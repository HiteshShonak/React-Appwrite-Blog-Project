import React, {useState, useEffect} from 'react'
import { PostForm, Container } from '../Components'
import appwriteService from '../appwrite/config.js'
import { useParams, useNavigate } from 'react-router-dom'

function EditPost() {
    const [post, setPost] = useState(null);
    const {slug} = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if(slug){
            appwriteService.getPost(slug).then((post) => {
                if (post) {
                    setPost(post);
                } else {
                    navigate('/');
                }
            });
        } else {
            navigate('/');
        }
    }, [slug, navigate]);

  return post ? (
    <div className='py-12 bg-slate-50 min-h-screen page-anim px-2 sm:px-4'>
        <Container>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className='text-3xl font-bold text-slate-900 tracking-tight'>Edit Article</h1>
                        <p className="text-slate-500 mt-1">Update content, status, or featured image.</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full">
                        Editing Mode
                    </span>
                </div>
                
                {/* Editor Wrapper */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                    <PostForm post={post} />
                </div>
            </div>
        </Container>
    </div>
  ) : null
}

export default EditPost