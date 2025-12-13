import conf from '../conf/conf.js';
import { Client, Account, ID } from 'appwrite';

export class AuthService {
    client = new Client();
    account;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);

        this.account = new Account(this.client);
    }

    async createAccount({ email, password, name }) {
        try{
        const userAccount = await this.account.create(ID.unique(), email, password, name);

        if (userAccount) {
            return this.login({ email, password });
            // Account created successfully
            // Call login after account creation here

        } else {
            throw new Error('Account creation failed');
        }

        } catch (error) {
            throw error;
        }

    }

    async login({ email, password }) {
        try {
            const session = await this.account.createEmailPasswordSession(email, password);
            return session;

        } catch (error) {
            throw error;
        }

    }

    async getCurrentUser() {
        try {
            const user = await this.account.get();
            return user;
        } catch (error) {
            console.error("Appwrite Service :: getCurrentUser :: error:", error);
        }

        return null;
    }

    async logout() {
        try {
            await this.account.deleteSessions();
        } catch (error) {
            console.log("Appwrite Service :: logout :: error:", error);
        }
    }


}

const authService = new AuthService();

export default authService