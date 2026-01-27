import { motion } from "framer-motion";
import { 
  Sparkles, 
  ShieldCheck, 
  Target, 
  Rocket,
  Server,
  Monitor,
  Wrench,
  Layers,
  Globe,
  Cpu,
  Smartphone,
  Plug,
  ShoppingCart,
  Heart,
  Users
} from "lucide-react";

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
    items: ["React","Vue 3", "Inertia.js", "Tailwind CSS", "Vite", "TypeScript",]
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

const About = () => {
  return (
    <div className="relative overflow-hidden">
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
            className="max-w-4xl mb-20"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase bg-primary/10 text-primary border border-primary/20 mb-6"
            >
              About Us
            </motion.span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="gradient-text">About CoreLink</span>
            </h1>
            
            <p className="text-xl text-muted-foreground">
              Pioneering AI-powered web development
            </p>
          </motion.div>

          {/* Who We Are Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-8 lg:p-12 mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Who We Are
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Our mission at CoreLink Development is to steward technology for good, creating AI-enhanced web and mobile applications that are scalable, reliable, and transformative—rooted in Christian values of integrity, service, and innovation to uplift clients and communities.
              </p>
              <p>
                CoreLink Development is a forward-thinking software development company specializing in building intelligent web and mobile applications. We combine the efficiency of AI-assisted development with the expertise of senior developers to deliver exceptional results. CoreLink was fully built using Claude AI, demonstrating the power of AI-driven development when paired with expert oversight.
              </p>
              <p>
                Our approach leverages cutting-edge artificial intelligence to accelerate the development process while maintaining rigorous code quality standards and architectural excellence. Every line of code is reviewed and guided by experienced developers who understand both the technical and business requirements of your project.
              </p>
            </div>
          </motion.div>

          {/* Philosophy Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              Our Philosophy
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {philosophyItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group glass-card rounded-2xl p-6 hover:border-primary/30 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Tech Stack Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              Our Tech Stack
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(techStack).map(([key, stack], index) => {
                const Icon = stack.icon;
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card rounded-2xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{stack.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {stack.items.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1.5 rounded-lg text-sm bg-secondary/50 text-foreground border border-border"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* What We Build Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              What We Build
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {whatWeBuild.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group glass-card rounded-2xl p-6 text-center hover:border-primary/30 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default About;
