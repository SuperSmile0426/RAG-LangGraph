# RAG-LangGraph: Complete Development Guide

A sophisticated hierarchical agent system built with Node.js, LangGraph, Weaviate vector database, and Google Gemini API. This system features intelligent query routing, RAG (Retrieval-Augmented Generation), and Chart.js visualization capabilities.

## 🏗️ System Architecture

### Core Components

1. **Delegating Agent**: Main orchestrator that analyzes queries and routes to specialized tools
2. **RAG Agent**: Retrieves relevant information from Weaviate vector database
3. **Chart Tool**: Generates Chart.js configurations for data visualization
4. **Weaviate Database**: Multi-tenant vector database with semantic search
5. **Google Gemini API**: Advanced LLM for natural language processing

### Multi-Tenancy Support

- **tenant1**: Default tenant with machine learning documentation
- **tenant2**: Additional tenant with different data sets
- Isolated data storage and retrieval per tenant

## 🚀 Complete Development Setup Guide

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Docker & Docker Compose** - [Installation guide](https://docs.docker.com/get-docker/)
- **Git** - [Download here](https://git-scm.com/)

### Step 1: Project Initialization

```bash
# Clone the repository
git clone <your-repository-url>
cd RAG-LangGraph

# Install dependencies
npm install
```

### Step 2: Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit the .env file with your configuration
nano .env
```

**Required Environment Variables:**

```env
# Weaviate Configuration
WEAVIATE_URL=http://localhost:8080
WEAVIATE_API_KEY=

# Google Gemini API Configuration (Optional but recommended)
GOOGLE_API_KEY=your_google_api_key_here

# Application Configuration
PORT=3000
NODE_ENV=development
```

### Step 3: Google Gemini API Setup (Optional)

1. **Get Free API Key**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Sign in** with your Google account
3. **Click "Create API Key"**
4. **Copy the key** and add it to your `.env` file

### Step 4: Database Setup

```bash
# Start Weaviate database using Docker
npm run docker:up

# Initialize database schema and sample data
npm run setup
```

### Step 5: Start the Application

```bash
# Start the application
npm start

# Or for development with auto-restart
npm run dev
```

### Step 6: Verify Installation

```bash
# Run comprehensive tests
npm run test

# Check health endpoint
curl http://localhost:3000/health
```

## 📁 Project Structure

```
RAG-LangGraph/
├── src/
│   ├── agents/
│   │   ├── delegating-agent.js    # Main query orchestrator
│   │   └── rag-agent.js           # RAG implementation
│   ├── database/
│   │   └── weaviate-setup.js      # Database configuration
│   ├── llm/
│   │   └── llm-config.js          # Google Gemini integration
│   └── tools/
│       └── chart-tool.js          # Chart generation
├── tests/
│   ├── comprehensive-tests.js      # Full system tests
│   └── integration-tests.js        # Integration tests
├── examples/
│   └── usage-examples.js          # Usage examples
├── docker-compose.yml              # Weaviate configuration
├── setup.js                        # Database initialization
├── test-client.js                  # Test client
├── index.js                        # Main application
├── package.json                    # Dependencies
├── .env                           # Environment variables
├── .gitignore                     # Git ignore rules
└── README.md                      # This file
```

## 🔧 API Endpoints

### Health Check
```http
GET /health
```

### Main Query Endpoint
```http
POST /api/query
Content-Type: application/json

{
  "query": "What is machine learning?",
  "tenant": "tenant1"
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

## 🧪 Testing

### Run All Tests
```bash
npm run test:all
```

### Run Specific Test Suites
```bash
# Basic functionality tests
npm run test

# Comprehensive system tests
npm run test:comprehensive

# Integration tests
npm run test:integration
```

### Manual Testing
```bash
# Test a specific query
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is machine learning?", "tenant": "tenant1"}'
```

## 🔄 Development Workflow

### 1. Adding New Tools

1. **Create Tool Class**:
```javascript
// src/tools/your-tool.js
const { Tool } = require('@langchain/core/tools');

class YourTool extends Tool {
    name = 'your-tool';
    description = 'Description of your tool';

    async _call(input) {
        // Your tool implementation
        return 'Tool result';
    }
}

module.exports = YourTool;
```

2. **Register in Delegating Agent**:
```javascript
// src/agents/delegating-agent.js
const YourTool = require('../tools/your-tool');

class DelegatingAgent {
    constructor() {
        this.yourTool = new YourTool();
    }
}
```

### 2. Adding New Agents

1. **Create Agent Class**:
```javascript
// src/agents/your-agent.js
class YourAgent {
    async processQuery(query, tenant) {
        // Your agent implementation
        return {
            answer: 'Agent response',
            fileIds: [],
            references: []
        };
    }
}

module.exports = YourAgent;
```

2. **Integrate with Delegating Agent**:
```javascript
// src/agents/delegating-agent.js
const YourAgent = require('./your-agent');

class DelegatingAgent {
    constructor() {
        this.yourAgent = new YourAgent();
    }
}
```

### 3. Database Schema Modifications

1. **Update Schema**:
```javascript
// src/database/weaviate-setup.js
const schema = {
    class: 'YourClass',
    properties: [
        {
            name: 'yourProperty',
            dataType: ['text'],
            indexInverted: true
        }
    ]
};
```

2. **Add Sample Data**:
```javascript
const sampleData = [
    {
        property1: 'value1',
        property2: 'value2'
    }
];
```

## 🐳 Docker Commands

```bash
# Start Weaviate
npm run docker:up

# Stop Weaviate
npm run docker:down

# View logs
docker-compose logs weaviate

# Restart Weaviate
docker-compose restart weaviate
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Weaviate Connection Failed
```bash
# Check if Docker is running
docker ps

# Check Weaviate status
curl http://localhost:8080/v1/meta

# Restart Weaviate
npm run docker:down && npm run docker:up
```

#### 2. Google Gemini API Errors
```bash
# Verify API key
echo $GOOGLE_API_KEY

# Test API key validity
curl -H "Authorization: Bearer $GOOGLE_API_KEY" \
  https://generativelanguage.googleapis.com/v1beta/models
```

#### 3. Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3001
```

#### 4. Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm start

# Run with verbose output
npm start -- --verbose
```

## 📊 Performance Optimization

### 1. Database Optimization
- Use appropriate vectorizer for your use case
- Implement proper indexing strategies
- Monitor query performance

### 2. Caching Strategy
```javascript
// Implement Redis caching
const redis = require('redis');
const client = redis.createClient();

// Cache frequently accessed data
await client.set('key', 'value', 'EX', 3600);
```

### 3. Load Balancing
```javascript
// Use PM2 for process management
npm install -g pm2
pm2 start index.js --name "rag-langgraph" --instances 4
```

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env` files
- Use strong, unique API keys
- Rotate keys regularly

### 2. API Security
```javascript
// Implement rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

### 3. Input Validation
```javascript
// Validate all inputs
const { body, validationResult } = require('express-validator');

app.post('/api/query', [
    body('query').isString().isLength({ min: 1, max: 1000 }),
    body('tenant').isString().isIn(['tenant1', 'tenant2'])
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // Process query
});
```

## 📈 Monitoring and Logging

### 1. Application Logging
```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});
```

### 2. Health Monitoring
```javascript
// Implement health checks
app.get('/health', async (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            weaviate: await checkWeaviateHealth(),
            delegatingAgent: 'ready'
        }
    };
    res.json(health);
});
```

### 3. Performance Metrics
```javascript
// Track response times
const responseTime = require('response-time');
app.use(responseTime((req, res, time) => {
    console.log(`${req.method} ${req.url} - ${time}ms`);
}));
```

## 🚀 Deployment Guide

### 1. Production Environment Setup

```bash
# Set production environment
NODE_ENV=production

