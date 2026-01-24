import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Projects", href: "/projects" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Blog", href: "/blog" },
    { label: "Process", href: "/process" },
    { label: "About", href: "/about" },
  ];

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ 
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <nav className="flex items-center justify-between">
          {/* Logo - always visible */}
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                style={{
                  color: location.pathname === item.href ? '#06b6d4' : '#9ca3af',
                  fontSize: '14px',
                  fontWeight: '500',
                  textDecoration: 'none'
                }}
                className="hover:text-cyan-400 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA Button */}
          <Link
            to="/contact"
            className="hidden md:block"
            style={{
              padding: '8px 24px',
              backgroundColor: '#06b6d4',
              color: 'white',
              fontWeight: '500',
              borderRadius: '8px',
              textDecoration: 'none'
            }}
          >
            Get In Touch
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-1 border-t border-white/10 mt-3">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={closeMenu}
                    className="block py-3 px-2 rounded-lg transition-colors"
                    style={{
                      color: location.pathname === item.href ? '#06b6d4' : '#d1d5db',
                      backgroundColor: location.pathname === item.href ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                      fontSize: '16px',
                      fontWeight: '500',
                      textDecoration: 'none'
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/contact"
                  onClick={closeMenu}
                  className="block mt-4 text-center"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#06b6d4',
                    color: 'white',
                    fontWeight: '600',
                    borderRadius: '8px',
                    textDecoration: 'none'
                  }}
                >
                  Get In Touch
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
