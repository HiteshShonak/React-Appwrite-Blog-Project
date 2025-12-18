import { Container, Button } from '../Components';
import { Link } from 'react-router-dom';
import Logo from '../assets/Logo.png'
import { useEffect } from 'react';

function AboutUs() {


    useEffect(() => {
                window.scrollTo(0, 0);
            }, []);

  return (
    <div className='w-full min-h-screen bg-slate-50 py-12 md:py-20 page-anim px-2 sm:px-4'>
        <Container>
            <div className="max-w-4xl mx-auto">
                
                {/* Hero section */}
                <div className="text-center mb-16">
                    <div className="inline-block p-3 bg-blue-50 text-blue-600 rounded-2xl mb-6">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
                        We are building the home for <br className="hidden md:block" />
                        <span className="text-blue-600">curious minds.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                        Blog Ideas & Stories is a community-driven platform where writers, thinkers, and experts share their unique perspectives with the world.
                    </p>
                </div>

                {/* Mission card */}
                <div className="gpu-accelerate bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 mb-12">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                We believe that everyone has a story to tell. Our mission is to provide a clean, distraction-free environment where your words take center stage. Whether you are an industry expert or just starting your writing journey, this is your canvas.
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                                We strip away the clutter so you can focus on what matters most: <b>creating content that connects.</b>
                            </p>
                        </div>
                        <div className="flex-1 w-full">
                            <img 
                                src={Logo} 
                                alt="Team working together" 
                                className="gpu-accelerate w-full h-64 object-contain rounded-2xl shadow-md transform rotate-2 hover:rotate-0 transition-all duration-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Values grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div className="gpu-accelerate bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Built for Speed</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            A blazing fast experience powered by React and Appwrite. No loading spinners, just instant content.
                        </p>
                    </div>

                    <div className="gpu-accelerate bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Community First</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Connect with other writers, read inspiring stories, and grow your audience in a supportive space.
                        </p>
                    </div>

                    <div className="gpu-accelerate bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Freedom to Create</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Write about what you love. Our editor gives you the tools to express yourself without limits.
                        </p>
                    </div>
                </div>

                {/* CTA section */}
                <div className="gpu-accelerate bg-slate-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                        </svg>
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">Ready to share your story?</h2>
                        <p className="text-slate-300 mb-8 max-w-xl mx-auto">
                            Join thousands of writers who are already sharing their ideas on our platform. It takes less than a minute to get started.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/signup">
                                <Button className="bg-white! text-slate-900! hover:bg-slate-100! px-8! py-3! text-lg! font-bold shadow-lg">
                                    Get Started
                                </Button>
                            </Link>
                            <Link to="/all-posts">
                                <Button className="bg-transparent! border border-slate-600 text-white! hover:bg-slate-800! px-8! py-3! text-lg!">
                                    Start Reading
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </Container>
    </div>
  )
}

export default AboutUs;