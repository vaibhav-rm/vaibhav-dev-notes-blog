import config from '../config/config'
import { Client, ID, Databases, Storage, Query, Account, Functions } from "appwrite"

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
            if (!userId) {
                console.error("getUserDetails called with no userId");
                return null;
            }
    
            const functionId = '67168fef001a4be773e8';
            console.log("Calling function with ID:", functionId, "for userId:", userId);
    
            const response = await this.functions.createExecution(
                functionId,
                JSON.stringify({ userId }),  // Ensure it's stringified
                false
            );
    
            console.log("Full function response:", JSON.stringify(response, null, 2));
    
            if (response && response.response) {
                const data = JSON.parse(response.response);
                console.log("Parsed function output:", data);
    
                if (data.success && data.user) {
                    return data.user;
                } else {
                    console.error("Error fetching user:", data.error || "Invalid data structure");
                    return null;
                }
            } else {
                console.error("Error fetching user: Invalid response", response);
                return null;
            }
        } catch (error) {
            console.error("Error calling cloud function:", error);
            return null;
        }
    }
    
}

const service = new Service();

export default service;
