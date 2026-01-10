const { Submission, Researcher, Reward, Program } = require('../models');

// Get dashboard overview
exports.getDashboardOverview = async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;

    // Build date query
    const date = new Date();
    if (timeframe === '7d') date.setDate(date.getDate() - 7);
    else if (timeframe === '30d') date.setDate(date.getDate() - 30);
    else if (timeframe === '90d') date.setDate(date.getDate() - 90);
    
    const dateQuery = timeframe === 'all' ? {} : { submitted_at: { $gte: date } };

    // Get submission stats
    const submissionStats = await Submission.getStats(dateQuery);

    // Get researcher stats
    const researcherStats = await Researcher.getStats();

    // Get reward stats
    const rewardStats = await Reward.getStats(
      timeframe === 'all' ? {} : { createdAt: { $gte: date } }
    );

    // Get recent activity
    const recentSubmissions = await Submission.find()
      .sort('-submitted_at')
      .limit(10)
      .select('submission_id title severity status submitted_at researcher_id')
      .populate('researcher_id', 'name username')
      .lean();

    // Get top researchers
    const topResearchers = await Researcher.find({ status: 'active' })
      .sort('-reputation_score')
      .limit(10)
      .select('name username reputation_score rank total_earned accepted_submissions')
      .lean();

    res.json({
      success: true,
      dashboard: {
        submissions: {
          total: submissionStats.total,
          by_severity: {
            critical: submissionStats.critical,
            high: submissionStats.high,
            medium: submissionStats.medium,
            low: submissionStats.low
          },
          avg_cvss: submissionStats.avgCVSS,
          avg_quality: submissionStats.avgQualityScore
        },
        researchers: {
          total: researcherStats.total_researchers,
          avg_reputation: researcherStats.avg_reputation,
          total_submissions: researcherStats.total_submissions
        },
        rewards: {
          total_paid: rewardStats.paid_amount,
          pending_amount: rewardStats.pending_amount,
          avg_reward: rewardStats.avg_amount,
          total_rewards: rewardStats.total_rewards
        },
        recent_activity: recentSubmissions,
        top_researchers: topResearchers
      },
      timeframe
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get submission trends
exports.getSubmissionTrends = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const date = new Date();
    date.setDate(date.getDate() - parseInt(days));

    // Daily submission counts
    const dailySubmissions = await Submission.aggregate([
      { $match: { submitted_at: { $gte: date } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$submitted_at' }
          },
          count: { $sum: 1 },
          critical: {
            $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
          },
          high: {
            $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] }
          },
          medium: {
            $sum: { $cond: [{ $eq: ['$severity', 'medium'] }, 1, 0] }
          },
          low: {
            $sum: { $cond: [{ $eq: ['$severity', 'low'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Vulnerability type distribution
    const typeDistribution = await Submission.aggregate([
      { $match: { submitted_at: { $gte: date } } },
      {
        $group: {
          _id: '$vulnerability_type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Status distribution
    const statusDistribution = await Submission.aggregate([
      { $match: { submitted_at: { $gte: date } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      trends: {
        daily_submissions: dailySubmissions,
        by_type: typeDistribution,
        by_status: statusDistribution
      },
      period: `Last ${days} days`
    });

  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get researcher analytics
exports.getResearcherAnalytics = async (req, res) => {
  try {
    // Top researchers by reputation
    const byReputation = await Researcher.find({ status: 'active' })
      .sort('-reputation_score')
      .limit(20)
      .select('name username reputation_score rank total_earned')
      .lean();

    // Top earners
    const byEarnings = await Researcher.find({ status: 'active' })
      .sort('-total_earned')
      .limit(20)
      .select('name username total_earned accepted_submissions')
      .lean();

    // Most active
    const byActivity = await Researcher.find({ status: 'active' })
      .sort('-total_submissions')
      .limit(20)
      .select('name username total_submissions accepted_submissions')
      .lean();

    // Rank distribution
    const rankDistribution = await Researcher.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$rank',
          count: { $sum: 1 },
          avg_earnings: { $avg: '$total_earned' },
          avg_reputation: { $avg: '$reputation_score' }
        }
      }
    ]);

    // Country distribution
    const countryDistribution = await Researcher.aggregate([
      { $match: { status: 'active', country: { $ne: '' } } },
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    res.json({
      success: true,
      analytics: {
        top_by_reputation: byReputation,
        top_by_earnings: byEarnings,
        most_active: byActivity,
        rank_distribution: rankDistribution,
        country_distribution: countryDistribution
      }
    });

  } catch (error) {
    console.error('Get researcher analytics error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get reward analytics
exports.getRewardAnalytics = async (req, res) => {
  try {
    const { days = 90 } = req.query;

    const date = new Date();
    date.setDate(date.getDate() - parseInt(days));

    // Reward timeline
    const timeline = await Reward.aggregate([
      { $match: { createdAt: { $gte: date } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          total_amount: { $sum: '$amount' },
          avg_amount: { $avg: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Reward by severity
    const bySeverity = await Reward.aggregate([
      { $match: { createdAt: { $gte: date } } },
      {
        $lookup: {
          from: 'submissions',
          localField: 'submission_id',
          foreignField: '_id',
          as: 'submission'
        }
      },
      { $unwind: '$submission' },
      {
        $group: {
          _id: '$submission.severity',
          count: { $sum: 1 },
          total_amount: { $sum: '$amount' },
          avg_amount: { $avg: '$amount' }
        }
      }
    ]);

    // Payment method distribution
    const byPaymentMethod = await Reward.aggregate([
      { $match: { createdAt: { $gte: date } } },
      {
        $group: {
          _id: '$payment_method',
          count: { $sum: 1 },
          total_amount: { $sum: '$amount' }
        }
      }
    ]);

    // Top rewarded researchers
    const topRewarded = await Reward.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: date } } },
      {
        $group: {
          _id: '$researcher_id',
          total_earned: { $sum: '$amount' },
          reward_count: { $sum: 1 }
        }
      },
      { $sort: { total_earned: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'researchers',
          localField: '_id',
          foreignField: '_id',
          as: 'researcher'
        }
      },
      { $unwind: '$researcher' }
    ]);

    res.json({
      success: true,
      analytics: {
        timeline,
        by_severity: bySeverity,
        by_payment_method: byPaymentMethod,
        top_rewarded: topRewarded
      },
      period: `Last ${days} days`
    });

  } catch (error) {
    console.error('Get reward analytics error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get program analytics
exports.getProgramAnalytics = async (req, res) => {
  try {
    const programs = await Program.find({ status: 'active' });

    const programData = await Promise.all(
      programs.map(async (program) => {
        const submissions = await Submission.countDocuments({
          program_id: program._id
        });

        const validSubmissions = await Submission.countDocuments({
          program_id: program._id,
          status: { $in: ['accepted', 'fixed', 'disclosed'] }
        });

        const totalRewards = await Reward.aggregate([
          {
            $lookup: {
              from: 'submissions',
              localField: 'submission_id',
              foreignField: '_id',
              as: 'submission'
            }
          },
          { $unwind: '$submission' },
          {
            $match: {
              'submission.program_id': program._id,
              status: 'paid'
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]);

        return {
          program_id: program.program_id,
          name: program.name,
          submissions,
          valid_submissions: validSubmissions,
          acceptance_rate: submissions > 0 ? (validSubmissions / submissions * 100).toFixed(2) : 0,
          total_rewards: totalRewards[0]?.total || 0
        };
      })
    );

    res.json({
      success: true,
      programs: programData
    });

  } catch (error) {
    console.error('Get program analytics error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Export data for reporting
exports.exportData = async (req, res) => {
  try {
    const { type, format = 'json', date_from, date_to } = req.query;

    const query = {};
    if (date_from && date_to) {
      query.submitted_at = {
        $gte: new Date(date_from),
        $lte: new Date(date_to)
      };
    }

    let data;
    switch (type) {
      case 'submissions':
        data = await Submission.find(query)
          .populate('researcher_id', 'name email')
          .lean();
        break;

      case 'researchers':
        data = await Researcher.find({ status: 'active' })
          .select('-payment_info')
          .lean();
        break;

      case 'rewards':
        data = await Reward.find(query)
          .populate('submission_id', 'submission_id title')
          .populate('researcher_id', 'name email')
          .lean();
        break;

      default:
        return res.status(400).json({
          error: 'Invalid export type. Use: submissions, researchers, or rewards'
        });
    }

    if (format === 'csv') {
      // In production, use a proper CSV library
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_export.csv"`);
      res.send('CSV export not implemented yet');
    } else {
      res.json({
        success: true,
        data,
        count: data.length,
        exported_at: new Date()
      });
    }

  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ error: error.message });
  }
};
