import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Button, Container } from "../Components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";

export default function Post() {
    const [post, setPost] = useState(null);
    const { slug } = useParams();
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);

    const isAuthor = post && userData ? post.UserId === userData.$id : false;

    useEffect(() => {
        if (slug) {
            appwriteService.getPost(slug).then((post) => {
                if (post) setPost(post);
                else navigate("/");
            });
        } else navigate("/");
    }, [slug, navigate]);

    const deletePost = () => {
        appwriteService.deletePost(post.$id).then((status) => {
            if (status) {
                appwriteService.deleteFile(post.featuredImage);
                navigate("/");
            }
        });
    };

    return post ? (
        <div className="py-12 bg-slate-50 min-h-screen">
            <Container>
                {/* Main Article Card */}
                <article className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                    
                    {/* Header Image Section */}
                    <div className="relative w-full h-64 md:h-96">
                        <img
                            src={appwriteService.getFileView(post.featuredImage)}
                            alt={post.Title}
                            className="w-full h-full object-cover"
                        />
                        
                        {/* Gradient Overlay for better contrast if needed, purely aesthetic */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent"></div>

                        {/* Author Actions (Edit/Delete) */}
                        {isAuthor && (
                            <div className="absolute top-6 right-6 flex gap-3">
                                <Link to={`/edit-post/${post.$id}`}>
                                    <Button bgcolor="bg-emerald-500" className="shadow-lg hover:bg-emerald-600 transition-all px-6! py-2! opacity-90 hover:opacity-100 backdrop-blur-sm">
                                        Edit
                                    </Button>
                                </Link>
                                <Button bgcolor="bg-rose-500" onClick={deletePost} className="shadow-lg hover:bg-rose-600 transition-all px-6! py-2! opacity-90 hover:opacity-100 backdrop-blur-sm">
                                    Delete
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Article Content Wrapper */}
                    <div className="p-8 md:p-12">
                        {/* Title Header */}
                        <div className="mb-8 border-b border-slate-200 pb-6">
                            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
                                {post.Title}
                            </h1>
                            <div className="flex items-center text-slate-500 text-sm font-medium">
                                {/* You can add Date or Author Name here later */}
                                <span>Article ID: {post.$id}</span>
                            </div>
                        </div>

                        {/* Rich Text Content */}
                        {/* 'browser-css' class handles the HTML styles, we add extra spacing here */}
                        <div className="browser-css text-lg text-slate-700 leading-relaxed space-y-4">
                            {parse(post.Content || "")}
                        </div>
                    </div>
                </article>
            </Container>
        </div>
    ) : null;
}