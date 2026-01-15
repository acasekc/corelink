import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, Wrench, Code2, Shield, Sparkles } from 'lucide-react';
import FeatureCard from './FeatureCard';

const features = [
  {
    icon: Zap,
    title: "AI-Enhanced Development",
    description: "Leveraging AI to accelerate development while maintaining expert code quality and best practices.",
  },
  {
    icon: Target,
    title: "Proven Track Record",
    description: "Building and scaling SaaS platforms that serve thousands of users with reliability and performance.",
  },
  {
    icon: Wrench,
    title: "Modern Tech Stack",
    description: "Laravel, Vue 3, Inertia.js, React, and more for responsive, cutting-edge applications.",
  },
  {
    icon: Code2,
    title: "Clean Architecture",
    description: "Maintainable, scalable codebases built with industry best practices and design patterns.",
  },
  {
    icon: Shield,
    title: "Security First",
    description: "Enterprise-grade security measures implemented from day one to protect your data.",
  },
  {
    icon: Sparkles,
    title: "Pixel Perfect Design",
    description: "Beautiful, intuitive interfaces that delight users and drive engagement.",
  },
];

const Features = () => {
  return (
    <section className="relative py-32 overflow-hidden" id="features">
      {/* Background accent */}
      <div className="absolute inset-0 hero-gradient opacity-50" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium tracking-wider uppercase text-sm">
            Why Choose Us
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Excellence in Every <span className="gradient-text">Line of Code</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We combine the power of AI with human expertise to deliver exceptional 
            digital experiences that stand out.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
