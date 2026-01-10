/**
 * AuditTrailPro - Search Service
 * Advanced full-text and structured search
 */

const AuditLog = require('../models/AuditLog');

class SearchService {
  // Full-text search across audit logs
  async search(params) {
    const {
      query,
      eventTypes,
      actions,
      actorIds,
      actorTypes,
      resourceTypes,
      statuses,
      riskLevels,
      startDate,
      endDate,
      source,
      ipAddress,
      page = 1,
      limit = 50,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = params;

    const filter = {};

    // Text search
    if (query) {
      filter.$or = [
        { action: { $regex: query, $options: 'i' } },
        { 'actor.name': { $regex: query, $options: 'i' } },
        { 'actor.email': { $regex: query, $options: 'i' } },
        { 'resource.name': { $regex: query, $options: 'i' } },
        { 'resource.path': { $regex: query, $options: 'i' } },
        { logId: { $regex: query, $options: 'i' } }
      ];
    }

    // Event type filter
    if (eventTypes?.length) {
      filter.eventType = { $in: eventTypes };
    }

    // Actions filter
    if (actions?.length) {
      filter.action = { $in: actions };
    }

    // Actor filters
    if (actorIds?.length) {
      filter['actor.id'] = { $in: actorIds };
    }
    if (actorTypes?.length) {
      filter['actor.type'] = { $in: actorTypes };
    }

    // Resource filter
    if (resourceTypes?.length) {
      filter['resource.type'] = { $in: resourceTypes };
    }

    // Status filter
    if (statuses?.length) {
      filter.status = { $in: statuses };
    }

    // Risk level filter
    if (riskLevels?.length) {
      filter.riskLevel = { $in: riskLevels };
    }

    // Date range
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    // Source filter
    if (source) {
      filter['metadata.source'] = source;
    }

    // IP address filter
    if (ipAddress) {
      filter['actor.ip'] = { $regex: ipAddress, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [results, total] = await Promise.all([
      AuditLog.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      AuditLog.countDocuments(filter)
    ]);

    return {
      results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      query: params
    };
  }

  // Get search suggestions/autocomplete
  async getSuggestions(field, prefix, limit = 10) {
    const fieldMap = {
      actor: 'actor.name',
      action: 'action',
      resource: 'resource.name',
      ip: 'actor.ip',
      eventType: 'eventType'
    };

    const dbField = fieldMap[field] || field;

    const suggestions = await AuditLog.aggregate([
      {
        $match: { [dbField]: { $regex: `^${prefix}`, $options: 'i' } }
      },
      {
        $group: { _id: `$${dbField}` }
      },
      {
        $limit: limit
      },
      {
        $project: { value: '$_id', _id: 0 }
      }
    ]);

    return suggestions.map(s => s.value).filter(Boolean);
  }

  // Get distinct values for filters
  async getFilterOptions() {
    const [eventTypes, actions, actorTypes, resourceTypes, statuses, sources] = await Promise.all([
      AuditLog.distinct('eventType'),
      AuditLog.distinct('action'),
      AuditLog.distinct('actor.type'),
      AuditLog.distinct('resource.type'),
      AuditLog.distinct('status'),
      AuditLog.distinct('metadata.source')
    ]);

    return {
      eventTypes: eventTypes.filter(Boolean).sort(),
      actions: actions.filter(Boolean).sort(),
      actorTypes: actorTypes.filter(Boolean).sort(),
      resourceTypes: resourceTypes.filter(Boolean).sort(),
      statuses: statuses.filter(Boolean).sort(),
      sources: sources.filter(Boolean).sort()
    };
  }

  // Search by correlation ID to find related events
  async findCorrelated(correlationId) {
    const logs = await AuditLog.find({
      $or: [
        { 'metadata.correlationId': correlationId },
        { 'metadata.requestId': correlationId },
        { 'metadata.sessionId': correlationId }
      ]
    }).sort({ timestamp: 1 });

    return logs;
  }

  // Get actor activity timeline
  async getActorTimeline(actorId, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await AuditLog.find({
      'actor.id': actorId,
      timestamp: { $gte: startDate }
    })
    .sort({ timestamp: -1 })
    .limit(500);

    return logs;
  }

  // Get resource access history
  async getResourceHistory(resourceType, resourceId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await AuditLog.find({
      'resource.type': resourceType,
      'resource.id': resourceId,
      timestamp: { $gte: startDate }
    })
    .sort({ timestamp: -1 });

    return logs;
  }
}

module.exports = new SearchService();
