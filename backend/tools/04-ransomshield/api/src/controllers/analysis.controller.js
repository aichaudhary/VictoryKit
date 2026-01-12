/**
 * RansomShield - Analysis Controller
 * Handles malware analysis operations
 */

const Analysis = require('../models/Analysis.model');
const Sample = require('../models/Sample.model');
const { logger } = require('../../../../../shared');

// Malware detection simulation data
const MALWARE_NAMES = [
  'Emotet',
  'TrickBot',
  'Ryuk',
  'Maze',
  'REvil',
  'WannaCry',
  'Petya',
  'Locky',
  'CryptoLocker',
  'Cerber',
  'GandCrab',
  'Dridex',
  'Zeus',
  'Mirai',
  'NotPetya',
  'SamSam',
];

const MALWARE_TYPES = ['ransomware', 'trojan', 'worm', 'backdoor', 'rootkit', 'spyware'];

const AI_ANALYSIS_TEMPLATES = {
  MALICIOUS: [
    'This sample exhibits highly malicious behavior consistent with {family} ransomware. Detected {count} critical indicators including file encryption routines, shadow copy deletion, and network beacon activity. Immediate quarantine and incident response recommended.',
    'Analysis reveals sophisticated evasion techniques and payload delivery mechanisms. The sample attempts to disable security software and establishes persistence through multiple vectors. Classification: {type} with {confidence}% confidence.',
    'Neural analysis identifies this as a variant of {family}. Key indicators include encrypted C2 communications, credential harvesting capabilities, and lateral movement tools. Risk assessment: CRITICAL. Isolate affected systems immediately.',
  ],
  SUSPICIOUS: [
    'Sample exhibits potentially unwanted behaviors requiring further investigation. Detected suspicious API calls, obfuscated code sections, and network activity to unknown endpoints. Manual review recommended before allowing execution.',
    'Heuristic analysis flagged multiple concerning indicators. While not definitively malicious, the sample shows characteristics common to {type} variants. Extended sandbox analysis may reveal additional behaviors.',
    'Behavioral patterns suggest this may be a dropper or loader component. The sample attempts to download additional payloads and modify system configurations. Treat with caution pending full analysis.',
  ],
  CLEAN: [
    'Comprehensive analysis complete. No malicious indicators detected. Sample passed all static, dynamic, and ML-based detection modules with high confidence. File is safe for execution.',
    'All scan engines report clean status. Signature matching, heuristic analysis, and behavioral monitoring found no threats. Normal application behavior confirmed.',
    'Neural network classification: BENIGN with {confidence}% confidence. No suspicious strings, API calls, or network activity detected. File integrity verified.',
  ],
};

