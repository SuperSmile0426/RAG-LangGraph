const { Tool } = require('@langchain/core/tools');

class ChartTool extends Tool {
    constructor() {
        super({
            name: 'chart_tool',
            description: 'Generates Chart.js configurations for data visualization',
            schema: {
                type: 'object',
                properties: {
                    chartType: {
                        type: 'string',
                        description: 'Type of chart to generate (bar, line, pie, doughnut)',
                        enum: ['bar', 'line', 'pie', 'doughnut']
                    },
                    data: {
                        type: 'object',
                        description: 'Data to visualize'
                    },
                    title: {
                        type: 'string',
                        description: 'Chart title'
                    }
                },
                required: ['chartType', 'data']
            }
        });
    }

    async _call(input) {
        try {
            const { chartType, data, title = 'Chart' } = typeof input === 'string' ? JSON.parse(input) : input;
            
            // Generate mock Chart.js configuration
            const chartConfig = this.generateChartConfig(chartType, data, title);
            
            return {
                success: true,
                chartConfig: chartConfig,
                message: `Generated ${chartType} chart configuration successfully`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to generate chart configuration'
            };
        }
    }

    async invoke(input) {
        return await this._call(input);
    }

    generateChartConfig(chartType, data, title) {
        const baseConfig = {
            type: chartType,
            data: {
                labels: data.labels || ['Label 1', 'Label 2', 'Label 3'],
                datasets: [{
                    label: data.label || 'Dataset',
                    data: data.values || [10, 20, 30],
                    backgroundColor: this.getColors(chartType),
                    borderColor: chartType === 'line' ? '#36A2EB' : undefined,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: title
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: chartType !== 'pie' && chartType !== 'doughnut' ? {
                    y: {
                        beginAtZero: true
                    }
                } : undefined
            }
        };

        return baseConfig;
    }

    getColors(chartType) {
        const colors = {
            bar: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            line: ['#36A2EB'],
            pie: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            doughnut: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        };

        return colors[chartType] || colors.bar;
    }

    // Mock method to generate sample data
    generateSampleData(chartType) {
        const sampleData = {
            bar: {
                labels: ['January', 'February', 'March', 'April', 'May'],
                values: [65, 59, 80, 81, 56],
                label: 'Sales Data'
            },
            line: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                values: [12, 19, 3, 5, 2],
                label: 'Trend Data'
            },
            pie: {
                labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
                values: [12, 19, 3, 5, 2],
                label: 'Distribution'
            },
            doughnut: {
                labels: ['Red', 'Blue', 'Yellow', 'Green'],
                values: [12, 19, 3, 5],
                label: 'Categories'
            }
        };

        return sampleData[chartType] || sampleData.bar;
    }
}

module.exports = ChartTool; 