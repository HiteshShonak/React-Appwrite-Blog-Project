import conf from '../conf/conf.js';
import { Client, ID, Databases, Storage, Query } from 'appwrite';

export class Service {
    client = new Client();
    databases;
    bucket;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);

        this.databases = new Databases(this.client);
        this.bucket = new Storage(this.client);
    }

    // Creates a new post document in the database
    async createPost({ title, slug, content, featuredImage, status, userId, AuthorName }) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug,
                {
                    Title: title,
                    Content: content,
                    featuredImage: featuredImage,
                    Status: status,
                    UserId: userId,
                    AuthorName: AuthorName,
                }
            );
        } catch (error) {
            console.log("Appwrite Service :: createPost :: error", error);
            
            // 🚨 CLEANUP: If post creation fails, delete the image we just uploaded
            if (featuredImage) {
                await this.deleteFile(featuredImage);
            }

            // Re-throw the error so the UI (PostForm) knows the submission failed
            throw error; 
        }
    }

    // Updates an existing post by its slug
    // Updates an existing post by its slug
    async updatePost(slug, { title, content, featuredImage, status }) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug,
                {
                    Title: title,
                    Content: content,
                    featuredImage: featuredImage,
                    Status: status,
                }
            );
        } catch (error) {
            console.log("Appwrite Service :: updatePost :: error", error);
            throw error; // 🚨 CRITICAL: This allows the error to bubble up to PostForm
        }
    }

    // Deletes a post document AND its associated image
    async deletePost(slug) {
        try {
            // 1. Get the post first to find the image ID
            const post = await this.getPost(slug);
            
            if (post) {
                // 2. Delete the Document
                await this.databases.deleteDocument(
                    conf.appwriteDatabaseId,
                    conf.appwriteCollectionId,
                    slug
                );

                // 3. Automatically delete the image (Cleanup)
                if (post.featuredImage) {
                    await this.deleteFile(post.featuredImage);
                }
                return true;
            }
            return false;
        } catch (error) {
            console.log("Appwrite Service :: deletePost :: error", error);
            return false;
        }
    }

    // Retrieves a single post by its slug
    async getPost(slug) {
        try {
            return await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug
            );
        } catch (error) {
            console.log("Appwrite Service :: getPost :: error", error);
            return false;
        }
    }

    // Retrieves a list of posts (defaults to active status)
    async getPosts(queries = [Query.equal("Status", "active"), Query.orderDesc("$createdAt")]) {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                queries, 
            );
        } catch (error) {
            console.log("Appwrite Service :: getPosts :: error", error);
            return false;
        }
    }

    // Uploads a file to the storage bucket
    async uploadFile(file) {
        try {
            return await this.bucket.createFile(
                conf.appwriteBucketId,
                ID.unique(),
                file
            );
        } catch (error) {
            console.log("Appwrite Service :: uploadFile :: error", error);
            return false;
        }
    }

    // Deletes a file from the storage bucket
    async deleteFile(fileId) {
        try {
            await this.bucket.deleteFile(
                conf.appwriteBucketId,
                fileId
            );
            return true;
        } catch (error) {
            console.log("Appwrite Service :: deleteFile :: error", error);
            return false;
        }
    }

    // Generates a preview URL for a file
    getFileView(fileId) {
        return this.bucket.getFileView(
            conf.appwriteBucketId,
            fileId
        );
    }

    //Increment Post Views
    async incrementViews(postId, currentViews) {
        try {
            
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                postId,
                {
                    Views: currentViews + 1, 
                }
            
            );
        } catch (error) {
            console.log("Appwrite service :: incrementViews :: error", error);
        }
    }

    // ---------------------------------------------------------
    // 🚨 NEW PROFILE METHODS START HERE
    // ---------------------------------------------------------

    // 1. Upload Profile Picture (To the Shared Bucket)
    async uploadProfilePicture(file) {
        try {
            return await this.bucket.createFile(
                conf.appwriteBucketId, // Shared Bucket ID
                ID.unique(),
                file
            );
        } catch (error) {
            console.log("Appwrite serive :: uploadProfilePicture :: error", error);
            return false;
        }
    }

    // 2. Link File ID to User (In UserProfiles Collection)
    async saveProfileImageId(userId, fileId) {
        try {
            // We try to update the document first.
            // We assume the Document ID is the SAME as the UserId for easy lookup.
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteUserProfilesCollectionId,
                userId, // Using UserId as Document ID
                {
                    ProfileImageFileId: fileId
                }
            );
        } catch (error) {
            // If update fails (document doesn't exist yet), we create it.
            console.log("Profile document not found, creating new one...");
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteUserProfilesCollectionId,
                userId, // Set Document ID to UserId
                {
                    UserId: userId,
                    ProfileImageFileId: fileId
                }
            );
        }
    }

    // 3. Get Profile Image ID by User ID
    async getProfileImageFileId(userId) {
        try {
            // Since we set Document ID = User ID, we can get it directly
            const doc = await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteUserProfilesCollectionId,
                userId
            );
            return doc.ProfileImageFileId; 
        } catch (error) {
            // It's okay if it fails, means user has no profile doc yet
            return null;
        }
    }

    // 4. Get Avatar Preview URL
    getAvatarPreview(fileId) {
        if (!fileId) return null;
        return this.bucket.getFileView(
            conf.appwriteBucketId,
            fileId
        );
    }

    async updateUserProfile(userId, { fileId, Bio }) {
        // 1. Prepare data to update (only include defined values)
            const data = {};
            if (fileId !== undefined) data.ProfileImageFileId = fileId;
            if (Bio !== undefined) data.Bio = Bio ? Bio : `My Name is ${userId}.`; 
        try {
            

            // 2. Try to update existing document
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteUserProfilesCollectionId,
                userId,
                data
            );
        } catch (error) {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteUserProfilesCollectionId,
                userId,
                {
                    UserId: userId,
                    ...data
                }
            );
        }
    }

    // Fetch full profile data
    async getUserProfile(userId) {
        try {
            return await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteUserProfilesCollectionId,
                userId
            );
        } catch (error) {
            return null;
        }
    }

   // 1. Create a Comment
    async createComment({ content, postId, userId, authorName }) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCommentsCollectionId, // Ensure this exists in your conf.js
                ID.unique(),
                {
                    content,
                    postId,
                    userId,
                    authorName
                }
            );
        } catch (error) {
            console.log("Appwrite service :: createComment :: error", error);
        }
    }

    // 2. Get Comments for a specific Post
    async getComments(postId) {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCommentsCollectionId,
                [
                    Query.equal("postId", postId), // This requires the Index you just created
                    Query.orderDesc("$createdAt")  // Newest comments first
                ]
            );
        } catch (error) {
            console.log("Appwrite service :: getComments :: error", error);
            return false;
        }
    }

    // 3. Delete a Comment
    async deleteComment(commentId) {
        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCommentsCollectionId,
                commentId
            );
            return true;
        } catch (error) {
            console.log("Appwrite service :: deleteComment :: error", error);
            return false;
        }
    }

    // 4. Update Comment (Used for Likes)
    async updateComment(commentId, data) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCommentsCollectionId,
                commentId,
                data
            );
        } catch (error) {
            console.log("Appwrite service :: updateComment :: error", error);
            return false;
        }
    }

    async getPostRatings(postId) {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteRatingsCollectionId,
                [Query.equal("postId", postId)]
            );
        } catch (error) {
            console.log("Appwrite service :: getPostRatings :: error", error);
            return false;
        }
    }

    // Get specific user's rating for a post (Fixes pagination bug)
    async getUserRating(postId, userId) {
    try {
        return await this.databases.listDocuments(
            conf.appwriteDatabaseId,
            conf.appwriteRatingsCollectionId,
            [
                Query.equal('postId', postId),
                Query.equal('userId', userId),
                Query.limit(1)
            ]
        );
    } catch (error) {
        console.log("Appwrite service :: getUserRating :: error", error);
        return null;
    }
}


    // 2. Rate a Post (Create or Update)
    async setRating({ postId, userId, stars }) {
        try {
            // First, check if the user already rated this post
            const existingRatings = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteRatingsCollectionId,
                [
                    Query.equal("postId", postId),
                    Query.equal("userId", userId)
                ]
            );

            if (existingRatings.documents.length > 0) {
                // UPDATE existing rating
                const ratingId = existingRatings.documents[0].$id;
                return await this.databases.updateDocument(
                    conf.appwriteDatabaseId,
                    conf.appwriteRatingsCollectionId,
                    ratingId,
                    { stars }
                );
            } else {
                // CREATE new rating
                return await this.databases.createDocument(
                    conf.appwriteDatabaseId,
                    conf.appwriteRatingsCollectionId,
                    ID.unique(),
                    { postId, userId, stars }
                );
            }
        } catch (error) {
            console.log("Appwrite service :: setRating :: error", error);
        }
    }
    
    // 3. Delete Rating
    async deleteRating(ratingId) {
        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteRatingsCollectionId,
                ratingId
            );
            return true;
        } catch (error) {
            console.log("Appwrite service :: deleteRating :: error", error);
            return false;
        }
    }

    
    // Hybrid Trending Logic (Time Window + Scoring + Smart Backfill)
    async getTrendingPosts(limit = 6) { // ✅ ADD PARAMETER with default value
    try {
        // 1. Define Time Window (Last 10 Days)
        const date = new Date();
        date.setDate(date.getDate() - 10);

        // 2. Fetch Recent Trending Candidates (fetch more than needed for scoring)
        let response = await this.databases.listDocuments(
            conf.appwriteDatabaseId,
            conf.appwriteCollectionId,
            [
                Query.equal("Status", "active"),
                Query.greaterThanEqual("$createdAt", date.toISOString()),
                Query.limit(Math.max(40, limit * 3)) // ✅ Scale fetch based on limit
            ]
        );

        let initialPosts = response ? response.documents : [];

        // 3. Score & Sort the Recent Posts
        let scoredPosts = await Promise.all(initialPosts.map(async (post) => {
            const views = post.Views || 0;
            
            // Fetch Rating
            let averageRating = 0;
            try {
                const ratingData = await this.getPostRatings(post.$id);
                if (ratingData && ratingData.documents.length > 0) {
                    const totalStars = ratingData.documents.reduce((acc, curr) => acc + curr.stars, 0);
                    averageRating = totalStars / ratingData.documents.length;
                }
            } catch (e) {
                averageRating = 0;
            }

            // Time Decay
            const publishedDate = new Date(post.$createdAt);
            const now = new Date();
            const hoursSincePublished = Math.max(0, (now - publishedDate) / (1000 * 60 * 60));

            // Quality Multiplier
            let qualityMultiplier = 1;
            if (averageRating > 0) {
                qualityMultiplier = 0.5 + (averageRating * 0.4); 
            }

            const gravity = views / Math.pow(hoursSincePublished + 2, 1.5);
            const finalScore = gravity * qualityMultiplier;

            return { ...post, trendScore: finalScore };
        }));

        // Sort Recent Posts by Score
        scoredPosts.sort((a, b) => b.trendScore - a.trendScore);

        // 4. SMART BACKFILL: Check if we have less than requested limit
        if (scoredPosts.length < limit) { // ✅ Use dynamic limit
            const needed = limit - scoredPosts.length;
            
            // Fetch "All-Time Best" to fill the gap
            const existingIds = scoredPosts.map(p => p.$id);
            
            const fallbackResponse = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                [
                    Query.equal("Status", "active"),
                    Query.orderDesc("Views"),
                    Query.limit(needed + 10) // ✅ Fetch slightly more than needed for filtering
                ]
            );

            if (fallbackResponse && fallbackResponse.documents) {
                const fallbackPosts = fallbackResponse.documents.filter(p => !existingIds.includes(p.$id));
                
                // Add the best fallback posts to fill the quota
                scoredPosts = [...scoredPosts, ...fallbackPosts.slice(0, needed)];
            }
        }

        // 5. Final Safety Slice (Return exactly requested limit)
        return scoredPosts.slice(0, limit); // ✅ Use dynamic limit

    } catch (error) {
        console.log("Appwrite Service :: getTrendingPosts :: error", error);
        return [];
    }
}

    // ============================================================
    // 👤 USER PROFILE SERVICES (Logic Reset)
    // ============================================================

    // 1. Create Profile (Run this ONCE immediately after Signup)
    async createUserProfile({ userId, username, bio = "", imageId = null }) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteUserProfilesCollectionId, // Ensure this var is in conf.js
                userId, // 🚨 We use Auth ID as Document ID for 1:1 linking
                {
                    UserId: userId,
                    Username: username,         // Capital U (Matches Schema)
                    Bio: bio,                   // Capital B
                    ProfileImageFileId: imageId // Capital P
                }
            );
        } catch (error) {
            console.log("Appwrite Service :: createUserProfile :: error", error);
            throw error; // Throwing ensures Signup knows if this failed
        }
    }

    // 2. Check Availability (Used for Real-time validation)
    async isUsernameAvailable(username) {
        try {
            const queries = [Query.equal("Username", username)]; // Capital U
            const result = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteUserProfilesCollectionId,
                queries
            );
            // If 0 documents found, it means the username is FREE to take.
            return result.documents.length === 0; 
        } catch (error) {
            console.log("Appwrite Service :: isUsernameAvailable :: error", error);
            // 🚨 SAFETY: If network fails, return TRUE so we don't block the user.
            return true; 
        }
    }

    // 3. Get Profile by Username (For Public Profile Pages)
    async getProfileByUsername(username) {
        try {
            const queries = [Query.equal("Username", username)]; // Capital U
            const result = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteUserProfilesCollectionId,
                queries
            );
            return result.documents[0]; // Return the profile doc
        } catch (error) {
            console.log("Appwrite Service :: getProfileByUsername :: error", error);
            return false;
        }
    }


}

const appwriteService = new Service();
export default appwriteService;