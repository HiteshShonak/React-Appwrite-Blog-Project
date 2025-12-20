/* sitemap-generator.js */
import { SitemapStream } from 'sitemap';
import { createWriteStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; 

// 1. Load Environment Variables
dotenv.config();

// 🔴 CONFIGURATION
const YOUR_DOMAIN = 'https://blogideasandstories.vercel.app'; 

// 2. CONFIG OBJECT
const conf = {
    appwriteUrl: process.env.VITE_APPWRITE_URL,
    appwriteProjectId: process.env.VITE_APPWRITE_PROJECT_ID,
    appwriteDatabaseId: process.env.VITE_APPWRITE_DATABASE_ID,
    appwriteCollectionId: process.env.VITE_APPWRITE_COLLECTION_ID, 
    appwriteUserProfilesCollectionId: process.env.VITE_APPWRITE_USER_PROFILES_COLLECTION_ID, 
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSitemap() {
    console.log('------------------------------------------------');
    console.log('🗺️  Generating Sitemap...');

    // Safety Check
    if (!conf.appwriteUrl || !conf.appwriteProjectId || !conf.appwriteDatabaseId || !conf.appwriteCollectionId) {
        console.error('⛔ STOPPING: Missing .env variables.');
        return;
    }

    const sitemap = new SitemapStream({ hostname: YOUR_DOMAIN });
    const writeStream = createWriteStream(path.resolve(__dirname, './public/sitemap.xml'));

    // Pipe the stream and wait for it to finish
    sitemap.pipe(writeStream);
    const sitemapWritten = new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
    });

    // 1. STATIC PAGES
    const staticPages = [
        { url: '/', changefreq: 'daily', priority: 1.0 },
        { url: '/all-posts', changefreq: 'daily', priority: 0.9 },
        { url: '/login', changefreq: 'monthly', priority: 0.5 },
        { url: '/signup', changefreq: 'monthly', priority: 0.5 },
    ];
    staticPages.forEach(page => sitemap.write(page));

    // 2. FETCH BLOG POSTS
    console.log('⏳ Fetching Posts...');
    try {
        // Fetch latest 100 posts (Appwrite sorts by creation automatically unless specified)
        const response = await fetch(
            `${conf.appwriteUrl}/databases/${conf.appwriteDatabaseId}/collections/${conf.appwriteCollectionId}/documents?limit=100`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Appwrite-Project': conf.appwriteProjectId
                }
            }
        );

        const data = await response.json();

        if (data.documents) {
            // Filter strictly for "active" posts just to be safe
            const activePosts = data.documents.filter(post => post.Status === 'active');
            
            console.log(`✅ Added ${activePosts.length} posts to sitemap.`);

            activePosts.forEach((post) => {
                sitemap.write({
                    url: `/post/${post.$id}`,
                    changefreq: 'weekly',
                    priority: 0.8,
                    lastmod: post.$updatedAt
                });
            });
        }
    } catch (error) {
        console.error("❌ Error fetching posts:", error.message);
    }

    // 3. FETCH AUTHORS
    if (conf.appwriteUserProfilesCollectionId) {
        console.log('⏳ Fetching Authors...');
        try {
            const response = await fetch(
                `${conf.appwriteUrl}/databases/${conf.appwriteDatabaseId}/collections/${conf.appwriteUserProfilesCollectionId}/documents?limit=100`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Appwrite-Project': conf.appwriteProjectId
                    }
                }
            );
            const data = await response.json();
            if (data.documents) {
                console.log(`✅ Added ${data.documents.length} authors to sitemap.`);
                data.documents.forEach((profile) => {
                    const username = profile.Username || profile.username;
                    if (username) {
                        sitemap.write({
                            url: `/author/${username}`,
                            changefreq: 'weekly',
                            priority: 0.7
                        });
                    }
                });
            }
        } catch (error) {
            console.error("❌ Error fetching authors:", error.message);
        }
    }

    // 4. FINISH
    sitemap.end();
    await sitemapWritten;
    console.log('------------------------------------------------');
    console.log('✅ COMPLETE: Sitemap written to /public/sitemap.xml');
    console.log('------------------------------------------------');
}

generateSitemap();