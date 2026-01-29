import { Head } from '@inertiajs/react';
import MainLayout from '../layouts/MainLayout';

export default function PrivacyPolicy() {
    return (
        <MainLayout>
            <Head title="Privacy Policy" />
            
            <div className="bg-white py-16">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <h1 className="mb-8 text-3xl font-bold text-gray-900 md:text-4xl">Privacy Policy</h1>
                    
                    <div className="prose prose-lg max-w-none text-gray-600">
                        <p className="text-sm text-gray-500 mb-8">Last updated: January 29, 2026</p>
                        
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                            <p>
                                Welcome to SupportLocal ("we," "our," or "us"). We are committed to protecting your personal information 
                                and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard 
                                your information when you visit our website <strong>supportlocal.shop</strong> and use our services.
                            </p>
                            <p className="mt-4">
                                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, 
                                please do not access the site.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
                            
                            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Personal Information</h3>
                            <p>We may collect personal information that you voluntarily provide to us when you:</p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li>Register for an account</li>
                                <li>Make a purchase</li>
                                <li>Subscribe to our newsletter</li>
                                <li>Contact us through the contact form</li>
                                <li>Apply to become a seller</li>
                            </ul>
                            
                            <p className="mt-4">This information may include:</p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li>Name and contact information (email address, phone number)</li>
                                <li>Billing and shipping address</li>
                                <li>Payment information (processed securely through our payment providers)</li>
                                <li>Account credentials</li>
                                <li>Profile information and preferences</li>
                            </ul>

                            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Information from Social Media</h3>
                            <p>
                                If you choose to register or log in using a social media account (such as Facebook or Google), 
                                we may receive certain profile information about you from the social media provider. The information 
                                we receive may include your name, email address, and profile picture. You can control what information 
                                is shared with us through your social media account settings.
                            </p>

                            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">Automatically Collected Information</h3>
                            <p>When you visit our website, we automatically collect certain information, including:</p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li>Device information (browser type, operating system)</li>
                                <li>IP address</li>
                                <li>Pages visited and time spent on pages</li>
                                <li>Referring website addresses</li>
                                <li>Cookies and similar tracking technologies</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
                            <p>We use the information we collect to:</p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li>Create and manage your account</li>
                                <li>Process transactions and send related information</li>
                                <li>Facilitate communication between buyers and sellers</li>
                                <li>Send you marketing and promotional communications (with your consent)</li>
                                <li>Respond to your inquiries and provide customer support</li>
                                <li>Improve our website and services</li>
                                <li>Protect against fraudulent or unauthorized transactions</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Sharing Your Information</h2>
                            <p>We may share your information in the following situations:</p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li><strong>With Sellers:</strong> When you make a purchase, we share necessary information with the seller to fulfill your order.</li>
                                <li><strong>Service Providers:</strong> We may share your information with third-party service providers who perform services on our behalf (payment processing, email delivery, hosting).</li>
                                <li><strong>Legal Requirements:</strong> We may disclose your information where required by law or to protect our rights.</li>
                                <li><strong>Business Transfers:</strong> In connection with any merger, sale of company assets, or acquisition.</li>
                            </ul>
                            <p className="mt-4">
                                We do not sell your personal information to third parties.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookies and Tracking Technologies</h2>
                            <p>
                                We use cookies and similar tracking technologies to collect and track information about your browsing 
                                activity. Cookies are small data files stored on your device. You can instruct your browser to refuse 
                                all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may 
                                not be able to use some portions of our website.
                            </p>
                            <p className="mt-4">We use cookies for:</p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li>Authentication and security</li>
                                <li>Remembering your preferences</li>
                                <li>Shopping cart functionality</li>
                                <li>Analytics and performance monitoring</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
                            <p>
                                We implement appropriate technical and organizational security measures to protect your personal 
                                information against unauthorized access, alteration, disclosure, or destruction. However, no method 
                                of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee 
                                absolute security.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
                            <p>
                                We retain your personal information for as long as necessary to fulfill the purposes outlined in this 
                                Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer 
                                need your information, we will securely delete or anonymize it.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Your Rights</h2>
                            <p>Depending on your location, you may have the following rights regarding your personal information:</p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li><strong>Access:</strong> Request access to your personal information</li>
                                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                                <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
                                <li><strong>Withdraw Consent:</strong> Withdraw consent for processing where applicable</li>
                            </ul>
                            <p className="mt-4">
                                To exercise any of these rights, please contact us using the information provided below or use the 
                                data export feature in your account settings.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Third-Party Links</h2>
                            <p>
                                Our website may contain links to third-party websites. We are not responsible for the privacy 
                                practices or content of these third-party sites. We encourage you to read the privacy policies 
                                of any third-party sites you visit.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
                            <p>
                                Our services are not intended for individuals under the age of 18. We do not knowingly collect 
                                personal information from children. If you are a parent or guardian and believe your child has 
                                provided us with personal information, please contact us.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                                the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review 
                                this Privacy Policy periodically for any changes.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
                            </p>
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <p><strong>SupportLocal</strong></p>
                                <p>Email: privacy@supportlocal.shop</p>
                                <p>Website: <a href="/contact" className="text-primary hover:underline">Contact Form</a></p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
