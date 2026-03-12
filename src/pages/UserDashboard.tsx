import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { formatDistanceToNow, isPast, isFuture, differenceInDays, format } from "date-fns";
import { BookOpen, Clock, AlertCircle, CheckCircle, Library } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export default function UserDashboard({ session }: { session: any }) {
  const [borrowedBooks, setBorrowedBooks] = useState<any[]>([]);
  const [historyBooks, setHistoryBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("current");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [borrowedResponse, historyResponse] = await Promise.all([
        supabase
          .from("borrowed_books")
          .select(`
            id,
            borrowed_at,
            due_date,
            status,
            books (
              id,
              title,
              author,
              description,
              cover_url
            )
          `)
          .eq("user_id", session.user.id)
          .eq("status", "borrowed"),
        supabase
          .from("borrowed_books")
          .select(`
            id,
            borrowed_at,
            due_date,
            returned_at,
            status,
            books (
              id,
              title,
              author,
              description,
              cover_url
            )
          `)
          .eq("user_id", session.user.id)
          .neq("status", "borrowed")
          .order("returned_at", { ascending: false })
      ]);

      if (borrowedResponse.error) throw borrowedResponse.error;
      if (historyResponse.error) throw historyResponse.error;

      setBorrowedBooks(borrowedResponse.data || []);
      setHistoryBooks(historyResponse.data || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalBorrowed = borrowedBooks.length;
  const overdueCount = borrowedBooks.filter(b => isPast(new Date(b.due_date))).length;
  const dueSoonCount = borrowedBooks.filter(b => {
    const dueDate = new Date(b.due_date);
    return isFuture(dueDate) && differenceInDays(dueDate, new Date()) <= 3;
  }).length;

  // Calculate total fines (e.g., $1 per day overdue)
  const totalFines = borrowedBooks.reduce((total, b) => {
    const dueDate = new Date(b.due_date);
    if (isPast(dueDate)) {
      const daysOverdue = differenceInDays(new Date(), dueDate);
      return total + (daysOverdue > 0 ? daysOverdue : 0);
    }
    return total;
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">My Bookshelf</h1>
          <p className="text-slate-500 mt-2 text-lg font-light">Track and manage the books you are currently reading.</p>
        </div>
        <Link 
          to="/library"
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Library className="h-4 w-4" /> Browse Library
        </Link>
      </div>

      {/* Analytics / Reminders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 sm:gap-6 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
            <BookOpen className="h-7 w-7" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Currently Borrowed</p>
            <p className="text-3xl sm:text-4xl font-bold text-slate-900">{totalBorrowed}</p>
          </div>
        </div>
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 sm:gap-6 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm">
            <Clock className="h-7 w-7" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Due Soon (≤ 3 days)</p>
            <p className="text-3xl sm:text-4xl font-bold text-slate-900">{dueSoonCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 sm:gap-6 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shadow-sm">
            <AlertCircle className="h-7 w-7" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Overdue Books</p>
            <p className="text-3xl sm:text-4xl font-bold text-slate-900">{overdueCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 sm:gap-6 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Total Fines</p>
            <p className="text-3xl sm:text-4xl font-bold text-slate-900">${totalFines}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 sm:gap-4 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-hide">
        {["current", "history"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-4 text-sm font-medium capitalize transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab === "current" ? "Currently Borrowed" : "Borrowing History"}
          </button>
        ))}
      </div>

      {activeTab === "current" ? (
        <>
          {borrowedBooks.length === 0 ? (
            <div className="text-center py-24 sm:py-32 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm px-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">No books borrowed</h3>
              <p className="text-slate-500 text-lg font-light mb-8 max-w-md mx-auto">You haven't borrowed any books yet. Visit the library to find your next read.</p>
              <Link 
                to="/library"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5"
              >
                <Library className="h-5 w-5" /> Browse Library
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {borrowedBooks.map((borrowed) => {
                const book = borrowed.books;
                const dueDate = new Date(borrowed.due_date);
                const isOverdue = isPast(dueDate);
                const daysLeft = differenceInDays(dueDate, new Date());
                const isDueSoon = isFuture(dueDate) && daysLeft <= 3;

                return (
                  <motion.div
                    key={borrowed.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                  >
                    <div className="aspect-[3/4] relative overflow-hidden bg-slate-100 p-6 sm:p-8 flex items-center justify-center">
                      {book.cover_url ? (
                        <img
                          src={book.cover_url}
                          alt={book.title}
                          className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <BookOpen className="h-16 w-16 text-slate-300" />
                      )}
                      
                      {/* Reminder Banner */}
                      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-slate-900/60 to-transparent z-10">
                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm backdrop-blur-md w-fit ${
                          isOverdue 
                            ? "bg-red-500/90 text-white" 
                            : isDueSoon 
                              ? "bg-amber-500/90 text-white"
                              : "bg-white/90 text-slate-800"
                        }`}>
                          {isOverdue ? <AlertCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                          {isOverdue 
                            ? `Overdue by ${formatDistanceToNow(dueDate)}` 
                            : `${daysLeft} days left (Due ${formatDistanceToNow(dueDate, { addSuffix: true })})`}
                        </div>
                      </div>

                      {/* Borrowed Time Period */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-transparent z-10">
                        <div className="text-white text-xs font-medium text-center">
                          <p>Borrowed: {format(new Date(borrowed.borrowed_at), "MMM d, yyyy")}</p>
                          <p className={isOverdue ? "text-red-300 font-bold" : "text-slate-200"}>
                            Due: {format(dueDate, "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 flex flex-col flex-1 bg-white">
                      <h3 className="font-bold text-xl text-slate-900 line-clamp-1 mb-1" title={book.title}>
                        {book.title}
                      </h3>
                      <p className="text-slate-500 text-sm mb-4 font-medium">{book.author}</p>
                      <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed flex-1 mb-6 font-light">
                        {book.description}
                      </p>
                      
                      <button
                        onClick={() => setSelectedBook(book)}
                        className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                      >
                        <BookOpen className="h-5 w-5" /> View Details
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <>
          {historyBooks.length === 0 ? (
            <div className="text-center py-24 sm:py-32 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm px-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">No borrowing history</h3>
              <p className="text-slate-500 text-lg font-light">You haven't returned any books yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 min-w-[600px]">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-medium">Book</th>
                      <th className="px-6 py-4 font-medium">Borrowed Date</th>
                      <th className="px-6 py-4 font-medium">Returned Date</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Fine</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {historyBooks.map((borrow) => {
                      const dueDate = new Date(borrow.due_date);
                      const returnedDate = borrow.returned_at ? new Date(borrow.returned_at) : new Date();
                      const daysOverdue = differenceInDays(returnedDate, dueDate);
                      const fineAmount = daysOverdue > 0 ? daysOverdue : 0;

                      return (
                      <tr key={borrow.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-4">
                          {borrow.books?.cover_url ? (
                            <img src={borrow.books.cover_url} alt="" className="w-10 h-14 object-cover rounded-md shadow-sm" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-10 h-14 bg-slate-100 rounded-md flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-slate-300" />
                            </div>
                          )}
                          <span className="line-clamp-2">{borrow.books?.title || "Unknown Book"}</span>
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
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Book Details Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col md:flex-row"
          >
            <div className="w-full md:w-2/5 bg-slate-100 p-8 flex items-center justify-center">
              {selectedBook.cover_url ? (
                <img
                  src={selectedBook.cover_url}
                  alt={selectedBook.title}
                  className="w-full h-auto object-cover rounded-lg shadow-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <BookOpen className="h-24 w-24 text-slate-300" />
              )}
            </div>
            <div className="w-full md:w-3/5 p-8 flex flex-col relative">
              <button 
                onClick={() => setSelectedBook(null)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              
              <div className="mt-2 mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{selectedBook.title}</h2>
                <p className="text-lg text-slate-500 font-medium">By {selectedBook.author}</p>
              </div>
              
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Description</h4>
                <p className="text-slate-600 font-light leading-relaxed whitespace-pre-line">
                  {selectedBook.description || "No description available for this book."}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
