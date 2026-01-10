const axios = require('axios');
const { Submission, Researcher, Program } = require('../models');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8050';

// Create new submission
exports.createSubmission = async (req, res) => {
  try {
    const {
      title,
      description,
      vulnerability_type,
      severity,
      assets_affected,
      proof_of_concept,
      steps_to_reproduce,
      impact,
      researcher_email,
      cvss_vector
    } = req.body;

    // Generate unique submission ID
    const submission_id = `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Find or create researcher
    let researcher = await Researcher.findOne({ email: researcher_email });
    if (!researcher) {
      // Auto-create researcher profile
      researcher = await Researcher.create({
        researcher_id: `RES-${Date.now()}`,
        email: researcher_email,
        name: researcher_email.split('@')[0],
        username: researcher_email.split('@')[0]
      });
    }

    // Create submission
    const submission = await Submission.create({
      submission_id,
      title,
      description,
      vulnerability_type,
      severity: severity || 'medium',
      assets_affected,
      proof_of_concept,
      steps_to_reproduce,
      impact,
      researcher_id: researcher._id,
      researcher_email,
      cvss_vector,
      status: 'new',
      submitted_at: new Date()
    });

    // Update researcher stats
    researcher.total_submissions += 1;
    researcher.last_submission = new Date();
    await researcher.save();

    res.status(201).json({
      success: true,
      submission: submission,
      message: 'Submission created successfully'
    });

  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all submissions with filters
exports.getSubmissions = async (req, res) => {
  try {
    const {
      status,
      severity,
      vulnerability_type,
      researcher_id,
      page = 1,
      limit = 20,
      sort = '-submitted_at'
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (vulnerability_type) query.vulnerability_type = vulnerability_type;
    if (researcher_id) query.researcher_id = researcher_id;

    const submissions = await Submission.find(query)
      .populate('researcher_id', 'name email username reputation_score')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await Submission.countDocuments(query);

    res.json({
      success: true,
      submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get submission by ID
exports.getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findOne({
      $or: [{ _id: id }, { submission_id: id }]
    })
      .populate('researcher_id')
      .populate('duplicate_of')
      .lean();

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({ success: true, submission });

  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Analyze submission with AI
exports.analyzeSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findOne({
      $or: [{ _id: id }, { submission_id: id }]
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Call ML engine for analysis
    const mlResponse = await axios.post(`${ML_ENGINE_URL}/analyze`, {
      data: {
        title: submission.title,
        description: submission.description,
        vulnerability_type: submission.vulnerability_type,
        proof_of_concept: submission.proof_of_concept,
        assets_affected: submission.assets_affected
      }
    });

    // Update submission with AI analysis
    submission.ai_analysis = {
      validity_score: mlResponse.data.analysis?.confidence || 0.85,
      severity_confidence: mlResponse.data.analysis?.confidence || 0.8,
      classification: submission.vulnerability_type,
      recommendations: [
        'Verify proof of concept',
        'Check for duplicates',
        'Assess business impact'
      ],
      analyzed_at: new Date()
    };

    await submission.save();

    res.json({
      success: true,
      analysis: submission.ai_analysis,
      message: 'Analysis complete'
    });

  } catch (error) {
    console.error('Analyze submission error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Check for duplicate submissions
exports.checkDuplicates = async (req, res) => {
  try {
    const { id } = req.params;
    const { threshold = 0.85 } = req.body;

    const submission = await Submission.findOne({
      $or: [{ _id: id }, { submission_id: id }]
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Call ML engine for duplicate detection
    const mlResponse = await axios.post(`${ML_ENGINE_URL}/check-duplicates`, {
      title: submission.title,
      description: submission.description,
      vulnerability_type: submission.vulnerability_type,
      threshold
    });

    const duplicates = mlResponse.data.duplicates || [];

    res.json({
      success: true,
      is_duplicate: duplicates.length > 0,
      duplicates,
      similarity_threshold: threshold
    });

  } catch (error) {
    console.error('Check duplicates error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update submission status (triage)
exports.updateSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, triaged_by } = req.body;

    const submission = await Submission.findOne({
      $or: [{ _id: id }, { submission_id: id }]
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    submission.status = status;
    if (status === 'triaged' || status === 'accepted') {
      submission.triaged_at = new Date();
      submission.triaged_by = triaged_by;
    }
    if (status === 'fixed' || status === 'closed') {
      submission.resolved_at = new Date();
    }

    // Add to timeline
    submission.timeline.push({
      action: `Status changed to ${status}`,
      user_name: 'System',
      details: notes || '',
      timestamp: new Date()
    });

    await submission.save();

    // Update researcher stats if accepted/rejected
    if (status === 'accepted') {
      await Researcher.findByIdAndUpdate(submission.researcher_id, {
        $inc: { accepted_submissions: 1 }
      });
    } else if (status === 'rejected') {
      await Researcher.findByIdAndUpdate(submission.researcher_id, {
        $inc: { rejected_submissions: 1 }
      });
    } else if (status === 'duplicate') {
      await Researcher.findByIdAndUpdate(submission.researcher_id, {
        $inc: { duplicate_submissions: 1 }
      });
    }

    res.json({
      success: true,
      submission,
      message: `Submission ${status}`
    });

  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add comment to submission
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, user_name } = req.body;

    const submission = await Submission.findOne({
      $or: [{ _id: id }, { submission_id: id }]
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    submission.comments.push({
      user_name: user_name || 'Anonymous',
      comment,
      created_at: new Date()
    });

    await submission.save();

    res.json({
      success: true,
      comment: submission.comments[submission.comments.length - 1]
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get submission statistics
exports.getSubmissionStats = async (req, res) => {
  try {
    const { timeframe = 'all' } = req.query;

    let query = {};
    if (timeframe !== 'all') {
      const date = new Date();
      if (timeframe === '7d') date.setDate(date.getDate() - 7);
      else if (timeframe === '30d') date.setDate(date.getDate() - 30);
      else if (timeframe === '90d') date.setDate(date.getDate() - 90);
      query.submitted_at = { $gte: date };
    }

    const stats = await Submission.getStats(query);

    // Get status breakdown
    const statusBreakdown = await Submission.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get vulnerability type breakdown
    const typeBreakdown = await Submission.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$vulnerability_type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      stats: {
        ...stats,
        by_status: statusBreakdown,
        by_type: typeBreakdown
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete submission (admin only)
exports.deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findOneAndDelete({
      $or: [{ _id: id }, { submission_id: id }]
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({
      success: true,
      message: 'Submission deleted'
    });

  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ error: error.message });
  }
};
