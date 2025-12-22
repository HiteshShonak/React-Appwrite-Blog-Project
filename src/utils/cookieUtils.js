const COOKIE_EXPIRY_DAYS = 1; // 1 hours

export const setViewedCookie = (postId) => {
    const name = `viewed_post_${postId}`;
    const date = new Date();
    // Set cookie to expire in 1 hours
    date.setTime(date.getTime() + (COOKIE_EXPIRY_DAYS * 1 * 60 * 60 * 1000));
    const expires = "; expires=" + date.toUTCString();
    
    // Set the cookie with a value of 'true'
    document.cookie = name + "=" + (true) + expires + "; path=/; Secure; SameSite=Lax";
};

export const hasViewedCookie = (postId) => {
    const name = `viewed_post_${postId}`;
    // Check if the specific cookie name exists
    return document.cookie.split(';').some((item) => item.trim().startsWith(name + '='));
};