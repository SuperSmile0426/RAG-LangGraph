const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { HumanMessage, AIMessage } = require('@langchain/core/messages');
const LLMConfig = require('../llm/llm-config');
const RAGAgent = require('./rag-agent');
const ChartTool = require('../tools/chart-tool');

class DelegatingAgent {
    constructor(weaviateSetup = null) {
        this.llm = new LLMConfig();
        this.ragAgent = new RAGAgent(weaviateSetup);
        this.chartTool = new ChartTool();
    }

    async processQuery(userQuery, tenant = 'tenant1') {
        try {
            // Step 1: Analyze the query to determine what tools/agents to use
            const analysis = await this.analyzeQuery(userQuery);
            
            const response = {
                answer: '',
                references: [],
                fileIds: [],
                chartConfig: null,
                toolsUsed: []
            };

            // Step 2: Execute tools/agents based on analysis
            const promises = [];

            // Use RAG agent if needed
            if (analysis.useRAG) {
                promises.push(this.ragAgent.processQuery(userQuery, tenant));
                response.toolsUsed.push('RAG');
            }

            // Use Chart tool if needed
            if (analysis.useChart) {
                const chartInput = this.prepareChartInput(userQuery, analysis.chartType);
                promises.push(this.chartTool.invoke(chartInput));
                response.toolsUsed.push('Chart');
            }

            // If no specific tools needed, provide direct answer
            if (!analysis.useRAG && !analysis.useChart) {
                const directAnswer = await this.provideDirectAnswer(userQuery);
                response.answer = directAnswer;
                response.toolsUsed.push('Direct');
            }

            // Step 3: Wait for all tools to complete
            if (promises.length > 0) {
                const results = await Promise.all(promises);
                
                results.forEach((result, index) => {
                    if (response.toolsUsed[index] === 'RAG') {
                        response.answer = result.answer;
                        response.fileIds = result.fileIds;
                        response.references = result.references;
                    } else if (response.toolsUsed[index] === 'Chart') {
                        if (result.success) {
                            response.chartConfig = result.chartConfig;
                        }
                    }
                });
            }

            // Step 4: Generate final response if multiple tools were used
            if (response.toolsUsed.length > 1) {
                response.answer = await this.generateCombinedResponse(userQuery, response);
            }

            return response;

        } catch (error) {
            console.error('❌ Error in delegating agent:', error);
            return {
                answer: "I encountered an error while processing your request. Please try again.",
                references: [],
                fileIds: [],
                chartConfig: null,
                toolsUsed: ['Error']
            };
        }
    }

    async analyzeQuery(userQuery) {
        // Simplified analysis based on keywords
        const query = userQuery.toLowerCase();
        
        const useRAG = query.includes('what') || query.includes('how') || query.includes('why') || 
                       query.includes('search') || query.includes('find') || query.includes('machine learning') || 
                       query.includes('neural network') || query.includes('deep learning') || query.includes('ai');
        
        const useChart = query.includes('chart') || query.includes('graph') || query.includes('visualize') || 
                        query.includes('plot') || query.includes('bar') || query.includes('pie') || 
                        query.includes('line') || query.includes('doughnut');
        
        let chartType = 'bar';
        if (query.includes('pie')) chartType = 'pie';
        else if (query.includes('line')) chartType = 'line';
        else if (query.includes('doughnut')) chartType = 'doughnut';
        
        return {
            useRAG: useRAG,
            useChart: useChart,
            chartType: chartType,
            reasoning: `Analysis based on query content: ${userQuery}`
        };
    }

    determineChartType(query) {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('bar')) return 'bar';
        if (lowerQuery.includes('line')) return 'line';
        if (lowerQuery.includes('pie')) return 'pie';
        if (lowerQuery.includes('doughnut')) return 'doughnut';
        return 'bar'; // default
    }

    prepareChartInput(userQuery, chartType) {
        // Generate sample data based on the query
        const sampleData = this.chartTool.generateSampleData(chartType);
        
        return {
            chartType: chartType,
            data: sampleData,
            title: `Chart for: ${userQuery}`
        };
    }

    async provideDirectAnswer(userQuery) {
        const query = userQuery.toLowerCase();
        
        if (query.includes('hello') || query.includes('how are you')) {
            return 'Hello! I am doing well, thank you for asking. How can I help you today?';
        } else if (query.includes('weather')) {
            return 'I cannot provide real-time weather information, but I can help you with other questions!';
        } else if (query.includes('joke')) {
            return 'Why did the AI go to therapy? Because it had too many neural issues! 😄';
        } else {
            return 'I understand your query. Let me provide you with a helpful response based on my knowledge.';
        }
    }

    async generateCombinedResponse(userQuery, response) {
        return `I've analyzed your query: "${userQuery}" and used ${response.toolsUsed.join(' and ')} to gather information. ${response.answer}`;
    }
}

module.exports = DelegatingAgent; 