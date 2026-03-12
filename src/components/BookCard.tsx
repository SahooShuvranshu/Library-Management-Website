import { Book } from "../types";
import { Edit2, Trash2, Image as ImageIcon } from "lucide-react";
import { motion } from "motion/react";

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
}

export default function BookCard({ book, onEdit, onDelete }: BookCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full"
    >
      <div className="relative aspect-[2/3] bg-stone-100 w-full overflow-hidden">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={`Cover of ${book.title}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
            <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
            <span className="text-sm font-medium">No Cover</span>
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(book)}
            className="p-2 bg-white/90 backdrop-blur-sm text-stone-700 hover:text-indigo-600 rounded-full shadow-sm transition-colors"
            title="Edit book"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(book.id)}
            className="p-2 bg-white/90 backdrop-blur-sm text-stone-700 hover:text-red-600 rounded-full shadow-sm transition-colors"
            title="Delete book"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg text-stone-900 line-clamp-1 mb-1">
          {book.title}
        </h3>
        <p className="text-stone-500 text-sm font-medium mb-3">{book.author}</p>
        <p className="text-stone-600 text-sm line-clamp-3 mt-auto">
          {book.description || "No description provided."}
        </p>
      </div>
    </motion.div>
  );
}
