const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

class TestClient {
    constructor() {
        this.client = axios.create({
            baseURL: BASE_URL,
            timeout: 30000
        });
    }

    async testHealth() {
        try {
            const response = await this.client.get('/health');
            console.log('✅ Health check passed:', response.data);
            return true;
        } catch (error) {
            console.error('❌ Health check failed:', error.message);
            return false;
        }
    }

    async testQuery(query, tenant = 'tenant1') {
        try {
            console.log(`\n🔍 Testing query: "${query}"`);
            const response = await this.client.post('/api/query', {
                query,
                tenant
            });

            console.log('📝 Response:');
            console.log('  Answer:', response.data.response.answer);
            console.log('  Tools used:', response.data.response.toolsUsed);
            console.log('  File IDs:', response.data.response.fileIds);
            
            if (response.data.response.chartConfig) {
                console.log('  Chart config available:', !!response.data.response.chartConfig);
            }
            
            if (response.data.response.references.length > 0) {
                console.log('  References:', response.data.response.references.length);
            }

            return response.data;
        } catch (error) {
            console.error(`❌ Query failed: ${error.message}`);
            return null;
        }
    }

    async testSearch(query, tenant = 'tenant1') {
        try {
            console.log(`\n🔍 Testing search: "${query}"`);
            const response = await this.client.post('/api/search', {
                query,
                tenant,
                limit: 3
            });

            console.log('📝 Search results:');
            console.log('  Count:', response.data.count);
            response.data.results.forEach((result, index) => {
                console.log(`  ${index + 1}. ${result.fileId}: ${result.question}`);
            });

            return response.data;
        } catch (error) {
            console.error(`❌ Search failed: ${error.message}`);
            return null;
        }
    }

    async testChart(chartType = 'bar') {
        try {
            console.log(`\n📊 Testing chart generation: ${chartType}`);
            const response = await this.client.post('/api/chart', {
                chartType,
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                    values: [10, 20, 15, 25, 30],
                    label: 'Sample Data'
                },
                title: `Sample ${chartType} chart`
            });

            console.log('📝 Chart result:');
            console.log('  Success:', response.data.success);
            console.log('  Chart type:', response.data.result.chartConfig.type);
            console.log('  Title:', response.data.result.chartConfig.options.plugins.title.text);

            return response.data;
        } catch (error) {
            console.error(`❌ Chart generation failed: ${error.message}`);
            return null;
        }
    }

    async runAllTests() {
        console.log('🚀 Starting comprehensive tests...\n');

        // Test 1: Health check
        const healthOk = await this.testHealth();
        if (!healthOk) {
            console.log('❌ System not ready, stopping tests');
            return;
        }

        // Test 2: RAG queries
        const ragQueries = [
            'What is machine learning?',
            'How does a neural network work?',
            'What is the difference between supervised and unsupervised learning?'
        ];

        for (const query of ragQueries) {
            await this.testQuery(query);
        }

        // Test 3: Chart queries
        const chartQueries = [
            'Create a bar chart of sales data',
            'Show me a pie chart of market share',
            'Generate a line chart of trends'
        ];

        for (const query of chartQueries) {
            await this.testQuery(query);
        }

        // Test 4: Combined queries
        const combinedQueries = [
            'What is AI and show me a bar chart of AI applications',
            'Explain machine learning and create a pie chart of ML algorithms'
        ];

        for (const query of combinedQueries) {
            await this.testQuery(query);
        }

        // Test 5: Direct queries
        const directQueries = [
            'Hello, how are you?',
            'What is the weather like?',
            'Tell me a joke'
        ];

        for (const query of directQueries) {
            await this.testQuery(query);
        }

        // Test 6: Search functionality
        await this.testSearch('machine learning');
        await this.testSearch('neural network');

        // Test 7: Chart generation
        await this.testChart('bar');
        await this.testChart('pie');
        await this.testChart('line');

        console.log('\n🎉 All tests completed!');
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const client = new TestClient();
    client.runAllTests().catch(console.error);
}

module.exports = TestClient; 