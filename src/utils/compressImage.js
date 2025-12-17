import imageCompression from 'browser-image-compression';

const COMPRESSION_CONFIG = {
    avatar: {
        maxSizeMB: 0.05,
        maxWidthOrHeight: 500,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.8
    },
    post: {
        maxSizeMB: 1.0,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.9,
        alwaysKeepResolution: true
    }
};

/**
 * @param {File} file - Original file
 * @param {string} type - 'avatar' or 'post'
 * @param {string} entityName - Author Name (for avatar) or Blog Title (for post)
 * @param {string} authorName - Author Name (only needed for 'post' type)
 */
export const compressImage = async (file, type = 'post', entityName = 'User', authorName = '') => {
    const options = COMPRESSION_CONFIG[type] || COMPRESSION_CONFIG.post;

    try {
        const compressedBlob = await imageCompression(file, options);

        // 1. Generate clean slugs (remove special characters, replace spaces with dashes)
        const cleanEntity = entityName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        const cleanAuthor = authorName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        
        // 2. Create Unique Timestamp (Short version)
        const timestamp = Math.floor(Date.now() / 1000);

        // 3. Conditional Renaming
        let finalFileName = "";
        if (type === 'avatar') {
            // Result: avatar-john-doe-1712345678.webp
            finalFileName = `avatar-${cleanEntity}-${timestamp}.webp`;
        } else {
            // Result: my-cool-blog-john-doe-1712345678.webp
            finalFileName = `${cleanEntity}-${cleanAuthor}-${timestamp}.webp`;
        }

        const compressedFile = new File([compressedBlob], finalFileName, { 
            type: "image/webp",
            lastModified: new Date().getTime()
        });

        return compressedFile;

    } catch (error) {
        console.error("⚠️ Image compression failed:", error);
        return file; 
    }
};