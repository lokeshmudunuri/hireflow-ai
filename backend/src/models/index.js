const { sequelize } = require('../config/database');
const User = require('./User');
const Recruiter = require('./Recruiter');
const Interviewer = require('./Interviewer');
const Job = require('./Job');
const Candidate = require('./Candidate');
const Skill = require('./Skill');
const CandidateSkill = require('./CandidateSkill');
const Resume = require('./Resume');
const Application = require('./Application');
const ApplicationStatusHistory = require('./ApplicationStatusHistory');
const Interview = require('./Interview');
const InterviewFeedback = require('./InterviewFeedback');
const RecruiterNote = require('./RecruiterNote');
const Notification = require('./Notification');

// User Relationships
User.hasOne(Recruiter, { foreignKey: 'userId', as: 'recruiterProfile', onDelete: 'CASCADE' });
Recruiter.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Interviewer, { foreignKey: 'userId', as: 'interviewerProfile', onDelete: 'CASCADE' });
Interviewer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Job, { foreignKey: 'createdById', as: 'jobsCreated' });
Job.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

User.hasMany(Application, { foreignKey: 'validatedById', as: 'validatedApplications' });
Application.belongsTo(User, { foreignKey: 'validatedById', as: 'validator' });

User.hasMany(Interview, { foreignKey: 'interviewerId', as: 'assignedInterviews' });
Interview.belongsTo(User, { foreignKey: 'interviewerId', as: 'interviewer' });

User.hasMany(Interview, { foreignKey: 'scheduledById', as: 'scheduledInterviews' });
Interview.belongsTo(User, { foreignKey: 'scheduledById', as: 'scheduler' });

User.hasMany(InterviewFeedback, { foreignKey: 'interviewerId', as: 'givenFeedbacks' });
InterviewFeedback.belongsTo(User, { foreignKey: 'interviewerId', as: 'interviewer' });

User.hasMany(ApplicationStatusHistory, { foreignKey: 'changedById', as: 'statusChanges' });
ApplicationStatusHistory.belongsTo(User, { foreignKey: 'changedById', as: 'changedBy' });

User.hasMany(RecruiterNote, { foreignKey: 'authorId', as: 'authoredNotes' });
RecruiterNote.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Job & Candidate & Application Relationships
Job.hasMany(Application, { foreignKey: 'jobId', as: 'applications', onDelete: 'CASCADE' });
Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

Candidate.hasMany(Application, { foreignKey: 'candidateId', as: 'applications', onDelete: 'CASCADE' });
Application.belongsTo(Candidate, { foreignKey: 'candidateId', as: 'candidate' });

Candidate.hasMany(Resume, { foreignKey: 'candidateId', as: 'resumes', onDelete: 'CASCADE' });
Resume.belongsTo(Candidate, { foreignKey: 'candidateId', as: 'candidate' });

// Skills Relationships
Candidate.belongsToMany(Skill, { through: CandidateSkill, foreignKey: 'candidateId', otherKey: 'skillId', as: 'skills' });
Skill.belongsToMany(Candidate, { through: CandidateSkill, foreignKey: 'skillId', otherKey: 'candidateId', as: 'candidates' });
Candidate.hasMany(CandidateSkill, { foreignKey: 'candidateId', as: 'candidateSkills', onDelete: 'CASCADE' });
CandidateSkill.belongsTo(Candidate, { foreignKey: 'candidateId', as: 'candidate' });
Skill.hasMany(CandidateSkill, { foreignKey: 'skillId', as: 'candidateSkills', onDelete: 'CASCADE' });
CandidateSkill.belongsTo(Skill, { foreignKey: 'skillId', as: 'skill' });

// Application Sub-Entities
Application.hasMany(ApplicationStatusHistory, { foreignKey: 'applicationId', as: 'statusHistory', onDelete: 'CASCADE' });
ApplicationStatusHistory.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });

Application.hasMany(Interview, { foreignKey: 'applicationId', as: 'interviews', onDelete: 'CASCADE' });
Interview.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });

Application.hasMany(InterviewFeedback, { foreignKey: 'applicationId', as: 'feedbacks', onDelete: 'CASCADE' });
InterviewFeedback.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });

Application.hasMany(RecruiterNote, { foreignKey: 'applicationId', as: 'notes', onDelete: 'SET NULL' });
RecruiterNote.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });

Candidate.hasMany(RecruiterNote, { foreignKey: 'candidateId', as: 'notes', onDelete: 'CASCADE' });
RecruiterNote.belongsTo(Candidate, { foreignKey: 'candidateId', as: 'candidate' });

Interview.hasOne(InterviewFeedback, { foreignKey: 'interviewId', as: 'feedback', onDelete: 'CASCADE' });
InterviewFeedback.belongsTo(Interview, { foreignKey: 'interviewId', as: 'interview' });

module.exports = {
  sequelize,
  User,
  Recruiter,
  Interviewer,
  Job,
  Candidate,
  Skill,
  CandidateSkill,
  Resume,
  Application,
  ApplicationStatusHistory,
  Interview,
  InterviewFeedback,
  RecruiterNote,
  Notification
};
