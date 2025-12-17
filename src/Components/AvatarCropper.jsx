import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/canvasUtils';

function AvatarCropper({ imageSrc, onCropComplete, onCancel }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [processing, setProcessing] = useState(false);

    // This callback runs every time the user moves the image
    const onCropChange = (crop) => {
        setCrop(crop);
    };

    // This runs when the user stops dragging
    const onCropCompleteInternal = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // This runs when user clicks "Save"
    const showCroppedImage = async () => {
        setProcessing(true);
        try {
            // 1. Generate the new file using canvas
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            const file = new File([croppedImageBlob], "avatar.jpg", { type: "image/jpeg" });
            
            // 2. Send back to parent
            onCropComplete(file);
        } catch (e) {
            console.error(e);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col h-125">
                
                {/* HEADER */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center z-10 bg-white">
                    <h3 className="font-bold text-slate-800">Adjust Photo</h3>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* CROPPER AREA */}
                <div className="relative flex-1 bg-slate-900">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1} // 1:1 Square aspect ratio
                        cropShape="round" // Shows a circle mask!
                        showGrid={false}
                        onCropChange={setCrop}
                        onCropComplete={onCropCompleteInternal}
                        onZoomChange={setZoom}
                    />
                </div>

                {/* CONTROLS */}
                <div className="p-6 bg-white space-y-4 z-10">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-slate-400">Zoom</span>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={onCancel}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={showCroppedImage}
                            disabled={processing}
                            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                        >
                            {processing ? 'Processing...' : 'Set Profile Picture'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AvatarCropper;