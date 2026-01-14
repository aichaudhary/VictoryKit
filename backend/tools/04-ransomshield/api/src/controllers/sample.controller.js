/**
 * RansomShield - Sample Controller
 * Handles malware sample operations
 */

const crypto = require('crypto');
const Sample = require('../models/Sample.model');
const Analysis = require('../models/Analysis.model');
const { logger } = require('../../../../../shared');

// Generate file hashes
const generateHashes = (buffer) => {
  return {
    md5: crypto.createHash('md5').update(buffer).digest('hex'),
    sha1: crypto.createHash('sha1').update(buffer).digest('hex'),
    sha256: crypto.createHash('sha256').update(buffer).digest('hex'),
  };
};

// Upload a new sample
exports.uploadSample = async (req, res, next) => {
  try {
    const { fileName, fileSize, fileType, mimeType, fileData } = req.body;
    const userId = req.user.id;

    // Decode base64 file data
    const buffer = Buffer.from(fileData, 'base64');

    // Generate hashes
    const hashes = generateHashes(buffer);

    // Check if sample already exists
    const existingSample = await Sample.findByHash(hashes.sha256);
    if (existingSample) {
      return res.status(200).json({
        success: true,
        message: 'Sample already exists',
        data: {
          sample: existingSample,
          isExisting: true,
        },
      });
    }

    // Create new sample
    const sample = new Sample({
      fileName,
      fileSize,
      fileType,
      mimeType,
      hashes,
      uploadedBy: userId,
      organizationId: req.user.organizationId,
      analysisStatus: 'pending',
      verdict: 'PENDING',
    });

    await sample.save();

    // Auto-create analysis job
    const analysis = new Analysis({
      sampleId: sample._id,
      analysisType: 'comprehensive',
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
      config: {
        depth: 'standard',
        enableHeuristics: true,
        enableBehavioral: true,
        enableYara: true,
      },
    });

    await analysis.save();

    logger.info(`New sample uploaded: ${sample._id} by user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Sample uploaded successfully',
      data: {
        sample,
        analysis,
        isExisting: false,
      },
    });
  } catch (error) {
    logger.error('Error uploading sample:', error);
    next(error);
  }
};

// Get all samples with pagination
exports.getAllSamples = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      malwareType,
      severity,
      isMalicious,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const userId = req.user.id;
    const query = { uploadedBy: userId };

    // Apply filters
    if (malwareType) query.malwareType = malwareType;
    if (severity) query.threatLevel = severity;
    if (isMalicious !== undefined) {
      query.verdict = isMalicious === 'true' ? 'MALICIOUS' : { $ne: 'MALICIOUS' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [samples, total] = await Promise.all([
      Sample.find(query).sort(sort).skip(skip).limit(parseInt(limit)).lean(),
      Sample.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        samples,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching samples:', error);
    next(error);
  }
};

// Get sample by ID
exports.getSampleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const sample = await Sample.findOne({ _id: id, uploadedBy: userId });

    if (!sample) {
      return res.status(404).json({
        success: false,
        error: 'Sample not found',
      });
    }

    // Get related analyses
    const analyses = await Analysis.find({ sampleId: id }).sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      data: {
        sample,
        analyses,
      },
    });
  } catch (error) {
    logger.error('Error fetching sample:', error);
    next(error);
  }
};

// Delete sample
exports.deleteSample = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const sample = await Sample.findOneAndDelete({ _id: id, uploadedBy: userId });

    if (!sample) {
      return res.status(404).json({
        success: false,
        error: 'Sample not found',
      });
    }

    // Delete related analyses
    await Analysis.deleteMany({ sampleId: id });

    logger.info(`Sample deleted: ${id} by user ${userId}`);

    res.json({
      success: true,
      message: 'Sample deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting sample:', error);
    next(error);
  }
};

// Get statistics
exports.getStatistics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const query = { uploadedBy: userId };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [totalSamples, verdictStats, threatLevelStats, malwareTypeStats, recentThreats] =
      await Promise.all([
        Sample.countDocuments(query),
        Sample.aggregate([{ $match: query }, { $group: { _id: '$verdict', count: { $sum: 1 } } }]),
        Sample.aggregate([
          { $match: query },
          { $group: { _id: '$threatLevel', count: { $sum: 1 } } },
        ]),
        Sample.aggregate([
          { $match: { ...query, verdict: 'MALICIOUS' } },
          { $group: { _id: '$malwareType', count: { $sum: 1 } } },
        ]),
        Sample.find({ ...query, verdict: 'MALICIOUS' })
          .sort({ createdAt: -1 })
          .limit(10)
          .select('fileName malwareType malwareFamily riskScore createdAt'),
      ]);

    // Format stats
    const formatStats = (arr) =>
      arr.reduce((acc, { _id, count }) => {
        if (_id) acc[_id] = count;
        return acc;
      }, {});

    res.json({
      success: true,
      data: {
        totalSamples,
        verdicts: formatStats(verdictStats),
        threatLevels: formatStats(threatLevelStats),
        malwareTypes: formatStats(malwareTypeStats),
        recentThreats,
      },
    });
  } catch (error) {
    logger.error('Error fetching statistics:', error);
    next(error);
  }
};

// Scan by hash (lookup)
exports.scanHash = async (req, res, next) => {
  try {
    const { hash } = req.body;

    const sample = await Sample.findByHash(hash);

    if (!sample) {
      return res.json({
        success: true,
        data: {
          found: false,
          message: 'Hash not found in database',
        },
      });
    }

    res.json({
      success: true,
      data: {
        found: true,
        sample: sample.generateReport(),
      },
    });
  } catch (error) {
    logger.error('Error scanning hash:', error);
    next(error);
  }
};

// Quarantine sample
exports.quarantineSample = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const sample = await Sample.findOneAndUpdate(
      { _id: id, uploadedBy: userId },
      {
        quarantined: true,
        quarantinedAt: new Date(),
      },
      { new: true }
    );

    if (!sample) {
      return res.status(404).json({
        success: false,
        error: 'Sample not found',
      });
    }

    logger.info(`Sample quarantined: ${id} by user ${userId}`);

    res.json({
      success: true,
      message: 'Sample quarantined successfully',
      data: { sample },
    });
  } catch (error) {
    logger.error('Error quarantining sample:', error);
    next(error);
  }
};

module.exports = exports;
