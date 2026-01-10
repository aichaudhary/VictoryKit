// Central export point for all ISO27001 controllers
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
