// Central export point for all BugBountyAI controllers
const submissionController = require('./submissionController');
const researcherController = require('./researcherController');
const rewardController = require('./rewardController');
const analyticsController = require('./analyticsController');

module.exports = {
  submissionController,
  researcherController,
  rewardController,
  analyticsController
};
