import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

// Investigation schema (inline for simplicity)
const InvestigationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'pending_review', 'closed', 'archived'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  assignee: { type: String },
  related_alerts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Alert' }],
  related_transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
  findings: [{
    timestamp: { type: Date, default: Date.now },
    author: String,
    content: String,
    type: { type: String, enum: ['note', 'evidence', 'conclusion'] }
  }],
  tags: [String],
  metadata: { type: mongoose.Schema.Types.Mixed },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  closed_at: { type: Date }
});

const Investigation = mongoose.model('Investigation', InvestigationSchema);

// GET /investigations - Get all investigations
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, priority, assignee, limit = 50, page = 1 } = req.query;
    
    const query: any = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignee) query.assignee = assignee;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [investigations, total] = await Promise.all([
      Investigation.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Investigation.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: investigations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching investigations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch investigations'
    });
  }
});

// GET /investigations/stats - Get investigation statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [byStatus, byPriority, total] = await Promise.all([
      Investigation.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Investigation.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Investigation.countDocuments()
    ]);
    
    res.json({
      success: true,
      stats: {
        total,
        by_status: byStatus.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        by_priority: byPriority.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching investigation stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

// GET /investigations/:id - Get investigation by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const investigation = await Investigation.findById(req.params.id);
    
    if (!investigation) {
      return res.status(404).json({
        success: false,
        error: 'Investigation not found'
      });
    }
    
    res.json({
      success: true,
      data: investigation
    });
  } catch (error) {
    console.error('Error fetching investigation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch investigation'
    });
  }
});

// POST /investigations - Create new investigation
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, priority, assignee, tags, metadata } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }
    
    const investigation = new Investigation({
      title,
      description,
      priority: priority || 'medium',
      assignee,
      tags: tags || [],
      metadata: metadata || {},
      status: 'open'
    });
    
    await investigation.save();
    
    res.status(201).json({
      success: true,
      data: investigation
    });
  } catch (error) {
    console.error('Error creating investigation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create investigation'
    });
  }
});

// PATCH /investigations/:id - Update investigation
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { title, description, status, priority, assignee, tags } = req.body;
    
    const investigation = await Investigation.findById(req.params.id);
    
    if (!investigation) {
      return res.status(404).json({
        success: false,
        error: 'Investigation not found'
      });
    }
    
    if (title) investigation.title = title;
    if (description !== undefined) investigation.description = description;
    if (status) {
      investigation.status = status;
      if (status === 'closed' || status === 'archived') {
        investigation.closed_at = new Date();
      }
    }
    if (priority) investigation.priority = priority;
    if (assignee !== undefined) investigation.assignee = assignee;
    if (tags) investigation.tags = tags;
    investigation.updated_at = new Date();
    
    await investigation.save();
    
    res.json({
      success: true,
      data: investigation
    });
  } catch (error) {
    console.error('Error updating investigation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update investigation'
    });
  }
});

// POST /investigations/:id/findings - Add finding to investigation
router.post('/:id/findings', async (req: Request, res: Response) => {
  try {
    const { content, type, author } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required'
      });
    }
    
    const investigation = await Investigation.findById(req.params.id);
    
    if (!investigation) {
      return res.status(404).json({
        success: false,
        error: 'Investigation not found'
      });
    }
    
    investigation.findings.push({
      content,
      type: type || 'note',
      author: author || 'System',
      timestamp: new Date()
    });
    investigation.updated_at = new Date();
    
    await investigation.save();
    
    res.json({
      success: true,
      data: investigation
    });
  } catch (error) {
    console.error('Error adding finding:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add finding'
    });
  }
});

// DELETE /investigations/:id - Delete investigation
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const investigation = await Investigation.findByIdAndDelete(req.params.id);
    
    if (!investigation) {
      return res.status(404).json({
        success: false,
        error: 'Investigation not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Investigation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting investigation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete investigation'
    });
  }
});

export default router;
