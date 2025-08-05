const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

class LLMConfig {
    constructor() {
        this.llm = this.createLLM();
    }

    createLLM() {
        // Check if Google API is disabled due to quota issues
        if (process.env.DISABLE_GOOGLE_API === 'true') {
            console.log('⚠️ Google API disabled due to quota issues, using mock LLM');
            return this.createMockLLM();
        }
        
        // Try to use Google Gemini first
        if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY.trim() !== '') {
            try {
                console.log('🔧 Attempting to initialize Google Gemini API...');
                
                // Try different model configurations
                const modelConfigs = [
                    { modelName: 'gemini-1.5-flash', maxOutputTokens: 2048, temperature: 0.7 },
                    { modelName: 'gemini-1.5-pro', maxOutputTokens: 2048, temperature: 0.7 },
                    { modelName: 'gemini-pro', maxOutputTokens: 2048, temperature: 0.7 }
                ];
                
                for (const config of modelConfigs) {
                    try {
                        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
                        const model = genAI.getGenerativeModel({ model: config.modelName });
                        
                        console.log(`✅ Google Gemini API initialized successfully with ${config.modelName}`);
                        return {
                            invoke: async (messages) => {
                                try {
                                    const lastMessage = messages[messages.length - 1];
                                    const result = await model.generateContent(lastMessage.content);
                                    const response = await result.response;
                                    return { content: response.text() };
                                } catch (error) {
                                    console.warn(`⚠️ Google Gemini API error: ${error.message}`);
                                    if (error.message.includes('429') || error.message.includes('quota')) {
                                        console.log('🔄 Falling back to mock LLM due to quota exceeded');
                                        return this.createMockLLM().invoke(messages);
                                    }
                                    throw error;
                                }
                            }
                        };
                    } catch (modelError) {
                        console.warn(`⚠️ Failed to initialize with ${config.modelName}:`, modelError.message);
                        continue;
                    }
                }
                
                throw new Error('All Gemini model configurations failed');
                
            } catch (error) {
                console.warn('⚠️ Google Gemini API initialization failed:', error.message);
                console.log('🔄 Falling back to mock LLM for testing');
            }
        } else {
            console.log('⚠️ No Google API key found, using mock LLM');
        }

        // Fallback to mock implementation
        return this.createMockLLM();
    }

    createMockLLM() {
        return {
            invoke: async (messages) => {
                // Mock response for local LLM
                const lastMessage = messages[messages.length - 1];
                const content = lastMessage.content;
                
                // Check if this is an analysis query
                if (content.includes('query analyzer') || content.includes('User query:')) {
                    const userQuery = content.split('User query:')[1]?.trim() || '';
                    const query = userQuery.toLowerCase();
                    
                    // Determine tool usage based on query content
                    const useRAG = query.includes('what') || query.includes('how') || query.includes('why') || query.includes('search') || query.includes('find') || query.includes('machine learning') || query.includes('neural network') || query.includes('deep learning');
                    const useChart = query.includes('chart') || query.includes('graph') || query.includes('visualize') || query.includes('plot') || query.includes('bar') || query.includes('pie') || query.includes('line');
                    
                    let chartType = 'bar';
                    if (query.includes('pie')) chartType = 'pie';
                    else if (query.includes('line')) chartType = 'line';
                    else if (query.includes('doughnut')) chartType = 'doughnut';
                    
                    return {
                        content: JSON.stringify({
                            useRAG: useRAG,
                            useChart: useChart,
                            chartType: chartType,
                            reasoning: `Analysis based on query content: ${userQuery}`
                        })
                    };
                }
                
                // For RAG queries, provide contextual responses
                if (content.includes('Context:')) {
                    const context = content.split('Context:')[1]?.split('Answer the user')[0] || '';
                    const question = content.split('Answer the user')[1]?.split('question:')[1] || '';
                    
                    if (context.includes('machine learning')) {
                        return { 
                            content: 'Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed. It uses algorithms to identify patterns in data and make predictions or decisions.' 
                        };
                    } else if (context.includes('neural network')) {
                        return { 
                            content: 'A neural network is a series of algorithms that attempts to recognize underlying relationships in a set of data through a process that mimics the way the human brain operates.' 
                        };
                    } else {
                        return { 
                            content: 'Based on the provided context, I can help answer your question. The information suggests this is related to AI and machine learning concepts.' 
                        };
                    }
                }
                
                // For direct questions, provide helpful responses
                if (content.includes('direct and informative answer')) {
                    const userQuery = content.split('{query}')[1]?.trim() || '';
                    if (userQuery.includes('hello') || userQuery.includes('how are you')) {
                        return { content: 'Hello! I am doing well, thank you for asking. How can I help you today?' };
                    } else if (userQuery.includes('weather')) {
                        return { content: 'I cannot provide real-time weather information, but I can help you with other questions!' };
                    } else if (userQuery.includes('joke')) {
                        return { content: 'Why did the AI go to therapy? Because it had too many neural issues! 😄' };
                    } else {
                        return { content: 'I understand your query. Let me provide you with a helpful response based on my knowledge.' };
                    }
                }
                
                // For chart requests
                if (content.includes('chart') || content.includes('graph')) {
                    return {
                        content: 'I can help you create a chart. Let me generate a Chart.js configuration for you.'
                    };
                } else if (content.includes('search') || content.includes('find') || content.includes('what')) {
                    return {
                        content: 'I can help you search for information. Let me query the knowledge base for relevant documents.'
                    };
                } else {
                    return {
                        content: 'I understand your query. Let me provide you with a direct answer based on my knowledge.'
                    };
                }
            }
        };
    }

    async invoke(messages) {
        try {
            return await this.llm.invoke(messages);
        } catch (error) {
            console.error('❌ Error invoking LLM:', error);
            
            // Check if it's a rate limit error
            if (error.message.includes('429') || error.message.includes('quota')) {
                console.log('🔄 Rate limit exceeded, using mock LLM');
                return this.createMockLLM().invoke(messages);
            }
            
            // Return a fallback response
            return {
                content: 'I encountered an error while processing your request. Please try again.'
            };
        }
    }

    async stream(messages) {
        try {
            if (this.llm.stream) {
                return await this.llm.stream(messages);
            }
            // Fallback for non-streaming LLMs
            const response = await this.invoke(messages);
            return [response];
        } catch (error) {
            console.error('❌ Error streaming from LLM:', error);
            return [{
                content: 'I encountered an error while processing your request. Please try again.'
            }];
        }
    }
}

module.exports = LLMConfig; 