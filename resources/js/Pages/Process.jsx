import { motion } from "framer-motion";
import { 
  MessageSquare, 
  Compass, 
  Palette, 
  Code2, 
  ShieldCheck, 
  Rocket,
  Sparkles,
  Brain,
  Eye,
  Users,
  TrendingUp,
  HeartHandshake
} from "lucide-react";

const processSteps = [
  {
    number: "01",
    title: "Discovery Process",
    description: "Our AI-driven discovery bot guides you through an intelligent conversation to understand your vision, challenges, and goals—generating a comprehensive project brief that captures every detail.",
    features: [
      "Interactive AI-guided requirements gathering",
      "Automatic identification of key features and priorities",
      "Expert review of AI-generated recommendations",
      "Comprehensive project brief delivered to your inbox",
    ],
    icon: MessageSquare,
  },
  {
    number: "02",
    title: "Strategy & Architecture",
    description: "With 25+ years of experience informing every decision, we translate your requirements into a solid technical foundation—selecting the right technologies and designing scalable architecture.",
    features: [
      "Technology stack selection based on project needs",
      "System architecture designed for growth",
      "AI-assisted research and analysis",
      "Expert validation of all technical decisions",
    ],
    icon: Compass,
  },
  {
    number: "03",
    title: "Design & Prototyping",
    description: "We create intuitive, beautiful interfaces using AI-enhanced design tools, with every decision guided by decades of UX expertise and real-world project experience.",
    features: [
      "AI-accelerated UI/UX design workflows",
      "Interactive prototypes for early feedback",
      "Responsive designs for all devices",
      "Accessibility built in from the start",
    ],
    icon: Palette,
  },
  {
    number: "04",
    title: "AI-Enhanced Development",
    description: "This is where AI truly shines. We leverage advanced AI coding assistants to write, review, and optimize code—always under the watchful eye of a veteran developer who ensures quality, security, and best practices.",
    features: [
      "AI pair programming for rapid development",
      "Every line reviewed by experienced human developer",
      "Modern, maintainable code architecture",
      "Continuous integration and automated testing",
    ],
    icon: Code2,
  },
  {
    number: "05",
    title: "Quality Assurance",
    description: "Comprehensive testing combines AI-powered analysis with manual expert review to catch issues before they reach production.",
    features: [
      "AI-assisted code review and security scanning",
      "Automated and manual testing coverage",
      "Performance optimization and load testing",
      "Cross-browser and device compatibility",
    ],
    icon: ShieldCheck,
  },
  {
    number: "06",
    title: "Launch & Beyond",
    description: "We handle deployment with care and continue supporting your project with ongoing maintenance, updates, and strategic improvements as your needs evolve.",
    features: [
      "Smooth, monitored deployment process",
      "Training and documentation provided",
      "Ongoing support and maintenance",
      "Strategic guidance for future growth",
    ],
    icon: Rocket,
  },
];

const advantages = [
  {
    title: "25+ Years Experience",
    description: "Every project benefits from decades of real-world development experience, from startups to enterprise solutions.",
    icon: Brain,
  },
  {
    title: "AI-Accelerated Delivery",
    description: "Cutting-edge AI tools dramatically speed up development while maintaining the highest quality standards.",
    icon: Sparkles,
  },
  {
    title: "Human Oversight",
    description: "AI assists, but an experienced developer reviews every decision to ensure nothing slips through the cracks.",
    icon: Eye,
  },
  {
    title: "Transparent Process",
    description: "Clear communication at every stage keeps you informed and involved throughout your project.",
    icon: Users,
  },
  {
    title: "Built for Scale",
    description: "Architecture decisions made with growth in mind, so your application can evolve as your business does.",
    icon: TrendingUp,
  },
  {
    title: "Long-term Partner",
    description: "We're invested in your success beyond launch, providing ongoing support and strategic guidance.",
    icon: HeartHandshake,
  },
];

const Process = () => {

  return (
    <div className="relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-[128px]" />
      </div>

      <main className="relative pt-32 pb-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase bg-primary/10 text-primary border border-primary/20 mb-6"
            >
              Our Approach
            </motion.span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="gradient-text">AI-Powered Development,</span>
              <br />
              <span className="text-foreground">Expert-Guided Results</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              We harness the power of cutting-edge AI tools while maintaining the oversight and strategic thinking that only comes from 25+ years of software development experience. The best of both worlds: speed and precision, innovation and wisdom.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-3 glass-card rounded-full px-6 py-3 border border-primary/20"
            >
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Human Expertise Meets AI Efficiency</span>
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-muted-foreground max-w-3xl mx-auto mb-24"
          >
            Every AI-assisted decision is validated by a seasoned developer who has navigated the evolution of web technology from the early days to today's modern frameworks. This means you get rapid development without sacrificing architectural integrity, security best practices, or long-term maintainability.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How We Work
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A streamlined process that leverages AI at every stage while keeping experienced human judgment at the helm.
            </p>
          </motion.div>

          <div className="relative mb-32">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent hidden lg:block" />
            
            <div className="space-y-12 lg:space-y-24">
              {processSteps.map((step, index) => {
                const Icon = step.icon;
                const isEven = index % 2 === 0;
                
                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className={`relative grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                      isEven ? "" : "lg:grid-flow-dense"
                    }`}
                  >
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        className="w-16 h-16 rounded-full bg-background border-2 border-primary flex items-center justify-center glow-border"
                      >
                        <span className="text-xl font-bold text-primary">{step.number}</span>
                      </motion.div>
                    </div>

                    <div className={`${isEven ? "lg:pr-20 lg:text-right" : "lg:col-start-2 lg:pl-20"}`}>
                      <div className="glass-card rounded-2xl p-8">
                        <div className={`flex items-center gap-4 mb-4 ${isEven ? "lg:flex-row-reverse" : ""}`}>
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="lg:hidden w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">{step.number}</span>
                          </div>
                          <h3 className="text-2xl font-bold text-foreground flex-1">
                            {step.title}
                          </h3>
                        </div>
                        
                        <p className={`text-muted-foreground mb-6 ${isEven ? "lg:text-right" : ""}`}>
                          {step.description}
                        </p>
                        
                        <ul className={`space-y-2 ${isEven ? "lg:text-right" : ""}`}>
                          {step.features.map((feature, i) => (
                            <li 
                              key={i} 
                              className={`text-sm text-muted-foreground flex items-center gap-2 ${
                                isEven ? "lg:flex-row-reverse" : ""
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className={`hidden lg:block ${isEven ? "" : "lg:col-start-1 lg:row-start-1"}`} />
                  </motion.div>
                );
              })}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              The CoreLink Advantage
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Combining decades of hands-on experience with the latest AI capabilities to deliver exceptional results.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
            {advantages.map((advantage, index) => {
              const Icon = advantage.icon;
              return (
                <motion.div
                  key={advantage.title}
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
                    {advantage.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {advantage.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center glass-card rounded-3xl p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Start Your Project?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Begin with our AI-powered discovery process and see how we can bring your vision to life.
              </p>
              <a
                href="/contact"
                className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Get Started
              </a>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Process;
