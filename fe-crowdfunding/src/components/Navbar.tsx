import Link from "next/link";
import { useAuth } from "@/components/AuthContent";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { User, LogOut, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  // STATE BARU: Untuk mengontrol dropdown menu user dan menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const isActiveLink = (link: string) => {
    if (link === "/") return router.pathname === link;
    return router.pathname.startsWith(link);
  };

  // EFEK BARU: Untuk menutup dropdown saat klik di luar area dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // EFEK BARU: Untuk mengunci scroll body saat menu mobile terbuka
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 shadow-md backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Bayfund Logo" width={32} height={32} priority />
            <span className="font-bold text-2xl text-purple-700">BAYFUND</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link href="/" className={`font-medium transition-colors duration-200 ${isActiveLink("/") ? "text-purple-700" : "text-gray-600 hover:text-purple-700"}`}>
              Home
            </Link>
            <Link href="/donasi" className={`font-medium transition-colors duration-200 ${isActiveLink("/donasi") ? "text-purple-700" : "text-gray-600 hover:text-purple-700"}`}>
              Donasi
            </Link>
            <Link href="/campaign" className={`font-medium transition-colors duration-200 ${isActiveLink("/campaign") ? "text-purple-700" : "text-gray-600 hover:text-purple-700"}`}>
              Buat Campaign
            </Link>
          </div>

          {/* Auth Buttons & User Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div ref={dropdownRef} className="relative">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.email}</span>
                </button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-50"
                    >
                      <Link href="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                        <User size={16} /> Profil Saya
                      </Link>
                      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-gray-100 w-full text-left border-t">
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/auth/signin" className="rounded-full border-2 border-purple-500 px-6 py-2 font-semibold text-purple-500 transition-colors duration-200 hover:bg-purple-500 hover:text-white">
                  Login
                </Link>
                <Link href="/auth/register" className="rounded-full bg-purple-600 px-6 py-2 font-semibold text-white transition-colors duration-200 hover:bg-purple-700">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="lg:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600" aria-label="Toggle menu">
              <Menu size={28} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-0 left-0 h-full w-4/5 max-w-sm bg-white p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 text-gray-500">
                <X size={24} />
              </button>
              <div className="flex flex-col h-full space-y-8 text-xl pt-12">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className={`transition-colors duration-200 ${isActiveLink("/") ? "font-bold text-purple-700" : "text-gray-600 hover:text-purple-700"}`}>
                  Home
                </Link>
                <Link href="/donasi" onClick={() => setIsMobileMenuOpen(false)} className={`transition-colors duration-200 ${isActiveLink("/donasi") ? "font-bold text-purple-700" : "text-gray-600 hover:text-purple-700"}`}>
                  Donasi
                </Link>
                <Link href="/campaign" onClick={() => setIsMobileMenuOpen(false)} className={`transition-colors duration-200 ${isActiveLink("/campaign") ? "font-bold text-purple-700" : "text-gray-600 hover:text-purple-700"}`}>
                  Buat Campaign
                </Link>
                <div className="flex flex-col items-center space-y-4 pt-8 border-t border-gray-200 w-full">
                  {user ? (
                    <>
                      <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center rounded-full border-2 border-purple-500 px-8 py-3 font-semibold text-purple-500">
                        Profil Saya
                      </Link>
                      <button onClick={handleLogout} className="w-full text-center rounded-full bg-red-600 px-8 py-3 font-semibold text-white">
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center rounded-full border-2 border-purple-500 px-8 py-3 font-semibold text-purple-500">
                        Login
                      </Link>
                      <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center rounded-full bg-purple-600 px-8 py-3 font-semibold text-white">
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;