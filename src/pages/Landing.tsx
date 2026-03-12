import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Library, Users, Clock, ArrowRight, GraduationCap, Search, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "motion/react";
import { supabase } from "../lib/supabase";

export default function Landing() {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: "center" }, [Autoplay({ delay: 4000 })]);
  const [featuredBooks, setFeaturedBooks] = useState<any[]>([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data } = await supabase
          .from("books")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(4);
        if (data) setFeaturedBooks(data);
      } catch (error) {
        console.error("Error fetching featured books:", error);
      }
    };
    fetchBooks();
  }, []);

  const carouselImages = [
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070",
    "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2070",
    "https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=2015",
  ];

  return (
    <div className="min-h-[100svh] bg-white text-slate-900 font-sans selection:bg-blue-100 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl sm:text-2xl tracking-tight text-slate-900">Nilachal Library</span>
          </div>
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-full bg-slate-900 text-white font-medium text-sm hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-2"
          >
            Student Portal <ChevronRight className="h-4 w-4 hidden sm:block" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-48 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold tracking-wide mb-6 border border-blue-100">
              EST. 2026 • PREMIER COLLEGE LIBRARY
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter text-slate-900 mb-8 leading-[1.1]">
              Knowledge, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                Without Limits.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-500 mb-10 leading-relaxed max-w-2xl mx-auto font-light">
              A vast, clean, and modern digital space for Nilachal College students to discover, borrow, and manage their academic resources.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-blue-600 text-white font-medium text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5"
              >
                Access Catalog <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-slate-700 font-medium text-lg hover:bg-slate-50 transition-all border border-slate-200 hover:border-slate-300"
              >
                <Search className="h-5 w-5" /> Search Journals
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Vast Carousel Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-6xl mx-auto [perspective:2000px]"
        >
          <div className="overflow-hidden rounded-[2rem] sm:rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 bg-slate-50" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {carouselImages.map((src, index) => (
                <div className="flex-[0_0_100%] min-w-0 relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]" key={index}>
                  <img
                    src={src}
                    alt={`Nilachal Library Campus ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Featured Books - Clean 3D Grid */}
      {featuredBooks.length > 0 && (
        <section className="py-24 sm:py-32 bg-slate-50 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 sm:mb-16 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">New Arrivals</h2>
                <p className="text-slate-500 text-lg font-light">The latest academic texts and literature added to our vast collection.</p>
              </div>
              <Link to="/login" className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors group">
                View Full Catalog <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 [perspective:1000px]">
              {featuredBooks.map((book, idx) => (
                <motion.div 
                  key={book.id} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  whileHover={{ rotateY: -5, rotateX: 5, scale: 1.02, z: 20 }}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 [transform-style:preserve-3d] group flex flex-col"
                >
                  <div className="aspect-[3/4] relative overflow-hidden bg-slate-100 p-6 sm:p-8 flex items-center justify-center">
                    {book.cover_url ? (
                      <img 
                        src={book.cover_url} 
                        alt={book.title} 
                        className="w-full h-full object-cover rounded-lg shadow-md group-hover:shadow-xl transition-shadow duration-300" 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <BookOpen className="h-16 w-16 text-slate-300" />
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col bg-white [transform:translateZ(10px)]">
                    <h3 className="font-bold text-slate-900 line-clamp-1 text-lg mb-1" title={book.title}>{book.title}</h3>
                    <p className="text-slate-500 text-sm font-medium">{book.author}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features - Vast & Clean Bento Grid */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">Designed for Focus</h2>
            <p className="text-slate-500 text-lg sm:text-xl font-light">A seamless digital experience that complements our physical campus, giving you the tools to succeed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: <Library className="h-7 w-7 text-blue-600" />,
                title: "Vast Collection",
                desc: "Access thousands of physical books, journals, and digital research papers.",
                bg: "bg-blue-50",
                border: "border-blue-100"
              },
              {
                icon: <Clock className="h-7 w-7 text-emerald-600" />,
                title: "Smart Tracking",
                desc: "Never miss a due date with our intuitive dashboard and automated reminders.",
                bg: "bg-emerald-50",
                border: "border-emerald-100"
              },
              {
                icon: <Users className="h-7 w-7 text-indigo-600" />,
                title: "Study Spaces",
                desc: "Reserve collaborative rooms and quiet zones directly from the student portal.",
                bg: "bg-indigo-50",
                border: "border-indigo-100"
              }
            ].map((feature, idx) => (
               <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 + 0.2 }}
                className={`p-8 sm:p-10 rounded-[2rem] ${feature.bg} border ${feature.border} transition-transform hover:-translate-y-1`}
              >
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-8 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed font-light">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-12 sm:py-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">Nilachal Library</span>
          </div>
          <p className="text-slate-500 mb-8 max-w-md font-light">Empowering the students of Nilachal College through knowledge, innovation, and discovery.</p>
          <div className="text-sm text-slate-400 font-light">
            © {new Date().getFullYear()} Nilachal College. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
