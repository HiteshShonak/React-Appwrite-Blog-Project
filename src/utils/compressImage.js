import imageCompression from 'browser-image-compression';

const COMPRESSION_CONFIG = {
    avatar: {
        maxSizeMB: 0.01,        // Goal: ~10KB
        maxWidthOrHeight: 150,  // Good for profile (92px) + buffer
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.80    
    },
    post: {
        maxSizeMB: 0.15,        // Goal: ~150KB (Slightly higher budget for the extra width)
        maxWidthOrHeight: 900,  // 🚨 EXACT MATCH for your 895px Hero container
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.80,   // 80% is the sweet spot for WebP
    }
};

/**
 * @param {File} file - Original file
 * @param {string} type - 'avatar' or 'post'
 * @param {string} entityName - Author Name (for avatar) or Blog Title (for post)
 * @param {string} authorName - Author Name (only needed for 'post' type)
 */
export const compressImage = async (file, type = 'post', entityName = 'User', authorName = '') => {
    // Default to 'post' config if type is invalid
    const options = COMPRESSION_CONFIG[type] || COMPRESSION_CONFIG.post;

    try {
        const compressedBlob = await imageCompression(file, options);

        // 1. Clean filename generation
        const cleanEntity = (entityName || 'unknown').toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        const cleanAuthor = (authorName || 'user').toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        
        // 2. Short timestamp
        const timestamp = Math.floor(Date.now() / 1000);

        // 3. Construct filename
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