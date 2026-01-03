/**
 * SecureCode Repository Controller
 * Handles code repository management and GitHub/GitLab integrations
 */

const CodeRepository = require('../models/CodeRepository.model');
const ScanResult = require('../models/ScanResult.model');
const axios = require('axios');

const GITHUB_API = 'https://api.github.com';
const GITLAB_API = 'https://gitlab.com/api/v4';

/**
 * List all repositories
 */
exports.listRepositories = async (req, res) => {
  try {
    const { 
      provider, 
      status,
      limit = 20, 
      offset = 0,
      search 
    } = req.query;

    const filter = {};
    if (provider) filter.provider = provider;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ];
    }

    const [repositories, total] = await Promise.all([
      CodeRepository.find(filter)
        .sort({ lastScanAt: -1, createdAt: -1 })
        .skip(parseInt(offset))
        .limit(parseInt(limit))
        .select('-accessToken'),
      CodeRepository.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        repositories,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('List repositories error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get repository by ID
 */
exports.getRepository = async (req, res) => {
  try {
    const { id } = req.params;

    const repository = await CodeRepository.findById(id)
      .select('-accessToken');

    if (!repository) {
      return res.status(404).json({
        success: false,
        error: 'Repository not found'
      });
    }

    // Get recent scans
    const recentScans = await ScanResult.find({ repository: id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('scanType status securityScore summary createdAt');

    res.json({
      success: true,
      data: {
        repository,
        recentScans
      }
    });

  } catch (error) {
    console.error('Get repository error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Add a new repository
 */
exports.addRepository = async (req, res) => {
  try {
    const {
      name,
      fullName,
      url,
      provider,
      defaultBranch,
      accessToken,
      webhookSecret,
      scanSettings
    } = req.body;

    if (!name || !url || !provider) {
      return res.status(400).json({
        success: false,
        error: 'name, url, and provider are required'
      });
    }

    // Check if repository already exists
    const existing = await CodeRepository.findOne({ url });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Repository already registered'
      });
    }

    // Validate access by trying to fetch repo info
    let repoInfo = null;
    if (accessToken) {
      try {
        repoInfo = await fetchRepositoryInfo(provider, fullName || name, accessToken);
      } catch (fetchError) {
        console.warn('Could not fetch repository info:', fetchError.message);
      }
    }

    const repository = new CodeRepository({
      name,
      fullName: fullName || name,
      url,
      provider,
      defaultBranch: defaultBranch || repoInfo?.default_branch || 'main',
      accessToken,
      webhookSecret,
      scanSettings: {
        autoScan: scanSettings?.autoScan ?? true,
        scanOnPush: scanSettings?.scanOnPush ?? true,
        scanOnPR: scanSettings?.scanOnPR ?? true,
        scanSchedule: scanSettings?.scanSchedule || 'daily',
        enabledScanners: scanSettings?.enabledScanners || ['sast', 'secrets', 'dependencies'],
        excludePaths: scanSettings?.excludePaths || ['node_modules/**', 'vendor/**', 'dist/**'],
        ...scanSettings
      },
      metadata: {
        language: repoInfo?.language,
        stars: repoInfo?.stargazers_count,
        forks: repoInfo?.forks_count,
        isPrivate: repoInfo?.private ?? true
      },
      status: 'active',
      addedBy: req.user?.id
    });

    await repository.save();

    // Return without sensitive data
    const responseRepo = repository.toObject();
    delete responseRepo.accessToken;

    res.status(201).json({
      success: true,
      data: responseRepo
    });

  } catch (error) {
    console.error('Add repository error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Update repository settings
 */
exports.updateRepository = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating certain fields
    delete updates._id;
    delete updates.createdAt;

    const repository = await CodeRepository.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-accessToken');

    if (!repository) {
      return res.status(404).json({
        success: false,
        error: 'Repository not found'
      });
    }

    res.json({
      success: true,
      data: repository
    });

  } catch (error) {
    console.error('Update repository error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Delete repository
 */
exports.deleteRepository = async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteScans } = req.query;

    const repository = await CodeRepository.findByIdAndDelete(id);

    if (!repository) {
      return res.status(404).json({
        success: false,
        error: 'Repository not found'
      });
    }

    // Optionally delete associated scans
    if (deleteScans === 'true') {
      await ScanResult.deleteMany({ repository: id });
    }

    res.json({
      success: true,
      message: 'Repository deleted successfully'
    });

  } catch (error) {
    console.error('Delete repository error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Sync repository from GitHub/GitLab
 */
exports.syncRepository = async (req, res) => {
  try {
    const { id } = req.params;

    const repository = await CodeRepository.findById(id);

    if (!repository) {
      return res.status(404).json({
        success: false,
        error: 'Repository not found'
      });
    }

    if (!repository.accessToken) {
      return res.status(400).json({
        success: false,
        error: 'No access token configured for this repository'
      });
    }

    // Fetch latest info from provider
    const repoInfo = await fetchRepositoryInfo(
      repository.provider,
      repository.fullName,
      repository.accessToken
    );

    // Update repository metadata
    repository.metadata = {
      ...repository.metadata,
      language: repoInfo.language,
      stars: repoInfo.stargazers_count || repoInfo.star_count,
      forks: repoInfo.forks_count || repoInfo.forks_count,
      isPrivate: repoInfo.private || repoInfo.visibility === 'private',
      lastCommit: repoInfo.pushed_at || repoInfo.last_activity_at,
      size: repoInfo.size
    };
    repository.defaultBranch = repoInfo.default_branch || repository.defaultBranch;
    repository.lastSyncAt = new Date();

    await repository.save();

    const responseRepo = repository.toObject();
    delete responseRepo.accessToken;

    res.json({
      success: true,
      data: responseRepo
    });

  } catch (error) {
    console.error('Sync repository error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get repository files/tree
 */
exports.getRepositoryFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const { path = '', branch } = req.query;

    const repository = await CodeRepository.findById(id);

    if (!repository) {
      return res.status(404).json({
        success: false,
        error: 'Repository not found'
      });
    }

    const targetBranch = branch || repository.defaultBranch;
    const files = await fetchRepositoryTree(
      repository.provider,
      repository.fullName,
      repository.accessToken,
      targetBranch,
      path
    );

    res.json({
      success: true,
      data: {
        path,
        branch: targetBranch,
        files
      }
    });

  } catch (error) {
    console.error('Get repository files error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get file content from repository
 */
exports.getFileContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { path, branch } = req.query;

    if (!path) {
      return res.status(400).json({
        success: false,
        error: 'File path is required'
      });
    }

    const repository = await CodeRepository.findById(id);

    if (!repository) {
      return res.status(404).json({
        success: false,
        error: 'Repository not found'
      });
    }

    const targetBranch = branch || repository.defaultBranch;
    const content = await fetchFileContent(
      repository.provider,
      repository.fullName,
      repository.accessToken,
      targetBranch,
      path
    );

    res.json({
      success: true,
      data: {
        path,
        branch: targetBranch,
        content,
        language: detectLanguageFromPath(path)
      }
    });

  } catch (error) {
    console.error('Get file content error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Import repositories from GitHub account
 */
exports.importFromGitHub = async (req, res) => {
  try {
    const { accessToken, filter } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: 'GitHub access token is required'
      });
    }

    // Fetch user's repositories
    const response = await axios.get(`${GITHUB_API}/user/repos`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        per_page: 100,
        sort: 'updated',
        type: filter?.type || 'all'
      }
    });

    const repositories = response.data.map(repo => ({
      name: repo.name,
      fullName: repo.full_name,
      url: repo.clone_url,
      htmlUrl: repo.html_url,
      provider: 'github',
      defaultBranch: repo.default_branch,
      language: repo.language,
      isPrivate: repo.private,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      updatedAt: repo.updated_at
    }));

    res.json({
      success: true,
      data: {
        repositories,
        total: repositories.length
      }
    });

  } catch (error) {
    console.error('Import from GitHub error:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message
    });
  }
};

/**
 * Handle webhook from GitHub/GitLab
 */
exports.handleWebhook = async (req, res) => {
  try {
    const { provider } = req.params;
    const event = req.headers['x-github-event'] || req.headers['x-gitlab-event'];
    const payload = req.body;

    console.log(`Received ${provider} webhook: ${event}`);

    // Find repository
    let repoFullName;
    if (provider === 'github') {
      repoFullName = payload.repository?.full_name;
    } else if (provider === 'gitlab') {
      repoFullName = payload.project?.path_with_namespace;
    }

    if (!repoFullName) {
      return res.status(400).json({
        success: false,
        error: 'Could not determine repository from webhook'
      });
    }

    const repository = await CodeRepository.findOne({
      fullName: repoFullName,
      provider
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        error: 'Repository not registered'
      });
    }

    // Determine action based on event type
    let shouldScan = false;
    let scanReason = '';

    if (provider === 'github') {
      if (event === 'push' && repository.scanSettings?.scanOnPush) {
        shouldScan = true;
        scanReason = `Push to ${payload.ref}`;
      } else if (event === 'pull_request' && repository.scanSettings?.scanOnPR) {
        shouldScan = payload.action === 'opened' || payload.action === 'synchronize';
        scanReason = `PR #${payload.pull_request?.number}`;
      }
    } else if (provider === 'gitlab') {
      if (event === 'Push Hook' && repository.scanSettings?.scanOnPush) {
        shouldScan = true;
        scanReason = `Push to ${payload.ref}`;
      } else if (event === 'Merge Request Hook' && repository.scanSettings?.scanOnPR) {
        shouldScan = payload.object_attributes?.state === 'opened';
        scanReason = `MR !${payload.object_attributes?.iid}`;
      }
    }

    if (shouldScan) {
      // Queue scan (in production, use a proper job queue)
      console.log(`Queueing scan for ${repoFullName}: ${scanReason}`);
      // TODO: Trigger async scan
    }

    res.json({
      success: true,
      message: shouldScan ? `Scan queued: ${scanReason}` : 'Webhook received, no action taken'
    });

  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get repository statistics
 */
exports.getRepositoryStats = async (req, res) => {
  try {
    const { id } = req.params;

    const [repository, scanStats] = await Promise.all([
      CodeRepository.findById(id).select('-accessToken'),
      ScanResult.aggregate([
        { $match: { repository: require('mongoose').Types.ObjectId(id) } },
        {
          $group: {
            _id: null,
            totalScans: { $sum: 1 },
            avgScore: { $avg: '$securityScore' },
            totalFindings: { $sum: '$summary.totalFindings' },
            criticalFindings: { $sum: '$summary.critical' },
            lastScan: { $max: '$createdAt' }
          }
        }
      ])
    ]);

    if (!repository) {
      return res.status(404).json({
        success: false,
        error: 'Repository not found'
      });
    }

    const stats = scanStats[0] || {
      totalScans: 0,
      avgScore: 0,
      totalFindings: 0,
      criticalFindings: 0,
      lastScan: null
    };

    // Get score trend (last 10 scans)
    const scoreTrend = await ScanResult.find({ repository: id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('securityScore createdAt');

    res.json({
      success: true,
      data: {
        repository,
        stats: {
          ...stats,
          avgScore: Math.round(stats.avgScore || 0)
        },
        scoreTrend: scoreTrend.reverse()
      }
    });

  } catch (error) {
    console.error('Get repository stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Helper functions

async function fetchRepositoryInfo(provider, fullName, accessToken) {
  if (provider === 'github') {
    const response = await axios.get(`${GITHUB_API}/repos/${fullName}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    return response.data;
  } else if (provider === 'gitlab') {
    const encodedPath = encodeURIComponent(fullName);
    const response = await axios.get(`${GITLAB_API}/projects/${encodedPath}`, {
      headers: {
        'PRIVATE-TOKEN': accessToken
      }
    });
    return response.data;
  }
  throw new Error(`Unsupported provider: ${provider}`);
}

async function fetchRepositoryTree(provider, fullName, accessToken, branch, path) {
  if (provider === 'github') {
    const treePath = path ? `${branch}:${path}` : branch;
    const response = await axios.get(
      `${GITHUB_API}/repos/${fullName}/git/trees/${branch}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    return response.data.tree.map(item => ({
      name: item.path,
      type: item.type === 'tree' ? 'directory' : 'file',
      size: item.size,
      sha: item.sha
    }));
  } else if (provider === 'gitlab') {
    const encodedPath = encodeURIComponent(fullName);
    const response = await axios.get(
      `${GITLAB_API}/projects/${encodedPath}/repository/tree`,
      {
        headers: {
          'PRIVATE-TOKEN': accessToken
        },
        params: {
          ref: branch,
          path: path || ''
        }
      }
    );
    return response.data.map(item => ({
      name: item.name,
      type: item.type,
      path: item.path,
      id: item.id
    }));
  }
  throw new Error(`Unsupported provider: ${provider}`);
}

async function fetchFileContent(provider, fullName, accessToken, branch, path) {
  if (provider === 'github') {
    const response = await axios.get(
      `${GITHUB_API}/repos/${fullName}/contents/${path}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        params: { ref: branch }
      }
    );
    return Buffer.from(response.data.content, 'base64').toString('utf-8');
  } else if (provider === 'gitlab') {
    const encodedPath = encodeURIComponent(fullName);
    const encodedFilePath = encodeURIComponent(path);
    const response = await axios.get(
      `${GITLAB_API}/projects/${encodedPath}/repository/files/${encodedFilePath}/raw`,
      {
        headers: {
          'PRIVATE-TOKEN': accessToken
        },
        params: { ref: branch }
      }
    );
    return response.data;
  }
  throw new Error(`Unsupported provider: ${provider}`);
}

function detectLanguageFromPath(path) {
  const ext = path.split('.').pop()?.toLowerCase();
  const langMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'go': 'go',
    'rb': 'ruby',
    'php': 'php',
    'cs': 'csharp',
    'c': 'c',
    'cpp': 'cpp',
    'rs': 'rust'
  };
  return langMap[ext] || 'plaintext';
}

module.exports = exports;
