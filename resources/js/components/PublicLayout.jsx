import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function PublicLayout({ children }) {
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
