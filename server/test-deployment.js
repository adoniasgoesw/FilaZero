import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current file directory for debugging
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Debug Info:');
console.log('📁 Current directory:', __dirname);
console.log('📁 Working directory:', process.cwd());
console.log('📁 __dirname:', __dirname);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route to check if server is working
app.get('/', (req, res) => {
  res.json({
    message: '🚀 FilaZero Test Server - Deployment Debug',
    environment: 'test',
    timestamp: new Date().toISOString(),
    status: 'running',
    debug: {
      currentDir: __dirname,
      workingDir: process.cwd(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Test server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Test file system access
app.get('/test-fs', (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const files = fs.readdirSync(__dirname);
    const routesDir = path.join(__dirname, 'routes');
    const routesFiles = fs.existsSync(routesDir) ? fs.readdirSync(routesDir) : [];
    
    res.json({
      success: true,
      currentDir: __dirname,
      files: files,
      routesDir: routesDir,
      routesFiles: routesFiles,
      exists: {
        routesDir: fs.existsSync(routesDir),
        AuthRoute: fs.existsSync(path.join(routesDir, 'AuthRoute.js')),
        authroutes: fs.existsSync(path.join(routesDir, 'authroutes.js'))
      }
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      currentDir: __dirname
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`🌍 Environment: Test`);
  console.log(`📁 Current directory: ${__dirname}`);
  console.log(`📁 Working directory: ${process.cwd()}`);
  console.log(`✅ Test server started successfully!`);
});

export default app;
