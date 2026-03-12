import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { BookOpen, Search, Filter, ArrowRight, X, ChevronLeft, ChevronRight, Library as LibraryIcon, Star, Share2, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const CATEGORIES = [
  "All", "Fiction", "Non-Fiction", "Science Fiction", "Fantasy", 
  "Mystery", "Biography", "History", "Romance", "Classic", "Uncategorized"
];

const getMockDetails = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const pages = 200 + (Math.abs(hash) % 400);
  const rating = 3.5 + ((Math.abs(hash) % 15) / 10);
  const reviews = 10 + (Math.abs(hash) % 500);
  const year = 1990 + (Math.abs(hash) % 34);
  const isbn = `978-${Math.abs(hash).toString().padStart(10, '0')}`;
  return { pages, rating, reviews, year, isbn };
};

export default function Library({ session }: { session: any }) {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Modal
  const [selectedBook, setSelectedBook] = useState<any | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  // Process books based on filters and sorting
  let processedBooks = [...books];

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    processedBooks = processedBooks.filter(book => 
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query)
    );
  }

  if (selectedCategory !== "All") {
    processedBooks = processedBooks.filter(book => book.category === selectedCategory);
  }

  if (showAvailableOnly) {
    processedBooks = processedBooks.filter(book => book.available_copies > 0);
  }

  processedBooks.sort((a, b) => {
    if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortBy === "a-z") return a.title.localeCompare(b.title);
    if (sortBy === "z-a") return b.title.localeCompare(a.title);
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(processedBooks.length / itemsPerPage);
  const paginatedBooks = processedBooks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy, showAvailableOnly]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 -mt-8 sm:-mt-12">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8 mb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-slate-900 to-slate-900"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-sm font-medium mb-6">
              <LibraryIcon className="w-4 h-4" />
              <span>Full Collection</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Discover Your Next <br className="hidden sm:block" /> Great Read.
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl font-light">
              Explore our vast collection of books, from timeless classics to modern masterpieces. 
              Find what moves you.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Controls Section */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-8 bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-200">
          
          {/* Search */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search titles or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-slate-500 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 outline-none cursor-pointer w-full"
              >
                <option value="newest">Newest Additions</option>
                <option value="oldest">Oldest First</option>
                <option value="a-z">Title (A-Z)</option>
                <option value="z-a">Title (Z-A)</option>
              </select>
            </div>

            <label className="flex items-center justify-center gap-3 cursor-pointer bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-colors w-full sm:w-auto select-none">
              <input 
                type="checkbox" 
                checked={showAvailableOnly}
                onChange={(e) => setShowAvailableOnly(e.target.checked)}
                className="rounded text-slate-900 focus:ring-slate-900 w-4 h-4 cursor-pointer"
              />
              <span className="text-sm font-medium text-slate-700">Available Only</span>
            </label>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex overflow-x-auto pb-4 mb-8 gap-2 hide-scrollbar">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category 
                  ? "bg-slate-900 text-white shadow-md" 
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid */}
        {paginatedBooks.length === 0 ? (
          <div className="text-center py-24 sm:py-32 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm px-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">No books found</h3>
            <p className="text-slate-500 text-lg font-light">Try adjusting your search or filters.</p>
            {(searchQuery || selectedCategory !== "All" || showAvailableOnly) && (
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setShowAvailableOnly(false);
                }}
                className="mt-6 px-6 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-full font-medium transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {paginatedBooks.map((book) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedBook(book)}
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                    {book.cover_url ? (
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-slate-300" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold rounded-full shadow-sm">
                        {book.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className={`w-3 h-3 rounded-full shadow-sm border-2 border-white ${
                        book.available_copies > 0 ? "bg-emerald-500" : "bg-red-500"
                      }`} title={book.available_copies > 0 ? "Available" : "Checked Out"} />
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {book.title}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0 mt-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-slate-700">{getMockDetails(book.id).rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm mb-4">{book.author}</p>
                    
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        {book.available_copies > 0 ? (
                          <span className="text-emerald-600">{book.available_copies} available</span>
                        ) : (
                          <span className="text-red-500">Waitlist</span>
                        )}
                      </span>
                      <span className="text-slate-400 group-hover:text-slate-900 transition-colors">
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-slate-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Book Details Modal */}
        <AnimatePresence>
          {selectedBook && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                onClick={() => setSelectedBook(null)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row z-10"
              >
                <button 
                  onClick={() => setSelectedBook(null)}
                  className="absolute top-4 right-4 md:top-6 md:right-6 z-20 p-2 bg-white/80 backdrop-blur-md text-slate-500 hover:text-slate-900 rounded-full transition-colors shadow-sm"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="w-full md:w-2/5 bg-slate-100 relative min-h-[250px] md:min-h-0">
                  {selectedBook.cover_url ? (
                    <img
                      src={selectedBook.cover_url}
                      alt={selectedBook.title}
                      className="w-full h-full object-cover absolute inset-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full absolute inset-0 flex items-center justify-center">
                      <BookOpen className="h-24 w-24 text-slate-300" />
                    </div>
                  )}
                </div>
                
                <div className="w-full md:w-3/5 p-6 sm:p-10 flex flex-col overflow-y-auto max-h-[60vh] md:max-h-[90vh]">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full uppercase tracking-wider">
                      {selectedBook.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      selectedBook.available_copies > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}>
                      {selectedBook.available_copies > 0 ? "Available" : "Checked Out"}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2 leading-tight">
                    {selectedBook.title}
                  </h2>
                  <p className="text-lg sm:text-xl text-slate-500 font-medium mb-4">By {selectedBook.author}</p>
                  
                  <div className="flex items-center gap-4 mb-6 sm:mb-8">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-900">{getMockDetails(selectedBook.id).rating.toFixed(1)}</span>
                      <span className="text-sm text-slate-500">({getMockDetails(selectedBook.id).reviews} reviews)</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                    <button className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5 text-sm font-medium">
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                    <button className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5 text-sm font-medium">
                      <Bookmark className="w-4 h-4" /> Save
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Synopsis</h4>
                    <p className="text-slate-600 font-light leading-relaxed whitespace-pre-line text-base sm:text-lg mb-8">
                      {selectedBook.description || "No description available for this book."}
                    </p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100">
                      <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pages</span>
                        <span className="text-sm font-medium text-slate-900">{getMockDetails(selectedBook.id).pages}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Published</span>
                        <span className="text-sm font-medium text-slate-900">{getMockDetails(selectedBook.id).year}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Language</span>
                        <span className="text-sm font-medium text-slate-900">English</span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">ISBN</span>
                        <span className="text-sm font-medium text-slate-900">{getMockDetails(selectedBook.id).isbn}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-slate-500 text-center sm:text-left">
                      <span className="block font-medium text-slate-900 mb-1">Library Status</span>
                      {selectedBook.available_copies} of {selectedBook.total_copies} copies available
                    </div>
                    <button className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-medium transition-colors shadow-md flex items-center justify-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      {selectedBook.available_copies > 0 ? "Request to Borrow" : "Join Waitlist"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

