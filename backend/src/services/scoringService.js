/**
 * Deterministic and Explainable Candidate Scoring Engine
 * Total: 100 Points
 *
 * Breakdown:
 * - Education: max 20 points
 * - Experience: max 20 points
 * - Required Skills: max 20 points
 * - Projects: max 20 points
 * - Certifications: max 10 points
 * - Profile/Resume Completeness: max 10 points
 *
 * NOTE: This is a purely algorithmic, explainable scoring system without opaque AI.
 */

function calculateCandidateScore(candidate, job, candidateSkills = []) {
  const breakdown = {
    education: { score: 0, max: 20, details: '' },
    experience: { score: 0, max: 20, details: '' },
    skills: { score: 0, max: 20, details: '' },
    projects: { score: 0, max: 20, details: '' },
    certifications: { score: 0, max: 10, details: '' },
    completeness: { score: 0, max: 10, details: '' }
  };

  // 1. Education Scoring (Max 20)
  const eduLevel = (candidate.educationLevel || '').toLowerCase();
  let eduScore = 12; // Base for diploma/other
  if (eduLevel.includes('phd') || eduLevel.includes('doctorate')) {
    eduScore = 20;
  } else if (eduLevel.includes('master')) {
    eduScore = 18;
  } else if (eduLevel.includes('bachelor')) {
    eduScore = 15;
  } else if (eduLevel.includes('associate')) {
    eduScore = 13;
  }

  // Bonus if candidate qualification matches or exceeds requirement
  const jobQual = (job?.qualification || '').toLowerCase();
  if (jobQual && eduLevel && (eduLevel.includes(jobQual) || (eduScore >= 15 && jobQual.includes('bachelor')))) {
    eduScore = Math.min(20, eduScore + 2);
  }
  breakdown.education.score = eduScore;
  breakdown.education.details = `${candidate.educationLevel || 'Degree'} in ${candidate.educationMajor || 'Major unspecified'} (${candidate.educationInstitution || 'University unspecified'})`;

  // 2. Experience Scoring (Max 20)
  const candidateExp = Number(candidate.yearsOfExperience) || 0;
  const reqExp = Number(job?.experienceRequirement) || 0;

  let expScore = 0;
  if (reqExp === 0) {
    expScore = Math.min(20, Math.round(candidateExp * 4) + 10);
  } else {
    const ratio = candidateExp / reqExp;
    if (ratio >= 1.5) {
      expScore = 20;
    } else if (ratio >= 1.0) {
      expScore = 18;
    } else if (ratio >= 0.75) {
      expScore = 14;
    } else if (ratio >= 0.5) {
      expScore = 10;
    } else {
      expScore = Math.max(4, Math.round(ratio * 15));
    }
  }
  breakdown.experience.score = Math.min(20, expScore);
  breakdown.experience.details = `${candidateExp} yrs total professional experience vs ${reqExp} yrs required for ${job?.title || 'Role'}`;

  // 3. Required Skills Scoring (Max 20)
  const requiredSkills = Array.isArray(job?.requiredSkills) 
    ? job.requiredSkills 
    : (typeof job?.requiredSkills === 'string' ? JSON.parse(job.requiredSkills || '[]') : []);

  // Candidate skill names collection
  const candidateSkillNames = new Set(
    (candidateSkills || []).map(s => (s.name || s.skill?.name || '').toLowerCase().trim())
  );

  let matchedSkills = [];
  let unmatchedSkills = [];

  if (requiredSkills.length === 0) {
    breakdown.skills.score = 18;
    breakdown.skills.details = 'No specific required skills listed; evaluated general tech profile';
  } else {
    requiredSkills.forEach(reqSkill => {
      const normalizedReq = reqSkill.toLowerCase().trim();
      const isMatched = Array.from(candidateSkillNames).some(cSkill => 
        cSkill === normalizedReq || cSkill.includes(normalizedReq) || normalizedReq.includes(cSkill)
      );
      if (isMatched) {
        matchedSkills.push(reqSkill);
      } else {
        unmatchedSkills.push(reqSkill);
      }
    });

    const matchRatio = matchedSkills.length / requiredSkills.length;
    breakdown.skills.score = Math.round(matchRatio * 20);
    breakdown.skills.details = `Matched ${matchedSkills.length} of ${requiredSkills.length} required skills (${matchedSkills.join(', ') || 'None'})`;
  }

  // 4. Projects Scoring (Max 20)
  const projects = Array.isArray(candidate.projects)
    ? candidate.projects
    : (typeof candidate.projects === 'string' ? JSON.parse(candidate.projects || '[]') : []);

  let projectScore = 0;
  if (projects.length >= 3) {
    projectScore = 20;
  } else if (projects.length === 2) {
    projectScore = 16;
  } else if (projects.length === 1) {
    projectScore = 10;
  } else {
    projectScore = 0;
  }
  breakdown.projects.score = projectScore;
  breakdown.projects.details = `${projects.length} portfolio/production project(s) documented with architecture breakdown`;

  // 5. Certifications Scoring (Max 10)
  const certs = Array.isArray(candidate.certifications)
    ? candidate.certifications
    : (typeof candidate.certifications === 'string' ? JSON.parse(candidate.certifications || '[]') : []);

  let certScore = 0;
  if (certs.length >= 2) {
    certScore = 10;
  } else if (certs.length === 1) {
    certScore = 6;
  } else {
    certScore = 2; // baseline for continuous learning
  }
  breakdown.certifications.score = certScore;
  breakdown.certifications.details = `${certs.length} industry certification(s) verified`;

  // 6. Profile/Resume Completeness (Max 10)
  let completenessScore = 0;
  let completenessItems = [];

  if (candidate.phone) { completenessScore += 2; completenessItems.push('Phone'); }
  if (candidate.linkedinUrl) { completenessScore += 2; completenessItems.push('LinkedIn'); }
  if (candidate.githubUrl || candidate.portfolioUrl) { completenessScore += 2; completenessItems.push('Github/Portfolio'); }
  if (candidate.summary && candidate.summary.length > 20) { completenessScore += 2; completenessItems.push('Professional Summary'); }
  if (candidate.headline) { completenessScore += 2; completenessItems.push('Headline'); }

  breakdown.completeness.score = Math.min(10, completenessScore);
  breakdown.completeness.details = `Verified: ${completenessItems.join(', ') || 'Basic Profile'}`;

  // Sum total score (0 to 100)
  const totalScore = breakdown.education.score +
    breakdown.experience.score +
    breakdown.skills.score +
    breakdown.projects.score +
    breakdown.certifications.score +
    breakdown.completeness.score;

  return {
    totalScore: Math.min(100, Math.max(0, totalScore)),
    breakdown
  };
}

module.exports = {
  calculateCandidateScore
};
