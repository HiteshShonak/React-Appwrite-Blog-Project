import React, { memo, useCallback, useRef, useEffect } from 'react';
import appwriteService from '../appwrite/config.js';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

function PostCard({ $id, Title, featuredImage, priority = false }) {
    const prefetchedRef = useRef(false);
    const hoverTimeoutRef = useRef(null);

    // ✅ FIXED: Remove equality check for proper re-renders
    const rating = useSelector((state) => state.ratings?.postRatings?.[$id] || null);

    const handleMouseEnter = useCallback(() => {
        if (prefetchedRef.current) return;
        if ('ontouchstart' in window) return;

        hoverTimeoutRef.current = setTimeout(() => {
            prefetchedRef.current = true;
            appwriteService.getPost($id).catch(() => {
                prefetchedRef.current = false;
            });
        }, 150);
    }, [$id]);

    const handleMouseLeave = useCallback(() => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

    const displayRating = rating && typeof rating === 'object' 
        ? rating.average 
        : rating;

    return (
        <Link 
            to={`/post/${$id}`} 
            className="gpu-accelerate group block h-full"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className='gpu-accelerate bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 hover:border-gray-200 transition-all duration-300 h-full flex flex-col'>
                
                <div className='relative w-full aspect-video overflow-hidden bg-gray-50'>
                    {featuredImage ? 
                        (<img 
                            src={appwriteService.getFileView(featuredImage)}
                            alt={Title}
                            className='gpu-accelerate w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out'
                            loading={priority ? "eager" : "lazy"}
                            fetchPriority={priority ? "high" : "auto"}
                        />) : (
                        <div className="flex items-center justify-center h-full text-gray-300">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        )
                    }
                    
                    <div className="gpu-accelerate absolute inset-0 bg-linear-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {displayRating != null && displayRating > 0 && (
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 border border-gray-100 z-10">
                            <svg className="w-3.5 h-3.5 text-yellow-500 fill-current" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            <span className="text-xs font-bold text-gray-800">
                                {displayRating.toFixed(1)}
                            </span>
                        </div>
                    )}
                </div>

                <div className='p-2.5 sm:p-4 grow flex flex-col justify-between'>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 truncate leading-tight">
                            {Title}
                        </h2>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default memo(PostCard, (prevProps, nextProps) => {
    return (
        prevProps.$id === nextProps.$id &&
        prevProps.Title === nextProps.Title &&
        prevProps.featuredImage === nextProps.featuredImage &&
        prevProps.priority === nextProps.priority
    );
});