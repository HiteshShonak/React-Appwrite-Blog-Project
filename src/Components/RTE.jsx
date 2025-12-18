import React, { useMemo } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Controller } from 'react-hook-form';


export default function RTE({ name, control, label, defaultValue = "" }) {
    // Memoized editor configuration
    const editorConfig = useMemo(() => ({
        height: 500,
        menubar: true,
        
        // Remove branding and promotions
        branding: false,
        promotion: false,
        
        plugins: [
            "image", "advlist", "autolink", "lists", "link", "charmap", "preview",
            "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
            "insertdatetime", "media", "table", "help", "wordcount"
        ],
        
        // Desktop toolbar - original structure
        toolbar:
            "undo redo | blocks | image | bold italic forecolor | alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent | removeformat | help | link",
        
        // Toolbar mode - sliding drawer for overflow items
        toolbar_mode: 'sliding',
        
        // Mobile-specific configuration
        mobile: {
            menubar: false,
            toolbar_mode: 'scrolling',
            
            // Simplified toolbar for mobile - essential tools
            toolbar:
                "undo redo | bold italic | alignleft aligncenter | bullist numlist | link image | more",
            
            plugins: [
                "autolink", "lists", "link", "image", "preview",
                "searchreplace", "fullscreen", "wordcount"
            ],
        },
        
        content_style: `
            body { 
                font-family: Helvetica, Arial, sans-serif; 
                font-size: 14px;
                line-height: 1.6;
            }
            @media (max-width: 640px) {
                body {
                    font-size: 16px;
                }
            }
        `,
        
        // Better mobile experience
        contextmenu: false,
        
    }), []);

    return (
        <div className='w-full'>
            {label && (
                <label className="inline-block mb-2 text-sm sm:text-base font-medium text-gray-700">
                    {label}
                </label>
            )}

            <Controller
                name={name || "Content"}
                control={control}
                defaultValue={defaultValue}
                render={({ field: { onChange, value } }) => (
                    <div className="tinymce-container">
                        <Editor
                            apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                            initialValue={defaultValue}
                            value={value}
                            init={editorConfig}
                            onEditorChange={onChange}
                        />
                    </div>
                )}
            />

            {/* Hide branding and promotional elements */}
            <style jsx global>{`
                /* Hide TinyMCE branding */
                .tox-promotion,
                .tox-statusbar__branding,
                .tox-notification--warning,
                .tox-notification--info,
                a[href*="tiny.cloud"],
                a[title*="Upgrade"],
                button[title*="Premium"],
                div[class*="promotion"] {
                    display: none !important;
                }
                
                /* Hide "Build with TinyMCE" link */
                .tox-statusbar__path + div,
                .tox-statusbar a[href*="tinymce"],
                .tox-statusbar__branding a {
                    display: none !important;
                }
                
                /* Mobile optimizations */
                @media (max-width: 640px) {
                    .tox-tinymce {
                        min-height: 300px !important;
                    }
                    
                    /* Make toolbar scrollable on very small screens */
                    .tox-toolbar__primary {
                        overflow-x: auto !important;
                        flex-wrap: nowrap !important;
                    }
                    
                    /* Slightly smaller buttons on mobile */
                    .tox-tbtn {
                        padding: 4px !important;
                    }
                }
                
                /* Tablet and small desktop */
                @media (min-width: 641px) and (max-width: 1024px) {
                    .tox-toolbar__overflow {
                        display: inline-flex !important;
                    }
                }
            `}</style>
        </div>
    );
}
