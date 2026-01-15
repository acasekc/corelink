import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { label: "Projects", href: "/projects" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Process", href: "/process" },
    { label: "About", href: "/about" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ 
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          
          <div className="flex items-center gap-8">
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
              >
                {item.label}
              </Link>
            ))}
          </div>

          <Link
            to="/contact"
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
        </nav>
      </div>
    </header>
  );
};

export default Header;
