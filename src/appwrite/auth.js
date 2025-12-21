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

    // ✅ FIX: Helper method to safely delete existing sessions
    async clearExistingSession() {
        try {
            // Try to delete current session
            await this.account.deleteSession('current');
        } catch (error) {
            // If no session exists or it fails, try to delete all sessions
            try {
                await this.account.deleteSessions();
            } catch (fallbackError) {
                // No sessions to delete - this is fine
                console.log("No active sessions to clear");
            }
        }
    }

    // Creates a new user account and automatically logs them in
    async createAccount({ email, password, name }) {
        try {
            // ✅ FIX: Clear any existing session first
            await this.clearExistingSession();

            const userAccount = await this.account.create(ID.unique(), email, password, name);

            if (userAccount) {
                // If account creation is successful, login immediately
                return this.login({ email, password });
            } else {
                return userAccount;
            }
        } catch (error) {
            throw error;
        }
    }
 
    // Authenticates the user with Email and Password
    async login({ email, password }) {
        try {
            // ✅ FIX: Clear any existing session first
            await this.clearExistingSession();

            return await this.account.createEmailPasswordSession(email, password);
        } catch (error) {
            throw error;
        }
    }

    // Retrieves the currently logged-in user's data
    async getCurrentUser() {
        try {
            return await this.account.get();
        } catch (error) {
            console.log("Appwrite Service :: getCurrentUser :: error", error);
        }
        return null;
    }
    
    // Logs out the user by deleting all sessions
    async logout() {
        try {
            // ✅ IMPROVED: Try current session first, fallback to all sessions
            try {
                await this.account.deleteSession('current');
            } catch (error) {
                // If current session fails, delete all
                await this.account.deleteSessions();
            }
        } catch (error) {
            console.log("Appwrite Service :: logout :: error", error);
        }
    }

    //Profile Photo Update
    async updateUserPrefs(prefs) {
        try {
            return await this.account.updatePrefs(prefs);
        } catch (error) {
            console.log("Appwrite service :: updateUserPrefs :: error", error);
            throw error;
        }
    }
}

const authService = new AuthService();

export default authService;
