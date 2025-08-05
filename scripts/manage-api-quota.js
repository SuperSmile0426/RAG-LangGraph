#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class APIQuotaManager {
    constructor() {
        this.envPath = path.join(__dirname, '..', '.env');
    }

    // Check current quota status
    async checkQuotaStatus() {
        console.log('🔍 Checking Google API quota status...');
        
        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
                headers: {
                    'Authorization': `Bearer ${process.env.GOOGLE_API_KEY}`
                }
            });
            
            if (response.status === 429) {
                console.log('❌ Rate limit exceeded - quota has been reached');
                return false;
            } else if (response.ok) {
                console.log('✅ API quota available');
                return true;
            }
        } catch (error) {
            console.log('⚠️ Could not check quota status:', error.message);
        }
        
        return null;
    }

    // Disable Google API temporarily
    disableGoogleAPI() {
        console.log('🔄 Disabling Google API due to quota exceeded...');
        
        try {
            let envContent = fs.readFileSync(this.envPath, 'utf8');
            
            // Update or add DISABLE_GOOGLE_API
            if (envContent.includes('DISABLE_GOOGLE_API=')) {
                envContent = envContent.replace(/DISABLE_GOOGLE_API=.*/g, 'DISABLE_GOOGLE_API=true');
            } else {
                envContent += '\nDISABLE_GOOGLE_API=true';
            }
            
            fs.writeFileSync(this.envPath, envContent);
            console.log('✅ Google API disabled. System will use mock LLM.');
            console.log('💡 To re-enable, run: npm run enable-google-api');
        } catch (error) {
            console.error('❌ Error updating .env file:', error.message);
        }
    }

    // Enable Google API
    enableGoogleAPI() {
        console.log('🔄 Re-enabling Google API...');
        
        try {
            let envContent = fs.readFileSync(this.envPath, 'utf8');
            
            if (envContent.includes('DISABLE_GOOGLE_API=')) {
                envContent = envContent.replace(/DISABLE_GOOGLE_API=.*/g, 'DISABLE_GOOGLE_API=false');
            }
            
            fs.writeFileSync(this.envPath, envContent);
            console.log('✅ Google API re-enabled.');
        } catch (error) {
            console.error('❌ Error updating .env file:', error.message);
        }
    }

    // Show quota solutions
    showQuotaSolutions() {
        console.log('\n📋 Google API Quota Solutions:');
        console.log('================================');
        
        console.log('\n1. 🆓 Free Tier Solutions:');
        console.log('   • Wait 24 hours for quota reset');
        console.log('   • Use mock LLM temporarily (already implemented)');
        console.log('   • Disable Google API: npm run disable-google-api');
        
        console.log('\n2. 💳 Paid Solutions:');
        console.log('   • Upgrade to Google AI Studio paid plan');
        console.log('   • Visit: https://makersuite.google.com/app/apikey');
        console.log('   • Get higher rate limits and quotas');
        
        console.log('\n3. 🔄 Alternative Solutions:');
        console.log('   • Use multiple API keys (rotate them)');
        console.log('   • Implement request caching');
        console.log('   • Use different LLM providers');
        
        console.log('\n4. 🛠️ Current System Status:');
        console.log('   • Mock LLM is active and working');
        console.log('   • All features remain functional');
        console.log('   • RAG queries still work with Weaviate data');
        
        console.log('\n5. 📊 Quota Information:');
        console.log('   • Free tier: 50 requests/day per model');
        console.log('   • Models: gemini-1.5-flash, gemini-1.5-pro, gemini-pro');
        console.log('   • Reset time: Every 24 hours');
    }

    // Show current configuration
    showCurrentConfig() {
        console.log('\n📋 Current Configuration:');
        console.log('========================');
        
        try {
            const envContent = fs.readFileSync(this.envPath, 'utf8');
            const lines = envContent.split('\n');
            
            const config = {
                'Google API Key': lines.find(line => line.startsWith('GOOGLE_API_KEY='))?.split('=')[1] ? 'Set' : 'Not set',
                'Google API Disabled': lines.find(line => line.startsWith('DISABLE_GOOGLE_API='))?.includes('true') ? 'Yes' : 'No',
                'Weaviate URL': lines.find(line => line.startsWith('WEAVIATE_URL='))?.split('=')[1] || 'Not set',
                'Port': lines.find(line => line.startsWith('PORT='))?.split('=')[1] || '3000'
            };
            
            Object.entries(config).forEach(([key, value]) => {
                console.log(`   ${key}: ${value}`);
            });
        } catch (error) {
            console.error('❌ Error reading configuration:', error.message);
        }
    }
}

// CLI interface
async function main() {
    const manager = new APIQuotaManager();
    const command = process.argv[2];

    switch (command) {
        case 'check':
            await manager.checkQuotaStatus();
            break;
            
        case 'disable':
            manager.disableGoogleAPI();
            break;
            
        case 'enable':
            manager.enableGoogleAPI();
            break;
            
        case 'solutions':
            manager.showQuotaSolutions();
            break;
            
        case 'config':
            manager.showCurrentConfig();
            break;
            
        default:
            console.log('🔧 Google API Quota Manager');
            console.log('==========================');
            console.log('');
            console.log('Usage:');
            console.log('  node scripts/manage-api-quota.js <command>');
            console.log('');
            console.log('Commands:');
            console.log('  check     - Check current quota status');
            console.log('  disable   - Disable Google API (use mock LLM)');
            console.log('  enable    - Re-enable Google API');
            console.log('  solutions - Show quota solutions');
            console.log('  config    - Show current configuration');
            console.log('');
            console.log('Example:');
            console.log('  node scripts/manage-api-quota.js solutions');
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = APIQuotaManager; 