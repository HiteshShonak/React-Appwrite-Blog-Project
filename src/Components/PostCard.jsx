import React from 'react'
import appwriteService from '../appwrite/config.js';
import { Link } from 'react-router-dom';

function PostCard({$id, Title, featuredImage}) {
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