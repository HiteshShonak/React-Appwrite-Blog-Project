import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/canvasUtils';

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
    
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Scroll lock WITHOUT layout shift
    useEffect(() => {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        
        return () => { 
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        };
    }, []);

    const onCropCompleteInternal = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
        if (!isMountedRef.current) return;
        
        setProcessing(true);
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            
            if (!isMountedRef.current) return;
            
            onCropComplete(croppedBlob); 
        } catch (e) {
            console.error('Image cropping failed:', e);
            
            if (isMountedRef.current) {
                setProcessing(false);
                alert('Failed to crop image. Please try again.');
            }
        } finally {
            if (isMountedRef.current) {
                setProcessing(false);
            }
        }
    }, [imageSrc, croppedAreaPixels, onCropComplete]);

    const handleCancel = useCallback(() => {
        if (processing) return;
        onCancel();
    }, [processing, onCancel]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && !processing) {
                onCancel();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [processing, onCancel]);

    return createPortal(
        <div 
            className="gpu-accelerate fixed inset-0 z-9999 flex items-center justify-center p-4 modal-backdrop-instant-blur"
            onClick={handleCancel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cropper-title"
        >
            <div 
                className={`gpu-accelerate bg-white w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300 modal-scale-animation ${aspect > 1 ? 'max-w-2xl h-[65vh]' : 'max-w-md h-125'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center z-10 bg-white">
                    <h3 id="cropper-title" className="font-bold text-slate-800">{title}</h3>
                    <button 
                        onClick={handleCancel}
                        disabled={processing}
                        className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Close cropper"
                        type="button"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
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
                        showGrid={aspect > 1}
                        onCropChange={setCrop}
                        onCropComplete={onCropCompleteInternal}
                        onZoomChange={setZoom}
                    />
                </div>

                {/* Footer Controls */}
                <div className="p-6 bg-white space-y-4 z-10">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Zoom</span>
                        <input 
                            type="range" 
                            value={zoom} 
                            min={1} 
                            max={3} 
                            step={0.1} 
                            onChange={(e) => setZoom(Number(e.target.value))} 
                            disabled={processing}
                            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed" 
                            aria-label="Zoom level"
                        />
                        <span className="text-xs font-mono text-slate-500 w-8 text-right">
                            {zoom.toFixed(1)}x
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={handleCancel}
                            disabled={processing}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            type="button"
                            aria-label="Cancel cropping"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={showCroppedImage}
                            disabled={processing || !croppedAreaPixels}
                            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                            type="button"
                            aria-label="Apply crop"
                        >
                            {processing ? (
                                <span className="flex items-center gap-2 justify-center">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : 'Apply Crop'}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default ImageCropper;