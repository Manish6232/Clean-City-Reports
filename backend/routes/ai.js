const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Report = require('../models/Report');

// AI Analysis using Anthropic API
router.post('/analyze', auth, async (req, res) => {
  try {
    const { description, category, severity, imageUrls } = req.body;

    const prompt = `You are an AI assistant for a Smart City Waste Management system called "Clean City Reporter".

Analyze this garbage/waste report and provide actionable recommendations:

Category: ${category}
Severity: ${severity}
Description: ${description}
${imageUrls && imageUrls.length > 0 ? `Images: ${imageUrls.length} photo(s) uploaded` : ''}

Please provide a JSON response with this exact structure:
{
  "detectedIssues": ["issue1", "issue2", "issue3"],
  "recommendedActions": ["action1", "action2", "action3"],
  "priorityScore": 8,
  "estimatedResolutionTime": "2-3 days",
  "environmentalImpact": "Brief description of environmental impact",
  "preventionTips": ["tip1", "tip2"],
  "nearbyResources": ["resource1", "resource2"]
}

Be specific, practical and concise. Priority score should be 1-10.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content[0].text;

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      detectedIssues: ['Waste accumulation detected'],
      recommendedActions: ['Schedule immediate pickup', 'Notify municipal authority'],
      priorityScore: 5,
      estimatedResolutionTime: '2-3 days',
      environmentalImpact: 'Moderate impact on local environment',
      preventionTips: ['Use designated bins', 'Report issues early'],
      nearbyResources: ['Local waste management center']
    };

    res.json({ analysis });
  } catch (err) {
    console.error('AI Analysis error:', err);
    // Fallback response
    res.json({
      analysis: {
        detectedIssues: ['Waste management issue reported'],
        recommendedActions: ['Contact municipal waste department', 'Place warning signs if hazardous'],
        priorityScore: 5,
        estimatedResolutionTime: '3-5 days',
        environmentalImpact: 'Local environmental impact detected',
        preventionTips: ['Use designated garbage bins', 'Participate in community clean drives'],
        nearbyResources: ['Municipal waste helpline: 1800-XXX-XXXX']
      }
    });
  }
});

// Save AI analysis to report
router.post('/analyze/:reportId', auth, async (req, res) => {
  try {
    const { analysis } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.reportId,
      { aiAnalysis: analysis },
      { new: true }
    );
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// AI Chat for city cleanliness tips
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, history } = req.body;

    const messages = [
      ...(history || []),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 512,
        system: 'You are EcoBot, a friendly AI assistant for Clean City Reporter app. Help users with waste management tips, how to report issues, recycling guidance, and environmental best practices. Keep responses concise and practical.',
        messages
      })
    });

    const data = await response.json();
    const reply = data.content[0].text;

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: 'AI chat unavailable', reply: 'I\'m having trouble connecting right now. Please try again!' });
  }
});

module.exports = router;
