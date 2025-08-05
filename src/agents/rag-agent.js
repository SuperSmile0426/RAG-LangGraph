const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { HumanMessage, AIMessage } = require('@langchain/core/messages');
const WeaviateSetup = require('../database/weaviate-setup');
const LLMConfig = require('../llm/llm-config');

class RAGAgent {
    constructor(weaviateSetup = null) {
        this.weaviate = weaviateSetup || new WeaviateSetup();
        this.llm = new LLMConfig();
    }

    async processQuery(userQuery, tenant = 'tenant1') {
        try {
            // Step 1: Search for relevant documents in Weaviate
            const relevantDocs = await this.weaviate.searchDocuments(userQuery, tenant, 5);
            
            if (!relevantDocs || relevantDocs.length === 0) {
                return {
                    answer: "I couldn't find any relevant information in the knowledge base for your query.",
                    fileIds: [],
                    references: []
                };
            }

            // Step 2: Extract fileIds and prepare context
            const fileIds = relevantDocs.map(doc => doc.fileId);
            const context = relevantDocs.map(doc => 
                `Question: ${doc.question}\nAnswer: ${doc.answer}`
            ).join('\n\n');

            // Step 3: Generate answer using LLM with context
            const prompt = ChatPromptTemplate.fromMessages([
                ['system', `You are a helpful AI assistant. Use the following context to answer the user's question. 
                If the context doesn't contain enough information to answer the question, say so.
                
                Context:
                {context}
                
                Answer the user's question based on the context provided.`],
                ['human', '{question}']
            ]);

            const formattedPrompt = await prompt.formatMessages({
                context: context,
                question: userQuery
            });

            const response = await this.llm.invoke(formattedPrompt);
            
            // Step 4: Prepare references
            const references = relevantDocs.map(doc => ({
                fileId: doc.fileId,
                question: doc.question,
                answer: doc.answer,
                tenant: doc.tenant
            }));

            return {
                answer: response.content,
                fileIds: fileIds,
                references: references
            };

        } catch (error) {
            console.error('❌ Error in RAG agent:', error);
            return {
                answer: "I encountered an error while processing your query. Please try again.",
                fileIds: [],
                references: []
            };
        }
    }

    async fetchDocumentsByFileIds(fileIds, tenant = 'tenant1') {
        try {
            const documents = await this.weaviate.fetchObjectsByFileIds(fileIds, tenant);
            return documents;
        } catch (error) {
            console.error('❌ Error fetching documents by fileIds:', error);
            return [];
        }
    }

    async searchSimilarQuestions(query, tenant = 'tenant1', limit = 3) {
        try {
            const similarDocs = await this.weaviate.searchDocuments(query, tenant, limit);
            return similarDocs.map(doc => ({
                fileId: doc.fileId,
                question: doc.question,
                answer: doc.answer
            }));
        } catch (error) {
            console.error('❌ Error searching similar questions:', error);
            return [];
        }
    }
}

module.exports = RAGAgent; 