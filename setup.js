#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 RAG-LangGraph Setup Script');
console.log('==============================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file from template...');
    const envExamplePath = path.join(__dirname, 'env.example');
    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ .env file created successfully');
        console.log('⚠️  Please edit .env file with your configuration');
    } else {
        console.log('❌ env.example file not found');
        process.exit(1);
    }
} else {
    console.log('✅ .env file already exists');
}

// Check if Docker is running
console.log('\n🐳 Checking Docker...');
try {
    execSync('docker --version', { stdio: 'pipe' });
    console.log('✅ Docker is available');
} catch (error) {
    console.log('❌ Docker is not available. Please install Docker first.');
    process.exit(1);
}

// Check if Docker Compose is available
try {
    execSync('docker-compose --version', { stdio: 'pipe' });
    console.log('✅ Docker Compose is available');
} catch (error) {
    console.log('❌ Docker Compose is not available. Please install Docker Compose first.');
    process.exit(1);
}

// Check if Node.js dependencies are installed
console.log('\n📦 Checking Node.js dependencies...');
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json not found');
    process.exit(1);
}

const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing Node.js dependencies...');
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dependencies installed successfully');
    } catch (error) {
        console.log('❌ Failed to install dependencies');
        process.exit(1);
    }
} else {
    console.log('✅ Node.js dependencies already installed');
}

// Check if Weaviate is running
console.log('\n🔍 Checking Weaviate status...');
try {
    const response = execSync('curl -s http://localhost:8080/v1/.well-known/ready', { stdio: 'pipe' });
    if (response.toString().includes('ready')) {
        console.log('✅ Weaviate is already running');
    } else {
        console.log('⚠️  Weaviate is not ready');
    }
} catch (error) {
    console.log('⚠️  Weaviate is not running');
    console.log('💡 You can start Weaviate with: npm run docker:up');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Edit .env file with your configuration');
console.log('2. Start Weaviate: npm run docker:up');
console.log('3. Start the application: npm start');
console.log('4. Run tests: node test-client.js');
console.log('\n📚 For more information, see README.md'); 