// Simulate analysis processing
const simulateAnalysis = async (analysis, sample) => {
  const steps = [
    { name: 'Initializing Engine', duration: 500 },
    { name: 'Signature Scan', duration: 1000 },
    { name: 'Heuristic Analysis', duration: 1500 },
    { name: 'Behavioral Detection', duration: 1200 },
    { name: 'YARA Rules', duration: 800 },
    { name: 'PE Analysis', duration: 1000 },
    { name: 'Memory Patterns', duration: 900 },
    { name: 'Network Indicators', duration: 700 },
    { name: 'Final Assessment', duration: 600 },
  ];

  const events = [];
  let threatsFound = 0;
  const detections = [];

  // Determine verdict (simulated)
  const random = Math.random();
  const verdict = random > 0.7 ? 'MALICIOUS' : random > 0.4 ? 'SUSPICIOUS' : 'CLEAN';
  const riskScore =
    verdict === 'MALICIOUS'
      ? 70 + Math.floor(Math.random() * 30)
      : verdict === 'SUSPICIOUS'
        ? 30 + Math.floor(Math.random() * 40)
        : Math.floor(Math.random() * 20);

  // Process each step
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    // Update step to running
    analysis.steps[i].status = 'running';
    analysis.steps[i].startedAt = new Date();
    analysis.currentStep = step.name;
    analysis.progress = Math.round((i / steps.length) * 100);
    await analysis.save();

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, step.duration));

    // Add event
    events.push({
      timestamp: new Date(),
      type: 'scan',
      severity: 'info',
      message: `${step.name} completed`,
    });

    // Randomly detect threats during analysis
    if (verdict === 'MALICIOUS' && Math.random() > 0.6 && i > 1 && i < 7) {
      const malwareName = MALWARE_NAMES[Math.floor(Math.random() * MALWARE_NAMES.length)];
      const severity = Math.random() > 0.5 ? 'critical' : 'high';

      detections.push({
        name: malwareName,
        type: MALWARE_TYPES[Math.floor(Math.random() * MALWARE_TYPES.length)],
        severity,
        file: sample.fileName,
        action: 'quarantine',
      });

      threatsFound++;

      events.push({
        timestamp: new Date(),
        type: 'detection',
        severity,
        message: `Detected: ${malwareName}`,
        file: sample.fileName,
      });
    }

    // Mark step complete
    analysis.steps[i].status = 'completed';
    analysis.steps[i].detail = '✓ Complete';
    analysis.steps[i].progress = 100;
    analysis.steps[i].completedAt = new Date();
  }

  // Generate AI analysis
  const templates = AI_ANALYSIS_TEMPLATES[verdict];
  let aiSummary = templates[Math.floor(Math.random() * templates.length)];
  aiSummary = aiSummary
    .replace('{family}', MALWARE_NAMES[Math.floor(Math.random() * MALWARE_NAMES.length)])
    .replace('{type}', MALWARE_TYPES[Math.floor(Math.random() * MALWARE_TYPES.length)])
    .replace('{count}', String(2 + Math.floor(Math.random() * 5)))
    .replace('{confidence}', String(85 + Math.floor(Math.random() * 15)));

  // Update analysis with results
  analysis.status = 'completed';
  analysis.progress = 100;
  analysis.events = events;
  analysis.result = {
    verdict,
    riskScore,
    confidence: 85 + Math.floor(Math.random() * 15),
    malwareType:
      verdict === 'MALICIOUS'
        ? MALWARE_TYPES[Math.floor(Math.random() * MALWARE_TYPES.length)]
        : 'clean',
    malwareFamily:
      verdict === 'MALICIOUS'
        ? MALWARE_NAMES[Math.floor(Math.random() * MALWARE_NAMES.length)]
        : null,
    threatLevel:
      riskScore >= 80
        ? 'CRITICAL'
        : riskScore >= 60
          ? 'HIGH'
          : riskScore >= 40
            ? 'MEDIUM'
            : riskScore >= 20
              ? 'LOW'
              : 'NONE',
    detections,
    summary: {
      malware: detections.filter((d) => d.severity === 'critical').length,
      pup: detections.filter((d) => d.type === 'pup').length,
      suspicious: verdict === 'SUSPICIOUS' ? 1 : 0,
      clean: verdict === 'CLEAN' ? 1 : 0,
    },
    recommendations:
      verdict === 'MALICIOUS'
        ? [
            'Quarantine detected threats immediately',
            'Run full system scan on affected endpoints',
            'Check for lateral movement indicators',
            'Update security definitions',
            'Review network logs for C2 activity',
          ]
        : verdict === 'SUSPICIOUS'
          ? [
              'Perform extended sandbox analysis',
              'Monitor for behavioral changes',
              'Review with security team',
            ]
          : ['No action required', 'Continue normal operations'],
  };
  analysis.aiAnalysis = {
    summary: aiSummary,
    technicalDetails: `File hash: ${sample.hashes.sha256}\nFile size: ${sample.fileSize} bytes`,
    remediationSteps: analysis.result.recommendations,
  };
  analysis.metrics = {
    startedAt: analysis.steps[0].startedAt,
    completedAt: new Date(),
    filesScanned: 1,
    threatsFound,
    bytesProcessed: sample.fileSize,
  };

  await analysis.save();

  // Update sample with analysis results
  sample.verdict = verdict;
  sample.riskScore = riskScore;
  sample.threatLevel = analysis.result.threatLevel;
  sample.confidence = analysis.result.confidence;
  sample.malwareType = analysis.result.malwareType;
  sample.malwareFamily = analysis.result.malwareFamily;
  sample.analysisStatus = 'completed';
  sample.analyzedAt = new Date();
  sample.aiSummary = aiSummary;
  await sample.save();

  return analysis;
};

