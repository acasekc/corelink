import React from 'react';
import { usePage } from '@inertiajs/react';
import InertiaHeader from '../components/InertiaHeader';
import InertiaFooter from '../components/InertiaFooter';

export default function InertiaPublicLayout({ children }) {
  const { url } = usePage();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <InertiaHeader />
      <main id="main-content" className="pt-20 flex-1">
        {children}
      </main>
      <InertiaFooter />
    </div>
  );
}
