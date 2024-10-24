import config from '../config/config'
import { Client, ID, Databases, Storage, Query, Account, Functions } from "appwrite"
import axios from 'axios';

export class Service {
    client = new Client();
    databases;
    bucket;
    account;
    functions;

    constructor() {
        this.client
            .setEndpoint(config.appwriteUrl)
            .setProject(config.appwriteProjectId);

        this.databases = new Databases(this.client);
        this.bucket = new Storage(this.client);
        this.account = new Account(this.client);
        this.functions = new Functions(this.client);
    }

    async createPost({ title, slug, content, featuredImage, status, userId }) {
        try {
            return await this.databases.createDocument(
                config.appwriteDatabaseId,
                config.appwriteCollectionId,
                slug,
                {
                    title,
                    content,
                    featuredImage,
                    status,
                    userId
                }
            );
        } catch (error) {
            console.log("Appwrite Service :: createPost :: error", error);
        }
    }

    async getUser(userId) {
        try {
            return await this.account.get(userId);
        } catch (error) {
            console.error("Appwrite service :: getUser :: error", error);
            return null;
        }
    }

    async updatePost(slug, { title, content, featuredImage, status }) {
        try {
            return await this.databases.updateDocument(
                config.appwriteDatabaseId,
                config.appwriteCollectionId,
                slug,
                {
                    title,
                    content,
                    featuredImage,
                    status,
                }
            );
        } catch (error) {
            console.log("Appwrite Service :: updatePost :: error", error);
        }
    }

    async deletePost(slug) {
        try {
            await this.databases.deleteDocument(
                config.appwriteDatabaseId,
                config.appwriteCollectionId,
                slug
            );
            return true;
        } catch (error) {
            console.log("Appwrite Service :: deletePost :: error", error);
            return false;
        }
    }

    async getPost(slug) {
        try {
            return await this.databases.getDocument(
                config.appwriteDatabaseId,
                config.appwriteCollectionId,
                slug
            );
        } catch (error) {
            console.log("Appwrite Service :: getPost :: error", error);
            return false;
        }
    }

    async getPosts(queries = [Query.equal("status", "active")]) {
        try {
            return await this.databases.listDocuments(
                config.appwriteDatabaseId,
                config.appwriteCollectionId,
                queries
            );
        } catch (error) {
            console.log("Appwrite Service :: getPosts :: error", error);
            return false;
        }
    }

    async uploadFile(file) {
        try {
            return await this.bucket.createFile(
                config.appwriteBucketId,
                ID.unique(),
                file
            );
        } catch (error) {
            console.log("Appwrite Services :: uploadFile :: error", error);
            return false;
        }
    }

    async deleteFile(fileId) {
        try {
            await this.bucket.deleteFile(
                config.appwriteBucketId,
                fileId
            );
            return true;
        } catch (error) {
            console.log("Appwrite Services :: deleteFile :: errorerr", error);
            return false;
        }
    }

    getFilePreview(fileId) {
        return this.bucket.getFilePreview(
            config.appwriteBucketId,
            fileId
        );
    }

    async getUserDetails(userId) {
        try {
    
            const execution = await this.functions.createExecution(
                config.appwriteFunctionId,
                JSON.stringify({ userId }),
                false
            );
        
            // // Check for a valid response
            // if (!execution.response) {
            //     console.error("Response is undefined"); 
            //     return null;
            // }
    
            // Parse the JSON response
            let result;
            try {
                result = JSON.parse(execution.responseBody);
            } catch (parseError) {
                console.error("Error parsing response:", execution.responseBody);
                return null;
            }
    
            // Check if the response indicates success
            if (result.success) {
                return {
                    name: result.user.name,
                    email: result.user.email
                };
            } else {
                console.error("Appwrite service :: getUserDetails :: error", result.error);
                return null;
            }
        } catch (error) {
            console.error("Appwrite service :: getUserDetails :: error", error);
            return null;
        }
    }
    
}

const service = new Service();

export default service;
