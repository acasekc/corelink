import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { motion, AnimatePresence } from "framer-motion";
import { S as SeoHead } from "./route-blog-jpwBX5H6.js";
import { Heart, Users, Sparkles, ShieldCheck, Target, Rocket, Wrench, Monitor, Server, Layers, Globe, Cpu, Smartphone, Plug, ShoppingCart, ArrowLeft, Send, ArrowRight, Zap, Code2, Shield, MessageSquare, Compass, Palette, Brain, Eye, TrendingUp, HeartHandshake, ExternalLink, X, ChevronLeft, ChevronRight, Scale } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, usePage, useForm } from "@inertiajs/react";
import { Link as Link$1 } from "react-router-dom";
import ReactMarkdown from "react-markdown";
const philosophyItems = [
  {
    icon: Heart,
    title: "Integrity First",
    description: "We build trust through transparent communication, honest timelines, and delivering on our promises."
  },
  {
    icon: Users,
    title: "Service-Minded",
    description: "We view our work as an opportunity to serve and uplift our clients and their communities."
  },
  {
    icon: Sparkles,
    title: "AI-Powered Efficiency",
    description: "We harness AI to accelerate development cycles without compromising on quality or innovation."
  },
  {
    icon: ShieldCheck,
    title: "Expert Oversight",
    description: "Senior developers provide strategic direction, code review, and architectural guidance on every project."
  },
  {
    icon: Target,
    title: "Results-Focused",
    description: "We're committed to delivering solutions that solve real problems and drive measurable business value."
  },
  {
    icon: Rocket,
    title: "Modern Technology",
    description: "We stay at the cutting edge of web technology, using the latest frameworks and best practices."
  }
];
const techStack = {
  backend: {
    icon: Server,
    title: "Backend",
    items: ["Laravel 12", "PHP 8.4", "Laravel Octane", "PostgreSQL/MySQL", "Redis"]
  },
  frontend: {
    icon: Monitor,
    title: "Frontend",
    items: ["React", "Vue 3", "Inertia.js", "Tailwind CSS", "Vite", "TypeScript"]
  },
  tools: {
    icon: Wrench,
    title: "Tools & Services",
    items: ["React Native", "Laravel Reverb", "Laravel Echo", "Pusher", "Twilio", "Stripe API", "AWS", "Docker", "Git & CI/CD", "Claude AI"]
  }
};
const whatWeBuild = [
  {
    icon: Layers,
    title: "SaaS Platforms",
    description: "Multi-tenant applications with advanced features and scalability"
  },
  {
    icon: Globe,
    title: "Web Applications",
    description: "Complex, feature-rich applications with real-time capabilities"
  },
  {
    icon: Cpu,
    title: "AI-Powered Solutions",
    description: "Intelligent content generation, chatbots, and AI-driven integrations"
  },
  {
    icon: Smartphone,
    title: "Mobile Apps",
    description: "Progressive Web Apps and responsive mobile experiences"
  },
  {
    icon: Plug,
    title: "APIs & Integrations",
    description: "Robust APIs and third-party service integrations"
  },
  {
    icon: ShoppingCart,
    title: "E-commerce Solutions",
    description: "Online stores, payment processing, and inventory management systems"
  }
];
const About = ({ meta }) => {
  return /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden", children: [
    /* @__PURE__ */ jsx(SeoHead, { meta }),
    /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 pointer-events-none", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-1/3 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-[128px]" })
    ] }),
    /* @__PURE__ */ jsx("main", { className: "relative pt-32 pb-24", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6", children: [
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6 },
          className: "max-w-4xl mb-20",
          children: [
            /* @__PURE__ */ jsx(
              motion.span,
              {
                initial: { opacity: 0, scale: 0.9 },
                animate: { opacity: 1, scale: 1 },
                transition: { delay: 0.1 },
                className: "inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase bg-primary/10 text-primary border border-primary/20 mb-6",
                children: "About Us"
              }
            ),
            /* @__PURE__ */ jsx("h1", { className: "text-4xl md:text-5xl lg:text-6xl font-bold mb-6", children: /* @__PURE__ */ jsx("span", { className: "gradient-text", children: "About CoreLink" }) }),
            /* @__PURE__ */ jsx("p", { className: "text-xl text-muted-foreground", children: "Pioneering AI-powered web development" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          className: "glass-card rounded-2xl p-8 lg:p-12 mb-16",
          children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl md:text-3xl font-bold text-foreground mb-6", children: "Who We Are" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-muted-foreground leading-relaxed", children: [
              /* @__PURE__ */ jsx("p", { children: "Our mission at CoreLink Development is to steward technology for good, creating AI-enhanced web and mobile applications that are scalable, reliable, and transformative—rooted in Christian values of integrity, service, and innovation to uplift clients and communities." }),
              /* @__PURE__ */ jsx("p", { children: "CoreLink Development is a forward-thinking software development company specializing in building intelligent web and mobile applications. We combine the efficiency of AI-assisted development with the expertise of senior developers to deliver exceptional results. CoreLink was fully built using Claude AI, demonstrating the power of AI-driven development when paired with expert oversight." }),
              /* @__PURE__ */ jsx("p", { children: "Our approach leverages cutting-edge artificial intelligence to accelerate the development process while maintaining rigorous code quality standards and architectural excellence. Every line of code is reviewed and guided by experienced developers who understand both the technical and business requirements of your project." })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          className: "mb-16",
          children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl md:text-3xl font-bold text-foreground mb-8", children: "Our Philosophy" }),
            /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 gap-6", children: philosophyItems.map((item, index) => {
              const Icon = item.icon;
              return /* @__PURE__ */ jsxs(
                motion.div,
                {
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { delay: index * 0.1 },
                  className: "group glass-card rounded-2xl p-6 hover:border-primary/30 transition-colors",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors", children: /* @__PURE__ */ jsx(Icon, { className: "w-6 h-6 text-primary" }) }),
                    /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-foreground mb-2", children: item.title }),
                    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: item.description })
                  ]
                },
                item.title
              );
            }) })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          className: "mb-16",
          children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl md:text-3xl font-bold text-foreground mb-8", children: "Our Tech Stack" }),
            /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-3 gap-6", children: Object.entries(techStack).map(([key, stack], index) => {
              const Icon = stack.icon;
              return /* @__PURE__ */ jsxs(
                motion.div,
                {
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { delay: index * 0.1 },
                  className: "glass-card rounded-2xl p-6",
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
                      /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5 text-primary" }) }),
                      /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-foreground", children: stack.title })
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: stack.items.map((tech) => /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: "px-3 py-1.5 rounded-lg text-sm bg-secondary/50 text-foreground border border-border",
                        children: tech
                      },
                      tech
                    )) })
                  ]
                },
                key
              );
            }) })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl md:text-3xl font-bold text-foreground mb-8", children: "What We Build" }),
            /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6", children: whatWeBuild.map((item, index) => {
              const Icon = item.icon;
              return /* @__PURE__ */ jsxs(
                motion.div,
                {
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { delay: index * 0.1 },
                  className: "group glass-card rounded-2xl p-6 text-center hover:border-primary/30 transition-colors",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors", children: /* @__PURE__ */ jsx(Icon, { className: "w-7 h-7 text-primary" }) }),
                    /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-foreground mb-2", children: item.title }),
                    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: item.description })
                  ]
                },
                item.title
              );
            }) })
          ]
        }
      )
    ] }) })
  ] });
};
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: About
}, Symbol.toStringTag, { value: "Module" }));
const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
    errors: {},
    processing: false
  });
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setForm((prev) => ({ ...prev, processing: true, errors: {} }));
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || document.cookie.split("; ").find((row) => row.startsWith("XSRF-TOKEN="))?.split("=")[1];
    try {
      const res = await fetch("/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": decodeURIComponent(csrfToken || ""),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          remember: form.remember
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setForm((prev) => ({ ...prev, errors: data.errors || { credentials: data.message || "Login failed." }, processing: false }));
      } else {
        window.location.href = data.redirect || "/admin/discovery";
      }
    } catch (err) {
      setForm((prev) => ({ ...prev, errors: { credentials: "Network error." }, processing: false }));
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gray-900 flex items-center justify-center px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-purple-400", children: "Corelink Admin" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-400 mt-2", children: "Sign in to manage discovery sessions" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-gray-800 rounded-lg p-8 border border-gray-700", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-300 mb-2", children: "Email" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "email",
            name: "email",
            type: "email",
            required: true,
            autoFocus: true,
            value: form.email,
            onChange: handleChange,
            className: "w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500",
            placeholder: "admin@example.com"
          }
        ),
        form.errors.email && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-red-400", children: form.errors.email })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-300 mb-2", children: "Password" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "password",
            name: "password",
            type: "password",
            required: true,
            value: form.password,
            onChange: handleChange,
            className: "w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500",
            placeholder: "••••••••"
          }
        ),
        form.errors.password && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-red-400", children: form.errors.password })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center mb-6", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "remember",
            name: "remember",
            type: "checkbox",
            checked: form.remember,
            onChange: handleChange,
            className: "w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 text-purple-600"
          }
        ),
        /* @__PURE__ */ jsx("label", { htmlFor: "remember", className: "ml-2 text-sm text-gray-300", children: "Remember me" })
      ] }),
      form.errors.credentials && /* @__PURE__ */ jsx("div", { className: "mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-red-400", children: form.errors.credentials }) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: form.processing,
          className: "w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors",
          children: form.processing ? "Signing in..." : "Sign In"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "mt-6 text-center text-gray-500 text-sm", children: /* @__PURE__ */ jsxs("p", { children: [
      "Looking for the support portal?",
      " ",
      /* @__PURE__ */ jsx("a", { href: "/helpdesk/login", className: "text-purple-400 hover:text-purple-300 transition", children: "Sign in here" })
    ] }) })
  ] }) });
};
const __vite_glob_0_32 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Login
}, Symbol.toStringTag, { value: "Module" }));
const CaseStudies = ({ meta, caseStudies: caseStudies2 = [] }) => {
  return /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden", children: [
    /* @__PURE__ */ jsx(SeoHead, { meta }),
    /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 pointer-events-none", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-1/3 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-[128px]" })
    ] }),
    /* @__PURE__ */ jsx("main", { className: "relative pt-32 pb-24", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6", children: [
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6 },
          className: "text-center max-w-3xl mx-auto mb-20",
          children: [
            /* @__PURE__ */ jsx(
              motion.span,
              {
                initial: { opacity: 0, scale: 0.9 },
                animate: { opacity: 1, scale: 1 },
                transition: { delay: 0.1 },
                className: "inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase bg-primary/10 text-primary border border-primary/20 mb-6",
                children: "Success Stories"
              }
            ),
            /* @__PURE__ */ jsx("h1", { className: "text-4xl md:text-5xl lg:text-6xl font-bold mb-6", children: /* @__PURE__ */ jsx("span", { className: "gradient-text", children: "Case Studies" }) }),
            /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground", children: "Real-world examples of how we've transformed businesses with intelligent web solutions" })
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto", children: caseStudies2.map((study, index) => /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 40 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-100px" },
          transition: { duration: 0.6, delay: index * 0.1 },
          className: "group",
          children: /* @__PURE__ */ jsx(Link, { href: `/case-studies/${study.slug}`, children: /* @__PURE__ */ jsxs("div", { className: "glass-card rounded-2xl p-8 h-full hover:border-primary/30 transition-colors cursor-pointer", children: [
            /* @__PURE__ */ jsx("span", { className: "inline-block px-3 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase bg-primary/10 text-primary border border-primary/20 mb-4", children: study.industry || "Case Study" }),
            /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors", children: study.title }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: study.subtitle }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: study.description })
          ] }) })
        },
        study.slug
      )) })
    ] }) })
  ] });
};
const __vite_glob_0_38 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: CaseStudies
}, Symbol.toStringTag, { value: "Module" }));
const caseStudies = [
  {
    slug: "dusties-delights",
    title: "Dustie's Delights",
    summary: "A custom e-commerce platform for a local bakery.",
    content: `Dustie's Delights is a modern bakery e-commerce site built for scale and ease of use. Features include online ordering, inventory management, and a beautiful, responsive design.`,
    image: "/images/case-studies/dusties-delights.jpg"
  }
  // Add more case studies here as needed
];
function CaseStudiesList() {
  return /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto py-16 px-4", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold mb-8", children: "Case Studies" }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-8 md:grid-cols-2", children: caseStudies.map((cs) => /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold mb-2", children: cs.title }),
      /* @__PURE__ */ jsx("p", { className: "mb-4", children: cs.summary }),
      /* @__PURE__ */ jsx(Link$1, { to: `/case-studies/${cs.slug}`, className: "text-blue-600 hover:underline", children: "Read More" })
    ] }, cs.slug)) })
  ] });
}
const __vite_glob_0_39 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: CaseStudiesList
}, Symbol.toStringTag, { value: "Module" }));
const CaseStudyDetail = ({ meta, caseStudy }) => {
  if (!caseStudy) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-4", children: "Case Study Not Found" }),
      /* @__PURE__ */ jsx(Link, { href: "/case-studies", className: "text-primary hover:underline", children: "Back to Case Studies" })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx(SeoHead, { meta }),
    /* @__PURE__ */ jsx("main", { className: "pt-32 pb-20", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6", children: [
      /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0, x: -20 },
          animate: { opacity: 1, x: 0 },
          transition: { duration: 0.4 },
          className: "mb-8",
          children: /* @__PURE__ */ jsxs(
            Link,
            {
              href: "/case-studies",
              className: "inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors",
              children: [
                /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
                "Back to Case Studies"
              ]
            }
          )
        }
      ),
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6 },
          className: "text-center mb-16",
          children: [
            /* @__PURE__ */ jsx("span", { className: "inline-block px-4 py-2 rounded-full glass-card glow-border text-sm font-medium text-primary mb-6", children: caseStudy.industry || "Client Success Story" }),
            /* @__PURE__ */ jsx("h1", { className: "text-4xl md:text-6xl font-bold mb-4", children: caseStudy.title }),
            /* @__PURE__ */ jsx("p", { className: "text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto", children: caseStudy.subtitle })
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay: 0.1 },
          className: "glass-card glow-border p-8 md:p-12 rounded-2xl max-w-4xl mx-auto mb-12",
          children: /* @__PURE__ */ jsxs("div", { className: "markdown-content", children: [
            caseStudy.hero_image && /* @__PURE__ */ jsx(
              "img",
              {
                src: caseStudy.hero_image,
                alt: caseStudy.title,
                width: 400,
                height: 300,
                loading: "eager",
                fetchpriority: "high",
                className: "float-right w-1/2 ml-6 mb-4 rounded-lg shadow-lg"
              }
            ),
            /* @__PURE__ */ jsx(
              ReactMarkdown,
              {
                components: {
                  h1: ({ node, ...props }) => /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold mb-6 mt-8", ...props }),
                  h2: ({ node, ...props }) => /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-4 mt-8", ...props }),
                  h3: ({ node, ...props }) => /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold mb-3 mt-6", ...props }),
                  h4: ({ node, ...props }) => /* @__PURE__ */ jsx("h4", { className: "text-lg font-bold mb-3 mt-4", ...props }),
                  p: ({ node, ...props }) => /* @__PURE__ */ jsx("p", { className: "text-base leading-7 mb-4 text-muted-foreground", ...props }),
                  ul: ({ node, ...props }) => /* @__PURE__ */ jsx("ul", { className: "list-disc ml-6 mb-4 space-y-2", ...props }),
                  ol: ({ node, ...props }) => /* @__PURE__ */ jsx("ol", { className: "list-decimal ml-6 mb-4 space-y-2", ...props }),
                  li: ({ node, ...props }) => /* @__PURE__ */ jsx("li", { className: "text-base leading-7 text-muted-foreground", ...props }),
                  strong: ({ node, ...props }) => /* @__PURE__ */ jsx("strong", { className: "font-bold text-white", ...props }),
                  em: ({ node, ...props }) => /* @__PURE__ */ jsx("em", { className: "italic", ...props }),
                  blockquote: ({ node, ...props }) => /* @__PURE__ */ jsx("blockquote", { className: "border-l-4 border-primary pl-4 italic my-4", ...props }),
                  code: ({ node, inline, ...props }) => inline ? /* @__PURE__ */ jsx("code", { className: "bg-gray-800 px-2 py-1 rounded text-sm", ...props }) : /* @__PURE__ */ jsx("code", { className: "block bg-gray-800 p-4 rounded-lg overflow-x-auto my-4", ...props })
                },
                children: caseStudy.content
              }
            )
          ] })
        }
      ),
      caseStudy.metrics && caseStudy.metrics.length > 0 && /* @__PURE__ */ jsxs(
        motion.section,
        {
          initial: { opacity: 0, y: 30 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          transition: { duration: 0.6 },
          className: "max-w-4xl mx-auto mb-16",
          children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-3xl md:text-4xl font-bold mb-6 text-center", children: [
              "Key ",
              /* @__PURE__ */ jsx("span", { className: "gradient-text", children: "Metrics" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-3 gap-6", children: caseStudy.metrics.map((metric, index) => /* @__PURE__ */ jsxs(
              motion.div,
              {
                initial: { opacity: 0, scale: 0.9 },
                whileInView: { opacity: 1, scale: 1 },
                viewport: { once: true },
                transition: { duration: 0.4, delay: index * 0.1 },
                className: "glass-card p-6 rounded-xl text-center",
                children: [
                  /* @__PURE__ */ jsx("div", { className: "text-4xl font-bold text-primary mb-2", children: metric.value }),
                  /* @__PURE__ */ jsx("div", { className: "text-muted-foreground", children: metric.label })
                ]
              },
              index
            )) })
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        motion.section,
        {
          initial: { opacity: 0, y: 30 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          transition: { duration: 0.6 },
          className: "text-center",
          children: /* @__PURE__ */ jsxs("div", { className: "glass-card glow-border p-10 md:p-14 rounded-2xl max-w-3xl mx-auto", children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-3xl md:text-4xl font-bold mb-4", children: [
              "Ready to Build Your ",
              /* @__PURE__ */ jsx("span", { className: "gradient-text", children: "Success Story" }),
              "?"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground mb-8", children: "Let CoreLink build a custom solution that helps your business thrive." }),
            /* @__PURE__ */ jsx(
              Link,
              {
                href: "/contact",
                className: "inline-block px-8 py-4 bg-linear-to-r from-primary to-accent text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity",
                children: "Get In Touch"
              }
            )
          ] })
        }
      )
    ] }) })
  ] });
};
const __vite_glob_0_40 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: CaseStudyDetail
}, Symbol.toStringTag, { value: "Module" }));
const Contact = ({ meta }) => {
  const { flash } = usePage().props;
  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(name, value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    post("/contact", {
      onSuccess: () => reset()
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden", children: [
    /* @__PURE__ */ jsx(SeoHead, { meta }),
    /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 pointer-events-none", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-1/3 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-[128px]" })
    ] }),
    /* @__PURE__ */ jsx("main", { className: "relative pt-32 pb-24", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6", children: [
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6 },
          className: "text-center max-w-2xl mx-auto mb-16",
          children: [
            /* @__PURE__ */ jsx(
              motion.span,
              {
                initial: { opacity: 0, scale: 0.9 },
                animate: { opacity: 1, scale: 1 },
                transition: { delay: 0.1 },
                className: "inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase bg-primary/10 text-primary border border-primary/20 mb-6",
                children: "Contact"
              }
            ),
            /* @__PURE__ */ jsx("h1", { className: "text-4xl md:text-5xl lg:text-6xl font-bold mb-6", children: /* @__PURE__ */ jsx("span", { className: "gradient-text", children: "Get In Touch" }) }),
            /* @__PURE__ */ jsx("p", { className: "text-xl text-muted-foreground", children: "We'd love to hear about your project" })
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay: 0.2 },
          className: "max-w-xl mx-auto",
          children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "glass-card rounded-2xl p-8 md:p-10", children: [
            Object.keys(errors).length > 0 && /* @__PURE__ */ jsx("div", { className: "mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center font-medium", children: Object.values(errors)[0] }),
            flash?.success && /* @__PURE__ */ jsxs("div", { className: "mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-center font-medium", children: [
              /* @__PURE__ */ jsx("div", { className: "text-2xl mb-2", children: "✓" }),
              flash.success
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
              /* @__PURE__ */ jsxs(
                motion.div,
                {
                  initial: { opacity: 0, x: -20 },
                  animate: { opacity: 1, x: 0 },
                  transition: { delay: 0.3 },
                  children: [
                    /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "text-foreground mb-2 block", children: [
                      "Name ",
                      /* @__PURE__ */ jsx("span", { className: "text-primary", children: "*" })
                    ] }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        id: "name",
                        name: "name",
                        type: "text",
                        placeholder: "Your name",
                        value: data.name,
                        onChange: handleChange,
                        required: true,
                        className: "w-full px-4 py-3 bg-background/50 border border-white/10 rounded-lg text-foreground placeholder-muted-foreground focus:border-primary/50 transition-colors"
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                motion.div,
                {
                  initial: { opacity: 0, x: -20 },
                  animate: { opacity: 1, x: 0 },
                  transition: { delay: 0.35 },
                  children: [
                    /* @__PURE__ */ jsxs("label", { htmlFor: "email", className: "text-foreground mb-2 block", children: [
                      "Email ",
                      /* @__PURE__ */ jsx("span", { className: "text-primary", children: "*" })
                    ] }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        id: "email",
                        name: "email",
                        type: "email",
                        placeholder: "your@email.com",
                        value: data.email,
                        onChange: handleChange,
                        required: true,
                        className: "w-full px-4 py-3 bg-background/50 border border-white/10 rounded-lg text-foreground placeholder-muted-foreground focus:border-primary/50 transition-colors"
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                motion.div,
                {
                  initial: { opacity: 0, x: -20 },
                  animate: { opacity: 1, x: 0 },
                  transition: { delay: 0.4 },
                  children: [
                    /* @__PURE__ */ jsxs("label", { htmlFor: "subject", className: "text-foreground mb-2 block", children: [
                      "Subject ",
                      /* @__PURE__ */ jsx("span", { className: "text-primary", children: "*" })
                    ] }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        id: "subject",
                        name: "subject",
                        type: "text",
                        placeholder: "What's this about?",
                        value: data.subject,
                        onChange: handleChange,
                        required: true,
                        className: "w-full px-4 py-3 bg-background/50 border border-white/10 rounded-lg text-foreground placeholder-muted-foreground focus:border-primary/50 transition-colors"
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                motion.div,
                {
                  initial: { opacity: 0, x: -20 },
                  animate: { opacity: 1, x: 0 },
                  transition: { delay: 0.45 },
                  children: [
                    /* @__PURE__ */ jsxs("label", { htmlFor: "message", className: "text-foreground mb-2 block", children: [
                      "Message ",
                      /* @__PURE__ */ jsx("span", { className: "text-primary", children: "*" })
                    ] }),
                    /* @__PURE__ */ jsx(
                      "textarea",
                      {
                        id: "message",
                        name: "message",
                        placeholder: "Tell us about your project...",
                        value: data.message,
                        onChange: handleChange,
                        required: true,
                        rows: 5,
                        className: "w-full px-4 py-3 bg-background/50 border border-white/10 rounded-lg text-foreground placeholder-muted-foreground focus:border-primary/50 transition-colors resize-none"
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                motion.div,
                {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: 0.5 },
                  children: /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "submit",
                      disabled: processing,
                      className: "w-full bg-linear-to-r from-primary to-accent hover:opacity-90 transition-opacity text-primary-foreground font-medium py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                      children: processing ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsx(
                          motion.div,
                          {
                            animate: { rotate: 360 },
                            transition: { duration: 1, repeat: Infinity, ease: "linear" },
                            className: "w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                          }
                        ),
                        "Sending..."
                      ] }) : /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsx(Send, { className: "w-5 h-5" }),
                        "Send Message"
                      ] })
                    }
                  )
                }
              )
            ] })
          ] })
        }
      )
    ] }) })
  ] });
};
const __vite_glob_0_41 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Contact
}, Symbol.toStringTag, { value: "Module" }));
function Home() {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("section", { className: "relative min-h-screen flex items-center justify-center overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[100px] animate-pulse" }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-500/10 blur-[80px] animate-pulse", style: { animationDelay: "1s" } }),
      /* @__PURE__ */ jsx("div", { className: "container mx-auto px-6 pt-32 pb-20 relative z-10", children: /* @__PURE__ */ jsxs("div", { className: "text-center max-w-4xl mx-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 mb-8", children: [
          /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-cyan-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 10V3L4 14h7v7l9-11h-7z" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "AI-Powered Web Development" })
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "font-display text-5xl md:text-7xl font-bold leading-tight mb-6", children: [
          "Building the",
          " ",
          /* @__PURE__ */ jsx("span", { className: "bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent", children: "Future" }),
          /* @__PURE__ */ jsx("br", {}),
          "of Web Applications"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10", children: "CoreLink Development specializes in crafting intelligent, scalable web and mobile applications using cutting-edge AI technology with expert developer oversight." }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-4", children: [
          /* @__PURE__ */ jsxs(
            Link$1,
            {
              to: "/projects",
              className: "group px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2",
              children: [
                "Explore Our Work",
                /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 transition-transform group-hover:translate-x-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            Link$1,
            {
              to: "/contact",
              className: "px-6 py-3 rounded-lg border border-slate-700 text-white font-medium hover:bg-slate-800/50 transition-colors",
              children: "Get In Touch"
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent" })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "relative py-32 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 opacity-50" }),
      /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 relative z-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center mb-16", children: [
          /* @__PURE__ */ jsx("span", { className: "text-cyan-500 font-medium tracking-wider uppercase text-sm", children: "Why Choose Us" }),
          /* @__PURE__ */ jsxs("h2", { className: "font-display text-4xl md:text-5xl font-bold mt-4 mb-6", children: [
            "Excellence in Every ",
            /* @__PURE__ */ jsx("span", { className: "bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent", children: "Line of Code" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-lg max-w-2xl mx-auto", children: "We combine the power of AI with human expertise to deliver exceptional digital experiences that stand out." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6", children: [
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
        ].map((feature, index) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "group bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-2xl hover:bg-slate-800/70 hover:border-cyan-500/30 transition-all duration-300",
            children: [
              /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors text-3xl", children: feature.icon }) }),
              /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-white mb-3", children: feature.title }),
              /* @__PURE__ */ jsx("p", { className: "text-slate-400 leading-relaxed", children: feature.description })
            ]
          },
          index
        )) })
      ] })
    ] })
  ] });
}
const __vite_glob_0_52 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Home
}, Symbol.toStringTag, { value: "Module" }));
const Hero = () => {
  return /* @__PURE__ */ jsxs("section", { className: "relative min-h-screen flex items-center justify-center hero-gradient overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:60px_60px]" }),
    /* @__PURE__ */ jsx(
      motion.div,
      {
        className: "absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[100px]",
        animate: {
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        },
        transition: { duration: 8, repeat: Infinity }
      }
    ),
    /* @__PURE__ */ jsx(
      motion.div,
      {
        className: "absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-[80px]",
        animate: {
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.2, 0.4]
        },
        transition: { duration: 6, repeat: Infinity }
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "container mx-auto px-6 pt-32 pb-20 relative z-10", children: /* @__PURE__ */ jsxs("div", { className: "text-center max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6 },
          className: "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border border-primary/30 shadow-[0_0_20px_rgba(8,216,250,0.3)] mb-8",
          children: [
            /* @__PURE__ */ jsx(Rocket, { className: "w-4 h-4 text-primary" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-foreground", children: "AI-Powered Web Development" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        motion.h1,
        {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay: 0.1 },
          className: "text-5xl md:text-7xl font-bold leading-tight mb-6",
          children: [
            "Building the",
            " ",
            /* @__PURE__ */ jsx("span", { className: "gradient-text", children: "Future" }),
            /* @__PURE__ */ jsx("br", {}),
            "of Web Applications"
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        motion.p,
        {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay: 0.2 },
          className: "text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10",
          children: "CoreLink Development specializes in crafting intelligent, scalable web and mobile applications using cutting-edge AI technology with expert developer oversight."
        }
      ),
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay: 0.3 },
          className: "flex flex-col sm:flex-row items-center justify-center gap-4",
          children: [
            /* @__PURE__ */ jsxs(
              Link$1,
              {
                to: "/projects",
                className: "group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2",
                children: [
                  "Explore Our Work",
                  /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 transition-transform group-hover:translate-x-1" })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              Link$1,
              {
                to: "/contact",
                className: "px-8 py-4 bg-transparent border border-white/20 text-foreground font-medium rounded-lg hover:bg-white/5 transition-colors",
                children: "Get In Touch"
              }
            )
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" })
  ] });
};
const FeatureCard = ({ icon: Icon, title, description, index }) => {
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 40 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-100px" },
      transition: { duration: 0.6, delay: index * 0.1 },
      whileHover: { y: -5, transition: { duration: 0.2 } },
      className: "group glass-card glow-border p-8 hover:bg-card/70 transition-all duration-300",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6 relative", children: [
          /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors", children: /* @__PURE__ */ jsx(Icon, { className: "w-7 h-7 text-primary" }) }),
          /* @__PURE__ */ jsx("div", { className: "absolute -inset-2 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity" })
        ] }),
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-xl mb-3 group-hover:text-primary transition-colors", children: title }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: description })
      ]
    }
  );
};
const features = [
  {
    icon: Zap,
    title: "AI-Enhanced Development",
    description: "Leveraging AI to accelerate development while maintaining expert code quality and best practices."
  },
  {
    icon: Target,
    title: "Proven Track Record",
    description: "Building and scaling SaaS platforms that serve thousands of users with reliability and performance."
  },
  {
    icon: Wrench,
    title: "Modern Tech Stack",
    description: "Laravel, Vue 3, Inertia.js, React, and more for responsive, cutting-edge applications."
  },
  {
    icon: Code2,
    title: "Clean Architecture",
    description: "Maintainable, scalable codebases built with industry best practices and design patterns."
  },
  {
    icon: Shield,
    title: "Security First",
    description: "Enterprise-grade security measures implemented from day one to protect your data."
  },
  {
    icon: Sparkles,
    title: "Pixel Perfect Design",
    description: "Beautiful, intuitive interfaces that delight users and drive engagement."
  }
];
const Features = () => {
  return /* @__PURE__ */ jsxs("section", { className: "relative py-32 overflow-hidden", id: "features", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 hero-gradient opacity-50" }),
    /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 relative z-10", children: [
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          className: "text-center mb-16",
          children: [
            /* @__PURE__ */ jsx("span", { className: "text-primary font-medium tracking-wider uppercase text-sm", children: "Why Choose Us" }),
            /* @__PURE__ */ jsxs("h2", { className: "text-4xl md:text-5xl font-bold mt-4 mb-6", children: [
              "Excellence in Every ",
              /* @__PURE__ */ jsx("span", { className: "gradient-text", children: "Line of Code" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-lg max-w-2xl mx-auto", children: "We combine the power of AI with human expertise to deliver exceptional digital experiences that stand out." })
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6", children: features.map((feature, index) => /* @__PURE__ */ jsx(FeatureCard, { ...feature, index }, feature.title)) })
    ] })
  ] });
};
const Index = ({ meta }) => {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(SeoHead, { meta }),
    /* @__PURE__ */ jsx(Hero, {}),
    /* @__PURE__ */ jsx(Features, {})
  ] });
};
const __vite_glob_0_53 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index
}, Symbol.toStringTag, { value: "Module" }));
const Privacy = ({ meta }) => {
  const effectiveDate = "January 22, 2026";
  return /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden", children: [
    /* @__PURE__ */ jsx(SeoHead, { meta }),
    /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 pointer-events-none", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-1/3 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-[128px]" })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "relative py-24 px-6", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto text-center", children: [
      /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5 },
          className: "flex justify-center mb-6",
          children: /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center", children: /* @__PURE__ */ jsx(Shield, { className: "w-8 h-8 text-primary" }) })
        }
      ),
      /* @__PURE__ */ jsx(
        motion.h1,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: 0.1 },
          className: "text-4xl md:text-5xl font-bold mb-6",
          children: "Privacy Policy"
        }
      ),
      /* @__PURE__ */ jsxs(
        motion.p,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: 0.2 },
          className: "text-lg text-muted-foreground",
          children: [
            "Effective Date: ",
            effectiveDate
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "relative py-12 px-6", children: /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay: 0.3 },
        className: "max-w-4xl mx-auto prose prose-invert prose-slate",
        children: /* @__PURE__ */ jsxs("div", { className: "bg-card/50 backdrop-blur border border-border rounded-2xl p-8 md:p-12 space-y-8", children: [
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground mb-4", children: "1. Introduction" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: 'CoreLink Development LLC ("Company," "we," "us," or "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, client portals, and related services (collectively, the "Services").' }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed mt-4", children: "As a software development and digital marketing company, we handle various types of client information. Please read this Privacy Policy carefully. By using our Services, you consent to the practices described in this policy." })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground mb-4", children: "2. Information We Collect" }),
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-medium text-foreground mt-6 mb-3", children: "2.1 Information You Provide" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "We collect information you voluntarily provide, including:" }),
            /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-6 text-muted-foreground space-y-2 mt-4", children: [
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Contact Information:" }),
                " Name, email address, phone number, and company name when you inquire about our services or create an account"
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Billing Information:" }),
                " Billing address and payment details (processed securely through Stripe)"
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Communication Data:" }),
                " Messages, emails, support requests, and feedback you send us"
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Project Information:" }),
                " Business requirements, brand assets, content, and other materials you provide for your projects"
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Discovery Information:" }),
                " Responses to our project discovery process and questionnaires"
              ] })
            ] }),
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-medium text-foreground mt-6 mb-3", children: "2.2 Information Collected Automatically" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "When you use our Services, we automatically collect:" }),
            /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-6 text-muted-foreground space-y-2 mt-4", children: [
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Device Information:" }),
                " Browser type, operating system, and device identifiers"
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Usage Data:" }),
                " Pages visited, features used, and actions taken within our Services"
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Log Data:" }),
                " IP address, access times, and referring URLs"
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Cookies:" }),
                " Session cookies for authentication and preferences"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground mb-4", children: "3. How We Use Your Information" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "We use the collected information to:" }),
            /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-6 text-muted-foreground space-y-2 mt-4", children: [
              /* @__PURE__ */ jsx("li", { children: "Deliver software development, web design, and marketing services" }),
              /* @__PURE__ */ jsx("li", { children: "Communicate about project progress, deliverables, and milestones" }),
              /* @__PURE__ */ jsx("li", { children: "Process transactions and send related information (proposals, invoices, receipts)" }),
              /* @__PURE__ */ jsx("li", { children: "Respond to your inquiries and provide customer support" }),
              /* @__PURE__ */ jsx("li", { children: "Send administrative notifications about your projects or account" }),
              /* @__PURE__ */ jsx("li", { children: "Share relevant industry insights, updates, and promotional offers (with consent)" }),
              /* @__PURE__ */ jsx("li", { children: "Improve our services and develop new offerings" }),
              /* @__PURE__ */ jsx("li", { children: "Detect, prevent, and address technical issues and security threats" }),
              /* @__PURE__ */ jsx("li", { children: "Comply with legal obligations" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground mb-4", children: "4. Information Sharing" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "We do not sell your personal information. We may share your information with:" }),
            /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-6 text-muted-foreground space-y-2 mt-4", children: [
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Service Providers:" }),
                " Third parties that help us operate our Services (e.g., Stripe for payment processing, email service providers)"
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Legal Requirements:" }),
                " When required by law, court order, or governmental authority"
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Business Transfers:" }),
                " In connection with a merger, acquisition, or sale of assets"
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "With Your Consent:" }),
                " When you have given explicit permission"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground mb-4", children: "5. Data Security" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "We implement appropriate technical and organizational measures to protect your personal data, including:" }),
            /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-6 text-muted-foreground space-y-2 mt-4", children: [
              /* @__PURE__ */ jsx("li", { children: "Encryption of data in transit (HTTPS/TLS)" }),
              /* @__PURE__ */ jsx("li", { children: "Secure password hashing" }),
              /* @__PURE__ */ jsx("li", { children: "Regular security assessments" }),
              /* @__PURE__ */ jsx("li", { children: "Access controls and authentication measures" }),
              /* @__PURE__ */ jsx("li", { children: "Secure payment processing through PCI-compliant providers (Stripe)" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed mt-4", children: "However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security." })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground mb-4", children: "6. Data Retention" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "We retain your personal data for as long as necessary to:" }),
            /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-6 text-muted-foreground space-y-2 mt-4", children: [
              /* @__PURE__ */ jsx("li", { children: "Provide our Services to you" }),
              /* @__PURE__ */ jsx("li", { children: "Comply with legal obligations (e.g., tax and accounting requirements)" }),
              /* @__PURE__ */ jsx("li", { children: "Resolve disputes and enforce our agreements" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed mt-4", children: "When data is no longer needed, we securely delete or anonymize it." })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground mb-4", children: "7. Your Rights" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "Depending on your location, you may have the following rights:" }),
            /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-6 text-muted-foreground space-y-2 mt-4", children: [
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Access:" }),
                " Request a copy of the personal data we hold about you"
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Correction:" }),
                " Request correction of inaccurate or incomplete data"
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Deletion:" }),
                " Request deletion of your personal data (subject to legal requirements)"
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Portability:" }),
                " Request transfer of your data to another service"
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Opt-out:" }),
                " Unsubscribe from marketing communications at any time"
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed mt-4", children: "To exercise these rights, please contact us using the information below." })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground mb-4", children: "8. Cookies and Tracking" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "We use cookies and similar technologies to:" }),
            /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-6 text-muted-foreground space-y-2 mt-4", children: [
              /* @__PURE__ */ jsx("li", { children: "Maintain your session and authentication" }),
              /* @__PURE__ */ jsx("li", { children: "Remember your preferences" }),
              /* @__PURE__ */ jsx("li", { children: "Analyze how our Services are used" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed mt-4", children: "You can control cookies through your browser settings, though disabling them may affect the functionality of our Services." })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground mb-4", children: "9. Third-Party Services" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "Our Services and the products we build may integrate with third-party services, including:" }),
            /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-6 text-muted-foreground space-y-2 mt-4", children: [
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Stripe:" }),
                " For secure payment processing. See ",
                /* @__PURE__ */ jsx("a", { href: "https://stripe.com/privacy", target: "_blank", rel: "noopener noreferrer", className: "text-primary hover:underline", children: "Stripe's Privacy Policy" })
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Cloud Hosting Providers:" }),
                " For website and application hosting (AWS, DigitalOcean, etc.)"
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Analytics Tools:" }),
                " To understand website traffic and user behavior"
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Email Services:" }),
                " For transactional and marketing communications"
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "AI Services:" }),
                " To enhance our development workflow and capabilities"
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed mt-4", children: "These services have their own privacy policies, and we encourage you to review them. For client projects, we will discuss any third-party integrations and their data implications." })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground mb-4", children: "10. Children's Privacy" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "Our Services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child, we will take steps to delete it." })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground mb-4", children: "11. Changes to This Policy" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: 'We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Effective Date" above. We encourage you to review this policy periodically.' })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground mb-4", children: "12. Contact Us" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "If you have questions about this Privacy Policy or our data practices, please contact us:" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 p-4 bg-muted/20 rounded-lg", children: [
              /* @__PURE__ */ jsx("p", { className: "text-foreground font-medium", children: "CoreLink Development LLC" }),
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Email: info@corelink.dev" }),
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Website: corelink.dev" })
            ] })
          ] })
        ] })
      }
    ) })
  ] });
};
const __vite_glob_0_54 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Privacy
}, Symbol.toStringTag, { value: "Module" }));
const processSteps = [
  {
    number: "01",
    title: "Discovery Process",
    description: "Our AI-driven discovery bot guides you through an intelligent conversation to understand your vision, challenges, and goals—generating a comprehensive project brief that captures every detail.",
    features: [
      "Interactive AI-guided requirements gathering",
      "Automatic identification of key features and priorities",
      "Expert review of AI-generated recommendations",
      "Comprehensive project brief delivered to your inbox"
    ],
    icon: MessageSquare
  },
  {
    number: "02",
    title: "Strategy & Architecture",
    description: "With 25+ years of experience informing every decision, we translate your requirements into a solid technical foundation—selecting the right technologies and designing scalable architecture.",
    features: [
      "Technology stack selection based on project needs",
      "System architecture designed for growth",
      "AI-assisted research and analysis",
      "Expert validation of all technical decisions"
    ],
    icon: Compass
  },
  {
    number: "03",
    title: "Design & Prototyping",
    description: "We create intuitive, beautiful interfaces using AI-enhanced design tools, with every decision guided by decades of UX expertise and real-world project experience.",
    features: [
      "AI-accelerated UI/UX design workflows",
      "Interactive prototypes for early feedback",
      "Responsive designs for all devices",
      "Accessibility built in from the start"
    ],
    icon: Palette
  },
  {
    number: "04",
    title: "AI-Enhanced Development",
    description: "This is where AI truly shines. We leverage advanced AI coding assistants to write, review, and optimize code—always under the watchful eye of a veteran developer who ensures quality, security, and best practices.",
    features: [
      "AI pair programming for rapid development",
      "Every line reviewed by experienced human developer",
      "Modern, maintainable code architecture",
      "Continuous integration and automated testing"
    ],
    icon: Code2
  },
  {
    number: "05",
    title: "Quality Assurance",
    description: "Comprehensive testing combines AI-powered analysis with manual expert review to catch issues before they reach production.",
    features: [
      "AI-assisted code review and security scanning",
      "Automated and manual testing coverage",
      "Performance optimization and load testing",
      "Cross-browser and device compatibility"
    ],
    icon: ShieldCheck
  },
  {
    number: "06",
    title: "Launch & Beyond",
    description: "We handle deployment with care and continue supporting your project with ongoing maintenance, updates, and strategic improvements as your needs evolve.",
    features: [
      "Smooth, monitored deployment process",
      "Training and documentation provided",
      "Ongoing support and maintenance",
      "Strategic guidance for future growth"
    ],
    icon: Rocket
  }
];
const advantages = [
  {
    title: "25+ Years Experience",
    description: "Every project benefits from decades of real-world development experience, from startups to enterprise solutions.",
    icon: Brain
  },
  {
    title: "AI-Accelerated Delivery",
    description: "Cutting-edge AI tools dramatically speed up development while maintaining the highest quality standards.",
    icon: Sparkles
  },
  {
    title: "Human Oversight",
    description: "AI assists, but an experienced developer reviews every decision to ensure nothing slips through the cracks.",
    icon: Eye
  },
  {
    title: "Transparent Process",
    description: "Clear communication at every stage keeps you informed and involved throughout your project.",
    icon: Users
  },
  {
    title: "Built for Scale",
    description: "Architecture decisions made with growth in mind, so your application can evolve as your business does.",
    icon: TrendingUp
  },
  {
    title: "Long-term Partner",
    description: "We're invested in your success beyond launch, providing ongoing support and strategic guidance.",
    icon: HeartHandshake
  }
];
const Process = ({ meta }) => {
  return /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden", children: [
    /* @__PURE__ */ jsx(SeoHead, { meta }),
    /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 pointer-events-none", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-1/3 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-[128px]" })
    ] }),
    /* @__PURE__ */ jsx("main", { className: "relative pt-32 pb-24", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6", children: [
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6 },
          className: "text-center max-w-4xl mx-auto mb-20",
          children: [
            /* @__PURE__ */ jsx(
              motion.span,
              {
                initial: { opacity: 0, scale: 0.9 },
                animate: { opacity: 1, scale: 1 },
                transition: { delay: 0.1 },
                className: "inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase bg-primary/10 text-primary border border-primary/20 mb-6",
                children: "Our Approach"
              }
            ),
            /* @__PURE__ */ jsxs("h1", { className: "text-4xl md:text-5xl lg:text-6xl font-bold mb-6", children: [
              /* @__PURE__ */ jsx("span", { className: "gradient-text", children: "AI-Powered Development," }),
              /* @__PURE__ */ jsx("br", {}),
              /* @__PURE__ */ jsx("span", { className: "text-foreground", children: "Expert-Guided Results" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground max-w-3xl mx-auto mb-8", children: "We harness the power of cutting-edge AI tools while maintaining the oversight and strategic thinking that only comes from 25+ years of software development experience. The best of both worlds: speed and precision, innovation and wisdom." }),
            /* @__PURE__ */ jsxs(
              motion.div,
              {
                initial: { opacity: 0, y: 10 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: 0.3 },
                className: "inline-flex items-center gap-3 glass-card rounded-full px-6 py-3 border border-primary/20",
                children: [
                  /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-primary" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-foreground", children: "Human Expertise Meets AI Efficiency" })
                ]
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        motion.p,
        {
          initial: { opacity: 0 },
          whileInView: { opacity: 1 },
          viewport: { once: true },
          className: "text-center text-muted-foreground max-w-3xl mx-auto mb-24",
          children: "Every AI-assisted decision is validated by a seasoned developer who has navigated the evolution of web technology from the early days to today's modern frameworks. This means you get rapid development without sacrificing architectural integrity, security best practices, or long-term maintainability."
        }
      ),
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          className: "text-center mb-16",
          children: [
            /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold text-foreground mb-4", children: "How We Work" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-2xl mx-auto", children: "A streamlined process that leverages AI at every stage while keeping experienced human judgment at the helm." })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "relative mb-32", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent hidden lg:block" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-12 lg:space-y-24", children: processSteps.map((step, index) => {
          const Icon = step.icon;
          const isEven = index % 2 === 0;
          return /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { opacity: 0, x: isEven ? -50 : 50 },
              whileInView: { opacity: 1, x: 0 },
              viewport: { once: true, margin: "-100px" },
              transition: { duration: 0.6 },
              className: `relative grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${isEven ? "" : "lg:grid-flow-dense"}`,
              children: [
                /* @__PURE__ */ jsx("div", { className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex", children: /* @__PURE__ */ jsx(
                  motion.div,
                  {
                    initial: { scale: 0 },
                    whileInView: { scale: 1 },
                    viewport: { once: true },
                    className: "w-16 h-16 rounded-full bg-background border-2 border-primary flex items-center justify-center glow-border",
                    children: /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-primary", children: step.number })
                  }
                ) }),
                /* @__PURE__ */ jsx("div", { className: `${isEven ? "lg:pr-20 lg:text-right" : "lg:col-start-2 lg:pl-20"}`, children: /* @__PURE__ */ jsxs("div", { className: "glass-card rounded-2xl p-8", children: [
                  /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-4 mb-4 ${isEven ? "lg:flex-row-reverse" : ""}`, children: [
                    /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Icon, { className: "w-6 h-6 text-primary" }) }),
                    /* @__PURE__ */ jsx("div", { className: "lg:hidden w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-primary", children: step.number }) }),
                    /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold text-foreground flex-1", children: step.title })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: `text-muted-foreground mb-6 ${isEven ? "lg:text-right" : ""}`, children: step.description }),
                  /* @__PURE__ */ jsx("ul", { className: `space-y-2 ${isEven ? "lg:text-right" : ""}`, children: step.features.map((feature, i) => /* @__PURE__ */ jsxs(
                    "li",
                    {
                      className: `text-sm text-muted-foreground flex items-center gap-2 ${isEven ? "lg:flex-row-reverse" : ""}`,
                      children: [
                        /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" }),
                        feature
                      ]
                    },
                    i
                  )) })
                ] }) }),
                /* @__PURE__ */ jsx("div", { className: `hidden lg:block ${isEven ? "" : "lg:col-start-1 lg:row-start-1"}` })
              ]
            },
            step.number
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          className: "text-center mb-16",
          children: [
            /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold text-foreground mb-4", children: "The CoreLink Advantage" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-2xl mx-auto", children: "Combining decades of hands-on experience with the latest AI capabilities to deliver exceptional results." })
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24", children: advantages.map((advantage, index) => {
        const Icon = advantage.icon;
        return /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 20 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true },
            transition: { delay: index * 0.1 },
            className: "group glass-card rounded-2xl p-6 hover:border-primary/30 transition-colors",
            children: [
              /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors", children: /* @__PURE__ */ jsx(Icon, { className: "w-6 h-6 text-primary" }) }),
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-foreground mb-2", children: advantage.title }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: advantage.description })
            ]
          },
          advantage.title
        );
      }) }),
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          className: "text-center glass-card rounded-3xl p-12 relative overflow-hidden",
          children: [
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold text-foreground mb-4", children: "Ready to Start Your Project?" }),
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-xl mx-auto mb-8", children: "Begin with our AI-powered discovery process and see how we can bring your vision to life." }),
              /* @__PURE__ */ jsx(
                Link,
                {
                  href: "/contact",
                  className: "inline-block px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity",
                  children: "Get Started"
                }
              )
            ] })
          ]
        }
      )
    ] }) })
  ] });
};
const __vite_glob_0_55 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Process
}, Symbol.toStringTag, { value: "Module" }));
const Lightbox = ({ images, currentIndex, onClose, onPrev, onNext }) => {
  return /* @__PURE__ */ jsx(AnimatePresence, { children: /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm",
      onClick: onClose,
      children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onClose,
            className: "absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10",
            children: /* @__PURE__ */ jsx(X, { className: "w-8 h-8" })
          }
        ),
        images.length > 1 && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              onPrev();
            },
            className: "absolute left-4 p-2 text-white/70 hover:text-white transition-colors z-10",
            children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-10 h-10" })
          }
        ),
        /* @__PURE__ */ jsx(
          motion.img,
          {
            initial: { opacity: 0, scale: 0.9 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.9 },
            src: images[currentIndex],
            alt: `Screenshot ${currentIndex + 1}`,
            width: 1200,
            height: 800,
            loading: "eager",
            className: "max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl",
            onClick: (e) => e.stopPropagation()
          },
          currentIndex
        ),
        images.length > 1 && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              onNext();
            },
            className: "absolute right-4 p-2 text-white/70 hover:text-white transition-colors z-10",
            children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-10 h-10" })
          }
        ),
        images.length > 1 && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-full text-white/70 text-sm", children: [
          currentIndex + 1,
          " / ",
          images.length
        ] })
      ]
    }
  ) });
};
const Projects = ({ meta, projects = [] }) => {
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
      currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1
    }));
  };
  const goToNext = () => {
    setLightbox((prev) => ({
      ...prev,
      currentIndex: prev.currentIndex === prev.images.length - 1 ? 0 : prev.currentIndex + 1
    }));
  };
  const handleKeyDown = (e) => {
    if (!lightbox.isOpen) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") goToPrev();
    if (e.key === "ArrowRight") goToNext();
  };
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox.isOpen]);
  return /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden", children: [
    /* @__PURE__ */ jsx(SeoHead, { meta }),
    lightbox.isOpen && /* @__PURE__ */ jsx(
      Lightbox,
      {
        images: lightbox.images,
        currentIndex: lightbox.currentIndex,
        onClose: closeLightbox,
        onPrev: goToPrev,
        onNext: goToNext
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 pointer-events-none", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]" }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px]" })
    ] }),
    /* @__PURE__ */ jsx("main", { className: "relative pt-32 pb-24", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center max-w-3xl mx-auto mb-20", children: [
        /* @__PURE__ */ jsx("span", { className: "inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 mb-6", children: "Portfolio" }),
        /* @__PURE__ */ jsx("h1", { className: "text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6", children: /* @__PURE__ */ jsx("span", { className: "bg-linear-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent", children: "Our Projects" }) }),
        /* @__PURE__ */ jsx("p", { className: "text-lg text-slate-400", children: "Innovative solutions powering businesses and individuals" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-12 lg:space-y-16", children: projects.map((project, index) => /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute -inset-0.5 bg-linear-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" }),
        /* @__PURE__ */ jsxs("div", { className: "relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 lg:p-10 overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-cyan-500/5 to-transparent rounded-full blur-3xl" }),
          /* @__PURE__ */ jsxs("div", { className: `grid lg:grid-cols-2 gap-8 lg:gap-12 ${index % 2 === 1 ? "lg:grid-flow-dense" : ""}`, children: [
            /* @__PURE__ */ jsxs("div", { className: `space-y-6 ${index % 2 === 1 ? "lg:col-start-2" : ""}`, children: [
              /* @__PURE__ */ jsx("span", { className: "inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase bg-cyan-500/10 text-cyan-500 border border-cyan-500/20", children: project.category }),
              /* @__PURE__ */ jsx("h3", { className: "text-3xl lg:text-4xl font-display font-bold text-white", children: project.title }),
              /* @__PURE__ */ jsx("p", { className: "text-slate-400 leading-relaxed", children: project.description }),
              project.features && project.features.length > 0 && /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: project.features.map((feature, i) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-3 text-sm text-slate-400", children: [
                /* @__PURE__ */ jsx("span", { className: "shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center mt-0.5", children: /* @__PURE__ */ jsx("svg", { className: "w-3 h-3 text-cyan-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }) }),
                feature
              ] }, i)) }),
              project.link && /* @__PURE__ */ jsxs(
                "a",
                {
                  href: project.link,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-linear-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity",
                  children: [
                    "Visit ",
                    project.title,
                    /* @__PURE__ */ jsx(ExternalLink, { className: "w-4 h-4" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: `space-y-6 ${index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}`, children: [
              project.tech_stack && project.tech_stack.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6", children: [
                /* @__PURE__ */ jsx("h4", { className: "text-xs font-medium tracking-widest uppercase text-slate-400 mb-4", children: "Tech Stack" }),
                /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: project.tech_stack.map((tech, i) => /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: "px-3 py-1 rounded-md text-xs font-medium bg-slate-800 text-cyan-500 border border-slate-700",
                    children: tech
                  },
                  i
                )) })
              ] }),
              project.screenshots && project.screenshots.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6", children: [
                /* @__PURE__ */ jsx("h4", { className: "text-xs font-medium tracking-widest uppercase text-slate-400 mb-4", children: "Screenshots" }),
                /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-3", children: project.screenshots.map((screenshot, i) => /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => openLightbox(project.screenshots, i),
                    className: "relative aspect-video rounded-lg overflow-hidden border border-slate-700 hover:border-cyan-500/50 transition-colors group/img",
                    children: [
                      /* @__PURE__ */ jsx(
                        "img",
                        {
                          src: screenshot,
                          alt: `${project.title} screenshot ${i + 1}`,
                          width: 400,
                          height: 225,
                          loading: "lazy",
                          className: "w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-110"
                        }
                      ),
                      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-colors flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "opacity-0 group-hover/img:opacity-100 transition-opacity text-white text-xs font-medium", children: "View" }) })
                    ]
                  },
                  i
                )) })
              ] })
            ] })
          ] })
        ] })
      ] }, project.id || index)) }),
      projects.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-center py-16", children: /* @__PURE__ */ jsx("p", { className: "text-slate-400", children: "No projects available at the moment." }) })
    ] }) })
  ] });
};
const __vite_glob_0_56 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Projects
}, Symbol.toStringTag, { value: "Module" }));
const Terms = ({ meta }) => {
  const effectiveDate = "January 22, 2026";
  return /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden", children: [
    /* @__PURE__ */ jsx(SeoHead, { meta }),
    /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 pointer-events-none", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-1/3 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-[128px]" })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "relative py-24 px-6", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto text-center", children: [
      /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5 },
          className: "flex justify-center mb-6",
          children: /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center", children: /* @__PURE__ */ jsx(Scale, { className: "w-8 h-8 text-primary" }) })
        }
      ),
      /* @__PURE__ */ jsx(
        motion.h1,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: 0.1 },
          className: "text-4xl md:text-5xl font-bold mb-6",
          children: "Terms of Service"
        }
      ),
      /* @__PURE__ */ jsxs(
        motion.p,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: 0.2 },
          className: "text-lg text-muted-foreground",
          children: [
            "Effective Date: ",
            effectiveDate
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "relative py-12 px-6", children: /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay: 0.3 },
        className: "max-w-4xl mx-auto prose prose-invert prose-slate",
        children: /* @__PURE__ */ jsxs("div", { className: "bg-card/50 backdrop-blur border border-border rounded-2xl p-8 md:p-12 space-y-8", children: [
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground mb-4", children: "1. Acceptance of Terms" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: 'By accessing or using the services provided by CoreLink Development LLC ("Company," "we," "us," or "our"), including our website, client portals, project deliverables, and any related services (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Services.' })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground mb-4", children: "2. Description of Services" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "CoreLink Development LLC is a software development and digital marketing company. We provide a range of technical and creative services to help businesses grow and succeed online. Our Services include:" }),
            /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-6 text-muted-foreground space-y-2 mt-4", children: [
              /* @__PURE__ */ jsx("li", { children: "Custom web application and software development" }),
              /* @__PURE__ */ jsx("li", { children: "Website design and development" }),
              /* @__PURE__ */ jsx("li", { children: "E-commerce solutions and online stores" }),
              /* @__PURE__ */ jsx("li", { children: "Mobile application development" }),
              /* @__PURE__ */ jsx("li", { children: "Digital marketing and SEO services" }),
              /* @__PURE__ */ jsx("li", { children: "Brand identity and graphic design" }),
              /* @__PURE__ */ jsx("li", { children: "API development and third-party integrations" }),
              /* @__PURE__ */ jsx("li", { children: "Ongoing maintenance, support, and hosting" }),
              /* @__PURE__ */ jsx("li", { children: "Technical consulting and project management" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground mb-4", children: "3. User Accounts" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "To access certain features of our Services, you may be required to create an account. You are responsible for:" }),
            /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-6 text-muted-foreground space-y-2 mt-4", children: [
              /* @__PURE__ */ jsx("li", { children: "Maintaining the confidentiality of your account credentials" }),
              /* @__PURE__ */ jsx("li", { children: "All activities that occur under your account" }),
              /* @__PURE__ */ jsx("li", { children: "Notifying us immediately of any unauthorized use of your account" }),
              /* @__PURE__ */ jsx("li", { children: "Ensuring your account information is accurate and up-to-date" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground mb-4", children: "4. Payment Terms" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "For paid services, the following terms apply:" }),
            /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-6 text-muted-foreground space-y-2 mt-4", children: [
              /* @__PURE__ */ jsx("li", { children: "All fees are quoted in US Dollars unless otherwise specified" }),
              /* @__PURE__ */ jsx("li", { children: "Payment is due according to the terms specified on your invoice" }),
              /* @__PURE__ */ jsx("li", { children: "We accept payment via credit card (processed through Stripe), check, or bank transfer" }),
              /* @__PURE__ */ jsx("li", { children: "Late payments may incur additional fees as specified in your service agreement" }),
              /* @__PURE__ */ jsx("li", { children: "All sales are final unless otherwise agreed upon in writing" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground mb-4", children: "5. Intellectual Property" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "Unless otherwise specified in a separate agreement:" }),
            /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-6 text-muted-foreground space-y-2 mt-4", children: [
              /* @__PURE__ */ jsx("li", { children: "All content, features, and functionality of our website and internal tools are owned by CoreLink" }),
              /* @__PURE__ */ jsx("li", { children: "Custom websites, applications, designs, and other deliverables become client property upon full payment" }),
              /* @__PURE__ */ jsx("li", { children: "We retain the right to display completed work in our portfolio unless otherwise agreed" }),
              /* @__PURE__ */ jsx("li", { children: "We retain the right to use general knowledge, skills, and techniques acquired during projects" }),
              /* @__PURE__ */ jsx("li", { children: "Third-party libraries, frameworks, and stock assets retain their original licenses" }),
              /* @__PURE__ */ jsx("li", { children: "Source code ownership transfers to client upon final payment unless using licensed platforms" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground mb-4", children: "6. Acceptable Use" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "You agree not to use our Services to:" }),
            /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-6 text-muted-foreground space-y-2 mt-4", children: [
              /* @__PURE__ */ jsx("li", { children: "Violate any applicable laws or regulations" }),
              /* @__PURE__ */ jsx("li", { children: "Infringe upon the rights of others" }),
              /* @__PURE__ */ jsx("li", { children: "Transmit malicious code or attempt to compromise our systems" }),
              /* @__PURE__ */ jsx("li", { children: "Interfere with or disrupt the Services or servers" }),
              /* @__PURE__ */ jsx("li", { children: "Attempt to gain unauthorized access to any part of the Services" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground mb-4", children: "7. Limitation of Liability" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "TO THE MAXIMUM EXTENT PERMITTED BY LAW, CORELINK SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICES." })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground mb-4", children: "8. Indemnification" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "You agree to indemnify, defend, and hold harmless CoreLink and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses arising out of or in any way connected with your access to or use of the Services or your violation of these Terms." })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground mb-4", children: "9. Termination" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "We may terminate or suspend your access to our Services immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Services will immediately cease." })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground mb-4", children: "10. Changes to Terms" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: 'We reserve the right to modify these Terms at any time. We will provide notice of significant changes by posting the new Terms on this page and updating the "Effective Date" above. Your continued use of the Services after any changes constitutes acceptance of the new Terms.' })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground mb-4", children: "11. Governing Law" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "These Terms shall be governed by and construed in accordance with the laws of the State of Missouri, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved in the courts located in Johnson County, Missouri." })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground mb-4", children: "12. Contact Information" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "If you have any questions about these Terms, please contact us at:" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 p-4 bg-muted/20 rounded-lg", children: [
              /* @__PURE__ */ jsx("p", { className: "text-foreground font-medium", children: "CoreLink Development LLC" }),
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Email: info@corelink.dev" }),
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Website: corelink.dev" })
            ] })
          ] })
        ] })
      }
    ) })
  ] });
};
const __vite_glob_0_57 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Terms
}, Symbol.toStringTag, { value: "Module" }));
export {
  __vite_glob_0_57 as _,
  __vite_glob_0_56 as a,
  __vite_glob_0_55 as b,
  __vite_glob_0_54 as c,
  __vite_glob_0_53 as d,
  __vite_glob_0_52 as e,
  __vite_glob_0_41 as f,
  __vite_glob_0_40 as g,
  __vite_glob_0_39 as h,
  __vite_glob_0_38 as i,
  __vite_glob_0_32 as j,
  __vite_glob_0_0 as k
};
