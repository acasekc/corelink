import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

const CaseStudyDetail = () => {
  const { case_study } = useParams();
  const [caseStudy, setCaseStudy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/case-studies/${case_study}`)
      .then((res) => res.json())
      .then((data) => {
        setCaseStudy(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [case_study]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!caseStudy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Case Study Not Found</h1>
          <Link to="/case-studies" className="text-primary hover:underline">
            Back to Case Studies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Link
              to="/case-studies"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Case Studies
            </Link>
          </motion.div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 rounded-full glass-card glow-border text-sm font-medium text-primary mb-6">
              {caseStudy.industry || 'Client Success Story'}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {caseStudy.title}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              {caseStudy.subtitle}
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card glow-border p-8 md:p-12 rounded-2xl max-w-4xl mx-auto mb-12"
          >
            <div className="markdown-content">
              {caseStudy.hero_image && (
                <img 
                  src={caseStudy.hero_image} 
                  alt={caseStudy.title}
                  className="float-right w-1/2 ml-6 mb-4 rounded-lg shadow-lg"
                />
              )}
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-6 mt-8" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-2xl font-bold mb-4 mt-8" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xl font-bold mb-3 mt-6" {...props} />,
                  h4: ({node, ...props}) => <h4 className="text-lg font-bold mb-3 mt-4" {...props} />,
                  p: ({node, ...props}) => <p className="text-base leading-7 mb-4 text-muted-foreground" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-4 space-y-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal ml-6 mb-4 space-y-2" {...props} />,
                  li: ({node, ...props}) => <li className="text-base leading-7 text-muted-foreground" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                  em: ({node, ...props}) => <em className="italic" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-4 italic my-4" {...props} />,
                  code: ({node, inline, ...props}) => 
                    inline 
                      ? <code className="bg-gray-800 px-2 py-1 rounded text-sm" {...props} />
                      : <code className="block bg-gray-800 p-4 rounded-lg overflow-x-auto my-4" {...props} />,
                }}
              >
                {caseStudy.content}
              </ReactMarkdown>
            </div>
          </motion.div>

          {/* Metrics */}
          {caseStudy.metrics && caseStudy.metrics.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
                Key <span className="gradient-text">Metrics</span>
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {caseStudy.metrics.map((metric, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="glass-card p-6 rounded-xl text-center"
                  >
                    <div className="text-4xl font-bold text-primary mb-2">{metric.value}</div>
                    <div className="text-muted-foreground">{metric.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* CTA */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="glass-card glow-border p-10 md:p-14 rounded-2xl max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Build Your <span className="gradient-text">Success Story</span>?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Let CoreLink build a custom solution that helps your business thrive.
              </p>
              <Link
                to="/contact"
                className="inline-block px-8 py-4 bg-linear-to-r from-primary to-accent text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Get In Touch
              </Link>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default CaseStudyDetail;
