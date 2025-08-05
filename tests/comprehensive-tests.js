const axios = require('axios');
const { expect } = require('chai');

const BASE_URL = 'http://localhost:3000';

class ComprehensiveTestSuite {
    constructor() {
        this.client = axios.create({
            baseURL: BASE_URL,
            timeout: 30000
        });
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    async logTest(name, result, error = null) {
        this.testResults.total++;
        if (result) {
            this.testResults.passed++;
            console.log(`✅ ${name}`);
        } else {
            this.testResults.failed++;
            console.log(`❌ ${name}`);
            if (error) console.log(`   Error: ${error}`);
        }
    }

    async testHealthCheck() {
        try {
            const response = await this.client.get('/health');
            const result = response.status === 200 && 
                          response.data.status === 'healthy' &&
                          response.data.services.weaviate === 'running';
            await this.logTest('Health Check', result);
            return result;
        } catch (error) {
            await this.logTest('Health Check', false, error.message);
            return false;
        }
    }

    async testSystemStatus() {
        try {
            const response = await this.client.get('/api/status');
            const result = response.status === 200 && 
                          response.data.status === 'running';
            await this.logTest('System Status', result);
            return result;
        } catch (error) {
            await this.logTest('System Status', false, error.message);
            return false;
        }
    }

    async testRAGQueries() {
        const ragQueries = [
            'What is machine learning?',
            'How does a neural network work?',
            'What is the difference between supervised and unsupervised learning?',
            'What is deep learning?',
            'How do you evaluate machine learning models?'
        ];

        for (const query of ragQueries) {
            try {
                const response = await this.client.post('/api/query', {
                    query,
                    tenant: 'tenant1'
                });

                const result = response.status === 200 &&
                              response.data.success &&
                              response.data.response.answer &&
                              response.data.response.toolsUsed.includes('RAG');

                await this.logTest(`RAG Query: "${query}"`, result);
            } catch (error) {
                await this.logTest(`RAG Query: "${query}"`, false, error.message);
            }
        }
    }

    async testChartQueries() {
        const chartQueries = [
            'Create a bar chart of sales data',
            'Show me a pie chart of market share',
            'Generate a line chart of trends',
            'Create a doughnut chart of expenses',
            'Make a bar chart of monthly revenue'
        ];

        for (const query of chartQueries) {
            try {
                const response = await this.client.post('/api/query', {
                    query,
                    tenant: 'tenant1'
                });

                const result = response.status === 200 &&
                              response.data.success &&
                              response.data.response.toolsUsed.includes('Chart');

                await this.logTest(`Chart Query: "${query}"`, result);
            } catch (error) {
                await this.logTest(`Chart Query: "${query}"`, false, error.message);
            }
        }
    }

    async testCombinedQueries() {
        const combinedQueries = [
            'What is AI and show me a bar chart of AI applications',
            'Explain machine learning and create a pie chart of ML algorithms',
            'What is deep learning and generate a line chart of DL frameworks',
            'Tell me about neural networks and create a doughnut chart of NN types'
        ];

        for (const query of combinedQueries) {
            try {
                const response = await this.client.post('/api/query', {
                    query,
                    tenant: 'tenant1'
                });

                const result = response.status === 200 &&
                              response.data.success &&
                              response.data.response.toolsUsed.length > 1;

                await this.logTest(`Combined Query: "${query}"`, result);
            } catch (error) {
                await this.logTest(`Combined Query: "${query}"`, false, error.message);
            }
        }
    }

    async testDirectQueries() {
        const directQueries = [
            'Hello, how are you?',
            'What is the weather like?',
            'Tell me a joke',
            'What time is it?',
            'How are you doing today?'
        ];

        for (const query of directQueries) {
            try {
                const response = await this.client.post('/api/query', {
                    query,
                    tenant: 'tenant1'
                });

                const result = response.status === 200 &&
                              response.data.success &&
                              response.data.response.answer;

                await this.logTest(`Direct Query: "${query}"`, result);
            } catch (error) {
                await this.logTest(`Direct Query: "${query}"`, false, error.message);
            }
        }
    }

    async testSearchFunctionality() {
        const searchQueries = [
            'machine learning',
            'neural network',
            'deep learning',
            'supervised learning',
            'evaluation metrics'
        ];

        for (const query of searchQueries) {
            try {
                const response = await this.client.post('/api/search', {
                    query,
                    tenant: 'tenant1',
                    limit: 3
                });

                const result = response.status === 200 &&
                              response.data.success &&
                              Array.isArray(response.data.results);

                await this.logTest(`Search: "${query}"`, result);
            } catch (error) {
                await this.logTest(`Search: "${query}"`, false, error.message);
            }
        }
    }

    async testChartGeneration() {
        const chartTypes = ['bar', 'line', 'pie', 'doughnut'];

        for (const chartType of chartTypes) {
            try {
                const response = await this.client.post('/api/chart', {
                    chartType,
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                        values: [10, 20, 15, 25, 30],
                        label: 'Sample Data'
                    },
                    title: `Sample ${chartType} chart`
                });

                const result = response.status === 200 &&
                              response.data.success &&
                              response.data.result.chartConfig.type === chartType;

                await this.logTest(`Chart Generation: ${chartType}`, result);
            } catch (error) {
                await this.logTest(`Chart Generation: ${chartType}`, false, error.message);
            }
        }
    }

