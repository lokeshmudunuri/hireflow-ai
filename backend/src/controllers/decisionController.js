const decisionService = require('../services/decisionService');

const makeFinalDecision = async (req, res, next) => {
  try {
    const { decision, reason, notes } = req.body;
    const application = await decisionService.makeFinalDecision(req.params.applicationId, {
      decision,
      reason,
      notes,
      recruiterId: req.user.id
    });

    res.json({
      success: true,
      message: `Final hiring decision recorded: ${decision}`,
      application
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  makeFinalDecision
};
