const { Op } = require('sequelize');
const {
  Application,
  Candidate,
  Job,
  Skill,
  CandidateSkill,
  Resume,
  ApplicationStatusHistory,
  Interview,
  InterviewFeedback,
  RecruiterNote,
  User,
  sequelize
} = require('../models');
const { calculateCandidateScore } = require('./scoringService');
const { transitionApplicationState } = require('./stateMachineService');

/**
 * Create a new application
 */
async function createApplication({ jobId, candidateId, userId }) {
  const candidate = await Candidate.findByPk(candidateId, {
    include: [{ model: Skill, as: 'skills' }]
  });
  if (!candidate) {
    throw new Error(`Candidate with ID ${candidateId} not found`);
  }

  const job = await Job.findByPk(jobId);
  if (!job) {
    throw new Error(`Job with ID ${jobId} not found`);
  }

  const scoringResult = calculateCandidateScore(candidate, job, candidate.skills || []);

  const application = await Application.create({
    jobId,
    candidateId,
    status: 'APPLIED',
    score: scoringResult.totalScore,
    scoreBreakdown: scoringResult.breakdown,
    appliedAt: new Date()
  });

  await ApplicationStatusHistory.create({
    applicationId: application.id,
    previousStatus: null,
    newStatus: 'APPLIED',
    changedById: userId || null,
    reason: 'Application submitted'
  });

  return getApplicationById(application.id);
}

/**
 * Fetch paginated applications with search, filtering, and sorting
 */
async function getApplications({
  page = 1,
  limit = 20,
  search = '',
  status = '',
  jobId = '',
  minExp = '',
  maxExp = '',
  skill = '',
  sortBy = 'appliedAt',
  sortOrder = 'DESC'
}) {
  const offset = (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));
  const parsedLimit = Math.max(1, parseInt(limit, 10));

  const applicationWhere = {};
  const candidateWhere = {};
  const jobWhere = {};

  // Status filter
  if (status && status !== 'ALL') {
    applicationWhere.status = status;
  }

  // Job filter
  if (jobId && jobId !== 'ALL') {
    applicationWhere.jobId = parseInt(jobId, 10);
  }

  // Experience filter
  if (minExp !== '' || maxExp !== '') {
    candidateWhere.yearsOfExperience = {};
    if (minExp !== '') candidateWhere.yearsOfExperience[Op.gte] = parseFloat(minExp);
    if (maxExp !== '') candidateWhere.yearsOfExperience[Op.lte] = parseFloat(maxExp);
  }

  // Search filter across candidate name, email, job title
  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    candidateWhere[Op.or] = [
      { firstName: { [Op.like]: term } },
      { lastName: { [Op.like]: term } },
      { email: { [Op.like]: term } },
      { headline: { [Op.like]: term } }
    ];
  }

  // Sorting
  const order = [];
  const allowedSortFields = ['appliedAt', 'score', 'status', 'createdAt'];
  const validSort = allowedSortFields.includes(sortBy) ? sortBy : 'appliedAt';
  const validDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  order.push([validSort, validDirection]);

  // Skill filter include
  const candidateInclude = [
    {
      model: Skill,
      as: 'skills',
      through: { attributes: ['yearsOfExperience', 'proficiencyLevel'] },
      ...(skill && skill !== 'ALL' ? { where: { name: { [Op.like]: `%${skill}%` } } } : { required: false })
    },
    {
      model: Resume,
      as: 'resumes',
      limit: 1
    }
  ];

  const { count, rows } = await Application.findAndCountAll({
    where: applicationWhere,
    include: [
      {
        model: Candidate,
        as: 'candidate',
        where: candidateWhere,
        include: candidateInclude
      },
      {
        model: Job,
        as: 'job',
        where: jobWhere,
        attributes: ['id', 'title', 'department', 'experienceRequirement', 'qualification', 'requiredSkills']
      },
      {
        model: User,
        as: 'validator',
        attributes: ['id', 'name', 'email']
      }
    ],
    order,
    limit: parsedLimit,
    offset,
    distinct: true
  });

  return {
    applications: rows,
    pagination: {
      total: count,
      page: parseInt(page, 10),
      limit: parsedLimit,
      totalPages: Math.ceil(count / parsedLimit)
    }
  };
}

