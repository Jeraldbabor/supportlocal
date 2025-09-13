import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

interface ContactProps {
    // You could add props for contact info if needed
}

export default function Contact({}: ContactProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate form submission
        setTimeout(() => {
            setSubmitMessage('Thank you for your message! We\'ll get back to you within 24 hours.');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <MainLayout title="Contact Us">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Information */}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                            Get in Touch
                        </h2>
                        <p className="text-lg text-gray-600 mb-8">
                            We'd love to hear from you! Whether you have questions about our artisans, 
                            need help with an order, or want to join our marketplace, we're here to help.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <Mail className="h-6 w-6 text-primary mt-1" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                                    <p className="text-gray-600">hello@artisanlocal.com</p>
                                    <p className="text-gray-600">support@artisanlocal.com</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <Phone className="h-6 w-6 text-primary mt-1" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Phone</h3>
                                    <p className="text-gray-600">(555) 123-4567</p>
                                    <p className="text-gray-600">Toll-free: (800) 123-4567</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <MapPin className="h-6 w-6 text-primary mt-1" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Address</h3>
                                    <p className="text-gray-600">
                                        123 Artisan Street<br />
                                        Creative District<br />
                                        Portland, OR 97201
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <Clock className="h-6 w-6 text-primary mt-1" />
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
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">
                                Frequently Asked Questions
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">
                                        How can I become an artisan on your platform?
                                    </h4>
                                    <p className="text-gray-600">
                                        We welcome applications from skilled artisans. Please use the contact form to 
                                        express your interest, and we'll send you our artisan application process.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">
                                        What is your return policy?
                                    </h4>
                                    <p className="text-gray-600">
                                        We offer a 30-day return policy for most items. Since our products are handmade, 
                                        please contact us if you have any concerns about your purchase.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">
                                        Do you ship internationally?
                                    </h4>
                                    <p className="text-gray-600">
                                        Currently, we ship within the United States and Canada. We're working on 
                                        expanding our shipping options to serve more customers worldwide.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div>
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Send us a Message
                            </h2>

                            {submitMessage && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                                    <p className="text-green-800">{submitMessage}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                        placeholder="Enter your email address"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject *
                                    </label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
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
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                        placeholder="Tell us how we can help you..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-primary text-white py-3 px-6 rounded-md font-semibold hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-5 w-5 mr-2" />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-sm text-gray-500">
                                <p>
                                    * Required fields. We typically respond within 24 hours during business days.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}