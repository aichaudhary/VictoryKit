/**
 * Classification Controller - Data Classification Management
 */

const { DataClassification } = require('../models');
const dlpService = require('../services/dlpService');

/**
 * Get all classifications
 */
exports.getAllClassifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, level, resourceType } = req.query;
    
    const query = {};
    if (level) query['classification.level'] = level;
    if (resourceType) query.resourceType = resourceType;
    
    const classifications = await DataClassification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await DataClassification.countDocuments(query);
    
    res.json({
      success: true,
      data: classifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get classification by resource ID
 */
exports.getClassificationByResource = async (req, res) => {
  try {
    const classification = await DataClassification.findOne({ 
      resourceId: req.params.resourceId 
    });
    
    if (!classification) {
      return res.status(404).json({ success: false, error: 'Classification not found' });
    }
    
    res.json({ success: true, data: classification });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Classify content automatically
 */
exports.classifyContent = async (req, res) => {
  try {
    const { content, resourceId, resourceType, metadata } = req.body;
    
    if (!content || !resourceId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Content and resourceId are required' 
      });
    }
    
    // Scan content for sensitive data
    const scanResult = await dlpService.scanContent(content);
    
    // Determine classification level based on findings
    let level = 'public';
    let confidence = 100;
    
    if (scanResult.riskScore >= 90) {
      level = 'restricted';
      confidence = 95;
    } else if (scanResult.riskScore >= 70) {
      level = 'confidential';
      confidence = 90;
    } else if (scanResult.riskScore >= 40) {
      level = 'internal';
      confidence = 85;
    }
    
    // Create or update classification
    const classification = await DataClassification.findOneAndUpdate(
      { resourceId },
      {
        resourceId,
        resourceType: resourceType || 'file',
        classification: {
          level,
          confidence,
          method: 'auto_content',
          classifiedAt: new Date()
        },
        sensitiveData: scanResult.findings.map(f => ({
          type: f.type,
          count: f.count,
          confidence: f.confidence
        })),
        metadata,
        labels: scanResult.findings.map(f => f.type)
      },
      { upsert: true, new: true }
    );
    
    res.json({
      success: true,
      data: classification,
      scanResult
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Manually set classification
 */
exports.setClassification = async (req, res) => {
  try {
    const { resourceId, level, labels, retention } = req.body;
    
    if (!resourceId || !level) {
      return res.status(400).json({ 
        success: false, 
        error: 'ResourceId and level are required' 
      });
    }
    
    const classification = await DataClassification.findOneAndUpdate(
      { resourceId },
      {
        'classification.level': level,
        'classification.method': 'manual',
        'classification.classifiedBy': req.user?._id,
        'classification.classifiedAt': new Date(),
        labels,
        retention
      },
      { upsert: true, new: true }
    );
    
    res.json({
      success: true,
      message: 'Classification updated',
      data: classification
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get classification statistics
 */
exports.getClassificationStats = async (req, res) => {
  try {
    const [byLevel, byType, byMethod] = await Promise.all([
      DataClassification.aggregate([
        { $group: { _id: '$classification.level', count: { $sum: 1 } } }
      ]),
      DataClassification.aggregate([
        { $group: { _id: '$resourceType', count: { $sum: 1 } } }
      ]),
      DataClassification.aggregate([
        { $group: { _id: '$classification.method', count: { $sum: 1 } } }
      ])
    ]);
    
    res.json({
      success: true,
      data: {
        byLevel: Object.fromEntries(byLevel.map(l => [l._id, l.count])),
        byType: Object.fromEntries(byType.map(t => [t._id, t.count])),
        byMethod: Object.fromEntries(byMethod.map(m => [m._id, m.count]))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Bulk classify resources
 */
exports.bulkClassify = async (req, res) => {
  try {
    const { resources } = req.body;
    
    if (!resources || !Array.isArray(resources)) {
      return res.status(400).json({ success: false, error: 'Resources array is required' });
    }
    
    const results = [];
    
    for (const resource of resources) {
      try {
        const scanResult = await dlpService.scanContent(resource.content);
        
        let level = 'public';
        if (scanResult.riskScore >= 90) level = 'restricted';
        else if (scanResult.riskScore >= 70) level = 'confidential';
        else if (scanResult.riskScore >= 40) level = 'internal';
        
        const classification = await DataClassification.findOneAndUpdate(
          { resourceId: resource.resourceId },
          {
            resourceId: resource.resourceId,
            resourceType: resource.resourceType || 'file',
            classification: {
              level,
              confidence: 90,
              method: 'auto_content',
              classifiedAt: new Date()
            },
            sensitiveData: scanResult.findings,
            metadata: resource.metadata
          },
          { upsert: true, new: true }
        );
        
        results.push({ resourceId: resource.resourceId, success: true, level });
      } catch (error) {
        results.push({ resourceId: resource.resourceId, success: false, error: error.message });
      }
    }
    
    res.json({
      success: true,
      total: resources.length,
      results
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
