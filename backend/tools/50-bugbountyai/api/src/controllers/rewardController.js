const { Reward, Submission, Researcher, Program } = require('../models');

// Calculate reward for submission
exports.calculateReward = async (req, res) => {
  try {
    const { submission_id, program_id } = req.body;

    const submission = await Submission.findOne({
      $or: [{ _id: submission_id }, { submission_id }]
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Get program if specified
    let program = null;
    if (program_id) {
      program = await Program.findOne({
        $or: [{ _id: program_id }, { program_id }]
      });
    }

    // Calculate reward amount
    const calculation = Reward.calculateAmount(submission, program);

    res.json({
      success: true,
      calculation,
      submission: {
        id: submission.submission_id,
        title: submission.title,
        severity: submission.severity,
        cvss_score: submission.cvss_score,
        quality_score: submission.quality_score
      }
    });

  } catch (error) {
    console.error('Calculate reward error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create reward record
exports.createReward = async (req, res) => {
  try {
    const {
      submission_id,
      researcher_id,
      amount,
      currency = 'USD',
      payment_method = 'paypal'
    } = req.body;

    // Verify submission and researcher exist
    const submission = await Submission.findOne({
      $or: [{ _id: submission_id }, { submission_id }]
    });

    const researcher = await Researcher.findOne({
      $or: [{ _id: researcher_id }, { researcher_id }]
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (!researcher) {
      return res.status(404).json({ error: 'Researcher not found' });
    }

    // Generate reward ID
    const reward_id = `REW-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const reward = await Reward.create({
      reward_id,
      submission_id: submission._id,
      researcher_id: researcher._id,
      amount,
      currency,
      payment_method,
      status: 'pending'
    });

    // Update submission
    submission.reward_amount = amount;
    submission.reward_status = 'pending';
    await submission.save();

    res.status(201).json({
      success: true,
      reward,
      message: 'Reward created'
    });

  } catch (error) {
    console.error('Create reward error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all rewards
exports.getRewards = async (req, res) => {
  try {
    const {
      status,
      researcher_id,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (researcher_id) {
      const researcher = await Researcher.findOne({
        $or: [{ _id: researcher_id }, { researcher_id }]
      });
      if (researcher) query.researcher_id = researcher._id;
    }

    const rewards = await Reward.find(query)
      .populate('submission_id', 'submission_id title severity')
      .populate('researcher_id', 'name email username')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await Reward.countDocuments(query);

    res.json({
      success: true,
      rewards,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get reward by ID
exports.getRewardById = async (req, res) => {
  try {
    const { id } = req.params;

    const reward = await Reward.findOne({
      $or: [{ _id: id }, { reward_id: id }]
    })
      .populate('submission_id')
      .populate('researcher_id')
      .populate('approved_by', 'name email')
      .lean();

    if (!reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    res.json({ success: true, reward });

  } catch (error) {
    console.error('Get reward error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Approve reward
exports.approveReward = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, user_name } = req.body;

    const reward = await Reward.findOne({
      $or: [{ _id: id }, { reward_id: id }]
    });

    if (!reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    if (reward.status !== 'pending') {
      return res.status(400).json({
        error: `Cannot approve reward with status: ${reward.status}`
      });
    }

    await reward.approve(user_id, user_name || 'Admin');

    // Update submission
    await Submission.findByIdAndUpdate(reward.submission_id, {
      reward_status: 'approved'
    });

    res.json({
      success: true,
      reward,
      message: 'Reward approved'
    });

  } catch (error) {
    console.error('Approve reward error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Reject reward
exports.rejectReward = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, user_name, reason } = req.body;

    const reward = await Reward.findOne({
      $or: [{ _id: id }, { reward_id: id }]
    });

    if (!reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    if (reward.status !== 'pending' && reward.status !== 'approved') {
      return res.status(400).json({
        error: `Cannot reject reward with status: ${reward.status}`
      });
    }

    await reward.reject(user_id, user_name || 'Admin', reason);

    // Update submission
    await Submission.findByIdAndUpdate(reward.submission_id, {
      reward_status: 'rejected'
    });

    res.json({
      success: true,
      reward,
      message: 'Reward rejected'
    });

  } catch (error) {
    console.error('Reject reward error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark reward as paid
exports.markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { transaction_id, payment_date } = req.body;

    const reward = await Reward.findOne({
      $or: [{ _id: id }, { reward_id: id }]
    });

    if (!reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    if (reward.status !== 'approved' && reward.status !== 'processing') {
      return res.status(400).json({
        error: `Cannot mark as paid with status: ${reward.status}`
      });
    }

    await reward.markAsPaid(transaction_id, payment_date);

    // Update submission
    await Submission.findByIdAndUpdate(reward.submission_id, {
      reward_status: 'paid'
    });

    // Update researcher earnings
    await Researcher.findByIdAndUpdate(reward.researcher_id, {
      $inc: {
        total_earned: reward.amount,
        'statistics.total_rewards_count': 1
      },
      $max: {
        'statistics.highest_reward': reward.amount
      }
    });

    res.json({
      success: true,
      reward,
      message: 'Reward marked as paid'
    });

  } catch (error) {
    console.error('Mark as paid error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Batch approve rewards
exports.batchApprove = async (req, res) => {
  try {
    const { reward_ids, user_id, user_name } = req.body;

    const results = {
      success: [],
      failed: []
    };

    for (const id of reward_ids) {
      try {
        const reward = await Reward.findOne({
          $or: [{ _id: id }, { reward_id: id }]
        });

        if (reward && reward.status === 'pending') {
          await reward.approve(user_id, user_name || 'Admin');
          results.success.push(id);
        } else {
          results.failed.push({ id, reason: 'Not found or not pending' });
        }
      } catch (err) {
        results.failed.push({ id, reason: err.message });
      }
    }

    res.json({
      success: true,
      results,
      message: `Approved ${results.success.length} rewards, ${results.failed.length} failed`
    });

  } catch (error) {
    console.error('Batch approve error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get reward statistics
exports.getRewardStats = async (req, res) => {
  try {
    const { timeframe = 'all' } = req.query;

    let query = {};
    if (timeframe !== 'all') {
      const date = new Date();
      if (timeframe === '7d') date.setDate(date.getDate() - 7);
      else if (timeframe === '30d') date.setDate(date.getDate() - 30);
      else if (timeframe === '90d') date.setDate(date.getDate() - 90);
      query.createdAt = { $gte: date };
    }

    const stats = await Reward.getStats(query);

    // Get timeline
    const timeline = await Reward.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          total_amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    res.json({
      success: true,
      stats,
      timeline
    });

  } catch (error) {
    console.error('Get reward stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get pending rewards summary
exports.getPendingSummary = async (req, res) => {
  try {
    const pending = await Reward.find({ status: 'pending' })
      .populate('submission_id', 'submission_id title severity')
      .populate('researcher_id', 'name email')
      .sort('-createdAt')
      .limit(50)
      .lean();

    const pendingStats = await Reward.getStats({ status: 'pending' });

    res.json({
      success: true,
      pending_rewards: pending,
      summary: {
        count: pendingStats.pending_count,
        total_amount: pendingStats.pending_amount
      }
    });

  } catch (error) {
    console.error('Get pending summary error:', error);
    res.status(500).json({ error: error.message });
  }
};
