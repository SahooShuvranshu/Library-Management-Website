import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import AdminOverview from "../components/admin/AdminOverview";
import InventoryManager from "../components/admin/InventoryManager";
import UserRoles from "../components/admin/UserRoles";
import ActiveBorrows from "../components/admin/ActiveBorrows";
import BorrowHistory from "../components/admin/BorrowHistory";

export default function AdminDashboard({ session }: { session: any }) {
  const [stats, setStats] = useState({ totalBooks: 0, activeUsers: 0, borrowedBooks: 0, overdueBooks: 0 });
  const [userActivityData, setUserActivityData] = useState<any[]>([]);
  const [popularBooksData, setPopularBooksData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      const { count: booksCount } = await supabase.from("books").select("*", { count: "exact", head: true }).eq("is_archived", false);
      const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      const { count: borrowedCount } = await supabase.from("borrowed_books").select("*", { count: "exact", head: true }).eq("status", "borrowed");
      const { count: overdueCount } = await supabase.from("borrowed_books").select("*", { count: "exact", head: true }).eq("status", "borrowed").lt("due_date", new Date().toISOString());
      
      const { data: allBorrowedData } = await supabase.from("borrowed_books").select(`
        id,
        profiles ( full_name ),
        books ( title )
      `);

      if (allBorrowedData) {
        const userCounts: Record<string, { name: string; count: number }> = {};
        const bookCounts: Record<string, { title: string; count: number }> = {};

        allBorrowedData.forEach((record: any) => {
          const userName = record.profiles?.full_name || 'Unknown User';
          if (!userCounts[userName]) userCounts[userName] = { name: userName, count: 0 };
          userCounts[userName].count += 1;

          const bookTitle = record.books?.title || 'Unknown Book';
          if (!bookCounts[bookTitle]) bookCounts[bookTitle] = { title: bookTitle, count: 0 };
          bookCounts[bookTitle].count += 1;
        });

        setUserActivityData(Object.values(userCounts).sort((a, b) => b.count - a.count).slice(0, 5));
        setPopularBooksData(Object.values(bookCounts).sort((a, b) => b.count - a.count).slice(0, 5));
      }

      setStats({
        totalBooks: booksCount || 0,
        activeUsers: usersCount || 0,
        borrowedBooks: borrowedCount || 0,
        overdueBooks: overdueCount || 0,
      });
    } catch (error) {
      console.error("Error fetching overview data:", error);
    } finally {
      setLoading(false);
    }
  };

  const mockChartData = [
    { name: "Jan", borrowed: 40, returned: 24 },
    { name: "Feb", borrowed: 30, returned: 13 },
    { name: "Mar", borrowed: 20, returned: 98 },
    { name: "Apr", borrowed: 27, returned: 39 },
    { name: "May", borrowed: 18, returned: 48 },
    { name: "Jun", borrowed: 23, returned: 38 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-12 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-2 text-lg font-light">Manage library inventory, users, and view analytics.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 sm:gap-4 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-hide">
        {["overview", "books", "users", "borrows", "history"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-4 text-sm font-medium capitalize transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <AdminOverview 
          stats={stats} 
          userActivityData={userActivityData} 
          popularBooksData={popularBooksData} 
          mockChartData={mockChartData} 
        />
      )}

      {activeTab === "books" && <InventoryManager />}
      {activeTab === "users" && <UserRoles />}
      {activeTab === "borrows" && <ActiveBorrows />}
      {activeTab === "history" && <BorrowHistory />}
    </div>
  );
}
