import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import toast from "react-hot-toast";

export default function BorrowHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchHistory();
  }, [page, searchQuery]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("borrowed_books")
        .select(`
          id,
          borrowed_at,
          due_date,
          returned_at,
          status,
          user_id,
          book_id,
          profiles!inner ( full_name ),
          books!inner ( title, cover_url )
        `, { count: "exact" })
        .neq("status", "borrowed")
        .order("returned_at", { ascending: false });

      if (searchQuery) {
        query = query.or(`profiles.full_name.ilike.%${searchQuery}%,books.title.ilike.%${searchQuery}%`);
      }

      const { data, count, error } = await query.range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;
      setHistory(data || []);
      setTotalCount(count || 0);
    } catch (error: any) {
      console.error("Error fetching borrow history:", error);
      toast.error("Failed to load borrow history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
        <h3 className="text-lg font-semibold text-slate-900">Borrowing History</h3>
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search history..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 min-w-[800px]">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Book</th>
              <th className="px-6 py-4 font-medium">Borrowed Date</th>
              <th className="px-6 py-4 font-medium">Returned Date</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Fine</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading history...</td>
              </tr>
            ) : history.map((borrow) => {
              const dueDate = new Date(borrow.due_date);
              const returnedDate = borrow.returned_at ? new Date(borrow.returned_at) : new Date();
              const daysOverdue = differenceInDays(returnedDate, dueDate);
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
                  {borrow.returned_at ? format(new Date(borrow.returned_at), "MMM d, yyyy") : "-"}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${borrow.status === 'returned' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                    {borrow.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {fineAmount > 0 ? (
                    <span className="text-red-600 font-bold">${fineAmount}</span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
              </tr>
            )})}
            {!loading && history.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No borrowing history found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalCount > pageSize && (
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <p className="text-sm text-slate-500">
            Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalCount)} of {totalCount} records
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
    </div>
  );
}
