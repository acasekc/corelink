import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { Instagram, Facebook } from 'lucide-react';
import Logo from './Logo';

const InertiaFooter = () => {
  return (
    <footer className="relative py-16 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link href="/">
              <Logo />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-6"
          >
            <Link href="/terms" className="text-muted-foreground hover:text-foreground text-sm transition">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground text-sm transition">
              Privacy Policy
            </Link>
            <a
              href="https://instagram.com/Corelink.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://www.facebook.com/corelink.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-muted-foreground text-sm"
          >
            © {new Date().getFullYear()} CoreLink Development LLC. All rights reserved.
          </motion.p>
        </div>
      </div>
    </footer>
  );
};

export default InertiaFooter;