/**
 * Get detailed application by ID with complete candidate profile, scoring, history, and interviews
 */
async function getApplicationById(id) {
  const application = await Application.findByPk(id, {
    include: [
      {
        model: Candidate,
        as: 'candidate',
        include: [
          {
            model: Skill,
            as: 'skills',
            through: { attributes: ['yearsOfExperience', 'proficiencyLevel'] }
          },
          {
            model: Resume,
            as: 'resumes'
          },
          {
            model: RecruiterNote,
            as: 'notes',
            include: [{ model: User, as: 'author', attributes: ['id', 'name', 'role'] }]
          }
        ]
      },
      {
        model: Job,
        as: 'job'
      },
      {
        model: User,
        as: 'validator',
        attributes: ['id', 'name', 'email']
      },
      {
        model: ApplicationStatusHistory,
        as: 'statusHistory',
        include: [{ model: User, as: 'changedBy', attributes: ['id', 'name', 'role'] }],
        order: [['createdAt', 'ASC']]
      },
      {
        model: Interview,
        as: 'interviews',
        include: [
          { model: User, as: 'interviewer', attributes: ['id', 'name', 'email'] },
          { model: InterviewFeedback, as: 'feedback' }
        ]
      },
      {
        model: RecruiterNote,
        as: 'notes',
        include: [{ model: User, as: 'author', attributes: ['id', 'name', 'role'] }]
      }
    ]
  });

  return application;
}

/**
 * Validate application and calculate score
 */
async function validateApplication(applicationId, {
  checklist,
  validationNotes,
  decision, // 'VALIDATED', 'MORE_INFO', 'REJECTED'
  userId
}) {
  const application = await getApplicationById(applicationId);
  if (!application) {
    throw new Error(`Application with ID ${applicationId} not found`);
  }

  // Update checklist and validation status
  const updatedChecklist = {
    ...application.validationChecklist,
    ...checklist
  };

  application.validationChecklist = updatedChecklist;
  application.validationNotes = validationNotes || application.validationNotes;
  application.isValidated = decision === 'VALIDATED';
  application.validatedById = userId;
  application.validatedAt = new Date();

  // Recalculate score deterministically
  const scoreResult = calculateCandidateScore(
    application.candidate,
    application.job,
    application.candidate.skills
  );

  application.score = scoreResult.totalScore;
  application.scoreBreakdown = scoreResult.breakdown;

  await application.save();

  // Handle status transition based on validation decision
  let targetStatus = application.status;
  if (decision === 'VALIDATED') {
    targetStatus = 'VALIDATED';
  } else if (decision === 'REJECTED') {
    targetStatus = 'REJECTED';
  } else if (decision === 'MORE_INFO') {
    targetStatus = 'HOLD';
  }

  if (targetStatus !== application.status) {
    await transitionApplicationState(
      application.id,
      targetStatus,
      userId,
      `Validation Result: ${decision}. ${validationNotes || ''}`
    );
  }

  return getApplicationById(applicationId);
}

/**
 * Recalculate candidate score for an application
 */
async function recalculateScore(applicationId) {
  const application = await getApplicationById(applicationId);
  if (!application) {
    throw new Error('Application not found');
  }

  const scoreResult = calculateCandidateScore(
    application.candidate,
    application.job,
    application.candidate.skills
  );

  application.score = scoreResult.totalScore;
  application.scoreBreakdown = scoreResult.breakdown;
  await application.save();

  return {
    score: application.score,
    scoreBreakdown: application.scoreBreakdown
  };
}

/**
 * Bulk transition applications with safeguards
 */
async function bulkUpdateStatus(applicationIds, targetStatus, userId, reason) {
  if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
    throw new Error('Application IDs array is required');
  }

  const results = {
    successful: [],
    failed: []
  };

  for (const id of applicationIds) {
    try {
      await transitionApplicationState(id, targetStatus, userId, reason || `Bulk update to ${targetStatus}`);
      results.successful.push(id);
    } catch (err) {
      results.failed.push({ id, error: err.message });
    }
  }

  return results;
}

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  validateApplication,
  recalculateScore,
  bulkUpdateStatus
};
