import { ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { BookOpen, LogOut, User, LayoutDashboard, Settings, Library, GraduationCap } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  isAdmin?: boolean;
}

export default function Layout({ children, isAdmin }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-[100svh] bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-xl sm:text-2xl tracking-tight text-slate-900 hidden sm:block">Nilachal Library</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-6">
              <Link 
                to="/library" 
                className={`text-sm font-medium transition-colors hover:text-blue-600 flex items-center gap-1.5 px-3 py-2 rounded-lg ${location.pathname === '/library' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Library className="h-4 w-4" />
                <span className="hidden sm:inline">All Books</span>
              </Link>

              <Link 
                to="/dashboard" 
                className={`text-sm font-medium transition-colors hover:text-blue-600 flex items-center gap-1.5 px-3 py-2 rounded-lg ${location.pathname === '/dashboard' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">My Books</span>
              </Link>
              
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className={`text-sm font-medium transition-colors hover:text-blue-600 flex items-center gap-1.5 px-3 py-2 rounded-lg ${location.pathname === '/admin' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              
              <div className="h-6 w-px bg-slate-200 mx-1 sm:mx-2 hidden sm:block"></div>
              
              <Link 
                to="/profile" 
                className={`text-sm font-medium transition-colors hover:text-blue-600 p-2 rounded-full ${location.pathname === '/profile' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <User className="h-5 w-5" />
              </Link>
              
              <button 
                onClick={handleLogout}
                className="text-slate-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
                title="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </main>
    </div>
  );
}
