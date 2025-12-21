// src/utils/errorUtils.js

/**
 * 🛡️ COMPREHENSIVE APPWRITE ERROR HANDLER
 * Based on official Appwrite Response Codes documentation
 * https://appwrite.io/docs/advanced/platform/response-codes
 * 
 * Parses Appwrite and Network errors into user-friendly messages.
 * @param {any} error - The error object caught in try/catch blocks.
 * @returns {string} - A clean, human-readable error message.
 */
export const parseErrorMessage = (error) => {
    if (!error) return "An unexpected error occurred. Please try again.";

    // Extract error properties
    const message = (error.message || error.toString()).toLowerCase();
    const code = error.code || 0;
    const type = error.type || "";

    // ============================================================
    // 🌐 SECTION 1: NETWORK & CONNECTION ERRORS (Highest Priority)
    // ============================================================
    if (message.includes("network request failed") || message.includes("failed to fetch")) {
        return "Unable to connect. Please check your internet connection.";
    }
    if (message.includes("network error") || message.includes("networkerror")) {
        return "Network error. Please check your connection and try again.";
    }
    if (code === 503 || message.includes("service unavailable") || type === "general_service_disabled") {
        return "Service temporarily unavailable. Please try again in a few moments.";
    }
    if (code === 504 || message.includes("gateway timeout")) {
        return "Request timeout. The server took too long to respond.";
    }
    if (code === 500 || type === "general_server_error" || type === "general_unknown") {
        return "Server error. Our team has been notified. Please try again later.";
    }
    if (type === "general_protocol_unsupported") {
        return "Connection protocol error. Please contact support.";
    }

    // ============================================================
    // 🚫 SECTION 2: RATE LIMITING
    // ============================================================
    if (code === 429 || type === "general_rate_limit_exceeded") {
        return "Too many requests. Please slow down and try again in a minute.";
    }

    // ============================================================
    // 🔐 SECTION 3: AUTHENTICATION ERRORS (Order matters!)
    // ============================================================
    
    // 3A. Invalid Credentials (MUST check BEFORE generic 401)
    if (
        type === "user_invalid_credentials" ||
        message.includes("invalid credentials") ||
        message.includes("invalid email or password") ||
        (message.includes("invalid") && message.includes("password"))
    ) {
        return "Incorrect email or password. Please try again.";
    }

    // 3B. User Already Exists (BEFORE generic 409)
    if (type === "user_already_exists" || type === "user_email_already_exists") {
        return "An account with this email already exists. Please log in.";
    }
    if (type === "user_phone_already_exists") {
        return "This phone number is already registered.";
    }

    // 3C. Session Conflicts
    if (type === "user_session_already_exists") {
        return "You're already logged in. Please refresh the page.";
    }

    // 3D. Account Blocked/Restricted
    if (type === "user_blocked") {
        return "Your account has been blocked. Please contact support.";
    }
    if (type === "user_unauthorized") {
        return "You don't have permission to perform this action.";
    }

    // 3E. Password Validation
    if (type === "user_password_mismatch") {
        return "Passwords do not match. Please try again.";
    }
    if (type === "password_recently_used") {
        return "Please choose a different password. This one was used recently.";
    }
    if (type === "password_personal_data") {
        return "Password contains personal info. Please choose a different one.";
    }
    if (message.includes("password must be") || (message.includes("password") && message.includes("short"))) {
        return "Password must be at least 8 characters long.";
    }
    if (type === "user_password_reset_required") {
        return "Password reset required. Please check your email.";
    }

    // 3F. Invalid Tokens/JWT
    if (type === "user_jwt_invalid" || type === "user_invalid_token") {
        return "Authentication token expired. Please log in again.";
    }
    if (type === "user_invalid_code") {
        return "Invalid verification code. Please try again.";
    }

    // 3G. Session Expiry / Unauthorized Scope (AFTER credential checks)
    if (
        code === 401 || 
        type === "general_unauthorized_scope" || 
        type === "general_access_forbidden" ||
        message.includes("unauthorized") || 
        message.includes("missing scope")
    ) {
        // Double-check it's not a login failure
        if (!message.includes("credential") && !message.includes("invalid")) {
            return "Session expired. Please log in again.";
        }
        return "Authentication failed. Please try again.";
    }

    // 3H. Email Validation
    if (message.includes("valid email") || message.includes("invalid email")) {
        return "Please enter a valid email address.";
    }

    // 3I. User Not Found
    if (type === "user_not_found") {
        return "User not found. Please check your credentials.";
    }
    if (type === "user_session_not_found") {
        return "Session not found. Please log in again.";
    }

    // 3J. OAuth Errors
    if (type === "user_oauth2_bad_request" || type === "user_oauth2_unauthorized") {
        return "OAuth login failed. Please try a different method.";
    }
    if (type === "user_oauth2_provider_error") {
        return "Social login provider error. Please try again.";
    }
    if (type === "project_provider_disabled" || type === "project_provider_unsupported") {
        return "This login method is not available. Try another option.";
    }

    // 3K. User Limits
    if (type === "user_count_exceeded") {
        return "Maximum number of users reached. Please contact support.";
    }
    if (type === "user_auth_method_unsupported") {
        return "This authentication method is not supported.";
    }

    // 3L. Team/Membership Errors
    if (type === "team_not_found" || type === "membership_not_found") {
        return "Team or membership not found.";
    }
    if (type === "team_invite_already_exists") {
        return "User already invited or is a member.";
    }

    // ============================================================
    // 🗄️ SECTION 4: DATABASE & DOCUMENT ERRORS
    // ============================================================

    // 4A. Document Already Exists (BEFORE generic 409)
    if (
        type === "row_already_exists" || 
        type === "document_already_exists" ||
        type === "table_already_exists" ||
        type === "database_already_exists"
    ) {
        return "This item already exists. Please use a different name or ID.";
    }

    // 4B. Conflict Errors (409) - After specific checks
    if (code === 409 || message.includes("already exists")) {
        if (message.includes("slug") || message.includes("title")) {
            return "This title/slug is already taken. Please choose a different one.";
        }
        return "This item already exists. Please try a different value.";
    }

    // 4C. Document Not Found
    if (
        type === "row_not_found" || 
        type === "document_not_found" ||
        type === "database_not_found" ||
        type === "table_not_found"
    ) {
        return "The requested content could not be found. It may have been deleted.";
    }

    // 4D. Column/Index Errors
    if (type === "column_limit_exceeded") {
        return "Maximum number of fields reached.";
    }
    if (type === "column_value_invalid" || type === "column_type_invalid") {
        return "Invalid data format. Please check your input.";
    }
    if (type === "index_invalid" || type === "index_limit_exceeded") {
        return "Database index error. Please contact support.";
    }

    // 4E. Query Errors
    if (type === "general_query_invalid") {
        return "Invalid search query. Please try different filters.";
    }
    if (type === "general_query_limit_exceeded") {
        return "Too many search filters. Please simplify your query.";
    }
    if (type === "general_cursor_not_found") {
        return "Data cursor expired. Please refresh and try again.";
    }

    // 4F. Row/Table Limits
    if (type === "table_limit_exceeded") {
        return "Maximum number of collections reached.";
    }
    if (type === "row_invalid_structure" || type === "row_missing_data") {
        return "Invalid data structure. Please check all required fields.";
    }
    if (type === "row_delete_restricted") {
        return "Cannot delete this item because it's referenced by other data.";
    }

    // ============================================================
    // 📁 SECTION 5: STORAGE & FILE UPLOAD ERRORS
    // ============================================================

    // 5A. File Size Issues
    if (
        type === "storage_invalid_file_size" ||
        message.includes("storage_file_too_big") ||
        message.includes("file too big") ||
        code === 413
    ) {
        return "File is too large. Maximum size is 10MB.";
    }

    // 5B. File Type Issues
    if (
        type === "storage_file_type_unsupported" ||
        type === "storage_invalid_file" ||
        message.includes("storage_invalid_file") ||
        message.includes("unsupported file")
    ) {
        return "This file type is not supported. Please upload JPG, PNG, or GIF.";
    }

    // 5C. Empty File
    if (type === "storage_file_empty" || message.includes("empty file")) {
        return "The file is empty or corrupted. Please try a different file.";
    }

    // 5D. Storage Not Found
    if (type === "storage_file_not_found" || type === "storage_bucket_not_found") {
        return "File or storage location not found.";
    }

    // 5E. Storage Already Exists
    if (type === "storage_file_already_exists" || type === "storage_bucket_already_exists") {
        return "A file with this name already exists.";
    }

    // 5F. Invalid Range (Chunked Upload)
    if (type === "storage_invalid_range" || type === "storage_invalid_content_range" || code === 416) {
        return "File upload error. Please try uploading again.";
    }

    // 5G. Invalid Appwrite ID
    if (type === "storage_invalid_appwrite_id") {
        return "Invalid file ID. Please contact support.";
    }

    // ============================================================
    // 🔧 SECTION 6: PLATFORM & PROJECT ERRORS
    // ============================================================

    // 6A. Project Configuration
    if (type === "project_unknown" || type === "project_not_found") {
        return "Project configuration error. Please contact support.";
    }
    if (type === "project_key_expired") {
        return "API key expired. Please contact support.";
    }

    // 6B. Origin/Domain Issues
    if (type === "general_unknown_origin") {
        return "Request from unauthorized domain. Please contact support.";
    }
    if (type === "router_host_not_found" || type === "router_domain_not_configured") {
        return "Domain not configured. Please contact support.";
    }

    // 6C. Argument Validation
    if (type === "general_argument_invalid") {
        if (message.includes("36 chars") || message.includes("documentid")) {
            return "The title creates an invalid link. Please shorten or simplify it.";
        }
        return "Invalid input. Please check your data and try again.";
    }

    // 6D. SMTP/Email Issues
    if (type === "general_smtp_disabled" || type === "project_smtp_config_invalid") {
        return "Email service unavailable. Please contact support.";
    }

    // 6E. Phone/SMS Issues
    if (type === "general_phone_disabled" || type === "user_phone_not_found") {
        return "Phone verification unavailable. Please use email instead.";
    }

    // ============================================================
    // 🔍 SECTION 7: GENERIC HTTP CODES (After specific checks)
    // ============================================================

    // 7A. Forbidden (403)
    if (code === 403 || message.includes("forbidden") || message.includes("permission")) {
        return "You don't have permission to perform this action.";
    }

    // 7B. Not Found (404)
    if (code === 404 || message.includes("not found")) {
        return "The requested resource could not be found.";
    }

    // 7C. Bad Request (400)
    if (code === 400) {
        return "Invalid request. Please check your input and try again.";
    }

    // 7D. Not Implemented (405/501)
    if (code === 405 || code === 501 || type === "general_not_implemented") {
        return "This feature is currently unavailable.";
    }

    // ============================================================
    // 🎯 SECTION 8: FUNCTIONS & MIGRATIONS (Optional)
    // ============================================================

    if (type === "function_not_found" || type === "deployment_not_found") {
        return "Function or deployment not found.";
    }
    if (type === "build_not_ready" || type === "build_in_progress") {
        return "Build in progress. Please wait a moment.";
    }
    if (type === "migration_in_progress") {
        return "Migration in progress. Please try again later.";
    }

    // ============================================================
    // 🖼️ SECTION 9: AVATARS & GRAPHQL (Optional)
    // ============================================================

    if (type === "avatar_not_found" || type === "avatar_image_not_found") {
        return "Avatar image not found.";
    }
    if (type === "graphql_no_query" || type === "graphql_too_many_queries") {
        return "GraphQL query error. Please simplify your request.";
    }

    // ============================================================
    // ⚠️ FALLBACK - When nothing matches
    // ============================================================
    
    // Return original message if it's short and readable
    if (message.length < 100 && message.length > 5) {
        return error.message || "An error occurred. Please try again.";
    }

    // Generic fallback
    return "Something went wrong. Please check your input and try again.";
};
