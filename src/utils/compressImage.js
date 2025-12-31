import imageCompression from 'browser-image-compression';

const COMPRESSION_CONFIG = {
    avatar: {
        maxSizeMB: 0.01,       
        maxWidthOrHeight: 150, 
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.80    
    },
    post: {
        maxSizeMB: 0.15,    
        maxWidthOrHeight: 900,  
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.80,   
    }
};

/**
 * @param {File} file 
 * @param {string} type 
 * @param {string} entityName 
 * @param {string} authorName 
 */
export const compressImage = async (file, type = 'post', entityName = 'User', authorName = '') => {
   
    const options = COMPRESSION_CONFIG[type] || COMPRESSION_CONFIG.post;

    try {
        const compressedBlob = await imageCompression(file, options);

        const cleanEntity = (entityName || 'unknown').toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        const cleanAuthor = (authorName || 'user').toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        
        const timestamp = Math.floor(Date.now() / 1000);

        let finalFileName = "";
        if (type === 'avatar') {
            finalFileName = `avatar-${cleanEntity}-${timestamp}.webp`;
        } else {
            const shortEntity = cleanEntity.substring(0, 30); 
            finalFileName = `${shortEntity}-${cleanAuthor}-${timestamp}.webp`;
        }

        const compressedFile = new File([compressedBlob], finalFileName, { 
            type: "image/webp",
            lastModified: Date.now()
        });

        return compressedFile;

    } catch (error) {
        console.error("⚠️ Image compression failed:", error);
        return file; 
    }
};