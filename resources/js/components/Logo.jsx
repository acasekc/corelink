import React from 'react';
import { motion } from 'framer-motion';

export const Logo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center"
    >
      <img
        src="/images/logo_100_h.png"
        alt="CoreLink"
        width={400}
        height={100}
        decoding="async"
        loading="eager"
        className="h-12 sm:h-16 md:h-20 w-auto"
      />
    </motion.div>
  );
};

export default Logo;
