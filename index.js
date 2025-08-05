const express = require('express');
const cors = require('cors');
require('dotenv').config();

const WeaviateSetup = require('./src/database/weaviate-setup');
const DelegatingAgent = require('./src/agents/delegating-agent');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize components
let weaviateSetup;
let delegatingAgent;

// Initialize the system
async function initializeSystem() {
    try {
        console.log('🚀 Initializing RAG-LangGraph system...');
        
        // Initialize Weaviate
        weaviateSetup = new WeaviateSetup();
        await weaviateSetup.initialize();
        await weaviateSetup.createSchema();
        await weaviateSetup.insertSampleData();
        
        // Initialize Delegating Agent with the initialized WeaviateSetup
        delegatingAgent = new DelegatingAgent(weaviateSetup);
        
        console.log('✅ System initialized successfully!');
    } catch (error) {
        console.error('❌ Error initializing system:', error);
        process.exit(1);
    }
}

// API Routes

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            weaviate: 'running',
            delegatingAgent: 'ready'
        }
    });
});

// Main query endpoint
app.post('/api/query', async (req, res) => {
    try {
        const { query, tenant = 'tenant1' } = req.body;
        
        if (!query) {
            return res.status(400).json({
                error: 'Query is required'
            });
        }

        console.log(`📝 Processing query: "${query}" for tenant: ${tenant}`);
        
        const response = await delegatingAgent.processQuery(query, tenant);
        
        console.log(`✅ Query processed successfully. Tools used: ${response.toolsUsed.join(', ')}`);
        
        res.json({
            success: true,
            query: query,
            response: response
        });
        
    } catch (error) {
        console.error('❌ Error processing query:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Search documents endpoint
app.post('/api/search', async (req, res) => {
    try {
        const { query, tenant = 'tenant1', limit = 5 } = req.body;
        
        if (!query) {
            return res.status(400).json({
                error: 'Query is required'
            });
        }

        const results = await weaviateSetup.searchDocuments(query, tenant, limit);
        
        res.json({
            success: true,
            query: query,
            results: results,
            count: results.length
        });
        
    } catch (error) {
        console.error('❌ Error searching documents:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Get documents by fileIds endpoint
app.post('/api/documents', async (req, res) => {
    try {
        const { fileIds, tenant = 'tenant1' } = req.body;
        
        if (!fileIds || !Array.isArray(fileIds)) {
            return res.status(400).json({
                error: 'fileIds array is required'
            });
        }

        const documents = await weaviateSetup.fetchObjectsByFileIds(fileIds, tenant);
        
        res.json({
            success: true,
            fileIds: fileIds,
            documents: documents,
            count: documents.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching documents:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Chart generation endpoint
app.post('/api/chart', async (req, res) => {
    try {
        const { chartType, data, title } = req.body;
        
        if (!chartType || !data) {
            return res.status(400).json({
                error: 'chartType and data are required'
            });
        }

        const ChartTool = require('./src/tools/chart-tool');
        const chartTool = new ChartTool();
        
        const result = await chartTool.invoke({
            chartType,
            data,
            title: title || 'Chart'
        });
        
        res.json({
            success: true,
            result: result
        });
        
    } catch (error) {
        console.error('❌ Error generating chart:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// System status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        status: 'running',
        components: {
            weaviate: weaviateSetup ? 'initialized' : 'not initialized',
            delegatingAgent: delegatingAgent ? 'ready' : 'not ready'
        },
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, async () => {
    console.log(`🌐 Server starting on port ${PORT}...`);
    
    // Initialize the system
    await initializeSystem();
    
    console.log(`🎉 Server is running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔍 API endpoints:`);
    console.log(`   POST /api/query - Main query endpoint`);
    console.log(`   POST /api/search - Search documents`);
    console.log(`   POST /api/documents - Get documents by fileIds`);
    console.log(`   POST /api/chart - Generate charts`);
    console.log(`   GET /api/status - System status`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down gracefully...');
    process.exit(0);
}); 