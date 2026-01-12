import { Router, Request, Response } from 'express';
import { ThreatIntel } from '../models/ThreatIntel.js';

const router = Router();

// GET /threat-intel/blacklist - Get blacklisted items (malicious threats)
router.get('/blacklist', async (req: Request, res: Response) => {
  try {
    const { type, limit = 50, page = 1 } = req.query;
    
    const query: any = { 'threat_data.is_malicious': true };
    if (type) {
      query.indicator_type = type;
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [items, total] = await Promise.all([
      ThreatIntel.find(query)
        .sort({ last_updated: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ThreatIntel.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching blacklist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blacklist'
    });
  }
});

// GET /threat-intel/search - Search threat intel
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, type } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    const query: any = {
      indicator: { $regex: q, $options: 'i' }
    };
    if (type) {
      query.indicator_type = type;
    }
    
    const results = await ThreatIntel.find(query)
      .sort({ 'threat_data.confidence': -1 })
      .limit(50);
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('Error searching threat intel:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search threat intel'
    });
  }
});

// GET /threat-intel/stats - Get threat intel statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [
      totalCount,
      maliciousCount,
      byType,
      recentThreats
    ] = await Promise.all([
      ThreatIntel.countDocuments(),
      ThreatIntel.countDocuments({ 'threat_data.is_malicious': true }),
      ThreatIntel.aggregate([
        { $group: { _id: '$indicator_type', count: { $sum: 1 } } }
      ]),
      ThreatIntel.find({ 'threat_data.confidence': { $gte: 70 } })
        .sort({ last_updated: -1 })
        .limit(10)
    ]);
    
    res.json({
      success: true,
      stats: {
        total: totalCount,
        malicious: maliciousCount,
        by_type: byType.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recent_high_risk: recentThreats.length
      }
    });
  } catch (error) {
    console.error('Error fetching threat intel stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

// GET /threat-intel/:id - Get threat intel by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await ThreatIntel.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Threat intel not found'
      });
    }
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching threat intel:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch threat intel'
    });
  }
});

// POST /threat-intel - Create new threat intel entry
router.post('/', async (req: Request, res: Response) => {
  try {
    const { indicator, indicator_type, source, confidence, categories } = req.body;
    
    if (!indicator || !indicator_type) {
      return res.status(400).json({
        success: false,
        error: 'Indicator and indicator_type are required'
      });
    }
    
    const item = new ThreatIntel({
      indicator,
      indicator_type,
      threat_data: {
        is_malicious: (confidence || 50) >= 70,
        categories: categories || [],
        confidence: confidence || 50,
        sources: source ? [{ source, detected_at: new Date() }] : []
      },
      first_seen: new Date(),
      last_updated: new Date(),
      ttl: 86400,
      hit_count: 0
    });
    
    await item.save();
    
    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error creating threat intel:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create threat intel'
    });
  }
});

// PATCH /threat-intel/:id/blacklist - Toggle malicious status
router.patch('/:id/blacklist', async (req: Request, res: Response) => {
  try {
    const item = await ThreatIntel.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Threat intel not found'
      });
    }
    
    // Toggle malicious status
    item.threat_data.is_malicious = !item.threat_data.is_malicious;
    item.last_updated = new Date();
    await item.save();
    
    res.json({
      success: true,
      data: item,
      message: item.threat_data.is_malicious ? 'Marked as malicious' : 'Marked as safe'
    });
  } catch (error) {
    console.error('Error toggling blacklist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update blacklist status'
    });
  }
});

export default router;
