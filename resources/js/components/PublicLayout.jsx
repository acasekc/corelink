import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function PublicLayout({ children }) {
  const location = useLocation();

  // Update canonical tag on route change
  useEffect(() => {
    const canonical = document.querySelector('link[rel="canonical"]');
    const url = 'https://corelink.dev' + location.pathname + location.search;
    
    if (canonical) {
      canonical.href = url;
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = url;
      document.head.appendChild(link);
    }
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main id="main-content" className="pt-20 flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
