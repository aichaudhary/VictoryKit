/**
 * AuditTrail - Search Controller
 * Advanced full-text and structured search
 */

const SearchService = require('../services/searchService');

// Full search
exports.search = async (req, res) => {
  try {
    const params = { ...req.query, ...req.body };
    const results = await SearchService.search(params);
    res.json({
      success: true,
      ...results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

// Get search suggestions
exports.getSuggestions = async (req, res) => {
  try {
    const { field, prefix, limit } = req.query;
    
    if (!field || !prefix) {
      return res.status(400).json({
        success: false,
        message: 'field and prefix are required'
      });
    }
    
    const suggestions = await SearchService.getSuggestions(
      field, 
      prefix, 
      parseInt(limit) || 10
    );
    
    res.json({
      success: true,
      field,
      prefix,
      suggestions
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions',
      error: error.message
    });
  }
};

// Get filter options
exports.getFilterOptions = async (req, res) => {
  try {
    const options = await SearchService.getFilterOptions();
    res.json({
      success: true,
      filters: options
    });
  } catch (error) {
    console.error('Filter options error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get filter options',
      error: error.message
    });
  }
};

// Find correlated events
exports.findCorrelated = async (req, res) => {
  try {
    const { correlationId } = req.params;
    const logs = await SearchService.findCorrelated(correlationId);
    
    res.json({
      success: true,
      correlationId,
      count: logs.length,
      logs
    });
  } catch (error) {
    console.error('Correlation search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find correlated events',
      error: error.message
    });
  }
};

// Get actor timeline
exports.getActorTimeline = async (req, res) => {
  try {
    const { actorId } = req.params;
    const { days } = req.query;
    
    const logs = await SearchService.getActorTimeline(
      actorId, 
      parseInt(days) || 7
    );
    
    res.json({
      success: true,
      actorId,
      count: logs.length,
      timeline: logs
    });
  } catch (error) {
    console.error('Actor timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get actor timeline',
      error: error.message
    });
  }
};

// Get resource history
exports.getResourceHistory = async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;
    const { days } = req.query;
    
    const logs = await SearchService.getResourceHistory(
      resourceType,
      resourceId,
      parseInt(days) || 30
    );
    
    res.json({
      success: true,
      resource: { type: resourceType, id: resourceId },
      count: logs.length,
      history: logs
    });
  } catch (error) {
    console.error('Resource history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get resource history',
      error: error.message
    });
  }
};
