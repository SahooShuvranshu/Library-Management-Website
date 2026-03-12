import React, { useState, useEffect } from "react";
import { Book } from "../types";
import { supabase } from "../lib/supabase";
import { X, Upload, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  book?: Book | null;
  userId: string;
}

export default function BookModal({
  isOpen,
  onClose,
  onSave,
  book,
  userId,
}: BookModalProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setAuthor(book.author);
      setDescription(book.description || "");
      setCoverPreview(book.cover_url);
    } else {
      setTitle("");
      setAuthor("");
      setDescription("");
      setCoverFile(null);
      setCoverPreview(null);
    }
    setError(null);
  }, [book, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const uploadCover = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("book-covers")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("book-covers")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let cover_url = book?.cover_url || null;

      if (coverFile) {
        try {
          cover_url = await uploadCover(coverFile);
        } catch (uploadErr: any) {
          throw new Error(`Failed to upload cover: ${uploadErr.message}`);
        }
      }

      const bookData = {
        title,
        author,
        description,
        cover_url,
        user_id: userId,
      };

      if (book) {
        const { error } = await supabase
          .from("books")
          .update(bookData)
          .eq("id", book.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("books").insert([bookData]);
        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between p-6 border-b border-stone-100">
            <h2 className="text-2xl font-bold text-stone-900">
              {book ? "Edit Book" : "Add New Book"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6">
                {error}
              </div>
            )}

            <form id="book-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="The Great Gatsby"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Author *
                    </label>
                    <input
                      type="text"
                      required
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="F. Scott Fitzgerald"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Cover Image
                  </label>
                  <div className="relative group rounded-2xl border-2 border-dashed border-stone-300 hover:border-indigo-500 transition-colors bg-stone-50 aspect-[2/3] flex flex-col items-center justify-center overflow-hidden cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    {coverPreview ? (
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center p-6">
                        <Upload className="w-10 h-10 text-stone-400 mx-auto mb-3 group-hover:text-indigo-500 transition-colors" />
                        <p className="text-sm text-stone-500 font-medium">
                          Click or drag to upload
                        </p>
                        <p className="text-xs text-stone-400 mt-1">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    )}

                    {coverPreview && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white font-medium flex items-center gap-2">
                          <Upload className="w-5 h-5" /> Change Cover
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                  placeholder="A brief summary of the book..."
                />
              </div>
            </form>
          </div>

          <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 rounded-xl font-medium text-stone-600 hover:bg-stone-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="book-form"
              disabled={loading}
              className="px-6 py-3 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {book ? "Save Changes" : "Add Book"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
