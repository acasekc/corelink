import { motion } from "framer-motion";
import SeoHead from "@/components/SeoHead";
import { FileText, Scale } from "lucide-react";

const Terms = ({ meta }) => {
    const effectiveDate = "January 22, 2026";

    return (
        <div className="relative overflow-hidden">
            <SeoHead meta={meta} />
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
                            <Scale className="w-8 h-8 text-primary" />
                        </div>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold mb-6"
                    >
                        Terms of Service
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
                            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                By accessing or using the services provided by CoreLink Development LLC ("Company," "we," "us," or "our"), 
                                including our website, client portals, project deliverables, and any related services 
                                (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). 
                                If you do not agree to these Terms, please do not use our Services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Services</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                CoreLink Development LLC is a software development and digital marketing company. 
                                We provide a range of technical and creative services to help businesses grow and succeed online. 
                                Our Services include:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                                <li>Custom web application and software development</li>
                                <li>Website design and development</li>
                                <li>E-commerce solutions and online stores</li>
                                <li>Mobile application development</li>
                                <li>Digital marketing and SEO services</li>
                                <li>Brand identity and graphic design</li>
                                <li>API development and third-party integrations</li>
                                <li>Ongoing maintenance, support, and hosting</li>
                                <li>Technical consulting and project management</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                To access certain features of our Services, you may be required to create an account. 
                                You are responsible for:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                                <li>Maintaining the confidentiality of your account credentials</li>
                                <li>All activities that occur under your account</li>
                                <li>Notifying us immediately of any unauthorized use of your account</li>
                                <li>Ensuring your account information is accurate and up-to-date</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Payment Terms</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                For paid services, the following terms apply:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                                <li>All fees are quoted in US Dollars unless otherwise specified</li>
                                <li>Payment is due according to the terms specified on your invoice</li>
                                <li>We accept payment via credit card (processed through Stripe), check, or bank transfer</li>
                                <li>Late payments may incur additional fees as specified in your service agreement</li>
                                <li>All sales are final unless otherwise agreed upon in writing</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Intellectual Property</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Unless otherwise specified in a separate agreement:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                                <li>All content, features, and functionality of our website and internal tools are owned by CoreLink</li>
                                <li>Custom websites, applications, designs, and other deliverables become client property upon full payment</li>
                                <li>We retain the right to display completed work in our portfolio unless otherwise agreed</li>
                                <li>We retain the right to use general knowledge, skills, and techniques acquired during projects</li>
                                <li>Third-party libraries, frameworks, and stock assets retain their original licenses</li>
                                <li>Source code ownership transfers to client upon final payment unless using licensed platforms</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Acceptable Use</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                You agree not to use our Services to:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                                <li>Violate any applicable laws or regulations</li>
                                <li>Infringe upon the rights of others</li>
                                <li>Transmit malicious code or attempt to compromise our systems</li>
                                <li>Interfere with or disrupt the Services or servers</li>
                                <li>Attempt to gain unauthorized access to any part of the Services</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Limitation of Liability</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                TO THE MAXIMUM EXTENT PERMITTED BY LAW, CORELINK SHALL NOT BE LIABLE FOR ANY 
                                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS 
                                OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS 
                                OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE 
                                OF THE SERVICES.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Indemnification</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                You agree to indemnify, defend, and hold harmless CoreLink and its officers, 
                                directors, employees, and agents from and against any claims, liabilities, 
                                damages, losses, and expenses arising out of or in any way connected with 
                                your access to or use of the Services or your violation of these Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Termination</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We may terminate or suspend your access to our Services immediately, without 
                                prior notice or liability, for any reason, including if you breach these Terms. 
                                Upon termination, your right to use the Services will immediately cease.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Changes to Terms</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We reserve the right to modify these Terms at any time. We will provide notice 
                                of significant changes by posting the new Terms on this page and updating the 
                                "Effective Date" above. Your continued use of the Services after any changes 
                                constitutes acceptance of the new Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Governing Law</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                These Terms shall be governed by and construed in accordance with the laws of 
                                the State of Missouri, without regard to its conflict of law provisions. Any 
                                disputes arising under these Terms shall be resolved in the courts located 
                                in Johnson County, Missouri.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contact Information</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                If you have any questions about these Terms, please contact us at:
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

export default Terms;
