import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/canvasUtils';

// Universal component for both Avatars (round) and Blog Posts (rect)
function ImageCropper({ 
    imageSrc, 
    onCropComplete, 
    onCancel, 
    aspect = 1, 
    cropShape = "round",
    title = "Adjust Photo" 
}) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Scroll lock
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const onCropCompleteInternal = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = async () => {
        setProcessing(true);
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            // Return raw blob; PostForm will handle naming and compression
            onCropComplete(croppedBlob); 
        } catch (e) {
            console.error(e);
        } finally {
            setProcessing(false);
        }
    };

    return createPortal(
        <div 
            className="gpu-accelerate fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
            <div 
                // 🚨 CHANGED: 'max-w-4xl h-[85vh]' -> 'max-w-2xl h-[65vh]' 
                // This makes the blog crop modal (aspect > 1) much smaller/compact.
                className={`gpu-accelerate bg-white w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300 ${aspect > 1 ? 'max-w-2xl h-[65vh]' : 'max-w-md h-125'}`}
                style={{ animation: 'scaleIn 0.3s ease-out' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center z-10 bg-white">
                    <h3 className="font-bold text-slate-800">{title}</h3>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Cropper Area */}
                <div className="relative flex-1 bg-slate-900">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        cropShape={cropShape}
                        showGrid={aspect > 1} // Only show grid for rectangular crops
                        onCropChange={setCrop}
                        onCropComplete={onCropCompleteInternal}
                        onZoomChange={setZoom}
                    />
                </div>

                {/* Footer Controls */}
                <div className="p-6 bg-white space-y-4 z-10">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-slate-400">Zoom</span>
                        <input 
                            type="range" value={zoom} min={1} max={3} step={0.1} 
                            onChange={(e) => setZoom(Number(e.target.value))} 
                            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                        />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                            Cancel
                        </button>
                        <button 
                            onClick={showCroppedImage}
                            disabled={processing}
                            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                        >
                            {processing ? 'Processing...' : 'Apply Crop'}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default ImageCropper;