const { Op } = require('sequelize');
const { Candidate, Skill, CandidateSkill, Resume, RecruiterNote, Application, Job, User } = require('../models');

async function getCandidates({ search = '', limit = 20, page = 1 } = {}) {
  const parsedLimit = Math.max(1, parseInt(limit, 10));
  const offset = (Math.max(1, parseInt(page, 10)) - 1) * parsedLimit;

  const where = {};
  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    where[Op.or] = [
      { firstName: { [Op.like]: term } },
      { lastName: { [Op.like]: term } },
      { email: { [Op.like]: term } },
      { headline: { [Op.like]: term } },
      { location: { [Op.like]: term } }
    ];
  }

  const { count, rows } = await Candidate.findAndCountAll({
    where,
    include: [
      {
        model: Skill,
        as: 'skills',
        through: { attributes: ['yearsOfExperience', 'proficiencyLevel'] }
      },
      {
        model: Resume,
        as: 'resumes',
        limit: 1
      },
      {
        model: Application,
        as: 'applications',
        include: [{ model: Job, as: 'job', attributes: ['id', 'title', 'department'] }]
      }
    ],
    order: [['createdAt', 'DESC']],
    limit: parsedLimit,
    offset,
    distinct: true
  });

  return {
    candidates: rows,
    pagination: {
      total: count,
      page: parseInt(page, 10),
      limit: parsedLimit,
      totalPages: Math.ceil(count / parsedLimit)
    }
  };
}

async function getCandidateById(id) {
  const candidate = await Candidate.findByPk(id, {
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
        model: Application,
        as: 'applications',
        include: [{ model: Job, as: 'job' }]
      },
      {
        model: RecruiterNote,
        as: 'notes',
        include: [{ model: User, as: 'author', attributes: ['id', 'name', 'role'] }],
        order: [['createdAt', 'DESC']]
      }
    ]
  });

  if (!candidate) {
    throw new Error(`Candidate with ID ${id} not found`);
  }

  return candidate;
}

async function createCandidate(data) {
  const candidate = await Candidate.create(data);

  if (Array.isArray(data.skills)) {
    for (const skillName of data.skills) {
      const [skill] = await Skill.findOrCreate({
        where: { name: skillName },
        defaults: { name: skillName, category: 'Technical' }
      });
      await CandidateSkill.create({
        candidateId: candidate.id,
        skillId: skill.id,
        proficiencyLevel: 'Intermediate',
        yearsOfExperience: data.yearsOfExperience || 1
      });
    }
  }

  return getCandidateById(candidate.id);
}

async function addCandidateNote(candidateId, { note, applicationId, authorId }) {
  return RecruiterNote.create({
    candidateId,
    applicationId: applicationId || null,
    authorId,
    note
  });
}

module.exports = {
  getCandidates,
  getCandidateById,
  createCandidate,
  addCandidateNote
};