// Create new analysis
exports.createAnalysis = async (req, res, next) => {
  try {
    const { sampleId, analysisType, config } = req.body;
    const userId = req.user.id;

    // Check if sample exists
    const sample = await Sample.findOne({ _id: sampleId, uploadedBy: userId });
    if (!sample) {
      return res.status(404).json({
        success: false,
        error: 'Sample not found',
      });
    }

    // Create analysis
    const analysis = new Analysis({
      sampleId,
      analysisType: analysisType || 'comprehensive',
      status: 'queued',
      createdBy: userId,
      organizationId: req.user.organizationId,
      steps: [
        { name: 'Initializing Engine', status: 'pending' },
        { name: 'Signature Scan', status: 'pending' },
        { name: 'Heuristic Analysis', status: 'pending' },
        { name: 'Behavioral Detection', status: 'pending' },
        { name: 'YARA Rules', status: 'pending' },
        { name: 'PE Analysis', status: 'pending' },
        { name: 'Memory Patterns', status: 'pending' },
        { name: 'Network Indicators', status: 'pending' },
        { name: 'Final Assessment', status: 'pending' },
      ],
      config: config || {
        depth: 'standard',
        enableHeuristics: true,
        enableBehavioral: true,
        enableYara: true,
      },
    });

    await analysis.save();

    // Start analysis in background
    analysis.status = 'running';
    await analysis.save();

    // Run simulation (in production, this would be a job queue)
    simulateAnalysis(analysis, sample).catch((err) => {
      logger.error('Analysis simulation error:', err);
    });

    logger.info(`Analysis created: ${analysis._id} for sample ${sampleId}`);

    res.status(201).json({
      success: true,
      message: 'Analysis started',
      data: { analysis },
    });
  } catch (error) {
    logger.error('Error creating analysis:', error);
    next(error);
  }
};

// Get analysis by ID
exports.getAnalysisById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const analysis = await Analysis.findOne({ _id: id, createdBy: userId }).populate(
      'sampleId',
      'fileName fileSize hashes verdict'
    );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found',
      });
    }

    res.json({
      success: true,
      data: { analysis },
    });
  } catch (error) {
    logger.error('Error fetching analysis:', error);
    next(error);
  }
};

// Get all analyses
exports.getAllAnalyses = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, analysisType } = req.query;
    const userId = req.user.id;

    const query = { createdBy: userId };
    if (status) query.status = status;
    if (analysisType) query.analysisType = analysisType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [analyses, total] = await Promise.all([
      Analysis.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('sampleId', 'fileName verdict')
        .lean(),
      Analysis.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        analyses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching analyses:', error);
    next(error);
  }
};

// Delete analysis
exports.deleteAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const analysis = await Analysis.findOneAndDelete({ _id: id, createdBy: userId });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found',
      });
    }

    logger.info(`Analysis deleted: ${id} by user ${userId}`);

    res.json({
      success: true,
      message: 'Analysis deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting analysis:', error);
    next(error);
  }
};

// Get analysis status (for polling)
exports.getAnalysisStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const analysis = await Analysis.findOne({ _id: id, createdBy: userId }).select(
      'status progress currentStep steps events result'
    );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found',
      });
    }

    res.json({
      success: true,
      data: { analysis },
    });
  } catch (error) {
    logger.error('Error fetching analysis status:', error);
    next(error);
  }
};

module.exports = exports;
