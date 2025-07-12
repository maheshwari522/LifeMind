#!/usr/bin/env node

// Simple test script for STT endpoints
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing STT Endpoints...\n');

// Test 1: Check if web app is running
async function testWebApp() {
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log('✅ Web app is running on http://localhost:3000');
    } else {
      console.log('❌ Web app is not responding properly');
    }
  } catch (error) {
    console.log('❌ Web app is not running');
  }
}

// Test 2: Check Vosk server
async function testVoskServer() {
  try {
    const response = await fetch('http://localhost:2700/health');
    if (response.ok) {
      console.log('✅ Vosk server is running on http://localhost:2700');
    } else {
      console.log('⚠️  Vosk server is not responding (Docker may not be running)');
    }
  } catch (error) {
    console.log('⚠️  Vosk server is not running (Docker may not be running)');
  }
}

// Test 3: Check API endpoints
async function testAPIEndpoints() {
  const endpoints = [
    { name: 'OpenAI STT', url: 'http://localhost:3000/api/stt/openai' },
    { name: 'Deepgram STT', url: 'http://localhost:3000/api/stt/deepgram' },
    { name: 'AI Service', url: 'http://localhost:3000/api/ai' }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url, { method: 'POST' });
      if (response.status === 400) {
        console.log(`✅ ${endpoint.name} endpoint is available (400 = missing audio file, which is expected)`);
      } else if (response.status === 500) {
        console.log(`⚠️  ${endpoint.name} endpoint is available but needs API key configuration`);
      } else {
        console.log(`✅ ${endpoint.name} endpoint is available`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name} endpoint is not available`);
    }
  }
}

// Run all tests
async function runTests() {
  await testWebApp();
  await testVoskServer();
  await testAPIEndpoints();
  
  console.log('\n📋 Summary:');
  console.log('• Web Speech API: Available in browser (no setup needed)');
  console.log('• Vosk: Requires Docker to be running');
  console.log('• OpenAI: Requires OPENAI_API_KEY in .env.local');
  console.log('• Deepgram: Requires DEEPGRAM_API_KEY in .env.local');
  
  console.log('\n🎯 Quick Start:');
  console.log('1. Open http://localhost:3000 in your browser');
  console.log('2. Click the settings icon (⚙️) on the voice recorder');
  console.log('3. Select "Web Speech API" (works immediately)');
  console.log('4. Click the microphone and start speaking!');
  
  console.log('\n🚀 For better accuracy:');
  console.log('• Install Docker and run: ./vosk-server-setup.sh');
  console.log('• Or get API keys for OpenAI/Deepgram');
}

runTests().catch(console.error); 