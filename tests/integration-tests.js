const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

class IntegrationTests {
    constructor() {
        this.client = axios.create({
            baseURL: BASE_URL,
            timeout: 30000
        });
    }

    async testCompleteWorkflow() {
        console.log('\n🔄 Testing Complete Workflow');
        console.log('===========================\n');

        try {
            // Step 1: Health check
            console.log('1. Checking system health...');
            const healthResponse = await this.client.get('/health');
            console.log('✅ Health check passed');

            // Step 2: Search for documents
            console.log('\n2. Searching for documents...');
            const searchResponse = await this.client.post('/api/search', {
                query: 'machine learning',
                tenant: 'tenant1',
                limit: 3
            });
            console.log(`✅ Found ${searchResponse.data.count} documents`);

            // Step 3: Get specific documents
            console.log('\n3. Retrieving specific documents...');
            const fileIds = searchResponse.data.results.map(doc => doc.fileId).slice(0, 2);
            const docsResponse = await this.client.post('/api/documents', {
                fileIds,
                tenant: 'tenant1'
            });
            console.log(`✅ Retrieved ${docsResponse.data.count} documents`);

            // Step 4: RAG query
            console.log('\n4. Testing RAG query...');
            const ragResponse = await this.client.post('/api/query', {
                query: 'What is machine learning?',
                tenant: 'tenant1'
            });
            console.log('✅ RAG query completed');
            console.log(`   Tools used: ${ragResponse.data.response.toolsUsed.join(', ')}`);
            console.log(`   File IDs: ${ragResponse.data.response.fileIds.join(', ')}`);

            // Step 5: Chart generation
            console.log('\n5. Testing chart generation...');
            const chartResponse = await this.client.post('/api/chart', {
                chartType: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                    values: [10, 20, 15, 25, 30],
                    label: 'Sample Data'
                },
                title: 'Monthly Data'
            });
            console.log('✅ Chart generation completed');
            console.log(`   Chart type: ${chartResponse.data.result.chartConfig.type}`);

            // Step 6: Combined query
            console.log('\n6. Testing combined query...');
            const combinedResponse = await this.client.post('/api/query', {
                query: 'What is AI and show me a pie chart of AI applications',
                tenant: 'tenant1'
            });
            console.log('✅ Combined query completed');
            console.log(`   Tools used: ${combinedResponse.data.response.toolsUsed.join(', ')}`);
            console.log(`   Has chart config: ${!!combinedResponse.data.response.chartConfig}`);

            // Step 7: Multi-tenant test
            console.log('\n7. Testing multi-tenant functionality...');
            const tenant1Response = await this.client.post('/api/query', {
                query: 'What is machine learning?',
                tenant: 'tenant1'
            });
            const tenant2Response = await this.client.post('/api/query', {
                query: 'What is deep learning?',
                tenant: 'tenant2'
            });
            console.log('✅ Multi-tenant test completed');

            console.log('\n🎉 Complete workflow test passed!');
            return true;

        } catch (error) {
            console.error('❌ Workflow test failed:', error.message);
            return false;
        }
    }

    async testPerformanceWorkflow() {
        console.log('\n⚡ Testing Performance Workflow');
        console.log('==============================\n');

        const startTime = Date.now();
        const results = [];

        try {
            // Run multiple queries in parallel
            const queries = [
                'What is machine learning?',
                'Create a bar chart of sales data',
                'How does a neural network work?',
                'Show me a pie chart of market share',
                'What is deep learning?'
            ];

            console.log(`Running ${queries.length} queries in parallel...`);

            const promises = queries.map(async (query, index) => {
                const queryStartTime = Date.now();
                try {
                    const response = await this.client.post('/api/query', {
                        query,
                        tenant: 'tenant1'
                    });
                    const queryEndTime = Date.now();
                    const queryTime = queryEndTime - queryStartTime;
                    
                    results.push({
                        query: query.substring(0, 30) + '...',
                        success: true,
                        time: queryTime,
                        tools: response.data.response.toolsUsed
                    });

                    console.log(`✅ Query ${index + 1}: ${queryTime}ms`);
                    return response;
                } catch (error) {
                    const queryEndTime = Date.now();
                    const queryTime = queryEndTime - queryStartTime;
                    
                    results.push({
                        query: query.substring(0, 30) + '...',
                        success: false,
                        time: queryTime,
                        error: error.message
                    });

                    console.log(`❌ Query ${index + 1}: ${queryTime}ms - ${error.message}`);
                    throw error;
                }
            });

            await Promise.all(promises);

            const endTime = Date.now();
            const totalTime = endTime - startTime;
            const avgTime = totalTime / queries.length;
            const successCount = results.filter(r => r.success).length;

            console.log('\n📊 Performance Results:');
            console.log(`Total Time: ${totalTime}ms`);
            console.log(`Average Time: ${avgTime.toFixed(0)}ms`);
            console.log(`Success Rate: ${(successCount / queries.length * 100).toFixed(1)}%`);
            console.log(`Queries/Second: ${(queries.length / (totalTime / 1000)).toFixed(2)}`);

            return successCount === queries.length;

        } catch (error) {
            console.error('❌ Performance test failed:', error.message);
            return false;
        }
    }

    async testErrorRecovery() {
        console.log('\n🛡️ Testing Error Recovery');
        console.log('=========================\n');

        try {
            // Test 1: Invalid query
            console.log('1. Testing invalid query handling...');
            try {
                await this.client.post('/api/query', {
                    query: '',
                    tenant: 'tenant1'
                });
                console.log('❌ Should have failed with empty query');
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    console.log('✅ Properly handled empty query');
                } else {
                    console.log('❌ Unexpected error for empty query');
                }
            }

            // Test 2: Invalid chart data
            console.log('\n2. Testing invalid chart data handling...');
            try {
                await this.client.post('/api/chart', {
                    chartType: 'invalid',
                    data: {}
                });
                console.log('❌ Should have failed with invalid chart data');
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    console.log('✅ Properly handled invalid chart data');
                } else {
                    console.log('❌ Unexpected error for invalid chart data');
                }
            }

            // Test 3: System recovery after errors
            console.log('\n3. Testing system recovery...');
            const recoveryResponse = await this.client.post('/api/query', {
                query: 'What is machine learning?',
                tenant: 'tenant1'
            });
            
            if (recoveryResponse.status === 200 && recoveryResponse.data.success) {
                console.log('✅ System recovered properly after errors');
            } else {
                console.log('❌ System did not recover properly');
            }

            console.log('\n🎉 Error recovery test completed!');
            return true;

        } catch (error) {
            console.error('❌ Error recovery test failed:', error.message);
            return false;
        }
    }

    async runAllIntegrationTests() {
        console.log('🚀 Integration Test Suite');
        console.log('========================\n');

        // Check if system is running
        try {
            await this.client.get('/health');
            console.log('✅ System is running\n');
        } catch (error) {
            console.error('❌ System is not running. Please start the server first.');
            console.log('💡 Run: npm start');
            return;
        }

        const results = [];

        // Run all integration tests
        results.push(await this.testCompleteWorkflow());
        results.push(await this.testPerformanceWorkflow());
        results.push(await this.testErrorRecovery());

        // Print summary
        const passed = results.filter(r => r).length;
        const total = results.length;

        console.log('\n📊 Integration Test Summary');
        console.log('==========================');
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${total - passed}`);
        console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

        if (passed === total) {
            console.log('\n🎉 All integration tests passed!');
        } else {
            console.log(`\n⚠️  ${total - passed} integration test(s) failed.`);
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const integrationTests = new IntegrationTests();
    integrationTests.runAllIntegrationTests().catch(console.error);
}

module.exports = IntegrationTests; 