# Install production dependencies
npm ci --only=production

# Build the application (if needed)
npm run build
```

### 2. Environment Configuration

```bash
# Production .env
NODE_ENV=production
PORT=3000
WEAVIATE_URL=https://your-weaviate-instance.com
WEAVIATE_API_KEY=your-production-api-key
GOOGLE_API_KEY=your-production-google-api-key
```

### 3. Process Management

```bash
# Install PM2
npm install -g pm2

# Start application with PM2
pm2 start index.js --name "rag-langgraph"

# Monitor application
pm2 monit

# View logs
pm2 logs rag-langgraph
```

### 4. Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - weaviate
  
  weaviate:
    image: semitechnologies/weaviate:1.22.4
    ports:
      - "8080:8080"
    environment:
      - AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true
      - PERSISTENCE_DATA_PATH=/var/lib/weaviate
```

## 📚 API Documentation

### Query Processing

The system processes queries through a sophisticated pipeline:

1. **Query Analysis**: Delegating agent analyzes the query to determine required tools
2. **Tool Selection**: Routes to appropriate tools (RAG, Chart, Direct)
3. **Parallel Execution**: Multiple tools can run simultaneously
4. **Response Synthesis**: Combines results into coherent response

### Response Format

```json
{
  "success": true,
  "query": "What is machine learning?",
  "response": {
    "answer": "Detailed answer from Google Gemini API...",
    "references": [
      {
        "fileId": "doc001",
        "question": "What is machine learning?",
        "answer": "Machine learning is...",
        "tenant": "tenant1"
      }
    ],
    "fileIds": ["doc001", "doc002"],
    "chartConfig": null,
    "toolsUsed": ["RAG"]
  }
}
```

