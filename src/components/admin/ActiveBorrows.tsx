import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Search, BookPlus, CheckCircle, X, Save, ChevronLeft, ChevronRight } from "lucide-react";
import { format, isPast, differenceInDays } from "date-fns";
import toast from "react-hot-toast";

export default function ActiveBorrows() {
  const [borrows, setBorrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueFormData, setIssueFormData] = useState({ userId: "", bookId: "", days: 14 });
  const [availableBooks, setAvailableBooks] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchBorrows();
  }, [page, searchQuery]);

  useEffect(() => {
    if (isIssueModalOpen) {
      fetchDropdownData();
    }
  }, [isIssueModalOpen]);

  const fetchBorrows = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("borrowed_books")
        .select(`
          id,
          borrowed_at,
          due_date,
          status,
          user_id,
          book_id,
          profiles!inner ( full_name ),
          books!inner ( title, cover_url )
        `, { count: "exact" })
        .eq("status", "borrowed")
        .order("borrowed_at", { ascending: false });

      if (searchQuery) {
        query = query.or(`profiles.full_name.ilike.%${searchQuery}%,books.title.ilike.%${searchQuery}%`);
      }

      const { data, count, error } = await query.range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;
      setBorrows(data || []);
      setTotalCount(count || 0);
    } catch (error: any) {
      console.error("Error fetching active borrows:", error);
      toast.error("Failed to load active borrows");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const { data: booksData } = await supabase.from("books").select("id, title, available_copies").eq("is_archived", false).gt("available_copies", 0);
      const { data: usersData } = await supabase.from("profiles").select("id, full_name");
      
      setAvailableBooks(booksData || []);
      setAllUsers(usersData || []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + issueFormData.days);

      const { error } = await supabase.from("borrowed_books").insert({
        user_id: issueFormData.userId,
        book_id: issueFormData.bookId,
        due_date: dueDate.toISOString(),
        status: "borrowed"
      });

      if (error) throw error;
      
      toast.success("Book issued successfully");
      setIsIssueModalOpen(false);
      setIssueFormData({ userId: "", bookId: "", days: 14 });
      fetchBorrows();
    } catch (error: any) {
      console.error("Error issuing book:", error);
      toast.error("Failed to issue book: " + error.message);
    }
  };

  const handleReturnBook = async (borrowedId: string) => {
    try {
      const { error } = await supabase
        .from("borrowed_books")
        .update({ status: "returned", returned_at: new Date().toISOString() })
        .eq("id", borrowedId);

      if (error) throw error;

      toast.success("Book marked as returned");
      fetchBorrows();
    } catch (error: any) {
      console.error("Error returning book:", error);
      toast.error("Failed to return book");
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
        <h3 className="text-lg font-semibold text-slate-900">Active Borrows</h3>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search borrows..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>
          <button 
            onClick={() => setIsIssueModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <BookPlus className="h-4 w-4" /> Issue Book
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 min-w-[800px]">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Book</th>
              <th className="px-6 py-4 font-medium">Borrowed Date</th>
              <th className="px-6 py-4 font-medium">Due Date</th>
              <th className="px-6 py-4 font-medium">Fine</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading active borrows...</td>
              </tr>
            ) : borrows.map((borrow) => {
              const dueDate = new Date(borrow.due_date);
              const isOverdue = isPast(dueDate);
              const daysOverdue = isOverdue ? differenceInDays(new Date(), dueDate) : 0;
              const fineAmount = daysOverdue > 0 ? daysOverdue : 0;

              return (
              <tr key={borrow.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">
                  {borrow.profiles?.full_name || "Unknown User"}
                </td>
                <td className="px-6 py-4">
                  {borrow.books?.title || "Unknown Book"}
                </td>
                <td className="px-6 py-4">{format(new Date(borrow.borrowed_at), "MMM d, yyyy")}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {format(dueDate, "MMM d, yyyy")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {fineAmount > 0 ? (
                    <span className="text-red-600 font-bold">${fineAmount}</span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleReturnBook(borrow.id)}
                    className="text-emerald-600 hover:text-emerald-800 font-medium text-sm inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" /> Mark Returned
                  </button>
                </td>
              </tr>
            )})}
            {!loading && borrows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No active borrows found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalCount > pageSize && (
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <p className="text-sm text-slate-500">
            Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalCount)} of {totalCount} borrows
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={(page + 1) * pageSize >= totalCount}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Issue Book Modal */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md border border-slate-100">
            <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-white/90 backdrop-blur-md rounded-t-[2rem]">
              <h2 className="text-2xl font-bold text-slate-900">Issue Book</h2>
              <button 
                onClick={() => setIsIssueModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleIssueBook} className="p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Select User <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={issueFormData.userId}
                  onChange={(e) => setIssueFormData({...issueFormData, userId: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow bg-slate-50 focus:bg-white"
                >
                  <option value="">-- Select a user --</option>
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Select Book <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={issueFormData.bookId}
                  onChange={(e) => setIssueFormData({...issueFormData, bookId: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow bg-slate-50 focus:bg-white"
                >
                  <option value="">-- Select an available book --</option>
                  {availableBooks.map(b => (
                    <option key={b.id} value={b.id}>{b.title} ({b.available_copies} available)</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Borrow Duration (Days) <span className="text-red-500">*</span></label>
                <input 
                  required
                  type="number" 
                  min="1"
                  max="90"
                  value={issueFormData.days}
                  onChange={(e) => setIssueFormData({...issueFormData, days: parseInt(e.target.value) || 14})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-6 py-3 rounded-full text-slate-600 font-medium hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Save className="h-5 w-5" /> Issue Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
