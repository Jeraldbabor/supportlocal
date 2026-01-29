import { Head } from '@inertiajs/react';
import MainLayout from '../layouts/MainLayout';

export default function Terms() {
    return (
        <MainLayout>
            <Head title="Terms of Service" />

            <div className="bg-white py-16">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <h1 className="mb-8 text-3xl font-bold text-gray-900 md:text-4xl">Terms of Service</h1>

                    <div className="prose prose-lg max-w-none text-gray-600">
                        <p className="mb-8 text-sm text-gray-500">Last updated: January 29, 2026</p>

                        <section className="mb-8">
                            <h2 className="mb-4 text-2xl font-semibold text-gray-900">1. Agreement to Terms</h2>
                            <p>
                                By accessing or using SupportLocal ("the Platform"), you agree to be bound by these Terms of Service and all
                                applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or
                                accessing this site.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="mb-4 text-2xl font-semibold text-gray-900">2. Description of Service</h2>
                            <p>
                                SupportLocal is an online marketplace that connects local artisans and sellers with buyers seeking unique, handmade,
                                and locally-produced products. We provide a platform for sellers to list their products and for buyers to discover and
                                purchase these items.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="mb-4 text-2xl font-semibold text-gray-900">3. User Accounts</h2>
                            <h3 className="mt-6 mb-3 text-xl font-medium text-gray-800">Account Registration</h3>
                            <p>
                                To access certain features of the Platform, you must register for an account. You agree to provide accurate, current,
                                and complete information during registration and to update such information to keep it accurate, current, and
                                complete.
                            </p>

                            <h3 className="mt-6 mb-3 text-xl font-medium text-gray-800">Account Security</h3>
                            <p>
                                You are responsible for safeguarding your account credentials and for all activities that occur under your account.
                                You must notify us immediately of any unauthorized use of your account.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="mb-4 text-2xl font-semibold text-gray-900">4. Buyer Terms</h2>
                            <p>As a buyer on SupportLocal, you agree to:</p>
                            <ul className="mt-2 list-disc space-y-2 pl-6">
                                <li>Provide accurate shipping and payment information</li>
                                <li>Pay for all items purchased through the Platform</li>
                                <li>Communicate respectfully with sellers</li>
                                <li>Leave honest and fair reviews based on your actual experience</li>
                                <li>Report any issues or disputes through proper channels</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="mb-4 text-2xl font-semibold text-gray-900">5. Seller Terms</h2>
                            <p>As a seller on SupportLocal, you agree to:</p>
                            <ul className="mt-2 list-disc space-y-2 pl-6">
                                <li>Provide accurate and truthful product descriptions and images</li>
                                <li>Fulfill orders promptly and professionally</li>
                                <li>Maintain adequate inventory for listed products</li>
                                <li>Comply with all applicable laws and regulations</li>
                                <li>Handle customer inquiries and complaints professionally</li>
                                <li>Not sell prohibited or illegal items</li>
                                <li>Respect intellectual property rights</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="mb-4 text-2xl font-semibold text-gray-900">6. Prohibited Activities</h2>
                            <p>You may not use the Platform to:</p>
                            <ul className="mt-2 list-disc space-y-2 pl-6">
                                <li>Violate any applicable laws or regulations</li>
                                <li>Infringe on intellectual property rights</li>
                                <li>Transmit harmful code or malware</li>
                                <li>Engage in fraudulent activities</li>
                                <li>Harass, abuse, or harm other users</li>
                                <li>Manipulate reviews or ratings</li>
                                <li>Circumvent security measures</li>
                                <li>Collect user information without consent</li>
                                <li>Advertise or sell prohibited items</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="mb-4 text-2xl font-semibold text-gray-900">7. Payments and Fees</h2>
                            <p>
                                All payments are processed securely through our payment providers. Prices are displayed in Philippine Pesos (PHP)
                                unless otherwise stated. Sellers are responsible for any applicable taxes on their sales.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="mb-4 text-2xl font-semibold text-gray-900">8. Shipping and Delivery</h2>
                            <p>
                                Sellers are responsible for shipping products to buyers. Shipping times and costs are determined by individual
                                sellers. SupportLocal is not responsible for delays or issues caused by shipping carriers.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="mb-4 text-2xl font-semibold text-gray-900">9. Returns and Refunds</h2>
                            <p>
                                Return and refund policies may vary by seller. Please review the seller's specific policies before making a purchase.
                                Disputes should be resolved directly between buyers and sellers, with SupportLocal providing mediation assistance when
                                necessary.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="mb-4 text-2xl font-semibold text-gray-900">10. Intellectual Property</h2>
                            <p>
                                The Platform and its original content, features, and functionality are owned by SupportLocal and are protected by
                                international copyright, trademark, and other intellectual property laws. Sellers retain ownership of their product
                                listings and images but grant SupportLocal a license to display and promote their products on the Platform.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="mb-4 text-2xl font-semibold text-gray-900">11. Disclaimer of Warranties</h2>
                            <p>
                                The Platform is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that
                                the Platform will be uninterrupted, secure, or error-free. We are not responsible for the quality, safety, or legality
                                of items listed by sellers.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="mb-4 text-2xl font-semibold text-gray-900">12. Limitation of Liability</h2>
                            <p>
                                SupportLocal shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out
                                of your use of the Platform. Our total liability shall not exceed the amount you paid to us in the twelve months
                                preceding the claim.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="mb-4 text-2xl font-semibold text-gray-900">13. Indemnification</h2>
                            <p>
                                You agree to indemnify and hold harmless SupportLocal and its officers, directors, employees, and agents from any
                                claims, damages, losses, or expenses arising from your use of the Platform or violation of these Terms.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="mb-4 text-2xl font-semibold text-gray-900">14. Termination</h2>
                            <p>
                                We may terminate or suspend your account and access to the Platform immediately, without prior notice, for any reason,
                                including breach of these Terms. Upon termination, your right to use the Platform will immediately cease.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="mb-4 text-2xl font-semibold text-gray-900">15. Changes to Terms</h2>
                            <p>
                                We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the
                                new Terms on this page. Your continued use of the Platform after any changes constitutes acceptance of the new Terms.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="mb-4 text-2xl font-semibold text-gray-900">16. Governing Law</h2>
                            <p>
                                These Terms shall be governed by and construed in accordance with the laws of the Republic of the Philippines, without
                                regard to its conflict of law provisions.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="mb-4 text-2xl font-semibold text-gray-900">17. Contact Us</h2>
                            <p>If you have any questions about these Terms of Service, please contact us at:</p>
                            <div className="mt-4 rounded-lg bg-gray-50 p-4">
                                <p>
                                    <strong>SupportLocal</strong>
                                </p>
                                <p>Email: support@supportlocal.shop</p>
                                <p>
                                    Website:{' '}
                                    <a href="/contact" className="text-primary hover:underline">
                                        Contact Form
                                    </a>
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
