const decisionService = require('../services/decisionService');

const makeFinalDecision = async (req, res, next) => {
  try {
    const { decision, reason, notes, comments } = req.body;
    const application = await decisionService.makeFinalDecision(req.params.applicationId, {
      decision,
      reason: reason || comments || `Final decision made: ${decision}`,
      notes: notes || comments,
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
