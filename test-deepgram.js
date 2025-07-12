#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Deepgram API Setup...\n');

// Check if .env.local exists
const envPath = path.join(__dirname, 'apps/web/.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasDeepgramKey = envContent.includes('DEEPGRAM_API_KEY=');
  
  if (hasDeepgramKey) {
    console.log('✅ Found .env.local file with DEEPGRAM_API_KEY');
  } else {
    console.log('❌ DEEPGRAM_API_KEY not found in .env.local');
    console.log('📝 Please add: DEEPGRAM_API_KEY=your-api-key-here');
  }
} else {
  console.log('❌ .env.local file not found');
  console.log('📝 Please create apps/web/.env.local with:');
  console.log('   DEEPGRAM_API_KEY=your-api-key-here');
}

console.log('\n🔗 Get your Deepgram API key from: https://console.deepgram.com/');
console.log('💰 Deepgram offers 200 hours free per month');

console.log('\n🌐 Test your app at: http://localhost:3000');
console.log('🎤 Select "Deepgram" from the STT provider dropdown'); 