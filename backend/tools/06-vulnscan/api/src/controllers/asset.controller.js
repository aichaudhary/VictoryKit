const Asset = require('../models/Asset.model');
const { ApiResponse, ApiError } = require('../../../../../shared');

class AssetController {
  /**
   * Create a new asset
   */
  async createAsset(req, res, next) {
    try {
      const { name, description, assetType, target, environment, criticality, owner, tags, compliance } = req.body;

      // Generate asset ID
      const assetId = `ASSET-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const asset = new Asset({
        userId: req.user.id,
        assetId,
        name,
        description,
        assetType,
        target,
        environment,
        criticality,
        owner,
        tags,
        compliance,
        discoveredBy: {
          method: 'manual',
          source: 'user',
          date: new Date()
        }
      });

      await asset.save();

      res.status(201).json(ApiResponse.created(asset, 'Asset created successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all assets for user
   */
  async getAllAssets(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        assetType, 
        environment, 
        criticality, 
        status = 'active',
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const query = { userId: req.user.id };

      // Filters
      if (assetType) query.assetType = assetType;
      if (environment) query.environment = environment;
      if (criticality) query.criticality = criticality;
      if (status) query.status = status;
      
      // Search
      if (search) {
        query.$or = [
          { name: new RegExp(search, 'i') },
          { 'target.hostname': new RegExp(search, 'i') },
          { 'target.ipAddress': new RegExp(search, 'i') },
          { 'target.url': new RegExp(search, 'i') },
          { tags: new RegExp(search, 'i') }
        ];
      }

      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const assets = await Asset.find(query)
        .sort(sort)
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean();

      const total = await Asset.countDocuments(query);

      // Summary stats
      const stats = await Asset.aggregate([
        { $match: { userId: req.user.id, status: 'active' } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            critical: { $sum: { $cond: [{ $eq: ['$criticality', 'critical'] }, 1, 0] } },
            high: { $sum: { $cond: [{ $eq: ['$criticality', 'high'] }, 1, 0] } },
            withVulns: { $sum: { $cond: [{ $gt: ['$lastScan.vulnerabilities.critical', 0] }, 1, 0] } }
          }
        }
      ]);

      res.json(ApiResponse.success({
        assets,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        },
        stats: stats[0] || { total: 0, critical: 0, high: 0, withVulns: 0 }
      }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get asset by ID
   */
  async getAssetById(req, res, next) {
    try {
      const asset = await Asset.findById(req.params.id).populate('lastScan.scanId');

      if (!asset) {
        throw ApiError.notFound('Asset not found');
      }

      if (asset.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      res.json(ApiResponse.success(asset));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update asset
   */
  async updateAsset(req, res, next) {
    try {
      const { name, description, assetType, target, environment, criticality, owner, tags, compliance, status, notes } = req.body;

      const asset = await Asset.findById(req.params.id);

      if (!asset) {
        throw ApiError.notFound('Asset not found');
      }

      if (asset.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      // Update fields
      if (name) asset.name = name;
      if (description !== undefined) asset.description = description;
      if (assetType) asset.assetType = assetType;
      if (target) asset.target = { ...asset.target, ...target };
      if (environment) asset.environment = environment;
      if (criticality) asset.criticality = criticality;
      if (owner) asset.owner = { ...asset.owner, ...owner };
      if (tags) asset.tags = tags;
      if (compliance) asset.compliance = { ...asset.compliance, ...compliance };
      if (status) asset.status = status;
      if (notes !== undefined) asset.notes = notes;

      await asset.save();

      res.json(ApiResponse.success(asset, 'Asset updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete asset
   */
  async deleteAsset(req, res, next) {
    try {
      const asset = await Asset.findById(req.params.id);

      if (!asset) {
        throw ApiError.notFound('Asset not found');
      }

      if (asset.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
      }

      await asset.deleteOne();

      res.json(ApiResponse.success(null, 'Asset deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk import assets
   */
  async bulkImport(req, res, next) {
    try {
      const { assets } = req.body;

      if (!Array.isArray(assets) || assets.length === 0) {
        throw ApiError.badRequest('Assets array is required');
      }

      const results = {
        imported: 0,
        failed: 0,
        errors: []
      };

      for (const assetData of assets) {
        try {
          const assetId = `ASSET-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

          const asset = new Asset({
            userId: req.user.id,
            assetId,
            ...assetData,
            discoveredBy: {
              method: 'import',
              source: 'bulk_import',
              date: new Date()
            }
          });

          await asset.save();
          results.imported++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            asset: assetData.name || assetData.target?.hostname || 'Unknown',
            error: error.message
          });
        }
      }

      res.status(201).json(ApiResponse.created(results, `Imported ${results.imported} assets`));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get assets by tag
   */
  async getAssetsByTag(req, res, next) {
    try {
      const { tag } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const assets = await Asset.find({
        userId: req.user.id,
        tags: tag,
        status: 'active'
      })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean();

      const total = await Asset.countDocuments({
        userId: req.user.id,
        tags: tag,
        status: 'active'
      });

      res.json(ApiResponse.success({
        assets,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get asset statistics
   */
  async getStatistics(req, res, next) {
    try {
      const stats = await Asset.aggregate([
        { $match: { userId: req.user.id } },
        {
          $facet: {
            byType: [
              { $group: { _id: '$assetType', count: { $sum: 1 } } }
            ],
            byEnvironment: [
              { $group: { _id: '$environment', count: { $sum: 1 } } }
            ],
            byCriticality: [
              { $group: { _id: '$criticality', count: { $sum: 1 } } }
            ],
            byStatus: [
              { $group: { _id: '$status', count: { $sum: 1 } } }
            ],
            riskSummary: [
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  withCriticalVulns: { 
                    $sum: { $cond: [{ $gt: ['$lastScan.vulnerabilities.critical', 0] }, 1, 0] } 
                  },
                  withHighVulns: { 
                    $sum: { $cond: [{ $gt: ['$lastScan.vulnerabilities.high', 0] }, 1, 0] } 
                  },
                  scannedRecently: {
                    $sum: {
                      $cond: [
                        { $gte: ['$lastScan.date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                        1,
                        0
                      ]
                    }
                  }
                }
              }
            ],
            recentlyAdded: [
              { $sort: { createdAt: -1 } },
              { $limit: 5 },
              { $project: { name: 1, assetType: 1, createdAt: 1 } }
            ]
          }
        }
      ]);

      res.json(ApiResponse.success(stats[0]));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all unique tags
   */
  async getTags(req, res, next) {
    try {
      const tags = await Asset.distinct('tags', { userId: req.user.id });
      res.json(ApiResponse.success(tags));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Discover assets from network scan
   */
  async discoverFromScan(req, res, next) {
    try {
      const { scanId } = req.body;
      const VulnScan = require('../models/Scan.model');

      const scan = await VulnScan.findById(scanId);
      if (!scan) {
        throw ApiError.notFound('Scan not found');
      }

      if (scan.userId.toString() !== req.user.id) {
        throw ApiError.forbidden('Access denied');
      }

      // Check if asset already exists
      let asset = await Asset.findOne({
        userId: req.user.id,
        $or: [
          { 'target.hostname': scan.targetIdentifier },
          { 'target.ipAddress': scan.targetIdentifier },
          { 'target.url': scan.targetIdentifier }
        ]
      });

      if (!asset) {
        // Create new asset from scan
        const assetId = `ASSET-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        asset = new Asset({
          userId: req.user.id,
          assetId,
          name: scan.targetIdentifier,
          assetType: scan.targetType,
          target: {
            [scan.targetType === 'host' ? 'hostname' : 'url']: scan.targetIdentifier
          },
          discoveredBy: {
            method: 'network_scan',
            source: scanId,
            date: new Date()
          }
        });
      }

      // Update from scan results
      await asset.updateFromScan(scan);

      res.json(ApiResponse.success(asset, 'Asset discovered and updated from scan'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AssetController();
