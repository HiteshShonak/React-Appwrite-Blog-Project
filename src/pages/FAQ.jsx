import React, { useState } from 'react';
import { Container } from '../Components/index.js'; // Assuming you have a standard Container component
import { Link } from 'react-router-dom';

// --- Component for a single collapsible FAQ item ---
const FaqItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-slate-200 py-6">
            <button
                className="flex justify-between items-center w-full text-left focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-lg font-semibold text-slate-800">
                    {question}
                </span>
                <span className="text-slate-500">
                    <svg 
                        // Using vanilla CSS classes for smooth arrow rotation
                        className={`w-6 h-6 faq-arrow ${isOpen ? 'faq-arrow-rotated' : ''}`} 
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </button>
            
            {/* 🚨 Uses the 'faq-answer-collapse' and 'faq-answer-expanded' classes */}
            <div 
                className={`faq-answer-collapse ${isOpen ? 'faq-answer-expanded' : ''}`}
            >
                <div className="text-slate-600 leading-relaxed pr-8">
                    {answer}
                </div>
            </div>
        </div>
    );
};

// --- Main FAQ Component ---
function FAQ() {

    const faqData = [
        {
            category: "Getting Started & Accounts",
            items: [
                {
                    q: "How do I create a new account?",
                    a: <>
                        Click on the <b>Dashboard</b> link in the navigation bar and select <b>Create Account</b>. You will need to provide your full name, email, and a secure password (minimum 8 characters).
                    </>
                },
                {
                    q: "I forgot my password. How can I reset it?",
                    a: <>
                        For security reasons, you cannot reset your password directly on this page. Please contact support via the <Link to="/contact" className="text-indigo-600 font-semibold underline">Contact</Link> page to assist you with resetting your password.
                    </>
                },
                {
                    q: "How do I update my profile picture (Avatar)?",
                    a: <>
                        Navigate to your <b>Dashboard</b>. Click on your current avatar in the profile card at the top. This will open a modal where you can upload a new photo or remove the existing one.
                    </>
                },
            ],
        },
        {
            category: "Writing and Publishing",
            items: [
                {
                    q: "How do I write and publish a new post?",
                    a: <>
                        After logging into your Dashboard, click the <b>'Create New Post'</b> button. Fill out the title, upload a featured image, write your content, and set the status to 'Active' to publish, or 'Draft' to save it privately.
                    </>
                },
                {
                    q: "What is the difference between 'Active' and 'Draft' status?",
                    a: <>
                        <b>Active</b> status means your post is live and visible to all visitors on the 'All Posts' page and the Home page feed. <b>Draft</b> status means the post is saved privately in your Dashboard and is only visible to you for editing.
                    </>
                },
                {
                    q: "Can I edit a published post?",
                    a: <>
                        Yes. Go to your <b>Dashboard</b>, find the published post in the 'Published Articles' section, and click on it to open the edit page. You can make changes and re-save it.
                    </>
                },
            ],
        },
        {
            category: "Troubleshooting & Technical",
            items: [
                {
                    q: "Why do I see a 'Rate Limit Exceeded' error when logging in?",
                    a: <>
                        This is a security feature (Appwrite) that temporarily blocks your IP address after too many failed login attempts in a short period. This protects your account from brute-force attacks. <b>Please wait 15–60 minutes</b> before trying again, or try logging in from a different network.
                    </>
                },
                {
                    q: "My mobile device won't log in, but my PC works. Why?",
                    a: <>
                        This is often due to strict mobile browser privacy settings that block third-party cookies or sessions.
                    </>
                },
                {
                    q: "What technologies are used to run this blog?",
                    a: <>
                        This blog is built using <b>React</b> and <b>Tailwind CSS</b> for the frontend, and the backend and database management are powered entirely by <b>Appwrite</b> (a self-hosted or cloud Backend-as-a-Service solution).
                    </>
                },
            ],
        },
    ];

    return (
        <div className='w-full min-h-screen bg-slate-50 py-16'>
            <Container>
                <div className="max-w-4xl mx-auto">
                    
                    {/* Header */}
                    <header className="text-center mb-12">
                        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Find quick answers to the most common questions about accounts, writing, and technical issues.
                        </p>
                    </header>

                    {/* FAQ Sections */}
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 space-y-8">
                        
                        {faqData.map((section, index) => (
                            <section key={index} className={index > 0 ? "pt-8 border-t border-slate-100" : ""}>
                                <h2 className="text-2xl font-bold text-indigo-600 mb-6 flex items-center gap-3">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                    {section.category}
                                </h2>
                                
                                <div className="divide-y divide-slate-100">
                                    {section.items.map((item, itemIndex) => (
                                        <FaqItem 
                                            key={itemIndex}
                                            question={item.q}
                                            answer={item.a}
                                        />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>

                    {/* Contact CTA */}
                    <div className="mt-12 text-center bg-indigo-50 p-8 rounded-2xl border border-indigo-200">
                        <p className="text-xl font-semibold text-indigo-700 mb-4">
                            Still need help?
                        </p>
                        <p className="text-indigo-600 mb-6">
                            If you can't find an answer here, please contact us directly.
                        </p>
                        <Link to="/contact" className="inline-block px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md transition-all">
                            Contact Support
                        </Link>
                    </div>

                </div>
            </Container>
        </div>
    );
}

export default FAQ;