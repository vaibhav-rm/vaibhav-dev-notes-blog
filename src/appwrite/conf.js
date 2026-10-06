import config from '../config/config'
import { Client, ID, Databases, Storage, Query, Account, Functions,Permission, Role } from "appwrite"
import { normalizeCategory, normalizeTags } from '../lib/taxonomy'

/**
 * The `category` and `tags` attributes are optional in the Appwrite collection.
 * Sending them to a collection that has not been migrated yet makes Appwrite
 * reject the whole write, so we only include them when there is something to
 * save, and strip them from the retry if the server reports them unknown.
 */
const taxonomyFields = ({ category, tags }) => {
    const fields = {}
    const normalizedCategory = normalizeCategory(category)
    if (normalizedCategory) fields.category = normalizedCategory

    const normalizedTags = normalizeTags(tags)
    if (normalizedTags.length) fields.tags = normalizedTags

    return fields
}

const isUnknownAttributeError = (error, keys) => {
    const message = String(error?.message || error)
    return keys.some(
        (key) =>
            message.includes(`Attribute "${key}"`) ||
            message.includes(`attribute "${key}" is not found`) ||
            (message.includes('Unknown attribute') && message.includes(key))
    )
}

/**
 * Runs `write(payload)`, and if Appwrite rejects the document because the
 * optional taxonomy attributes do not exist in the collection yet, retries once
 * without them. Keeps publishing working before `npm run setup:schema` has run.
 */
const writeWithTaxonomyFallback = async (write, payload, taxonomyKeys) => {
    try {
        return await write(payload)
    } catch (error) {
        if (!isUnknownAttributeError(error, taxonomyKeys)) throw error

        const stripped = { ...payload }
        for (const key of taxonomyKeys) delete stripped[key]
        console.warn(
            `Appwrite Service :: optional attribute(s) ${taxonomyKeys.join(', ')} not found in the ` +
                'posts collection — run `npm run setup:schema`. Post saved without them.'
        )
        return await write(stripped)
    }
}

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

    async createPost({ title, slug, content, featuredImage, status, userId, category, tags }) {
        const payload = {
            title,
            content,
            featuredImage,
            status,
            userId,
            ...taxonomyFields({ category, tags }),
        }

        try {
            return await writeWithTaxonomyFallback(
                (data) =>
                    this.databases.createDocument(
                        config.appwriteDatabaseId,
                        config.appwriteCollectionId,
                        slug,
                        data
                    ),
                payload,
                ['category', 'tags']
            );
        } catch (error) {
            console.log("Appwrite Service :: createPost :: error", error);
            throw error;
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

    async updatePost(slug, { title, content, featuredImage, status, category, tags }) {
        const payload = {
            title,
            content,
            featuredImage,
            status,
            ...taxonomyFields({ category, tags }),
        }

        try {
            return await writeWithTaxonomyFallback(
                (data) =>
                    this.databases.updateDocument(
                        config.appwriteDatabaseId,
                        config.appwriteCollectionId,
                        slug,
                        data
                    ),
                payload,
                ['category', 'tags']
            );
        } catch (error) {
            console.log("Appwrite Service :: updatePost :: error", error);
            throw error;
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

    // Inside Service class
async addComment(commentData) {
    try {
        return await this.databases.createDocument(
            config.appwriteDatabaseId,
            config.appwriteCommentsCollectionId, // new collection
            ID.unique(),
            commentData
        );
    } catch (error) {
        console.error("Appwrite Service :: addComment :: error", error);
        return null;
    }
}

async getComments(postId) {
    try {
        return await this.databases.listDocuments(
            config.appwriteDatabaseId,
            config.appwriteCommentsCollectionId,
            [Query.equal("postId", postId), Query.orderDesc("$createdAt")]
        );
    } catch (error) {
        console.error("Appwrite Service :: getComments :: error", error);
        return [];
    }
}

async deleteComment(commentId) {
    try {
        await this.databases.deleteDocument(
            config.appwriteDatabaseId,
            config.appwriteCommentsCollectionId,
            commentId
        );
        return true;
    } catch (error) {
        console.error("Appwrite Service :: deleteComment :: error", error);
        return false;
    }
}


async uploadFile(file) {
  try {
    return await this.bucket.createFile(
      config.appwriteBucketId,
      ID.unique(),
      file,
      [
        Permission.read(Role.any()) // 👈 makes file publicly readable
      ]
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

      // ✅ Always return direct URL
  getFileUrl(fileId) {
    return `${config.appwriteUrl}/storage/buckets/${config.appwriteBucketId}/files/${fileId}/view?project=${config.appwriteProjectId}`;
  }

    async getUserDetails(userId) {
        try {
            if (!userId) {
                console.error("getUserDetails called with no userId");
                return null;
            }

            const functionId = '67168fef001a4be773e8';
           // console.log("Calling function with ID:", functionId, "for userId:", userId);

            const response = await this.functions.createExecution(
                functionId,
                JSON.stringify({ userId }),
                false
            );

            // console.log("Full function response:", JSON.stringify(response, null, 2));

            if (response && response.responseBody) {    
                try {
                    const data = JSON.parse(response.responseBody);
                    
                    if (data.success && data.user) {
                        return data.user;
                    } else {
                        console.error("Error fetching user:", data.error || "Invalid data structure");
                        return null;
                    }
                } catch (parseError) {
                    console.error("Error parsing function response:", parseError);
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