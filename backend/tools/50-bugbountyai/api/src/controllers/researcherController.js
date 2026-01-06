const { Researcher, Submission } = require('../models');

// Create researcher profile
exports.createResearcher = async (req, res) => {
  try {
    const {
      name,
      email,
      username,
      bio,
      country,
      website,
      twitter,
      github,
      linkedin
    } = req.body;

    // Check if researcher exists
    const existing = await Researcher.findOne({
      $or: [{ email }, { username }]
    });

    if (existing) {
      return res.status(400).json({
        error: 'Researcher with this email or username already exists'
      });
    }

    // Generate researcher ID
    const researcher_id = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const researcher = await Researcher.create({
      researcher_id,
      name,
      email,
      username,
      bio,
      country,
      website,
      twitter,
      github,
      linkedin,
      reputation_score: 50,
      rank: 'rookie'
    });

    res.status(201).json({
      success: true,
      researcher,
      message: 'Researcher profile created'
    });

  } catch (error) {
    console.error('Create researcher error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all researchers
exports.getResearchers = async (req, res) => {
  try {
    const {
      rank,
      status = 'active',
      page = 1,
      limit = 20,
      sort = '-reputation_score'
    } = req.query;

    const query = { status };
    if (rank) query.rank = rank;

    const researchers = await Researcher.find(query)
      .select('-payment_info -notes')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await Researcher.countDocuments(query);

    res.json({
      success: true,
      researchers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get researchers error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get researcher by ID
exports.getResearcherById = async (req, res) => {
  try {
    const { id } = req.params;

    const researcher = await Researcher.findOne({
      $or: [{ _id: id }, { researcher_id: id }, { email: id }, { username: id }]
    })
      .select('-payment_info')
      .lean();

    if (!researcher) {
      return res.status(404).json({ error: 'Researcher not found' });
    }

    // Get recent submissions
    const submissions = await Submission.find({ researcher_id: researcher._id })
      .select('submission_id title severity status submitted_at reward_amount')
      .sort('-submitted_at')
      .limit(10)
      .lean();

    res.json({
      success: true,
      researcher,
      recent_submissions: submissions
    });

  } catch (error) {
    console.error('Get researcher error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update researcher profile
exports.updateResearcher = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove protected fields
    delete updates.researcher_id;
    delete updates.email;
    delete updates.reputation_score;
    delete updates.rank;
    delete updates.total_submissions;
    delete updates.total_earned;

    const researcher = await Researcher.findOneAndUpdate(
      { $or: [{ _id: id }, { researcher_id: id }] },
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-payment_info');

    if (!researcher) {
      return res.status(404).json({ error: 'Researcher not found' });
    }

    res.json({
      success: true,
      researcher,
      message: 'Profile updated'
    });

  } catch (error) {
    console.error('Update researcher error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get researcher statistics
exports.getResearcherStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { timeframe = 'all' } = req.query;

    const researcher = await Researcher.findOne({
      $or: [{ _id: id }, { researcher_id: id }]
    });

    if (!researcher) {
      return res.status(404).json({ error: 'Researcher not found' });
    }

    // Build query for submissions
    let submissionQuery = { researcher_id: researcher._id };
    if (timeframe !== 'all') {
      const date = new Date();
      if (timeframe === '7d') date.setDate(date.getDate() - 7);
      else if (timeframe === '30d') date.setDate(date.getDate() - 30);
      else if (timeframe === '90d') date.setDate(date.getDate() - 90);
      submissionQuery.submitted_at = { $gte: date };
    }

    // Get submission stats
    const submissionStats = await Submission.getStats(submissionQuery);

    // Get timeline data
    const timeline = await Submission.aggregate([
      { $match: submissionQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$submitted_at' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    res.json({
      success: true,
      stats: {
        profile: {
          reputation_score: researcher.reputation_score,
          rank: researcher.rank,
          total_earned: researcher.total_earned,
          acceptance_rate: researcher.acceptance_rate,
          days_member: researcher.days_member
        },
        submissions: submissionStats,
        timeline
      }
    });

  } catch (error) {
    console.error('Get researcher stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 100, timeframe = 'all' } = req.query;

    const leaderboard = await Researcher.getLeaderboard(
      parseInt(limit),
      timeframe
    );

    res.json({
      success: true,
      leaderboard,
      timeframe
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update researcher reputation (admin/system)
exports.updateReputation = async (req, res) => {
  try {
    const { id } = req.params;

    const researcher = await Researcher.findOne({
      $or: [{ _id: id }, { researcher_id: id }]
    });

    if (!researcher) {
      return res.status(404).json({ error: 'Researcher not found' });
    }

    // Recalculate reputation
    researcher.updateReputation();
    await researcher.save();

    res.json({
      success: true,
      researcher: {
        reputation_score: researcher.reputation_score,
        rank: researcher.rank
      },
      message: 'Reputation updated'
    });

  } catch (error) {
    console.error('Update reputation error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add achievement to researcher
exports.addAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon } = req.body;

    const researcher = await Researcher.findOne({
      $or: [{ _id: id }, { researcher_id: id }]
    });

    if (!researcher) {
      return res.status(404).json({ error: 'Researcher not found' });
    }

    researcher.achievements.push({
      name,
      description,
      icon,
      earned_at: new Date()
    });

    await researcher.save();

    res.json({
      success: true,
      achievement: researcher.achievements[researcher.achievements.length - 1]
    });

  } catch (error) {
    console.error('Add achievement error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update payment info
exports.updatePaymentInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { method, details } = req.body;

    const researcher = await Researcher.findOneAndUpdate(
      { $or: [{ _id: id }, { researcher_id: id }] },
      {
        $set: {
          'payment_info.method': method,
          'payment_info.details': details
        }
      },
      { new: true }
    ).select('-payment_info.details');

    if (!researcher) {
      return res.status(404).json({ error: 'Researcher not found' });
    }

    res.json({
      success: true,
      message: 'Payment info updated'
    });

  } catch (error) {
    console.error('Update payment info error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get global researcher statistics
exports.getGlobalStats = async (req, res) => {
  try {
    const stats = await Researcher.getStats();

    // Get rank distribution
    const rankDistribution = await Researcher.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$rank',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        ...stats,
        rank_distribution: rankDistribution
      }
    });

  } catch (error) {
    console.error('Get global stats error:', error);
    res.status(500).json({ error: error.message });
  }
};
