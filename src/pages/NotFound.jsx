import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../Components/index.js'; // Ensure correct import path

function NotFound() {
  return (
    <div className='w-full min-h-screen bg-slate-50 flex justify-center py-20 page-anim px-2 sm:px-4'>
      <Container>
        <div className="gpu-accelerate text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-100 max-w-2xl mx-auto">
          
          {/* Error Code and Icon */}
          <h1 className="text-9xl font-extrabold text-indigo-600 mb-4 tracking-tighter">
            404
          </h1>
          <div className="mb-6 inline-block p-3 bg-red-100 rounded-full">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.3 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Page Not Found
          </h2>

          <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
            Oops! The content you are looking for seems to have disappeared or the link is incorrect.
          </p>

          {/* Navigation Options */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="w-full sm:w-auto">
              <button className="w-full px-8 py-3.5 text-base font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg transition-all hover:-translate-y-0.5">
                Go to Home
              </button>
            </Link>
            <Link to="/posts" className="w-full sm:w-auto">
              <button className="w-full px-8 py-3.5 text-base font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all">
                View All Posts
              </button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default NotFound;