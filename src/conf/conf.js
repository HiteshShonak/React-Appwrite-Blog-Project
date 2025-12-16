const conf = {
  appwriteUrl: String(import.meta.env.VITE_APPWRITE_URL),
  appwriteProjectId: String(import.meta.env.VITE_APPWRITE_PROJECT_ID),
  appwriteApiKey: String(import.meta.env.VITE_APPWRITE_API_KEY),
  appwriteDatabaseId: String(import.meta.env.VITE_APPWRITE_DATABASE_ID),
  appwriteCollectionId: String(import.meta.env.VITE_APPWRITE_COLLECTION_ID),
  appwriteBucketId: String(import.meta.env.VITE_APPWRITE_BUCKET_ID),
  tinymceApiKey: String(import.meta.env.VITE_TINYMCE_API_KEY),
  emailJsServiceId: String(import.meta.env.VITE_EMAILJS_SERVICE_ID),
  emailJsTemplateId: String(import.meta.env.VITE_EMAILJS_TEMPLATE_ID),
  emailJsPublicKey: String(import.meta.env.VITE_EMAILJS_PUBLIC_KEY),
  appwriteUserProfilesCollectionId: String(import.meta.env.VITE_APPWRITE_USER_PROFILES_COLLECTION_ID),
  appwriteCommentsCollectionId: String(import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID),
  appwriteRatingsCollectionId: String(import.meta.env.VITE_APPWRITE_RATINGS_COLLECTION_ID),
}

export default conf