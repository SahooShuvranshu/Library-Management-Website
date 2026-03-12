import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Chrome, GraduationCap, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidUrl = (url: string | undefined) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isSupabaseConfigured =
    isValidUrl(import.meta.env.VITE_SUPABASE_URL) && import.meta.env.VITE_SUPABASE_ANON_KEY;

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured) {
      setError(
        "Supabase is not configured. Please check your environment variables.",
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100svh] bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-30 bg-blue-400 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] opacity-20 bg-indigo-400 blur-[120px] rounded-full pointer-events-none" />

      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium z-20"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-white overflow-hidden relative z-10"
      >
        <div className="p-10 sm:p-12">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-center text-slate-900 mb-2 tracking-tight">
            Student Portal
          </h2>
          <p className="text-center text-slate-500 mb-10 font-light text-lg">
            Sign in to access Nilachal Library
          </p>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-6 border border-red-100"
            >
              {error}
            </motion.div>
          )}

          {!isSupabaseConfigured && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-5 rounded-2xl text-sm mb-8 shadow-sm">
              <p className="font-semibold mb-3 text-amber-900">Setup Required:</p>
              <ol className="list-decimal list-inside space-y-2 text-amber-800/80">
                <li>Create a Supabase project</li>
                <li>Add <code className="bg-amber-100/50 px-1.5 py-0.5 rounded text-amber-900">VITE_SUPABASE_URL</code> and <code className="bg-amber-100/50 px-1.5 py-0.5 rounded text-amber-900">VITE_SUPABASE_ANON_KEY</code></li>
                <li>Run the SQL script from <code className="bg-amber-100/50 px-1.5 py-0.5 rounded text-amber-900">supabase-setup.sql</code></li>
                <li>Enable Google Auth in Supabase</li>
              </ol>
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading || !isSupabaseConfigured}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-700 font-medium py-4 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Chrome className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-base">Continue with Google</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-50/50 p-6 text-center border-t border-slate-100">
          <p className="text-sm text-slate-400 font-light">
            Secure access provided by Supabase
          </p>
        </div>
      </motion.div>
    </div>
  );
}
