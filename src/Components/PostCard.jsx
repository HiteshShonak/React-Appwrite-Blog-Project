import React, { useState, useEffect } from 'react'
import appwriteService from '../appwrite/config.js';
import { Link } from 'react-router-dom';

function PostCard({$id, Title, featuredImage}) {
  const [rating, setRating] = useState(null);

  // 1. Fetch Rating Logic
  useEffect(() => {
    appwriteService.getPostRatings($id).then((data) => {
        if (data && data.documents.length > 0) {
            const total = data.documents.reduce((acc, curr) => acc + curr.stars, 0);
            const avg = (total / data.documents.length).toFixed(1);
            setRating(avg);
        }
    });
  }, [$id]);

  return (
    <Link to={`/post/${$id}`} className="group block h-full">
        <div className='bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 hover:border-gray-200 transition-all duration-300 h-full flex flex-col'>
            
            <div className='relative w-full aspect-video overflow-hidden bg-gray-50'>
                {featuredImage ? 
                    (<img 
                        src={appwriteService.getFileView(featuredImage)}
                        alt={Title}
                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out'
                        loading="lazy"
                    />) : (
                    <div className="flex items-center justify-center h-full text-gray-300">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    )
                }
                
                {/* Fixed gradient syntax */}
                <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* 🚨 RATING BADGE (Top Right on Image) */}
                {rating && (
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 border border-gray-100 z-10">
                        <svg className="w-3.5 h-3.5 text-yellow-500 fill-current" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        <span className="text-xs font-bold text-gray-800">{rating}</span>
                    </div>
                )}
            </div>

            <div className='p-5 grow flex flex-col justify-between'>
                <div>
                    <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 leading-tight">
                        {Title}
                    </h2>
                </div>
            </div>
        </div>
    </Link>
  )
}

export default PostCard