import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables (with override enabled to prioritize .env file variables)
dotenv.config({ override: true });

function sanitizeValue(val: string | undefined | null): string {
  if (!val) return '';
  let cleaned = val.trim();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  } else if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.slice(1, -1);
  }
  cleaned = cleaned.trim();
  
  // Strip trailing /rest/v1/ or /rest/v1 or trailing slashes for Supabase URL compatibility
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    cleaned = cleaned.replace(/\/rest\/v1\/?$/, '');
    cleaned = cleaned.replace(/\/+$/, '');
  }
  
  return cleaned;
}

// Configure Cloudinary with sanitized values
cloudinary.config({
  cloud_name: sanitizeValue(process.env.CLOUDINARY_CLOUD_NAME),
  api_key: sanitizeValue(process.env.CLOUDINARY_API_KEY),
  api_secret: sanitizeValue(process.env.CLOUDINARY_API_SECRET),
  secure: true,
});

const supabaseUrl = sanitizeValue(process.env.VITE_SUPABASE_URL);
const supabaseAnonKey = sanitizeValue(process.env.VITE_SUPABASE_ANON_KEY);

const isSupabaseConfiguredOnServer = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') && 
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('placeholder') && 
  !supabaseAnonKey.includes('your-anon-key');

const serverSupabase = isSupabaseConfiguredOnServer 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 image data URIs
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // API Route for uploading images to Cloudinary
  app.post("/api/upload", async (req, res) => {
    console.log("=== START UPLOAD DEBUG FLOW ===");
    try {
      // 0. Verify Supabase JWT token
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        console.error("DEBUG [0/6] FAIL: No authorization token provided.");
        return res.status(401).json({ error: "Authentication required: No authorization token provided." });
      }

      if (!isSupabaseConfiguredOnServer || !serverSupabase) {
        console.error("DEBUG [0/6] FAIL: Supabase is not configured on the server, cannot verify token.");
        return res.status(500).json({ error: "Server Configuration Error: Supabase is not configured on the server." });
      }

      console.log("DEBUG [0/6] VERIFYING: Verifying token with Supabase...");
      const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token);

      if (authError || !user) {
        console.error("DEBUG [0/6] FAIL: JWT verification failed.", authError);
        return res.status(401).json({ error: `Unauthorized: Invalid or expired token. ${authError?.message || ''}` });
      }

      console.log(`DEBUG [0/6] SUCCESS: Token verified successfully for user: ${user?.id}`);

      const { image } = req.body; // base64 data URI
      
      // 1. Verify if the Express server received the image payload
      if (!image) {
        console.error("DEBUG [1/6] FAIL: Express server did NOT receive any image data in req.body.");
        return res.status(400).json({ error: "No image data provided" });
      }
      
      const imageLength = image.length;
      const preview = image.substring(0, 50);
      console.log(`DEBUG [1/6] SUCCESS: Express server received image payload successfully. Size of string: ${imageLength} characters. Preview: "${preview}..."`);

      // Backend size validation: Ensure the parsed base64 string size does not exceed 5 MB
      const base64Length = image.length - (image.indexOf(",") + 1);
      const sizeInBytes = (base64Length * 3) / 4;
      const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB
      console.log(`DEBUG [1.5/6] Calculated image size: ${(sizeInBytes / 1024 / 1024).toFixed(2)} MB`);
      if (sizeInBytes > maxSizeInBytes) {
        console.error(`DEBUG [1.5/6] FAIL: Image exceeds the 5 MB limit. Size: ${(sizeInBytes / 1024 / 1024).toFixed(2)} MB`);
        return res.status(400).json({ error: "Image size exceeds the 5 MB limit." });
      }

      const cloudName = sanitizeValue(process.env.CLOUDINARY_CLOUD_NAME);
      const apiKey = sanitizeValue(process.env.CLOUDINARY_API_KEY);
      const apiSecret = sanitizeValue(process.env.CLOUDINARY_API_SECRET);

      const isPlaceholder = (val?: string) => 
        !val || 
        val.trim() === "" || 
        val.toLowerCase().includes("your-") || 
        val.toLowerCase().includes("placeholder");

      // Robust check for missing or placeholder credentials
      if (isPlaceholder(cloudName) || isPlaceholder(apiKey) || isPlaceholder(apiSecret)) {
        console.error("DEBUG [2/6] FAIL: Cloudinary credentials are missing or set to placeholders:", { 
          cloudName: cloudName || "MISSING", 
          apiKey: apiKey ? "PRESENT (hidden)" : "MISSING", 
          apiSecret: apiSecret ? "PRESENT (hidden)" : "MISSING" 
        });
        return res.status(400).json({ 
          error: "Cloudinary credentials are not configured or are still set to placeholders. Please replace the placeholder values for CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your Environment Secrets with your actual Cloudinary credentials." 
        });
      }

      // 2. Initialize and configure Cloudinary SDK
      console.log(`DEBUG [2/6] CONFIGURING: Initializing Cloudinary SDK with Cloud Name: "${cloudName}" and API Key: "${apiKey}".`);
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      console.log("DEBUG [2/6] SUCCESS: Cloudinary SDK configured successfully.");

      // 3. Perform the upload and catch any responses/errors
      console.log("DEBUG [3/6] UPLOADING: Sending base64 payload to Cloudinary API...");
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "campusmart_listings",
        resource_type: "image",
      });

      // 5. Log the exact successful response from Cloudinary
      console.log("DEBUG [5/6] SUCCESS: Cloudinary API returned a successful response!");
      console.log("DEBUG [5/6] CLOUDINARY_RESPONSE_DATA:", JSON.stringify(uploadResponse, null, 2));

      console.log("=== END UPLOAD DEBUG FLOW (SUCCESS) ===");
      return res.json({ 
        url: uploadResponse.secure_url,
        public_id: uploadResponse.public_id 
      });
    } catch (error: any) {
      // 4. & 6. Log the exact error and print the complete error message
      console.error("=== END UPLOAD DEBUG FLOW (FAILED) ===");
      console.error("DEBUG [4/6] ERROR: Cloudinary API upload failed.");
      console.error("DEBUG [6/6] COMPLETE_ERROR_DETAILS:", error);
      if (error && typeof error === 'object') {
        console.error("DEBUG [6/6] ERROR_KEYS:", Object.keys(error));
        console.error("DEBUG [6/6] ERROR_MESSAGE:", error.message);
        console.error("DEBUG [6/6] ERROR_CODE:", error.code);
        console.error("DEBUG [6/6] ERROR_HTTP_CODE:", error.http_code);
      }

      // Extract the most descriptive error message possible
      let errorMessage = "An error occurred during Cloudinary upload";
      if (error && typeof error === 'object') {
        errorMessage = error.message || error.error?.message || JSON.stringify(error);
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      return res.status(500).json({ 
        error: errorMessage 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
