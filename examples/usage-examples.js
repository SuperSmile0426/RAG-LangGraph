const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Example usage of the RAG-LangGraph system
class UsageExamples {
    constructor() {
        this.client = axios.create({
            baseURL: BASE_URL,
            timeout: 30000
        });
    }

    async example1_RAGQuery() {
        console.log('\n📚 Example 1: RAG Query');
        console.log('Query: "What is machine learning?"');
        
        try {
            const response = await this.client.post('/api/query', {
                query: 'What is machine learning?',
                tenant: 'tenant1'
            });

            console.log('✅ Response:');
            console.log('  Answer:', response.data.response.answer);
            console.log('  Tools used:', response.data.response.toolsUsed);
            console.log('  File IDs:', response.data.response.fileIds);
            console.log('  References:', response.data.response.references.length);
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    }

    async example2_ChartGeneration() {
        console.log('\n📊 Example 2: Chart Generation');
        console.log('Query: "Create a bar chart of sales data"');
        
        try {
            const response = await this.client.post('/api/query', {
                query: 'Create a bar chart of sales data',
                tenant: 'tenant1'
            });

            console.log('✅ Response:');
            console.log('  Answer:', response.data.response.answer);
            console.log('  Tools used:', response.data.response.toolsUsed);
            console.log('  Chart config available:', !!response.data.response.chartConfig);
            
            if (response.data.response.chartConfig) {
                console.log('  Chart type:', response.data.response.chartConfig.type);
                console.log('  Chart title:', response.data.response.chartConfig.options.plugins.title.text);
            }
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    }

    async example3_CombinedQuery() {
        console.log('\n🔄 Example 3: Combined Query');
        console.log('Query: "What is AI and show me a pie chart of AI applications"');
        
        try {
            const response = await this.client.post('/api/query', {
                query: 'What is AI and show me a pie chart of AI applications',
                tenant: 'tenant1'
            });

            console.log('✅ Response:');
            console.log('  Answer:', response.data.response.answer);
            console.log('  Tools used:', response.data.response.toolsUsed);
            console.log('  File IDs:', response.data.response.fileIds);
            console.log('  Chart config available:', !!response.data.response.chartConfig);
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    }

    async example4_DirectQuery() {
        console.log('\n💬 Example 4: Direct Query');
        console.log('Query: "Hello, how are you?"');
        
        try {
            const response = await this.client.post('/api/query', {
                query: 'Hello, how are you?',
                tenant: 'tenant1'
            });

            console.log('✅ Response:');
            console.log('  Answer:', response.data.response.answer);
            console.log('  Tools used:', response.data.response.toolsUsed);
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    }

    async example5_SearchDocuments() {
        console.log('\n🔍 Example 5: Search Documents');
        console.log('Search: "neural network"');
        
        try {
            const response = await this.client.post('/api/search', {
                query: 'neural network',
                tenant: 'tenant1',
                limit: 3
            });

            console.log('✅ Search Results:');
            console.log('  Count:', response.data.count);
            response.data.results.forEach((result, index) => {
                console.log(`  ${index + 1}. ${result.fileId}: ${result.question}`);
            });
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    }

    async example6_ChartAPI() {
        console.log('\n📈 Example 6: Direct Chart API');
        console.log('Generate a line chart');
        
        try {
            const response = await this.client.post('/api/chart', {
                chartType: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                    values: [12, 19, 3, 5, 2],
                    label: 'Trend Data'
                },
                title: 'Monthly Trends'
            });

            console.log('✅ Chart Result:');
            console.log('  Success:', response.data.success);
            console.log('  Chart type:', response.data.result.chartConfig.type);
            console.log('  Title:', response.data.result.chartConfig.options.plugins.title.text);
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    }

    async example7_MultiTenant() {
        console.log('\n🏢 Example 7: Multi-Tenant Query');
        console.log('Query: "What is deep learning?" on tenant2');
        
        try {
            const response = await this.client.post('/api/query', {
                query: 'What is deep learning?',
                tenant: 'tenant2'
            });

            console.log('✅ Response:');
            console.log('  Answer:', response.data.response.answer);
            console.log('  Tools used:', response.data.response.toolsUsed);
            console.log('  File IDs:', response.data.response.fileIds);
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    }

    async runAllExamples() {
        console.log('🚀 RAG-LangGraph Usage Examples');
        console.log('================================\n');

        // Check if system is running
        try {
            await this.client.get('/health');
            console.log('✅ System is running\n');
        } catch (error) {
            console.error('❌ System is not running. Please start the server first.');
            console.log('💡 Run: npm start');
            return;
        }

        await this.example1_RAGQuery();
        await this.example2_ChartGeneration();
        await this.example3_CombinedQuery();
        await this.example4_DirectQuery();
        await this.example5_SearchDocuments();
        await this.example6_ChartAPI();
        await this.example7_MultiTenant();

        console.log('\n🎉 All examples completed!');
        console.log('\n💡 Try your own queries:');
        console.log('  curl -X POST http://localhost:3000/api/query \\');
        console.log('    -H "Content-Type: application/json" \\');
        console.log('    -d \'{"query": "Your question here"}\'');
    }
}

// Run examples if this file is executed directly
if (require.main === module) {
    const examples = new UsageExamples();
    examples.runAllExamples().catch(console.error);
}

module.exports = UsageExamples; 