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
        }
    }

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
        }
    }

    // Deletes a post document
    async deletePost(slug) {
        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug
            );
            return true;
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
    async getPosts(queries = [Query.equal("Status", "active")]) {
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
    
    
}

const appwriteService = new Service();
export default appwriteService;