import React from 'react'
import { PostForm, Container } from '../Components'

function AddPost() {
  return (
    <div className='py-12 bg-slate-50 min-h-screen page-anim'>
        <Container>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className='text-3xl font-bold text-slate-900 tracking-tight'>Create New Article</h1>
                    <p className="text-slate-500 mt-1">Share your knowledge with the world.</p>
                </div>
                
                {/* Editor Wrapper */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                    <PostForm />
                </div>
            </div>
        </Container>
    </div>
  )
}

export default AddPost