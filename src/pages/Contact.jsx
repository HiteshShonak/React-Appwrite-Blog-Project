import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { Container, Button, Input } from '../Components';
import emailjs from '@emailjs/browser';

function Contact() {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [notification, setNotification] = useState({ message: "", type: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = async (data) => {
        setNotification("");
        setIsSubmitting(true);

        // 1. Prepare data for EmailJS
        // Note: I included BOTH 'subject' and 'title' here to match your screenshot
        // regardless of whether you updated the template or not.
        const templateParams = {
            name: data.name,
            email: data.email,
            subject: data.subject, 
            title: data.subject, // Fallback for your specific template setup
            message: data.message,
        };

        try {
            // 2. Send the email using your Environment Variables
            await emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                templateParams,
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            );
            
            setNotification({ message: "Message sent successfully!", type: "success" });
            reset(); // Clear the form
        } catch (error) {
            console.log("EmailJS Error:", error);
            setNotification({ message: "Failed to send. Check your connection.", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Auto-hide notification
    useEffect(() => {
        if (notification.message) {
            const timer = setTimeout(() => setNotification({ message: "", type: "" }), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    return (
        <div className='w-full min-h-screen bg-slate-50 py-12 relative page-anim'>
            
            {/* Notification Toast */}
            {notification.message && (
                <div className='fixed top-24 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none'>
                    <div className={`
                        px-6 py-3 rounded-lg shadow-xl animate-bounce flex items-center justify-center gap-2
                        ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
                    `}>
                        <span className='font-bold text-sm'>{notification.message}</span>
                    </div>
                </div>
            )}

            <Container>
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-10 items-start">
                    
                    {/* LEFT SIDE: Contact Info (No Live Chat) */}
                    <div className="w-full md:w-1/3 pt-4 space-y-6">
                        <div>
                            <h2 className="text-3xl font-extrabold text-slate-900">Get in touch</h2>
                            <p className="text-slate-500 mt-2">
                                Have a question? Drop us a message and we'll get back to you shortly.
                            </p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Email Us</h3>
                                <a className="text-slate-600 text-sm" href="mailto:blogideasstories@gmail.com">blogideasstories@gmail.com</a>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: The Form */}
                    <div className="w-full md:w-2/3 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        <form onSubmit={handleSubmit(submit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Name"
                                    placeholder="Your Name"
                                    {...register("name", { required: true })}
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="you@example.com"
                                    {...register("email", { required: true })}
                                />
                            </div>

                            <Input
                                label="Subject"
                                placeholder="What is this about?"
                                {...register("subject", { required: true })}
                            />

                            <div className='w-full'>
                                <label className='inline-block mb-1 pl-1 text-sm font-medium text-slate-700'>
                                    Message
                                </label>
                                <textarea
                                    rows="4"
                                    placeholder="Type your message here..."
                                    className="px-4 py-3 rounded-lg bg-slate-50 text-black outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 border border-slate-200 w-full resize-none transition-all duration-200"
                                    {...register("message", { required: true })}
                                ></textarea>
                            </div>

                            <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                className={`w-full py-3 font-bold shadow-md transition-all
                                    ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}
                                `}
                            >
                                {isSubmitting ? "Sending..." : "Send Message"}
                            </Button>
                        </form>
                    </div>

                </div>
            </Container>
        </div>
    )
}

export default Contact