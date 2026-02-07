import React from "react";
import { motion } from "framer-motion";
import { Link } from "@inertiajs/react";
import SeoHead from "@/components/SeoHead";

const CaseStudies = ({ meta, caseStudies = [] }) => {
  return (
    <div className="relative overflow-hidden">
      <SeoHead meta={meta} />
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-[128px]" />
      </div>

      <main className="relative pt-32 pb-24">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase bg-primary/10 text-primary border border-primary/20 mb-6"
            >
              Success Stories
            </motion.span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="gradient-text">Case Studies</span>
            </h1>
            
            <p className="text-lg text-muted-foreground">
              Real-world examples of how we've transformed businesses with intelligent web solutions
            </p>
          </motion.div>

          {/* Case Studies Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {caseStudies.map((study, index) => (
              <motion.div
                key={study.slug}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Link href={`/case-studies/${study.slug}`}>
                  <div className="glass-card rounded-2xl p-8 h-full hover:border-primary/30 transition-colors cursor-pointer">
                    <span className="inline-block px-3 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase bg-primary/10 text-primary border border-primary/20 mb-4">
                      {study.industry || 'Case Study'}
                    </span>
                    
                    <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {study.title}
                    </h3>
                    
                    <p className="text-muted-foreground mb-4">
                      {study.subtitle}
                    </p>
                    
                    <p className="text-sm text-muted-foreground">
                      {study.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CaseStudies;
