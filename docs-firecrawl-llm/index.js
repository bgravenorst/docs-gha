import config from './config.js';
import FirecrawlApp from '@mendable/firecrawl-js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the Firecrawl client
const firecrawl = new FirecrawlApp({ apiKey: config.apiKey });

// Function to check job status
async function checkJobStatus(jobId) {
  try {
    const status = await firecrawl.checkGenerateLLMsTextStatus(jobId);
    console.log(`Status: ${status.status}`);
    
    if (status.status === 'completed') {
      console.log('LLMs.txt generation completed!');
      
      // Create output directory if it doesn't exist
      const outputDir = path.join(__dirname, './output');
      await fs.mkdir(outputDir, { recursive: true });
      
      // Write llms.txt to file
      if (status.data.llmstxt) {
        await fs.writeFile(path.join(outputDir, 'llms.txt'), status.data.llmstxt);
        console.log('Saved llms.txt to output directory');
      }
      
      // Write llms-full.txt to file if available
      if (status.data.llmsfulltxt) {
        await fs.writeFile(path.join(outputDir, 'llms-full.txt'), status.data.llmsfulltxt);
        console.log('Saved llms-full.txt to output directory');
      }
      
      // Log processed URLs count
      if (status.data.processedUrls) {
        console.log(`Processed URLs: ${status.data.processedUrls.length}`);
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking job status:', error);
    process.exit(1);
  }
}

// Main function to generate LLMs.txt
async function generateLlmsText() {
  try {
    console.log(`Generating LLMs.txt for: ${config.targetUrl}`);
    
    // Define parameters
    const params = {
      maxUrls: parseInt(config.maxUrls),
      showFullText: Boolean(config.showFullText),
    };
    
    // Create async job
    const job = await firecrawl.asyncGenerateLLMsText(config.targetUrl, params);
    
    if (!job.success) {
      console.error('Failed to create LLMs.txt generation job:', job.error || 'Unknown error');
      return;
    }
    
    // The job ID is in job.id property
    const jobId = job.id;
    console.log(`Job created successfully! Job ID: ${jobId}`);
    
    // Poll job status every 5 seconds until completion
    const pollInterval = 5000; // 5 seconds
    let isCompleted = false;
    
    console.log('Polling for job completion (this may take a while)...');
    
    while (!isCompleted) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      isCompleted = await checkJobStatus(jobId);
    }
    
  } catch (error) {
    console.error('Error generating LLMs.txt:', error);
    process.exit(1);
  }
}

// entrypoint
generateLlmsText(); 