## 🔧 Configuration Options

### Weaviate Configuration

```javascript
// src/database/weaviate-setup.js
const weaviateConfig = {
    scheme: 'http',
    host: 'localhost:8080',
    // For cloud Weaviate:
    // scheme: 'https',
    // host: 'your-instance.weaviate.network',
    // authClientSecret: new ApiKey('your-api-key')
};
```

### LLM Configuration

```javascript
// src/llm/llm-config.js
const modelConfigs = [
    { modelName: 'gemini-1.5-flash', maxOutputTokens: 2048, temperature: 0.7 },
    { modelName: 'gemini-1.5-pro', maxOutputTokens: 2048, temperature: 0.7 },
    { modelName: 'gemini-pro', maxOutputTokens: 2048, temperature: 0.7 }
];
```

## 🎯 Best Practices

### 1. Code Organization
- Keep agents modular and focused on single responsibilities
- Use dependency injection for better testability
- Implement proper error handling and logging

### 2. Database Design
- Design schemas with proper indexing
- Use multi-tenancy for data isolation
- Implement proper backup strategies

### 3. API Design
- Use consistent response formats
- Implement proper HTTP status codes
- Add comprehensive input validation

### 4. Testing Strategy
- Unit tests for individual components
- Integration tests for API endpoints
- End-to-end tests for complete workflows

## 🤝 Contributing

### Development Setup

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make your changes** following the coding standards
4. **Add tests** for new functionality
5. **Run the test suite**: `npm run test:all`
6. **Commit your changes**: `git commit -m 'Add your feature'`
7. **Push to the branch**: `git push origin feature/your-feature`
8. **Submit a pull request**

### Coding Standards

- Use consistent indentation (2 spaces)
- Follow JavaScript ES6+ conventions
- Add JSDoc comments for functions
- Use meaningful variable and function names

### Testing Requirements

- Maintain >80% code coverage
- Add tests for all new features
- Update existing tests when modifying functionality

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [LangChain](https://langchain.com/) for LLM orchestration
- [Weaviate](https://weaviate.io/) for vector database capabilities
- [Google Gemini](https://ai.google.dev/) for advanced LLM capabilities
- [Chart.js](https://www.chartjs.org/) for visualization support

## 📞 Support

For support and questions:

- **Issues**: Create an issue on GitHub
- **Documentation**: Check this README and inline code comments
- **Community**: Join our discussion forum

---

**Happy Coding! 🚀**