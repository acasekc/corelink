import { motion } from "framer-motion";
import { Shield, Lock } from "lucide-react";

const Privacy = () => {
    const effectiveDate = "January 22, 2026";

    return (
        <div className="relative overflow-hidden">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-[128px]" />
            </div>

            {/* Hero Section */}
            <section className="relative py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex justify-center mb-6"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                            <Shield className="w-8 h-8 text-primary" />
                        </div>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold mb-6"
                    >
                        Privacy Policy
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg text-muted-foreground"
                    >
                        Effective Date: {effectiveDate}
                    </motion.p>
                </div>
            </section>

            {/* Content */}
            <section className="relative py-12 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="max-w-4xl mx-auto prose prose-invert prose-slate"
                >
                    <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-8 md:p-12 space-y-8">
                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                CoreLink Development LLC ("Company," "we," "us," or "our") respects your privacy and is committed 
                                to protecting your personal data. This Privacy Policy explains how we collect, use, 
                                disclose, and safeguard your information when you use our website, client portals, 
                                and related services (collectively, the "Services").
                            </p>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                As a software development and digital marketing company, we handle various types of 
                                client information. Please read this Privacy Policy carefully. By using our Services, 
                                you consent to the practices described in this policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
                            
                            <h3 className="text-xl font-medium text-foreground mt-6 mb-3">2.1 Information You Provide</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                We collect information you voluntarily provide, including:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                                <li><strong>Contact Information:</strong> Name, email address, phone number, and company name when you inquire about our services or create an account</li>
                                <li><strong>Billing Information:</strong> Billing address and payment details (processed securely through Stripe)</li>
                                <li><strong>Communication Data:</strong> Messages, emails, support requests, and feedback you send us</li>
                                <li><strong>Project Information:</strong> Business requirements, brand assets, content, and other materials you provide for your projects</li>
                                <li><strong>Discovery Information:</strong> Responses to our project discovery process and questionnaires</li>
                            </ul>

                            <h3 className="text-xl font-medium text-foreground mt-6 mb-3">2.2 Information Collected Automatically</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                When you use our Services, we automatically collect:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                                <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
                                <li><strong>Usage Data:</strong> Pages visited, features used, and actions taken within our Services</li>
                                <li><strong>Log Data:</strong> IP address, access times, and referring URLs</li>
                                <li><strong>Cookies:</strong> Session cookies for authentication and preferences</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We use the collected information to:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                                <li>Deliver software development, web design, and marketing services</li>
                                <li>Communicate about project progress, deliverables, and milestones</li>
                                <li>Process transactions and send related information (proposals, invoices, receipts)</li>
                                <li>Respond to your inquiries and provide customer support</li>
                                <li>Send administrative notifications about your projects or account</li>
                                <li>Share relevant industry insights, updates, and promotional offers (with consent)</li>
                                <li>Improve our services and develop new offerings</li>
                                <li>Detect, prevent, and address technical issues and security threats</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Information Sharing</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We do not sell your personal information. We may share your information with:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                                <li><strong>Service Providers:</strong> Third parties that help us operate our Services (e.g., Stripe for payment processing, email service providers)</li>
                                <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental authority</li>
                                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                                <li><strong>With Your Consent:</strong> When you have given explicit permission</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Security</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We implement appropriate technical and organizational measures to protect your 
                                personal data, including:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                                <li>Encryption of data in transit (HTTPS/TLS)</li>
                                <li>Secure password hashing</li>
                                <li>Regular security assessments</li>
                                <li>Access controls and authentication measures</li>
                                <li>Secure payment processing through PCI-compliant providers (Stripe)</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                However, no method of transmission over the Internet is 100% secure. While we 
                                strive to protect your information, we cannot guarantee absolute security.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Retention</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We retain your personal data for as long as necessary to:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                                <li>Provide our Services to you</li>
                                <li>Comply with legal obligations (e.g., tax and accounting requirements)</li>
                                <li>Resolve disputes and enforce our agreements</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                When data is no longer needed, we securely delete or anonymize it.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Your Rights</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Depending on your location, you may have the following rights:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                                <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                                <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal requirements)</li>
                                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                To exercise these rights, please contact us using the information below.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Cookies and Tracking</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We use cookies and similar technologies to:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                                <li>Maintain your session and authentication</li>
                                <li>Remember your preferences</li>
                                <li>Analyze how our Services are used</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                You can control cookies through your browser settings, though disabling them 
                                may affect the functionality of our Services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Third-Party Services</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Our Services and the products we build may integrate with third-party services, including:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                                <li><strong>Stripe:</strong> For secure payment processing. See <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe's Privacy Policy</a></li>
                                <li><strong>Cloud Hosting Providers:</strong> For website and application hosting (AWS, DigitalOcean, etc.)</li>
                                <li><strong>Analytics Tools:</strong> To understand website traffic and user behavior</li>
                                <li><strong>Email Services:</strong> For transactional and marketing communications</li>
                                <li><strong>AI Services:</strong> To enhance our development workflow and capabilities</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                These services have their own privacy policies, and we encourage you to review them. 
                                For client projects, we will discuss any third-party integrations and their data implications.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Children's Privacy</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Our Services are not intended for individuals under the age of 18. We do not 
                                knowingly collect personal information from children. If we become aware that 
                                we have collected data from a child, we will take steps to delete it.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Changes to This Policy</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We may update this Privacy Policy from time to time. We will notify you of 
                                significant changes by posting the new policy on this page and updating the 
                                "Effective Date" above. We encourage you to review this policy periodically.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contact Us</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                If you have questions about this Privacy Policy or our data practices, please contact us:
                            </p>
                            <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                                <p className="text-foreground font-medium">CoreLink Development LLC</p>
                                <p className="text-muted-foreground">Email: info@corelink.dev</p>
                                <p className="text-muted-foreground">Website: corelink.dev</p>
                            </div>
                        </section>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default Privacy;
