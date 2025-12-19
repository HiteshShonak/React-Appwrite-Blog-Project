// src/utils/errorUtils.js

/**
 * Parses Appwrite and Network errors into user-friendly messages.
 * @param {any} error - The error object caught in try/catch blocks.
 * @returns {string} - A clean, human-readable error message.
 */
export const parseErrorMessage = (error) => {
    if (!error) return "An unexpected error occurred. Please try again.";

    // Convert error to string to check for keywords if it's an object
    const message = (error.message || error.toString()).toLowerCase();
    const code = error.code || 0;
    const type = error.type || ""; // Appwrite often provides a 'type' field

    // --- 1. NETWORK & CONNECTION ERRORS ---
    if (message.includes("network request failed") || message.includes("failed to fetch")) {
        return "Unable to connect. Please check your internet connection.";
    }
    if (code === 500 || message.includes("server error")) {
        return "Our servers are experiencing issues. Please try again later.";
    }
    if (code === 503 || message.includes("service unavailable")) {
        return "Service is currently unavailable. We're working on it!";
    }

    // --- 2. SPECIFIC CONFLICTS (409) ---
    // 🚨 FIX: Strict checks to separate "Duplicate Email" from "Duplicate Post"
    if (code === 409 || message.includes("already exists")) {
        // A. Auth: User already exists
        if (type === "user_already_exists" || message.includes("user_already_exists") || message.includes("account")) {
            return "An account with this email already exists. Please log in.";
        }
        // B. Database: Post/Slug already exists
        if (type === "document_already_exists" || message.includes("document_already_exists") || message.includes("document")) {
            return "This title/slug is already taken. Please choose a slightly different slug.";
        }
        // Fallback for 409
        return "This entry already exists. Please try a different value.";
    }

    // --- 3. AUTHENTICATION (Login / Signup) ---
    if (code === 401 || message.includes("unauthorized") || message.includes("missing scope")) {
        return "Session expired. Please log in again.";
    }
    if (message.includes("invalid credentials") || message.includes("invalid email or password")) {
        return "Incorrect email or password. Please try again.";
    }
    if (message.includes("password must be") || (message.includes("password") && message.includes("short"))) {
        return "Password must be at least 8 characters long.";
    }
    if (message.includes("valid email")) {
        return "Please enter a valid email address.";
    }

    // --- 4. DATABASE & POSTS (Limits & Validation) ---
    if (code === 404 || message.includes("document_not_found")) {
        return "We couldn't find the content you're looking for. It may have been deleted.";
    }
    if (message.includes("36 chars") || message.includes("valid chars") || message.includes("documentid")) {
        return "The title creates a link that is too long or contains invalid characters.";
    }
    if (message.includes("attribute") && message.includes("not found")) {
        return "Database mismatch: Some fields are missing. Please contact support.";
    }

    // --- 5. PROFILE & DASHBOARD (Bio / Avatar) ---
    if (message.includes("user_blocked")) {
        return "Your account has been restricted. Please contact support.";
    }
    if (code === 403 || message.includes("permission")) {
        return "You do not have permission to perform this action.";
    }

    // --- 6. STORAGE (Image Uploads) ---
    if (message.includes("storage_file_too_big")) {
        return "The image is too large. Please select an image under 10MB.";
    }
    if (message.includes("storage_invalid_file")) {
        return "This file type is not supported. Please upload a JPG, PNG, or GIF.";
    }

    // --- FALLBACK ---
    return message.length < 100 
        ? error.message // Return original casing for readability
        : "Something went wrong. Please check your inputs and try again.";
};