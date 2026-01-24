import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

/**
 * BlogLayout - A light-themed layout for blog pages with dark header and footer.
 */
export default function BlogLayout({ children }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Update canonical tag on route change
  useEffect(() => {
    const canonical = document.querySelector('link[rel="canonical"]');
    const url = "https://corelink.dev" + location.pathname + location.search;

    if (canonical) {
      canonical.href = url;
    } else {
      const link = document.createElement("link");
      link.rel = "canonical";
      link.href = url;
      document.head.appendChild(link);
    }
  }, [location.pathname, location.search]);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: "Projects", href: "/projects" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Dark Header */}
      <header
        className="sticky top-0 z-50"
        style={{
          backgroundColor: "rgba(17, 24, 39, 0.98)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="shrink-0">
              <Logo />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  style={{
                    color:
                      location.pathname === item.href ||
                      (item.href === "/blog" &&
                        location.pathname.startsWith("/blog"))
                        ? "#06b6d4"
                        : "#9ca3af",
                    fontSize: "14px",
                    fontWeight: "500",
                    textDecoration: "none",
                  }}
                  className="hover:text-cyan-400 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <Link
              to="/contact"
              className="hidden md:block"
              style={{
                padding: "8px 24px",
                backgroundColor: "#06b6d4",
                color: "white",
                fontWeight: "500",
                borderRadius: "8px",
                textDecoration: "none",
              }}
            >
              Get In Touch
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </nav>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden overflow-hidden"
              >
                <div className="py-4 space-y-2 border-t border-slate-700 mt-3">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      className={`block px-3 py-2 rounded-lg transition-colors ${
                        location.pathname === item.href ||
                        (item.href === "/blog" && location.pathname.startsWith("/blog"))
                          ? "text-cyan-400 bg-slate-800"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    to="/contact"
                    className="block mt-3 text-center px-4 py-2 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-400 transition-colors"
                  >
                    Get In Touch
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Light Content Area */}
      <main id="main-content" className="flex-1 bg-white">
        {children}
      </main>

      {/* Dark Footer */}
      <footer className="relative py-12 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Link to="/">
                <Logo />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-6"
            >
              <Link
                to="/blog"
                className="text-slate-400 hover:text-white text-sm transition"
              >
                Blog
              </Link>
              <Link
                to="/terms"
                className="text-slate-400 hover:text-white text-sm transition"
              >
                Terms of Service
              </Link>
              <Link
                to="/privacy"
                className="text-slate-400 hover:text-white text-sm transition"
              >
                Privacy Policy
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-slate-400 text-sm"
            >
              © {new Date().getFullYear()} CoreLink Development LLC. All rights
              reserved.
            </motion.p>
          </div>
        </div>
      </footer>
    </div>
  );
}
