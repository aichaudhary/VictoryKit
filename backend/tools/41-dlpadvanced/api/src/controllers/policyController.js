/**
 * Policy Controller - DLP Policy Management
 */

const { DLPPolicy, SensitivePattern } = require('../models');

/**
 * Get all policies
 */
exports.getAllPolicies = async (req, res) => {
  try {
    const { page = 1, limit = 20, enabled, search } = req.query;
    
    const query = {};
    if (enabled !== undefined) query.enabled = enabled === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const policies = await DLPPolicy.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await DLPPolicy.countDocuments(query);
    
    res.json({
      success: true,
      data: policies,
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
 * Get policy by ID
 */
exports.getPolicyById = async (req, res) => {
  try {
    const policy = await DLPPolicy.findById(req.params.id);
    
    if (!policy) {
      return res.status(404).json({ success: false, error: 'Policy not found' });
    }
    
    res.json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create new policy
 */
exports.createPolicy = async (req, res) => {
  try {
    const policy = await DLPPolicy.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Policy created successfully',
      data: policy
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update policy
 */
exports.updatePolicy = async (req, res) => {
  try {
    const policy = await DLPPolicy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!policy) {
      return res.status(404).json({ success: false, error: 'Policy not found' });
    }
    
    res.json({
      success: true,
      message: 'Policy updated successfully',
      data: policy
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete policy
 */
exports.deletePolicy = async (req, res) => {
  try {
    const policy = await DLPPolicy.findByIdAndDelete(req.params.id);
    
    if (!policy) {
      return res.status(404).json({ success: false, error: 'Policy not found' });
    }
    
    res.json({
      success: true,
      message: 'Policy deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Toggle policy enabled status
 */
exports.togglePolicy = async (req, res) => {
  try {
    const policy = await DLPPolicy.findById(req.params.id);
    
    if (!policy) {
      return res.status(404).json({ success: false, error: 'Policy not found' });
    }
    
    policy.enabled = !policy.enabled;
    await policy.save();
    
    res.json({
      success: true,
      message: `Policy ${policy.enabled ? 'enabled' : 'disabled'}`,
      data: policy
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get all patterns
 */
exports.getAllPatterns = async (req, res) => {
  try {
    const { type, enabled } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (enabled !== undefined) query.enabled = enabled === 'true';
    
    const patterns = await SensitivePattern.find(query).sort({ type: 1, name: 1 });
    
    res.json({ success: true, data: patterns });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create custom pattern
 */
exports.createPattern = async (req, res) => {
  try {
    // Validate regex pattern
    try {
      new RegExp(req.body.pattern);
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Invalid regex pattern' });
    }
    
    const pattern = await SensitivePattern.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Pattern created successfully',
      data: pattern
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update pattern
 */
exports.updatePattern = async (req, res) => {
  try {
    if (req.body.pattern) {
      try {
        new RegExp(req.body.pattern);
      } catch (e) {
        return res.status(400).json({ success: false, error: 'Invalid regex pattern' });
      }
    }
    
    const pattern = await SensitivePattern.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!pattern) {
      return res.status(404).json({ success: false, error: 'Pattern not found' });
    }
    
    res.json({
      success: true,
      message: 'Pattern updated successfully',
      data: pattern
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete pattern
 */
exports.deletePattern = async (req, res) => {
  try {
    const pattern = await SensitivePattern.findByIdAndDelete(req.params.id);
    
    if (!pattern) {
      return res.status(404).json({ success: false, error: 'Pattern not found' });
    }
    
    res.json({
      success: true,
      message: 'Pattern deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Test pattern against sample content
 */
exports.testPattern = async (req, res) => {
  try {
    const { pattern, content } = req.body;
    
    if (!pattern || !content) {
      return res.status(400).json({ success: false, error: 'Pattern and content are required' });
    }
    
    try {
      const regex = new RegExp(pattern, 'gi');
      const matches = content.match(regex) || [];
      
      res.json({
        success: true,
        matches: matches.length,
        samples: matches.slice(0, 10)
      });
    } catch (e) {
      res.status(400).json({ success: false, error: 'Invalid regex pattern' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
