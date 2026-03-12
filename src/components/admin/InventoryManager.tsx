import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { BookPlus, BookOpen, Search, Edit2, Trash2, X, Save, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

export default function InventoryManager() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    cover_url: "",
    category: "Uncategorized",
    total_copies: 1
  });

  useEffect(() => {
    fetchBooks();
  }, [page, searchQuery, selectedCategory]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("books")
        .select("*", { count: "exact" })
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%`);
      }

      if (selectedCategory !== "All") {
        query = query.eq("category", selectedCategory);
      }

      const { data, count, error } = await query.range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;
      setBooks(data || []);
      setTotalCount(count || 0);
    } catch (error: any) {
      console.error("Error fetching books:", error);
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (book: any = null) => {
    if (book) {
      setEditingBook(book);
      setFormData({
        title: book.title,
        author: book.author,
        description: book.description || "",
        cover_url: book.cover_url || "",
        category: book.category || "Uncategorized",
        total_copies: book.total_copies
      });
    } else {
      setEditingBook(null);
      setFormData({ title: "", author: "", description: "", cover_url: "", category: "Uncategorized", total_copies: 1 });
    }
    setIsModalOpen(true);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData };
      
      if (editingBook) {
        payload.id = editingBook.id;
        const diff = formData.total_copies - editingBook.total_copies;
        payload.available_copies = editingBook.available_copies + diff;
      } else {
        payload.available_copies = formData.total_copies;
      }

      const { error } = await supabase.from("books").upsert(payload);
      if (error) throw error;
      
      toast.success(editingBook ? "Book updated successfully" : "Book added successfully");
      setIsModalOpen(false);
      fetchBooks();
    } catch (error: any) {
      console.error("Error saving book:", error);
      toast.error("Failed to save book: " + error.message);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm("Are you sure you want to delete this book? This action cannot be undone.")) return;
    
    try {
      // Check if book is currently borrowed
      const { count, error: checkError } = await supabase
        .from("borrowed_books")
        .select("*", { count: "exact", head: true })
        .eq("book_id", bookId)
        .eq("status", "borrowed");
        
      if (checkError) throw checkError;

      if (count && count > 0) {
        toast.error("Cannot delete this book because it is currently borrowed by a user.");
        return;
      }

      // Soft delete
      const { error } = await supabase.from("books").update({ is_archived: true }).eq("id", bookId);
      if (error) throw error;
      
      toast.success("Book deleted successfully");
      fetchBooks();
    } catch (error: any) {
      console.error("Error deleting book:", error);
      toast.error("Failed to delete book.");
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
        <h3 className="text-lg font-semibold text-slate-900">Inventory Management</h3>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(0);
              }}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow appearance-none bg-white"
            >
              <option value="All">All Categories</option>
              <option value="Fiction">Fiction</option>
              <option value="Non-Fiction">Non-Fiction</option>
              <option value="Science Fiction">Science Fiction</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Mystery">Mystery</option>
              <option value="Biography">Biography</option>
              <option value="History">History</option>
              <option value="Romance">Romance</option>
              <option value="Classic">Classic</option>
              <option value="Uncategorized">Uncategorized</option>
            </select>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search books..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <BookPlus className="h-4 w-4" /> Add Book
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 min-w-[800px]">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Author</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Total Copies</th>
              <th className="px-6 py-4 font-medium">Available</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading books...</td>
              </tr>
            ) : books.map((book) => (
              <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-4">
                  {book.cover_url ? (
                    <img src={book.cover_url} alt="" className="w-10 h-14 object-cover rounded-md shadow-sm" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-10 h-14 bg-slate-100 rounded-md flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-slate-300" />
                    </div>
                  )}
                  <span className="line-clamp-2">{book.title}</span>
                </td>
                <td className="px-6 py-4">{book.author}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                    {book.category || 'Uncategorized'}
                  </span>
                </td>
                <td className="px-6 py-4">{book.total_copies}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${book.available_copies > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {book.available_copies}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleOpenModal(book)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteBook(book.id)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && books.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No books found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {!loading && totalCount > pageSize && (
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <p className="text-sm text-slate-500">
            Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalCount)} of {totalCount} books
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

      {/* Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-100">
            <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-10">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingBook ? "Edit Book" : "Add New Book"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveBook} className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Title <span className="text-red-500">*</span></label>
                  <input 
                    required
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow bg-slate-50 focus:bg-white"
                    placeholder="e.g. The Great Gatsby"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Author <span className="text-red-500">*</span></label>
                  <input 
                    required
                    type="text" 
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow bg-slate-50 focus:bg-white"
                    placeholder="e.g. F. Scott Fitzgerald"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow bg-slate-50 focus:bg-white"
                  >
                    <option value="Uncategorized">Uncategorized</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Science Fiction">Science Fiction</option>
                    <option value="Fantasy">Fantasy</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Biography">Biography</option>
                    <option value="History">History</option>
                    <option value="Romance">Romance</option>
                    <option value="Classic">Classic</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Total Copies <span className="text-red-500">*</span></label>
                  <input 
                    required
                    type="number" 
                    min="1"
                    value={formData.total_copies}
                    onChange={(e) => setFormData({...formData, total_copies: parseInt(e.target.value) || 1})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Cover URL (Must be a valid URL)</label>
                <input 
                  type="url" 
                  value={formData.cover_url}
                  onChange={(e) => setFormData({...formData, cover_url: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow bg-slate-50 focus:bg-white"
                  placeholder="https://example.com/cover.jpg"
                />
                {formData.cover_url && (
                  <div className="mt-3 h-40 w-28 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <img src={formData.cover_url} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-shadow bg-slate-50 focus:bg-white"
                  placeholder="A brief summary of the book..."
                />
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-full text-slate-600 font-medium hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Save className="h-5 w-5" /> Save Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
