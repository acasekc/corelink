import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-500/10 blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="container mx-auto px-6 pt-32 pb-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 mb-8">
              <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-medium">AI-Powered Web Development</span>
            </div>

            {/* Heading */}
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
              Building the{" "}
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Future
              </span>
              <br />
              of Web Applications
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              CoreLink Development specializes in crafting intelligent, scalable web 
              and mobile applications using cutting-edge AI technology with expert 
              developer oversight.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/projects"
                className="group px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                Explore Our Work
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3 rounded-lg border border-slate-700 text-white font-medium hover:bg-slate-800/50 transition-colors"
              >
                Get In Touch
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent" />
      </section>

      {/* Features Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 opacity-50" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-cyan-500 font-medium tracking-wider uppercase text-sm">
              Why Choose Us
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6">
              Excellence in Every <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Line of Code</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              We combine the power of AI with human expertise to deliver exceptional 
              digital experiences that stand out.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "⚡",
                title: "AI-Enhanced Development",
                description: "Leveraging AI to accelerate development while maintaining expert code quality and best practices."
              },
              {
                icon: "🎯",
                title: "Proven Track Record",
                description: "Building and scaling SaaS platforms that serve thousands of users with reliability and performance."
              },
              {
                icon: "🔧",
                title: "Modern Tech Stack",
                description: "Laravel, Vue 3, Inertia.js, React, and more for responsive, cutting-edge applications."
              },
              {
                icon: "💻",
                title: "Clean Architecture",
                description: "Maintainable, scalable codebases built with industry best practices and design patterns."
              },
              {
                icon: "🛡️",
                title: "Security First",
                description: "Enterprise-grade security measures implemented from day one to protect your data."
              },
              {
                icon: "✨",
                title: "Pixel Perfect Design",
                description: "Beautiful, intuitive interfaces that delight users and drive engagement."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-2xl hover:bg-slate-800/70 hover:border-cyan-500/30 transition-all duration-300"
              >
                <div className="mb-6">
                  <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors text-3xl">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
