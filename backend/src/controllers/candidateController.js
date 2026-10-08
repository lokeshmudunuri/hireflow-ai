const candidateService = require('../services/candidateService');

const getCandidates = async (req, res, next) => {
  try {
    const result = await candidateService.getCandidates(req.query);
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
};

const getCandidateById = async (req, res, next) => {
  try {
    const candidate = await candidateService.getCandidateById(req.params.id);
    res.json({
      success: true,
      candidate
    });
  } catch (err) {
    next(err);
  }
};

const createCandidate = async (req, res, next) => {
  try {
    const candidate = await candidateService.createCandidate(req.body);
    res.status(201).json({
      success: true,
      message: 'Candidate profile created successfully',
      candidate
    });
  } catch (err) {
    next(err);
  }
};

const addCandidateNote = async (req, res, next) => {
  try {
    const { note, applicationId } = req.body;
    if (!note || !note.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Note text cannot be empty'
      });
    }

    const createdNote = await candidateService.addCandidateNote(req.params.id, {
      note,
      applicationId,
      authorId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Recruiter note added',
      note: createdNote
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCandidates,
  getCandidateById,
  createCandidate,
  addCandidateNote
};
