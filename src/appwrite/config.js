import conf from '../conf/conf.js';
import { Client, Account, ID, Databases, Storage, Query } from 'appwrite';


export class Service{
    
    Client = new Client();
    databases;
    bucket;

    constructor(){
        this.Client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.databases = new Databases(this.Client);
        this.bucket = new Storage(this.Client);
    }

    async createPost({title, slug, content, featuredImageId, status, userId}){
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwritePostsCollectionId,
                slug,
                {
                    title,
                    content,
                    featuredImageId,
                    status,
                    userId
                }
            );


        } catch (error) {
            console.error("Appwrite Service :: createPost :: error:", error);
        }
    }

    async updatePost(slug, {title, content, featuredImageId, status}){
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwritePostsCollectionId,
                slug,
                {
                    title,
                    content,
                    featuredImageId,
                    status
                }
            );

        }catch (error) {
            console.error("Appwrite Service :: updatePost :: error:", error);
        }
    }

    async deletePost(slug){
        try{
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwritePostsCollectionId,
                slug
            );

            return true;

        } catch (error) {
            console.error("Appwrite Service :: deletePost :: error:", error);
            return false;
        }
    }

    async getPost(slug){
        try {
                return await this.databases.getDocument(
                    conf.appwriteDatabaseId,
                    conf.appwritePostsCollectionId,
                    slug
                );
        }
        catch (error) {
            console.error("Appwrite Service :: getPosts :: error:", error);
        }
    }

    async getPosts(queries = [Query.equal('status', 'active')]){
        try {
                return await this.databases.listDocuments(
                    conf.appwriteDatabaseId,
                    conf.appwritePostsCollectionId,
                    queries
                );
        } catch (error) {
            console.error("Appwrite Service :: getPosts :: error:", error);
            return false;
        }
    }

    //file upload services

    async uploadFile(file){
        try {
            return await this.bucket.createFile(
                conf.appwriteBucketId,
                ID.unique(),
                file
            );
        } catch (error) {
            console.error("Appwrite Service :: uploadFile :: error:", error);
            return false;
        }
    }

    async deleteFile(fileId){
        try {
            await this.bucket.deleteFile(
                conf.appwriteBucketId,
                fileId);
            return true;
        } catch (error) {
            console.error("Appwrite Service :: deleteFile :: error:", error);
            return false;
        }
    }
    
    getFilePreview(fileId){
        return this.bucket.getFilePreview(
            conf.appwriteBucketId,
            fileId,
        );
    }

}


const service = new Service();

export default service;