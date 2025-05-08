import 'dotenv/config';

export default {
  apiKey: process.env.FIRECRAWL_API_KEY,
  targetUrl: process.env.TARGET_URL,
  maxUrls: process.env.MAX_URLS,
  showFullText: process.env.SHOW_FULL_TEXT,
}; 
