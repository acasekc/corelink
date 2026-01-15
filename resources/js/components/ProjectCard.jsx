import React from 'react';
import { motion } from 'framer-motion';
import { Check, ExternalLink } from 'lucide-react';

const ProjectCard = ({
  category,
  title,
  description,
  features,
  techStack,
  link,
  linkText,
  index,
}) => {
  const isReversed = index % 2 === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative group"
    >
      {/* Glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative glass-card rounded-2xl p-8 lg:p-10 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl" />
        
        <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 ${isReversed ? 'lg:grid-flow-dense' : ''}`}>
          {/* Content side */}
          <div className={`space-y-6 ${isReversed ? 'lg:col-start-2' : ''}`}>
            {/* Category badge */}
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase bg-primary/10 text-primary border border-primary/20"
            >
              {category}
            </motion.span>

            {/* Title */}
            <h3 className="text-3xl lg:text-4xl font-bold text-foreground">
              {title}
            </h3>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">
              {description}
            </p>

            {/* Features */}
            <ul className="space-y-3">
              {features.map((feature, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </span>
                  {feature}
                </motion.li>
              ))}
            </ul>

            {/* CTA Button */}
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              {linkText}
              <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          {/* Tech stack side */}
          <div className={`space-y-6 ${isReversed ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
            {/* Tech Stack */}
            <div className="glass-card rounded-xl p-6 border border-white/5">
              <h4 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
                Tech Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="px-3 py-1.5 rounded-lg text-sm bg-background/50 text-foreground border border-white/10 hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-default"
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
