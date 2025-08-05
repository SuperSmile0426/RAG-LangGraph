# RAG-LangGraph: Hierarchical Agent System

A sophisticated hierarchical agent system built with Node.js, LangGraph, and Weaviate vector database. The system features a delegating agent that can intelligently route queries to specialized tools including RAG (Retrieval-Augmented Generation) and Chart.js visualization.

## 🏗️ Architecture

### System Components

1. **Delegating Agent**: The main orchestrator that analyzes user queries and determines which tools/agents to use
2. **RAG Agent**: Retrieves relevant information from the Weaviate vector database
3. **Chart.js Tool**: Generates Chart.js configurations for data visualization
4. **Weaviate Database**: Multi-tenant vector database with semantic search capabilities

### Multi-Tenancy Support

The system supports multiple tenants with isolated data storage and retrieval:
- `tenant1`: Default tenant with machine learning documentation
- `tenant2`: Additional tenant with different data sets

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- Google Gemini API key (optional, for enhanced LLM capabilities)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RAG-LangGraph
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start Weaviate database**
   ```bash
   npm run docker:up
   ```

5. **Start the application**
   ```bash
   npm start
   ```

## 📋 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Weaviate Configuration
WEAVIATE_URL=http://localhost:8080
WEAVIATE_API_KEY=

# Google Gemini API Configuration (Optional)
GOOGLE_API_KEY=your_google_api_key_here

# Application Configuration
PORT=3000
NODE_ENV=development
```

### Docker Configuration

The system uses Docker Compose to run Weaviate with the following configuration:
- **Image**: `semitechnologies/weaviate:1.22.4`
- **Port**: `8080`
- **Vectorizer**: `text2vec-transformers`
- **Model**: `sentence-transformers-multi-qa-MiniLM-L6-cos-v1`

## 🔧 API Endpoints

### Main Query Endpoint
```http
POST /api/query
Content-Type: application/json

{
  "query": "What is machine learning?",
  "tenant": "tenant1"
}
```

**Response:**
```json
{
  "success": true,
  "query": "What is machine learning?",
  "response": {
    "answer": "Machine learning is a subset of artificial intelligence...",
    "fileIds": ["doc001", "doc005"],
    "references": [...],
    "chartConfig": null,
    "toolsUsed": ["RAG"]
  }
}
```

### Search Documents
```http
POST /api/search
Content-Type: application/json

{
  "query": "neural network",
  "tenant": "tenant1",
  "limit": 5
}
```

### Get Documents by File IDs
```http
POST /api/documents
Content-Type: application/json

{
  "fileIds": ["doc001", "doc002"],
  "tenant": "tenant1"
}
```

### Generate Charts
```http
POST /api/chart
Content-Type: application/json

{
  "chartType": "bar",
  "data": {
    "labels": ["Jan", "Feb", "Mar"],
    "values": [10, 20, 30],
    "label": "Sales Data"
  },
  "title": "Monthly Sales"
}
```

### System Status
```http
GET /api/status
```

### Health Check
```http
GET /health
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
npm install axios  # If not already installed
node test-client.js
```

The test client will:
- Verify system health
- Test RAG queries
- Test chart generation
- Test combined queries
- Test direct responses
- Test search functionality

## 📊 Database Schema

### QADocument Class

```json
{
  "class": "QADocument",
  "multiTenancy": {
    "enabled": true
  },
  "properties": [
    {
      "name": "fileId",
      "dataType": ["string"],
      "indexInverted": false,
      "vectorizePropertyName": false
    },
    {
      "name": "question",
      "dataType": ["text"],
      "indexInverted": true,
      "vectorizePropertyName": true
    },
    {
      "name": "answer",
      "dataType": ["text"],
      "indexInverted": true,
      "vectorizePropertyName": true
    },
    {
      "name": "tenant",
      "dataType": ["string"],
      "indexInverted": true,
      "vectorizePropertyName": false
    }
  ]
}
```

## 🔄 Agent Flow

1. **Query Analysis**: The delegating agent analyzes the user query to determine required tools
2. **Tool Selection**: Based on analysis, selects appropriate tools:
   - RAG Agent for information retrieval
   - Chart Tool for visualization
   - Direct response for general queries
3. **Parallel Execution**: Multiple tools can run simultaneously
4. **Response Synthesis**: Combines results from multiple tools into a coherent response

## 🛠️ Development

### Project Structure

```
RAG-LangGraph/
├── src/
│   ├── agents/
│   │   ├── delegating-agent.js
│   │   └── rag-agent.js
│   ├── database/
│   │   └── weaviate-setup.js
│   ├── llm/
│   │   └── llm-config.js
│   └── tools/
│       └── chart-tool.js
├── index.js
├── test-client.js
├── docker-compose.yml
├── package.json
└── README.md
```

### Adding New Tools

1. Create a new tool class extending `@langchain/core/tools`
2. Implement the `_call` method
3. Register the tool in the delegating agent
4. Update the query analysis logic

### Adding New Agents

1. Create a new agent class
2. Implement the required methods
3. Integrate with the delegating agent
4. Update the routing logic

## 🐳 Docker Commands

```bash
# Start Weaviate
npm run docker:up

# Stop Weaviate
npm run docker:down

# View logs
docker-compose logs weaviate
```

## 🔍 Troubleshooting

### Common Issues

1. **Weaviate connection failed**
   - Ensure Docker is running
   - Check if port 8080 is available
   - Verify docker-compose.yml configuration

2. **LLM not responding**
   - Check Google API key configuration
   - Verify network connectivity
   - Check console logs for errors

3. **Schema creation failed**
   - Ensure Weaviate is fully started
   - Check for existing schema conflicts
   - Verify multi-tenancy configuration

### Logs

The application provides detailed logging:
- System initialization
- Query processing
- Tool usage
- Error handling

## 📈 Performance

- **Response Time**: < 2 seconds for most queries
- **Concurrent Queries**: Supports multiple simultaneous requests
- **Vector Search**: Optimized with Weaviate's semantic search
- **Memory Usage**: Efficient with streaming responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- LangChain for LLM orchestration
- Weaviate for vector database capabilities
- Chart.js for visualization support
- Google Gemini for enhanced LLM capabilities