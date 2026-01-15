import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

const projects = [
  {
    category: "Tournament Platform",
    title: "ChampLink",
    description:
      "A powerful tournament bracket management platform for competition organizers. Create and manage single elimination, double elimination, round robin, and group knockout tournaments with real-time updates and participant engagement.",
    features: [
      "Multiple tournament formats (single/double elimination, round robin)",
      "Interactive visual bracket editor",
      "Real-time score updates via WebSockets",
      "Email invitations and participant management",
      "Team and individual competition support",
      "Public spectator mode for followers",
    ],
    techStack: [
      "Laravel 12",
      "React 19",
      "TypeScript",
      "Laravel Reverb",
      "WebSockets",
      "MariaDB",
      "Tailwind CSS v4",
      "AWS EC2",
      "GitHub Actions",
      "Stripe Payments API",
    ],
    link: "https://champlink.app/",
    screenshots: [
      "/images/projects/champlink-1.jpg",
      "/images/projects/champlink-2.jpg",
      "/images/projects/champlink-3.jpg",
    ],
  },
  {
    category: "Web & Mobile App",
    title: "PantryLink",
    description:
      "A comprehensive inventory and shopping list management application for household and personal organization. Users can manage multiple inventory locations, create smart shopping lists, integrate with Walmart for direct ordering, and earn achievements through gamification. AI-powered meal generator suggests recipes based on available inventory.",
    features: [
      "Hierarchical inventory management by location",
      "Smart shopping list generation",
      "AI meal generator with recipe suggestions",
      "Recipe management and bookmarking",
      "Crew system for family collaboration",
      "Barcode scanning with image recognition",
      "Walmart integration for seamless ordering",
      "Gamification with badges and leaderboards",
    ],
    techStack: [
      "Laravel 12",
      "Vue 3",
      "Inertia.js",
      "React Native",
      "Laravel Octane",
      "PWA",
      "Barcode API",
      "Walmart API",
      "AWS RDS",
      "AWS EC2",
      "WebSockets",
      "Push Notifications",
      "Kroger API",
      "Stripe Payments API",
    ],
    link: "https://pantrylink.app/",
    screenshots: [
      "/images/projects/pantrylink-1.jpg",
      "/images/projects/pantrylink-2.jpg",
      "/images/projects/pantrylink-3.jpg",
    ],
  },
];

// Lightbox component
const Lightbox = ({ images, currentIndex, onClose, onPrev, onNext }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Previous button */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-4 p-2 text-white/70 hover:text-white transition-colors z-10"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
        )}

        {/* Image */}
        <motion.img
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          src={images[currentIndex]}
          alt={`Screenshot ${currentIndex + 1}`}
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Next button */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-full text-white/70 text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

const Projects = () => {
  const [lightbox, setLightbox] = useState({ isOpen: false, images: [], currentIndex: 0 });

  const openLightbox = (images, index) => {
    setLightbox({ isOpen: true, images, currentIndex: index });
  };

  const closeLightbox = () => {
    setLightbox({ isOpen: false, images: [], currentIndex: 0 });
  };

  const goToPrev = () => {
    setLightbox((prev) => ({
      ...prev,
      currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1,
    }));
  };

  const goToNext = () => {
    setLightbox((prev) => ({
      ...prev,
      currentIndex: prev.currentIndex === prev.images.length - 1 ? 0 : prev.currentIndex + 1,
    }));
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!lightbox.isOpen) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") goToPrev();
    if (e.key === "ArrowRight") goToNext();
  };

  // Add keyboard listener
  useState(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox.isOpen]);

  return (
    <div className="relative overflow-hidden">
      {/* Lightbox */}
      {lightbox.isOpen && (
        <Lightbox
          images={lightbox.images}
          currentIndex={lightbox.currentIndex}
          onClose={closeLightbox}
          onPrev={goToPrev}
          onNext={goToNext}
        />
      )}

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px]" />
      </div>

      <main className="relative pt-32 pb-24">
        <div className="container mx-auto px-6">
          {/* Page header */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 mb-6">
              Portfolio
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Our Projects</span>
            </h1>
            
            <p className="text-lg text-slate-400">
              Innovative solutions powering businesses and individuals
            </p>
          </div>

          {/* Projects list */}
          <div className="space-y-12 lg:space-y-16">
            {projects.map((project, index) => (
              <div key={index} className="relative group">
                {/* Glow effect on hover */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 lg:p-10 overflow-hidden">
                  {/* Background pattern */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/5 to-transparent rounded-full blur-3xl" />
                  
                  <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                    {/* Content side */}
                    <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                      {/* Category badge */}
                      <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                        {project.category}
                      </span>

                      {/* Title */}
                      <h3 className="text-3xl lg:text-4xl font-display font-bold text-white">
                        {project.title}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-400 leading-relaxed">
                        {project.description}
                      </p>

                      {/* Features */}
                      <ul className="space-y-3">
                        {project.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center mt-0.5">
                              <svg className="w-3 h-3 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity"
                        >
                          Visit {project.title}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    {/* Tech stack & Screenshots side */}
                    <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                      {/* Tech Stack */}
                      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                        <h4 className="text-xs font-medium tracking-widest uppercase text-slate-400 mb-4">
                          Tech Stack
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {project.techStack.map((tech, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 rounded-md text-xs font-medium bg-slate-800 text-cyan-500 border border-slate-700"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Screenshots Gallery */}
                      {project.screenshots && project.screenshots.length > 0 && (
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                          <h4 className="text-xs font-medium tracking-widest uppercase text-slate-400 mb-4">
                            Screenshots
                          </h4>
                          <div className="grid grid-cols-3 gap-3">
                            {project.screenshots.map((screenshot, i) => (
                              <button
                                key={i}
                                onClick={() => openLightbox(project.screenshots, i)}
                                className="relative aspect-video rounded-lg overflow-hidden border border-slate-700 hover:border-cyan-500/50 transition-colors group/img"
                              >
                                <img
                                  src={screenshot}
                                  alt={`${project.title} screenshot ${i + 1}`}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-colors flex items-center justify-center">
                                  <span className="opacity-0 group-hover/img:opacity-100 transition-opacity text-white text-xs font-medium">
                                    View
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Projects;
