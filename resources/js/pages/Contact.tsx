import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission
        setTimeout(() => {
            setSubmitMessage("Thank you for your message! We'll get back to you within 24 hours.");
            setFormData({ name: '', email: '', subject: '', message: '' });
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <MainLayout title="Contact Us">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                    {/* Contact Information */}
                    <div>
                        <h2 className="mb-6 text-3xl font-bold text-gray-900">Get in Touch</h2>
                        <p className="mb-8 text-lg text-gray-600">
                            We'd love to hear from you! Whether you have questions about our artisans, need help with an order, or want to join our
                            marketplace, we're here to help.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <Mail className="mt-1 h-6 w-6 text-primary" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                                    <p className="text-gray-600">hello@artisanlocal.com</p>
                                    <p className="text-gray-600">support@artisanlocal.com</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <Phone className="mt-1 h-6 w-6 text-primary" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Phone</h3>
                                    <p className="text-gray-600">(555) 123-4567</p>
                                    <p className="text-gray-600">Toll-free: (800) 123-4567</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <MapPin className="mt-1 h-6 w-6 text-primary" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Address</h3>
                                    <p className="text-gray-600">
                                        123 Artisan Street
                                        <br />
                                        Creative District
                                        <br />
                                        Portland, OR 97201
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <Clock className="mt-1 h-6 w-6 text-primary" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Business Hours</h3>
                                    <div className="text-gray-600">
                                        <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                                        <p>Saturday: 10:00 AM - 4:00 PM</p>
                                        <p>Sunday: Closed</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Section */}
                        <div className="mt-12">
                            <h3 className="mb-6 text-2xl font-bold text-gray-900">Frequently Asked Questions</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="mb-2 font-semibold text-gray-900">How can I become an artisan on your platform?</h4>
                                    <p className="text-gray-600">
                                        We welcome applications from skilled artisans. Please use the contact form to express your interest, and we'll
                                        send you our artisan application process.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="mb-2 font-semibold text-gray-900">What is your return policy?</h4>
                                    <p className="text-gray-600">
                                        We offer a 30-day return policy for most items. Since our products are handmade, please contact us if you have
                                        any concerns about your purchase.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="mb-2 font-semibold text-gray-900">Do you ship internationally?</h4>
                                    <p className="text-gray-600">
                                        Currently, we ship within the United States and Canada. We're working on expanding our shipping options to
                                        serve more customers worldwide.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div>
                        <div className="rounded-lg bg-white p-8 shadow-lg">
                            <h2 className="mb-6 text-2xl font-bold text-gray-900">Send us a Message</h2>

                            {submitMessage && (
                                <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-4">
                                    <p className="text-green-800">{submitMessage}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary"
                                        placeholder="Enter your email address"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="mb-2 block text-sm font-medium text-gray-700">
                                        Subject *
                                    </label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">Select a subject</option>
                                        <option value="general">General Inquiry</option>
                                        <option value="order">Order Support</option>
                                        <option value="artisan">Become an Artisan</option>
                                        <option value="technical">Technical Support</option>
                                        <option value="wholesale">Wholesale Inquiries</option>
                                        <option value="press">Press & Media</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-700">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                        rows={6}
                                        className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary"
                                        placeholder="Tell us how we can help you..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex w-full items-center justify-center rounded-md bg-primary px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-5 w-5" />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-sm text-gray-500">
                                <p>* Required fields. We typically respond within 24 hours during business days.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
