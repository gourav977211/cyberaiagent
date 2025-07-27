class CyberGuardAI {
    constructor() {
        this.state = {
            conversationHistory: [],
            securityContext: {
                threatLevel: 'low',
                lastAssessment: null,
                activeIncidents: []
            },
            userProfile: {
                experienceLevel: 'intermediate',
                organizationType: 'unknown'
            },
            metrics: {
                threatsDetected: 0,
                incidentsResolved: 0,
                securityScore: 85
            }
        };
        
        this.components = {
            inputProcessor: new InputProcessor(),
            stateTracker: new StateTracker(),
            taskPlanner: new TaskPlanner(),
            outputGenerator: new OutputGenerator()
        };
        
        this.knowledgeBase = new CybersecurityKnowledgeBase();
        this.initializeEventListeners();
        this.updateTimestamp();
    }

    initializeEventListeners() {
        const sendButton = document.getElementById('sendButton');
        const userInput = document.getElementById('userInput');
        const quickActions = document.querySelectorAll('.quick-action');

        sendButton.addEventListener('click', () => this.handleUserInput());
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserInput();
            }
        });

        quickActions.forEach(button => {
            button.addEventListener('click', () => {
                const message = button.getAttribute('data-message');
                userInput.value = message;
                this.handleUserInput();
            });
        });
    }

    async handleUserInput() {
        const userInput = document.getElementById('userInput');
        const message = userInput.value.trim();
        
        if (!message) return;

        userInput.value = '';
        this.addMessage(message, 'user');
        this.showProcessing();

        try {
            // Simulate AI processing delay
            await this.delay(1500);
            
            // Process through AI components
            const processedInput = await this.components.inputProcessor.process(message);
            const updatedState = await this.components.stateTracker.update(this.state, processedInput);
            const plan = await this.components.taskPlanner.plan(updatedState, processedInput);
            const response = await this.components.outputGenerator.generate(plan, updatedState);

            this.state = updatedState;
            this.hideProcessing();
            this.addMessage(response, 'bot');
            this.updateMetrics();
            this.logActivity(processedInput.category);
            
        } catch (error) {
            this.hideProcessing();
            this.addMessage('I apologize, but I encountered an error processing your request. Please try again.', 'bot', 'error');
        }
    }

    addMessage(content, sender, type = 'normal') {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const timestamp = new Date().toLocaleTimeString();
        const icon = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
        const name = sender === 'user' ? 'You' : 'CyberGuard AI';
        
        let messageClass = '';
        if (type === 'error') messageClass = 'error-message';
        if (type === 'success') messageClass = 'success-message';
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <i class="${icon}"></i>
                <span>${name}</span>
                <span class="timestamp">${timestamp}</span>
            </div>
            <div class="message-content ${messageClass}">
                ${typeof content === 'string' ? `<p>${content}</p>` : content}
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    showProcessing() {
        const chatMessages = document.getElementById('chatMessages');
        const processingDiv = document.createElement('div');
        processingDiv.id = 'processing';
        processingDiv.className = 'processing';
        processingDiv.innerHTML = `
            <i class="fas fa-cog"></i>
            <span>CyberGuard AI is analyzing your request...</span>
        `;
        chatMessages.appendChild(processingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideProcessing() {
        const processing = document.getElementById('processing');
        if (processing) processing.remove();
    }

    updateMetrics() {
        document.getElementById('threatsDetected').textContent = this.state.metrics.threatsDetected;
        document.getElementById('incidentsResolved').textContent = this.state.metrics.incidentsResolved;
        document.getElementById('securityScore').textContent = this.state.metrics.securityScore + '%';
    }

    logActivity(category) {
        const activityLog = document.getElementById('activityLog');
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        const icons = {
            'threat-analysis': 'fas fa-search',
            'incident-response': 'fas fa-exclamation-triangle',
            'security-assessment': 'fas fa-shield-alt',
            'policy-guidance': 'fas fa-file-shield',
            'general': 'fas fa-comment'
        };
        
        const icon = icons[category] || icons['general'];
        const timestamp = new Date().toLocaleTimeString();
        
        activityItem.innerHTML = `
            <i class="${icon}"></i>
            <span>Processed ${category.replace('-', ' ')} query - ${timestamp}</span>
        `;
        
        activityLog.insertBefore(activityItem, activityLog.firstChild);
        
        // Keep only last 5 activities
        while (activityLog.children.length > 5) {
            activityLog.removeChild(activityLog.lastChild);
        }
    }

    updateTimestamp() {
        const timestamp = document.getElementById('initialTimestamp');
        if (timestamp) {
            timestamp.textContent = new Date().toLocaleTimeString();
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

class InputProcessor {
    async process(input) {
        // Simulate natural language processing
        const lowerInput = input.toLowerCase();
        
        // Determine intent and category
        let category = 'general';
        let intent = 'information';
        let entities = [];
        let urgency = 'normal';
        
        // Security incident detection
        if (this.containsKeywords(lowerInput, ['compromised', 'breached', 'hacked', 'malware', 'virus', 'attack', 'incident'])) {
            category = 'incident-response';
            intent = 'emergency';
            urgency = 'high';
        }
        // Threat analysis
        else if (this.containsKeywords(lowerInput, ['threat', 'vulnerability', 'scan', 'analyze', 'risk'])) {
            category = 'threat-analysis';
            intent = 'analysis';
        }
        // Security assessment
        else if (this.containsKeywords(lowerInput, ['assess', 'audit', 'evaluation', 'security posture', 'check'])) {
            category = 'security-assessment';
            intent = 'assessment';
        }
        // Policy and compliance
        else if (this.containsKeywords(lowerInput, ['policy', 'compliance', 'standard', 'framework', 'governance'])) {
            category = 'policy-guidance';
            intent = 'guidance';
        }
        
        // Extract entities
        entities = this.extractEntities(lowerInput);
        
        return {
            originalText: input,
            category,
            intent,
            entities,
            urgency,
            timestamp: new Date()
        };
    }
    
    containsKeywords(text, keywords) {
        return keywords.some(keyword => text.includes(keyword));
    }
    
    extractEntities(text) {
        const entities = [];
        
        // Network entities
        if (text.includes('network') || text.includes('firewall') || text.includes('router')) {
            entities.push({ type: 'network', value: 'network infrastructure' });
        }
        
        // System entities
        if (text.includes('server') || text.includes('computer') || text.includes('system')) {
            entities.push({ type: 'system', value: 'computer system' });
        }
        
        // Data entities
        if (text.includes('data') || text.includes('database') || text.includes('information')) {
            entities.push({ type: 'data', value: 'data assets' });
        }
        
        return entities;
    }
}

class StateTracker {
    async update(currentState, processedInput) {
        const newState = JSON.parse(JSON.stringify(currentState)); // Deep clone
        
        // Update conversation history
        newState.conversationHistory.push({
            input: processedInput,
            timestamp: new Date()
        });
        
        // Update security context based on input
        if (processedInput.urgency === 'high') {
            newState.securityContext.threatLevel = 'high';
            newState.securityContext.activeIncidents.push({
                id: Date.now(),
                type: processedInput.category,
                description: processedInput.originalText,
                timestamp: new Date(),
                status: 'active'
            });
        }
        
        // Update metrics
        if (processedInput.category === 'threat-analysis') {
            newState.metrics.threatsDetected++;
        }
        
        if (processedInput.category === 'incident-response') {
            newState.metrics.incidentsResolved++;
        }
        
        // Adjust security score based on activity
        if (processedInput.urgency === 'high') {
            newState.metrics.securityScore = Math.max(50, newState.metrics.securityScore - 10);
        } else {
            newState.metrics.securityScore = Math.min(100, newState.metrics.securityScore + 2);
        }
        
        return newState;
    }
}

class TaskPlanner {
    async plan(state, processedInput) {
        const plan = {
            primaryTask: this.determinePrimaryTask(processedInput),
            secondaryTasks: [],
            resources: [],
            urgency: processedInput.urgency,
            estimatedSteps: []
        };
        
        switch (processedInput.category) {
            case 'incident-response':
                plan.estimatedSteps = [
                    'Assess the scope of the incident',
                    'Contain the threat',
                    'Investigate root cause',
                    'Implement remediation',
                    'Monitor for reoccurrence'
                ];
                plan.resources = ['Incident Response Team', 'Forensic Tools', 'Backup Systems'];
                break;
                
            case 'threat-analysis':
                plan.estimatedSteps = [
                    'Gather threat intelligence',
                    'Analyze attack vectors',
                    'Assess vulnerability impact',
                    'Recommend mitigation strategies'
                ];
                plan.resources = ['Threat Intelligence Feeds', 'Vulnerability Scanners', 'Risk Assessment Tools'];
                break;
                
            case 'security-assessment':
                plan.estimatedSteps = [
                    'Define assessment scope',
                    'Conduct security scanning',
                    'Analyze findings',
                    'Generate recommendations',
                    'Create improvement roadmap'
                ];
                plan.resources = ['Security Scanners', 'Compliance Frameworks', 'Assessment Tools'];
                break;
                
            case 'policy-guidance':
                plan.estimatedSteps = [
                    'Identify regulatory requirements',
                    'Assess current policies',
                    'Draft policy recommendations',
                    'Plan implementation strategy'
                ];
                plan.resources = ['Compliance Frameworks', 'Policy Templates', 'Legal Guidelines'];
                break;
                
            default:
                plan.estimatedSteps = [
                    'Understand user requirements',
                    'Provide relevant information',
                    'Suggest best practices'
                ];
        }
        
        return plan;
    }
    
    determinePrimaryTask(input) {
        const taskMap = {
            'incident-response': 'Incident Response and Recovery',
            'threat-analysis': 'Threat Analysis and Assessment',
            'security-assessment': 'Security Posture Evaluation',
            'policy-guidance': 'Policy and Compliance Guidance',
            'general': 'General Cybersecurity Consultation'
        };
        
        return taskMap[input.category] || taskMap['general'];
    }
}

class OutputGenerator {
    async generate(plan, state) {
        const knowledge = new CybersecurityKnowledgeBase();
        
        let response = `<div class="ai-response">`;
        response += `<h4><i class="fas fa-tasks"></i> ${plan.primaryTask}</h4>`;
        
        // Add urgency indicator
        if (plan.urgency === 'high') {
            response += `<div class="urgency-high"><i class="fas fa-exclamation-triangle"></i> <strong>High Priority</strong> - Immediate attention required</div>`;
        }
        
        // Add main response based on category
        const categoryResponse = knowledge.getResponse(plan.primaryTask.toLowerCase());
        response += `<p>${categoryResponse}</p>`;
        
        // Add action steps
        if (plan.estimatedSteps.length > 0) {
            response += `<h5><i class="fas fa-list-ol"></i> Recommended Steps:</h5><ol>`;
            plan.estimatedSteps.forEach(step => {
                response += `<li>${step}</li>`;
            });
            response += `</ol>`;
        }
        
        // Add resources
        if (plan.resources.length > 0) {
            response += `<h5><i class="fas fa-tools"></i> Required Resources:</h5><ul>`;
            plan.resources.forEach(resource => {
                response += `<li>${resource}</li>`;
            });
            response += `</ul>`;
        }
        
        // Add security recommendations
        const recommendations = knowledge.getRecommendations(plan.primaryTask.toLowerCase());
        if (recommendations.length > 0) {
            response += `<h5><i class="fas fa-lightbulb"></i> Security Recommendations:</h5><ul>`;
            recommendations.forEach(rec => {
                response += `<li>${rec}</li>`;
            });
            response += `</ul>`;
        }
        
        // Add follow-up questions
        response += `<div class="follow-up">`;
        response += `<p><strong>Need more help?</strong> I can assist with:</p>`;
        response += `<ul>`;
        response += `<li>Detailed implementation guidance</li>`;
        response += `<li>Risk assessment procedures</li>`;
        response += `<li>Compliance requirements</li>`;
        response += `<li>Security tool recommendations</li>`;
        response += `</ul>`;
        response += `</div>`;
        
        response += `</div>`;
        
        return response;
    }
}

class CybersecurityKnowledgeBase {
    constructor() {
        this.responses = {
            'incident response and recovery': `I understand you're dealing with a potential security incident. This requires immediate attention and a systematic approach to minimize damage and restore normal operations.`,
            'threat analysis and assessment': `I'll help you analyze potential threats to your systems. Threat analysis is crucial for proactive security and involves identifying, categorizing, and prioritizing security risks.`,
            'security posture evaluation': `Let me guide you through a comprehensive security assessment. This will help identify vulnerabilities and strengthen your overall security posture.`,
            'policy and compliance guidance': `I can help you develop robust cybersecurity policies and ensure compliance with relevant standards and regulations.`,
            'general cybersecurity consultation': `I'm here to provide expert cybersecurity guidance tailored to your specific needs and organizational context.`
        };
        
        this.recommendations = {
            'incident response and recovery': [
                'Maintain an updated incident response plan',
                'Establish clear communication channels',
                'Regular backup and recovery testing',
                'Document all incident activities',
                'Conduct post-incident reviews'
            ],
            'threat analysis and assessment': [
                'Implement continuous monitoring',
                'Use threat intelligence feeds',
                'Regular vulnerability assessments',
                'Employee security training',
                'Network segmentation'
            ],
            'security posture evaluation': [
                'Regular security audits',
                'Penetration testing',
                'Access control reviews',
                'Security awareness training',
                'Update security policies'
            ],
            'policy and compliance guidance': [
                'Align with industry frameworks',
                'Regular policy reviews',
                'Employee training programs',
                'Compliance monitoring',
                'Risk-based approach'
            ],
            'general cybersecurity consultation': [
                'Implement defense in depth',
                'Regular security updates',
                'Strong authentication',
                'Data encryption',
                'Security monitoring'
            ]
        };
    }
    
    getResponse(category) {
        return this.responses[category] || this.responses['general cybersecurity consultation'];
    }
    
    getRecommendations(category) {
        return this.recommendations[category] || this.recommendations['general cybersecurity consultation'];
    }
}

// Initialize the AI Agent
document.addEventListener('DOMContentLoaded', () => {
    const cyberGuardAI = new CyberGuardAI();
    
    // Add some CSS for the AI response styling
    const style = document.createElement('style');
    style.textContent = `
        .ai-response h4 {
            color: #667eea;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .ai-response h5 {
            color: #4a5568;
            margin: 20px 0 10px 0;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 1rem;
        }
        
        .urgency-high {
            background: #fed7d7;
            color: #c53030;
            padding: 10px;
            border-radius: 8px;
            margin: 10px 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .follow-up {
            background: #e6fffa;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            border-left: 4px solid #38b2ac;
        }
        
        .ai-response ol, .ai-response ul {
            margin: 10px 0;
            padding-left: 25px;
        }
        
        .ai-response li {
            margin-bottom: 8px;
            line-height: 1.5;
        }
    `;
    document.head.appendChild(style);
});