    async testMultiTenantQueries() {
        const tenantQueries = [
            { query: 'What is machine learning?', tenant: 'tenant1' },
            { query: 'What is deep learning?', tenant: 'tenant2' },
            { query: 'How does a neural network work?', tenant: 'tenant1' },
            { query: 'What is the difference between supervised and unsupervised learning?', tenant: 'tenant2' }
        ];

        for (const { query, tenant } of tenantQueries) {
            try {
                const response = await this.client.post('/api/query', {
                    query,
                    tenant
                });

                const result = response.status === 200 &&
                              response.data.success &&
                              response.data.response.answer;

                await this.logTest(`Multi-Tenant Query: "${query}" (${tenant})`, result);
            } catch (error) {
                await this.logTest(`Multi-Tenant Query: "${query}" (${tenant})`, false, error.message);
            }
        }
    }

    async testDocumentRetrieval() {
        const fileIds = ['doc001', 'doc002', 'doc003'];

        try {
            const response = await this.client.post('/api/documents', {
                fileIds,
                tenant: 'tenant1'
            });

            const result = response.status === 200 &&
                          response.data.success &&
                          Array.isArray(response.data.documents);

            await this.logTest('Document Retrieval by File IDs', result);
        } catch (error) {
            await this.logTest('Document Retrieval by File IDs', false, error.message);
        }
    }

    async testErrorHandling() {
        // Test invalid query
        try {
            const response = await this.client.post('/api/query', {
                query: '',
                tenant: 'tenant1'
            });

            const result = response.status === 400;
            await this.logTest('Error Handling: Empty Query', result);
        } catch (error) {
            await this.logTest('Error Handling: Empty Query', true); // Expected to fail
        }

        // Test invalid chart data
        try {
            const response = await this.client.post('/api/chart', {
                chartType: 'invalid',
                data: {}
            });

            const result = response.status === 400;
            await this.logTest('Error Handling: Invalid Chart Data', result);
        } catch (error) {
            await this.logTest('Error Handling: Invalid Chart Data', true); // Expected to fail
        }
    }

    async testPerformance() {
        const startTime = Date.now();
        
        try {
            const response = await this.client.post('/api/query', {
                query: 'What is machine learning?',
                tenant: 'tenant1'
            });

            const endTime = Date.now();
            const responseTime = endTime - startTime;
            const result = response.status === 200 && responseTime < 5000; // 5 seconds max

            await this.logTest(`Performance Test (${responseTime}ms)`, result);
        } catch (error) {
            await this.logTest('Performance Test', false, error.message);
        }
    }

    async testConcurrentQueries() {
        const queries = [
            'What is machine learning?',
            'Create a bar chart of data',
            'Hello, how are you?',
            'What is deep learning?'
        ];

        try {
            const promises = queries.map(query => 
                this.client.post('/api/query', { query, tenant: 'tenant1' })
            );

            const responses = await Promise.all(promises);
            const result = responses.every(response => 
                response.status === 200 && response.data.success
            );

            await this.logTest('Concurrent Queries Test', result);
        } catch (error) {
            await this.logTest('Concurrent Queries Test', false, error.message);
        }
    }

    async runAllTests() {
        console.log('🚀 Comprehensive Test Suite');
        console.log('===========================\n');

        // Check if system is running
        const healthOk = await this.testHealthCheck();
        if (!healthOk) {
            console.log('\n❌ System is not ready. Please start the server first.');
            console.log('💡 Run: npm start');
            return;
        }

        console.log('\n📋 Running all test categories...\n');

        // Run all test categories
        await this.testSystemStatus();
        await this.testRAGQueries();
        await this.testChartQueries();
        await this.testCombinedQueries();
        await this.testDirectQueries();
        await this.testSearchFunctionality();
        await this.testChartGeneration();
        await this.testMultiTenantQueries();
        await this.testDocumentRetrieval();
        await this.testErrorHandling();
        await this.testPerformance();
        await this.testConcurrentQueries();

        // Print summary
        console.log('\n📊 Test Summary');
        console.log('===============');
        console.log(`Total Tests: ${this.testResults.total}`);
        console.log(`Passed: ${this.testResults.passed}`);
        console.log(`Failed: ${this.testResults.failed}`);
        console.log(`Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);

        if (this.testResults.failed === 0) {
            console.log('\n🎉 All tests passed!');
        } else {
            console.log(`\n⚠️  ${this.testResults.failed} test(s) failed.`);
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const testSuite = new ComprehensiveTestSuite();
    testSuite.runAllTests().catch(console.error);
}

module.exports = ComprehensiveTestSuite; 