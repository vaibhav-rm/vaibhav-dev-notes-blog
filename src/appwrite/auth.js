import config from '../config/config'
import {Client, Account, ID} from "appwrite"

export class AuthService{
    client = new Client();
    account;

    constructor(){
        this.client
            .setEndpoint(config.appwriteUrl)
            .setProject(config.appwriteProjectId);
        this.account = new Account(this.client);
    }

    async createAccout({email, password, name}){
        const userAccount = await this.account.create(ID.unique(), email, password, name)
        if (userAccount) {
            return this.login({ email, password })
        }
        return userAccount
    }

    async login({ email, password }) {
        return this.account.createEmailSession(email, password)
    }

    async getCurrentUser(){
        try {
            return await this.account.get();
        } catch (error) {
            console.log("Appwrite Service :: getCurrentUser :: error", error);
        }
        return null;
    }

    async logout(){
        await this.account.deleteSessions()
    }
}

const authService = new AuthService();

export default authService;




