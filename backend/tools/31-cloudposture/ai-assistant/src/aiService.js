const { GoogleGenerativeAI } = require('@google/generative-ai');

function initializeAI() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'demo-key');
  
  const systemPrompt = `You are an expert AI assistant specializing in audit management, compliance frameworks, forensic analysis, and security event correlation.

Your expertise includes:
- Audit log analysis and forensic investigation
- Compliance frameworks: SOX, HIPAA, PCI-DSS, ISO-27001, GDPR, NIST, FISMA
- Anomaly detection and behavioral analysis
- Evidence collection and chain of custody
- Risk assessment and security posture evaluation
- Incident response and root cause analysis

You help users:
- Analyze audit trails and identify suspicious patterns
- Collect and organize compliance evidence
- Investigate security incidents with forensic rigor
- Detect anomalies using ML-powered analysis
- Generate comprehensive audit reports
- Verify audit log integrity and tamper detection
- Create and manage audit collection policies
- Calculate risk scores for users, systems, and activities

Always provide precise, actionable recommendations with security best practices.`;
  
  return {
    async streamResponse(query, context, onChunk) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        
        const fullPrompt = `${systemPrompt}\n\nContext: ${JSON.stringify(context, null, 2)}\n\nUser Query: ${query}`;
        
        const result = await model.generateContentStream(fullPrompt);
        
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            onChunk(text);
          }
        }
      } catch (error) {
        console.error('AI streaming error:', error);
        onChunk('I apologize, but I encountered an error processing your request. Please try again.');
      }
    }
  };
}

module.exports = { initializeAI };
