const { sequelize, connectDB } = require('../config/database');
const {
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
} = require('../models');
const { calculateCandidateScore } = require('../services/scoringService');

async function seed() {
  console.log('--- Starting HireFlow Database Seeding ---');
  try {
    await connectDB();
    await sequelize.sync({ force: true });
    console.log('Database tables cleared and resynced.');

    // 1. Create Users
    console.log('Creating users...');
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@hireflow.dev',
      password: 'Password123!',
      role: 'admin',
      department: 'HR Operations',
      phone: '+91 98100 00001'
    });

    const recruiter1 = await User.create({
      name: 'Sarah Jenkins',
      email: 'recruiter@hireflow.dev',
      password: 'Password123!',
      role: 'recruiter',
      department: 'Talent Acquisition',
      phone: '+91 98100 00002'
    });
    await Recruiter.create({
      userId: recruiter1.id,
      title: 'Lead Technical Recruiter',
      department: 'Engineering & Platform Hiring',
      assignedTeam: 'Core Infrastructure & Frontend'
    });

    const recruiter2 = await User.create({
      name: 'Arjun Nair',
      email: 'arjun.recruiter@hireflow.dev',
      password: 'Password123!',
      role: 'recruiter',
      department: 'Talent Acquisition',
      phone: '+91 98100 00003'
    });
    await Recruiter.create({
      userId: recruiter2.id,
      title: 'Senior Talent Partner',
      department: 'Product & Design Hiring',
      assignedTeam: 'Product Experience'
    });

    const interviewer1 = await User.create({
      name: 'Alex Rivera',
      email: 'interviewer@hireflow.dev',
      password: 'Password123!',
      role: 'interviewer',
      department: 'Engineering',
      phone: '+91 98100 00004'
    });
    await Interviewer.create({
      userId: interviewer1.id,
      title: 'Staff Software Engineer',
      skills: JSON.stringify(['React', 'Node.js', 'System Design', 'TypeScript', 'MySQL']),
      maxInterviewsPerWeek: 6
    });

    const interviewer2 = await User.create({
      name: 'Dr. Priya Patel',
      email: 'priya.interviewer@hireflow.dev',
      password: 'Password123!',
      role: 'interviewer',
      department: 'Infrastructure',
      phone: '+91 98100 00005'
    });
    await Interviewer.create({
      userId: interviewer2.id,
      title: 'Principal DevOps Architect',
      skills: JSON.stringify(['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD']),
      maxInterviewsPerWeek: 5
    });

    // 2. Create Skills
    console.log('Creating standard skills...');
    const skillList = [
      'React', 'Node.js', 'TypeScript', 'JavaScript', 'MySQL', 'PostgreSQL',
      'Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Linux',
      'Python', 'GraphQL', 'Next.js', 'Express', 'TailwindCSS', 'System Design',
      'Figma', 'UI/UX', 'Product Management', 'Performance Optimization', 'REST APIs'
    ];
    const skillEntities = {};
    for (const s of skillList) {
      skillEntities[s] = await Skill.create({ name: s, category: 'Technical' });
    }

    // 3. Create Job Postings
    console.log('Creating job postings...');
    const jobs = await Job.bulkCreate([
      {
        title: 'Senior Full Stack Engineer (Core Platform)',
        department: 'Engineering',
        location: 'Bengaluru, India (Hybrid)',
        employmentType: 'Full-time',
        experienceRequirement: 5,
        qualification: 'Bachelor in Computer Science / IT',
        requiredSkills: ['React', 'Node.js', 'TypeScript', 'MySQL', 'Docker', 'AWS'],
        salaryRange: '₹34,00,000 - ₹46,00,000',
        hiringManager: 'Siddharth Rao (Engineering Director)',
        description: 'Architect scalable web microservices, real-time candidate processing pipelines, and responsive recruiter workflows handling millions of records.',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        createdById: recruiter1.id
      },
      {
        title: 'Frontend Platform Architect',
        department: 'Engineering',
        location: 'Bengaluru, India / Remote',
        employmentType: 'Full-time',
        experienceRequirement: 6,
        qualification: 'Bachelor in Computer Science',
        requiredSkills: ['React', 'JavaScript', 'TypeScript', 'Performance Optimization'],
        salaryRange: '₹38,00,000 - ₹50,00,000',
        hiringManager: 'Alex Rivera (Staff Architect)',
        description: 'Lead enterprise frontend architecture, build reusable design systems, optimize Core Web Vitals to sub-800ms FCP, and establish robust state pipelines.',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        createdById: recruiter1.id
      },
      {
        title: 'DevOps / Site Reliability Engineer (SRE)',
        department: 'Infrastructure',
        location: 'Hyderabad, India (Hybrid)',
        employmentType: 'Full-time',
        experienceRequirement: 4,
        qualification: 'Bachelor in Information Technology',
        requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Linux'],
        salaryRange: '₹28,00,000 - ₹38,00,000',
        hiringManager: 'Dr. Priya Patel (Principal Architect)',
        description: 'Scale multi-region Kubernetes clusters on AWS, automate Terraform GitOps deployments, and guarantee 99.99% system uptime.',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        createdById: recruiter1.id
      },
      {
        title: 'Backend Microservices Engineer',
        department: 'Engineering',
        location: 'Pune, India (Hybrid)',
        employmentType: 'Full-time',
        experienceRequirement: 3,
        qualification: 'Bachelor in Computer Science',
        requiredSkills: ['Node.js', 'Express', 'MySQL', 'REST APIs', 'TypeScript'],
        salaryRange: '₹22,00,000 - ₹30,00,000',
        hiringManager: 'Sarah Jenkins (Talent Lead)',
        description: 'Implement transactional REST APIs, Sequelize ORM models, audit trails, and resilient caching layers for talent evaluation data.',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        createdById: recruiter1.id
      },
      {
        title: 'Staff Cloud Distributed Systems Architect',
        department: 'Engineering',
        location: 'San Francisco, CA / Remote',
        employmentType: 'Full-time',
        experienceRequirement: 7,
        qualification: 'Master in Computer Science',
        requiredSkills: ['Node.js', 'TypeScript', 'Docker', 'Kubernetes', 'AWS', 'System Design'],
        salaryRange: '$165,000 - $210,000',
        hiringManager: 'Alex Rivera (Staff Architect)',
        description: 'Design global event-driven services, partition-tolerant database clusters, and secure multi-tenant identity microservices.',
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        createdById: recruiter1.id
      },
      {
        title: 'Lead Product Designer (Design Systems)',
        department: 'Design',
        location: 'Gurgaon, India (Hybrid)',
        employmentType: 'Full-time',
        experienceRequirement: 5,
        qualification: 'Bachelor in Design / HCI',
        requiredSkills: ['Figma', 'UI/UX', 'Product Management'],
        salaryRange: '₹26,00,000 - ₹35,00,000',
        hiringManager: 'Arjun Nair (Lead Partner)',
        description: 'Standardize tokens, typography hierarchy, responsive interaction patterns, and recruiter workflow interfaces.',
        deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'CLOSED',
        createdById: recruiter2.id
      }
    ]);

    const [jobFullStack, jobFrontend, jobDevOps, jobBackend, jobStaffCloud, jobDesigner] = jobs;

    // 4. Create Realistic Indian & Global Candidates
    console.log('Creating candidates...');
    const candidateData = [
      {
        firstName: 'Rahul',
        lastName: 'Sharma',
        email: 'rahul.sharma@talent.hireflow.dev',
        phone: '+91 98450 12891',
        location: 'Bengaluru, Karnataka',
        headline: 'Lead Backend Architect | Distributed Systems (ex-Swiggy)',
        educationLevel: 'Master of Technology',
        educationInstitution: 'IIT Delhi',
        educationMajor: 'Computer Science',
        educationYear: 2017,
        yearsOfExperience: 7,
        currentCompany: 'Swiggy Platforms',
        currentTitle: 'Lead Backend Engineer',
        linkedinUrl: 'https://linkedin.com/in/rahul-sharma-ats',
        githubUrl: 'https://github.com/rahul-sharma-backend',
        portfolioUrl: 'https://rahulsharma.tech',
        summary: 'Backend architect with 7+ years building low-latency order dispatch engines and distributed transaction microservices handling 25k+ requests/sec at Swiggy and Flipkart.',
        projects: [
          { name: 'High-Throughput Geohash Dispatcher', tech: 'Node.js, Redis Cluster, Kafka', url: 'https://github.com/rahul-sharma-backend/geohash-dispatch' },
          { name: 'Distributed Transaction Outbox', tech: 'Node.js, PostgreSQL, Docker', url: 'https://github.com/rahul-sharma-backend/outbox-engine' }
        ],
        certifications: [
          { name: 'AWS Certified Solutions Architect - Professional', issuer: 'AWS', year: 2022 },
          { name: 'Certified Kubernetes Administrator (CKA)', issuer: 'Linux Foundation', year: 2023 }
        ],
        skills: ['React', 'Node.js', 'TypeScript', 'MySQL', 'Docker', 'AWS'],
        targetJob: jobFullStack,
        status: 'SELECTED'
      },
      {
        firstName: 'Priya',
        lastName: 'Nair',
        email: 'priya.nair@talent.hireflow.dev',
        phone: '+91 98710 44321',
        location: 'Hyderabad, Telangana',
        headline: 'Senior Frontend Platform Engineer | Design Systems (ex-Razorpay)',
        educationLevel: 'Bachelor of Engineering',
        educationInstitution: 'BITS Pilani',
        educationMajor: 'Computer Science',
        educationYear: 2019,
        yearsOfExperience: 5,
        currentCompany: 'Razorpay Core Checkout',
        currentTitle: 'Senior Frontend Engineer',
        linkedinUrl: 'https://linkedin.com/in/priya-nair-ui',
        githubUrl: 'https://github.com/priyanair-dev',
        portfolioUrl: 'https://priyanair.design',
        summary: 'Frontend engineer specializing in micro-frontends, core web vitals optimization (sub-800ms FCP), accessible component architectures, and TypeScript typing.',
        projects: [
          { name: 'High-Speed Payment Sheet Web SDK', tech: 'React, TypeScript, Rollup, PostCSS', url: 'https://github.com/priyanair-dev/fast-checkout' },
          { name: 'Enterprise Design Token Compiler', tech: 'TypeScript, AST, CSS Variables', url: 'https://github.com/priyanair-dev/tokens-lib' }
        ],
        certifications: [
          { name: 'Meta Certified Frontend Specialist', issuer: 'Meta', year: 2021 }
        ],
        skills: ['React', 'JavaScript', 'TypeScript', 'Performance Optimization'],
        targetJob: jobFrontend,
        status: 'INTERVIEW_SCHEDULED',
        scheduledForToday: true,
        interviewTime: '11:00:00'
      },
      {
        firstName: 'Rohan',
        lastName: 'Kulkarni',
        email: 'rohan.kulkarni@talent.hireflow.dev',
        phone: '+91 97654 32109',
        location: 'Pune, Maharashtra',
        headline: 'DevOps & Platform Reliability Engineer | Kubernetes (ex-PhonePe)',
        educationLevel: 'Bachelor of Technology',
        educationInstitution: 'College of Engineering Pune (COEP)',
        educationMajor: 'Information Technology',
        educationYear: 2020,
        yearsOfExperience: 4,
        currentCompany: 'PhonePe Infrastructure',
        currentTitle: 'Platform Reliability Engineer II',
        linkedinUrl: 'https://linkedin.com/in/rohan-kulkarni-sre',
        githubUrl: 'https://github.com/rohank-infra',
        portfolioUrl: 'https://rohankulkarni.cloud',
        summary: 'Cloud engineer running zero-downtime multi-cluster Kubernetes deployments on AWS with automated Terraform blue-green rollouts and Prometheus alerting.',
        projects: [
          { name: 'Multi-Region Kubernetes Observability Hub', tech: 'ArgoCD, Helm, Prometheus, Thanos', url: 'https://github.com/rohank-infra/k8s-observability' },
          { name: 'Terraform AWS Security Baseline Modules', tech: 'Terraform, AWS KMS, HashiCorp Vault', url: 'https://github.com/rohank-infra/tf-baseline' }
        ],
        certifications: [
          { name: 'AWS Certified DevOps Engineer - Professional', issuer: 'AWS', year: 2022 },
          { name: 'HashiCorp Certified Terraform Associate', issuer: 'HashiCorp', year: 2023 }
        ],
        skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Linux'],
        targetJob: jobDevOps,
        status: 'INTERVIEW_COMPLETED'
      },
      {
        firstName: 'Ananya',
        lastName: 'Iyer',
        email: 'ananya.iyer@talent.hireflow.dev',
        phone: '+91 94441 55678',
        location: 'Bengaluru, Karnataka',
        headline: 'Staff Full Stack Engineer | Scalable APIs & React (ex-Flipkart)',
        educationLevel: 'Bachelor of Technology',
        educationInstitution: 'NIT Trichy',
        educationMajor: 'Computer Science',
        educationYear: 2018,
        yearsOfExperience: 6,
        currentCompany: 'Flipkart Commerce Cloud',
        currentTitle: 'Staff Software Engineer',
        linkedinUrl: 'https://linkedin.com/in/ananya-iyer-tech',
        githubUrl: 'https://github.com/ananya-iyer-dev',
        portfolioUrl: 'https://ananyaiyer.dev',
        summary: 'Full-stack engineer with deep experience in inventory catalog caching, GraphQL federation, React server-side rendering, and high-volume MySQL queries.',
        projects: [
          { name: 'Distributed Inventory Cache Invalidator', tech: 'Node.js, Redis, MySQL', url: 'https://github.com/ananya-iyer-dev/cache-invalidator' },
          { name: 'Recruiter Pipeline Realtime Visualizer', tech: 'React, WebSockets, TypeScript', url: 'https://github.com/ananya-iyer-dev/pipeline-viz' }
        ],
        certifications: [
          { name: 'Google Cloud Professional Cloud Architect', issuer: 'Google Cloud', year: 2021 }
        ],
        skills: ['React', 'Node.js', 'TypeScript', 'MySQL', 'Docker', 'AWS'],
        targetJob: jobFullStack,
        status: 'INTERVIEW_SCHEDULED',
        scheduledForToday: true,
        interviewTime: '15:30:00'
      },
      {
        firstName: 'Vikram',
        lastName: 'Malhotra',
        email: 'vikram.malhotra@talent.hireflow.dev',
        phone: '+91 98200 89123',
        location: 'Mumbai, Maharashtra',
        headline: 'Cloud Infrastructure & SRE Specialist (ex-CRED)',
        educationLevel: 'Bachelor of Technology',
        educationInstitution: 'IIT Bombay',
        educationMajor: 'Computer Science',
        educationYear: 2019,
        yearsOfExperience: 5,
        currentCompany: 'CRED Security & Infra',
        currentTitle: 'Senior SRE',
        linkedinUrl: 'https://linkedin.com/in/vikram-malhotra-sre',
        githubUrl: 'https://github.com/vmalhotra-infra',
        portfolioUrl: 'https://vikrammalhotra.io',
        summary: 'Infrastructure engineer focused on zero-trust AWS networking, Terraform automation, container security, and high-availability MySQL clusters.',
        projects: [
          { name: 'Zero-Trust AWS Transit Gateway Orchestrator', tech: 'Terraform, AWS, Python', url: 'https://github.com/vmalhotra-infra/aws-tgw' }
        ],
        certifications: [
          { name: 'AWS Certified Solutions Architect - Professional', issuer: 'AWS', year: 2022 }
        ],
        skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Linux'],
        targetJob: jobDevOps,
        status: 'SHORTLISTED'
      },
      {
        firstName: 'Sneha',
        lastName: 'Deshmukh',
        email: 'sneha.deshmukh@talent.hireflow.dev',
        phone: '+91 99220 11456',
        location: 'Pune, Maharashtra',
        headline: 'Frontend Engineer | React, TypeScript & Micro-frontends (ex-Postman)',
        educationLevel: 'Bachelor of Engineering',
        educationInstitution: 'Pune Institute of Computer Technology (PICT)',
        educationMajor: 'Computer Engineering',
        educationYear: 2021,
        yearsOfExperience: 3,
        currentCompany: 'Postman API Network',
        currentTitle: 'UI Engineer II',
        linkedinUrl: 'https://linkedin.com/in/sneha-deshmukh-ui',
        githubUrl: 'https://github.com/snehadeshmukh-code',
        portfolioUrl: 'https://snehadeshmukh.dev',
        summary: 'Frontend engineer with passion for snappy UI interactions, custom hook libraries, and modern component architectures using React and TailwindCSS.',
        projects: [
          { name: 'API Schema Interactive Explorer', tech: 'React, TypeScript, Monaco Editor', url: 'https://github.com/snehadeshmukh-code/api-explorer' }
        ],
        certifications: [
          { name: 'OpenJS Node.js Application Developer', issuer: 'Linux Foundation', year: 2023 }
        ],
        skills: ['React', 'JavaScript', 'TypeScript', 'Performance Optimization'],
        targetJob: jobFrontend,
        status: 'VALIDATED'
      },
      {
        firstName: 'Aditya',
        lastName: 'Verma',
        email: 'aditya.verma@talent.hireflow.dev',
        phone: '+91 98112 67890',
        location: 'Bengaluru, Karnataka',
        headline: 'Backend API Engineer | Node.js, Express & Database Sharding',
        educationLevel: 'Bachelor of Engineering',
        educationInstitution: 'RV College of Engineering (RVCE)',
        educationMajor: 'Information Science',
        educationYear: 2022,
        yearsOfExperience: 2,
        currentCompany: 'InMobi AdTech',
        currentTitle: 'Associate Software Engineer',
        linkedinUrl: 'https://linkedin.com/in/aditya-verma-backend',
        githubUrl: 'https://github.com/adityaverma-eng',
        portfolioUrl: 'https://adityaverma.dev',
        summary: 'Backend engineer specializing in Express middleware architectures, Sequelize data modeling, and high-performance MySQL query tuning.',
        projects: [
          { name: 'Realtime Ad Event Ingestion Pipeline', tech: 'Node.js, Express, MySQL', url: 'https://github.com/adityaverma-eng/event-ingest' }
        ],
        certifications: [],
        skills: ['Node.js', 'Express', 'MySQL', 'REST APIs', 'TypeScript'],
        targetJob: jobBackend,
        status: 'SCREENING'
      },
      {
        firstName: 'Tanvi',
        lastName: 'Gupta',
        email: 'tanvi.gupta@talent.hireflow.dev',
        phone: '+91 98733 45678',
        location: 'Gurgaon, Haryana',
        headline: 'Lead Product Designer | B2B Design Systems (ex-Zomato)',
        educationLevel: 'Master of Design',
        educationInstitution: 'National Institute of Design (NID)',
        educationMajor: 'Interaction Design',
        educationYear: 2020,
        yearsOfExperience: 4,
        currentCompany: 'Zomato Merchant Systems',
        currentTitle: 'Senior Product Designer',
        linkedinUrl: 'https://linkedin.com/in/tanvi-gupta-design',
        githubUrl: 'https://github.com/tanvigupta-ds',
        portfolioUrl: 'https://tanvigupta.design',
        summary: 'Product designer focusing on enterprise workflows, user mental models, information hierarchy, and comprehensive Figma token systems.',
        projects: [
          { name: 'Merchant Order Processing Portal Redesign', tech: 'Figma, Design System, Prototyping', url: 'https://tanvigupta.design/merchant-portal' }
        ],
        certifications: [],
        skills: ['Figma', 'UI/UX', 'Product Management'],
        targetJob: jobDesigner,
        status: 'SHORTLISTED'
      },
      {
        firstName: 'David',
        lastName: 'Chen',
        email: 'david.chen@talent.hireflow.dev',
        phone: '+1 (415) 890-4412',
        location: 'San Francisco, CA',
        headline: 'Principal Frontend Architect | Performance & Frameworks (ex-Stripe)',
        educationLevel: 'Bachelor of Science',
        educationInstitution: 'UC Berkeley',
        educationMajor: 'Computer Science',
        educationYear: 2016,
        yearsOfExperience: 8,
        currentCompany: 'Stripe Developer Experience',
        currentTitle: 'Staff Engineer',
        linkedinUrl: 'https://linkedin.com/in/davidchen-architect',
        githubUrl: 'https://github.com/davidchen-ui',
        portfolioUrl: 'https://davidchen.tech',
        summary: 'Web performance architect with 8 years pushing browser runtime limits, authoring tree-shakeable packages, and crafting virtualized table systems.',
        projects: [
          { name: 'Virtualized 100k-Row Data Grid', tech: 'React, WebAssembly, Canvas', url: 'https://github.com/davidchen-ui/virtual-grid' }
        ],
        certifications: [
          { name: 'Meta Certified Frontend Specialist', issuer: 'Meta', year: 2021 }
        ],
        skills: ['React', 'JavaScript', 'TypeScript', 'Performance Optimization'],
        targetJob: jobFrontend,
        status: 'INTERVIEW_COMPLETED'
      },
      {
        firstName: 'Maya',
        lastName: 'Lin',
        email: 'maya.lin@talent.hireflow.dev',
        phone: '+1 (206) 555-8711',
        location: 'Seattle, WA',
        headline: 'Staff Distributed Systems Engineer | Event Architectures (ex-Datadog)',
        educationLevel: 'Master of Science',
        educationInstitution: 'University of Washington',
        educationMajor: 'Computer Science',
        educationYear: 2017,
        yearsOfExperience: 7,
        currentCompany: 'Datadog Core Telemetry',
        currentTitle: 'Staff Systems Architect',
        linkedinUrl: 'https://linkedin.com/in/maya-lin-systems',
        githubUrl: 'https://github.com/mayalin-dev',
        portfolioUrl: 'https://mayalin.dev',
        summary: 'Distributed systems architect specialized in asynchronous message brokers, fault-tolerant consensus, and multi-tenant cloud orchestration.',
        projects: [
          { name: 'Distributed Log Consensus Framework', tech: 'Node.js, Docker, AWS', url: 'https://github.com/mayalin-dev/log-consensus' }
        ],
        certifications: [
          { name: 'AWS Certified Solutions Architect - Professional', issuer: 'AWS', year: 2022 }
        ],
        skills: ['Node.js', 'TypeScript', 'Docker', 'Kubernetes', 'AWS', 'System Design'],
        targetJob: jobStaffCloud,
        status: 'SELECTED'
      },
      {
        firstName: 'Marcus',
        lastName: 'Johnson',
        email: 'marcus.johnson@talent.hireflow.dev',
        phone: '+1 (512) 441-9923',
        location: 'Austin, TX',
        headline: 'Full Stack Platform Engineer | Node.js & React (ex-Atlassian)',
        educationLevel: 'Bachelor of Science',
        educationInstitution: 'Georgia Tech',
        educationMajor: 'Computer Science',
        educationYear: 2020,
        yearsOfExperience: 4,
        currentCompany: 'Atlassian Jira Platform',
        currentTitle: 'Software Engineer II',
        linkedinUrl: 'https://linkedin.com/in/marcus-johnson-dev',
        githubUrl: 'https://github.com/marcusj-code',
        portfolioUrl: 'https://marcusjohnson.dev',
        summary: 'Full-stack platform engineer experienced in building responsive Kanban boards and resilient GraphQL services.',
        projects: [
          { name: 'Realtime Agile Workflow Board', tech: 'React, Node.js, WebSockets', url: 'https://github.com/marcusj-code/workflow-board' }
        ],
        certifications: [],
        skills: ['React', 'Node.js', 'MySQL', 'JavaScript'],
        targetJob: jobFullStack,
        status: 'HOLD'
      },
      {
        firstName: 'Kavita',
        lastName: 'Krishnan',
        email: 'kavita.krishnan@talent.hireflow.dev',
        phone: '+91 98101 22334',
        location: 'Noida, Uttar Pradesh',
        headline: 'Backend Engineer | Payment Gateways & Microservices (ex-Paytm)',
        educationLevel: 'Bachelor of Technology',
        educationInstitution: 'Delhi Technological University (DTU)',
        educationMajor: 'Computer Engineering',
        educationYear: 2021,
        yearsOfExperience: 3,
        currentCompany: 'Paytm Payments Bank',
        currentTitle: 'Software Engineer',
        linkedinUrl: 'https://linkedin.com/in/kavita-krishnan-backend',
        githubUrl: 'https://github.com/kavitak-dev',
        portfolioUrl: 'https://kavitakrishnan.tech',
        summary: 'Backend developer focused on idempotent payment transaction processing, webhook verification, and automated unit testing.',
        projects: [
          { name: 'Payment Webhook Reconciliation Service', tech: 'Node.js, Express, MySQL', url: 'https://github.com/kavitak-dev/recon-service' }
        ],
        certifications: [],
        skills: ['Node.js', 'Express', 'MySQL', 'REST APIs'],
        targetJob: jobBackend,
        status: 'APPLIED'
      },
      {
        firstName: 'Arjun',
        lastName: 'Mehta',
        email: 'arjun.mehta@talent.hireflow.dev',
        phone: '+91 98212 99887',
        location: 'Mumbai, Maharashtra',
        headline: 'Junior Infrastructure Engineer | Linux & Shell Automation',
        educationLevel: 'Bachelor of Engineering',
        educationInstitution: 'VJTI Mumbai',
        educationMajor: 'Information Technology',
        educationYear: 2023,
        yearsOfExperience: 1,
        currentCompany: 'TCS Cloud Ops',
        currentTitle: 'Associate Engineer',
        linkedinUrl: 'https://linkedin.com/in/arjun-mehta-ops',
        githubUrl: 'https://github.com/arjunm-ops',
        portfolioUrl: 'https://arjunmehta.cloud',
        summary: 'Enthusiastic junior DevOps engineer familiar with bash scripting, basic Docker containers, and monitoring alerts.',
        projects: [
          { name: 'Automated Server Health Inspector', tech: 'Bash, Linux, Cron', url: 'https://github.com/arjunm-ops/health-inspect' }
        ],
        certifications: [],
        skills: ['Docker', 'Linux', 'AWS'],
        targetJob: jobDevOps,
        status: 'REJECTED'
      },
      {
        firstName: 'Neha',
        lastName: 'Singhania',
        email: 'neha.singhania@talent.hireflow.dev',
        phone: '+91 94451 88776',
        location: 'Chennai, Tamil Nadu',
        headline: 'Full Stack Web Developer | React & Node.js (ex-Freshworks)',
        educationLevel: 'Bachelor of Engineering',
        educationInstitution: 'Anna University (CEG)',
        educationMajor: 'Computer Science',
        educationYear: 2021,
        yearsOfExperience: 3,
        currentCompany: 'Freshworks CRM Suite',
        currentTitle: 'Product Engineer',
        linkedinUrl: 'https://linkedin.com/in/neha-singhania-dev',
        githubUrl: 'https://github.com/nehasinghania-dev',
        portfolioUrl: 'https://nehasinghania.dev',
        summary: 'Full-stack software engineer with hands-on expertise building performant React interfaces and Node.js REST services.',
        projects: [
          { name: 'Customer Ticket Routing Engine', tech: 'React, Node.js, Express, MySQL', url: 'https://github.com/nehasinghania-dev/ticket-engine' }
        ],
        certifications: [],
        skills: ['React', 'Node.js', 'MySQL', 'TypeScript'],
        targetJob: jobFullStack,
        status: 'APPLIED'
      }
    ];

    console.log('Seeding applications, scoring, history, and interviews...');
    for (const cData of candidateData) {
      const skillsArray = cData.skills;
      const job = cData.targetJob;
      const targetStatus = cData.status;

      // Create Candidate
      const candidate = await Candidate.create({
        firstName: cData.firstName,
        lastName: cData.lastName,
        email: cData.email,
        phone: cData.phone,
        location: cData.location,
        headline: cData.headline,
        educationLevel: cData.educationLevel,
        educationInstitution: cData.educationInstitution,
        educationMajor: cData.educationMajor,
        educationYear: cData.educationYear,
        yearsOfExperience: cData.yearsOfExperience,
        currentCompany: cData.currentCompany,
        currentTitle: cData.currentTitle,
        linkedinUrl: cData.linkedinUrl,
        githubUrl: cData.githubUrl,
        portfolioUrl: cData.portfolioUrl,
        summary: cData.summary,
        projects: cData.projects,
        certifications: cData.certifications
      });

      // Link candidate skills
      const skillEntitiesToLink = [];
      for (const sName of skillsArray) {
        if (skillEntities[sName]) {
          await CandidateSkill.create({
            candidateId: candidate.id,
            skillId: skillEntities[sName].id,
            proficiency: 'Advanced',
            yearsOfExperience: Math.min(candidate.yearsOfExperience, 5)
          });
          skillEntitiesToLink.push({ name: sName });
        }
      }

      // Create Resume
      await Resume.create({
        candidateId: candidate.id,
        fileName: `${cData.firstName.toLowerCase()}_${cData.lastName.toLowerCase()}_resume.pdf`,
        fileUrl: `/uploads/resumes/${cData.firstName.toLowerCase()}_${cData.lastName.toLowerCase()}_resume.pdf`,
        fileSize: 184500,
        parsedText: `${cData.summary} Core Skills: ${skillsArray.join(', ')}. Education: ${cData.educationLevel} in ${cData.educationMajor} from ${cData.educationInstitution}. Experience: ${cData.yearsOfExperience} years at ${cData.currentCompany}.`,
        isPrimary: true
      });

      // Calculate Explainable Score
      const scoringResult = calculateCandidateScore(candidate, job, skillEntitiesToLink);

      // Determine validation state
      const isValidated = ['VALIDATED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'SELECTED'].includes(targetStatus);
      const validationChecklist = {
        detailsComplete: true,
        resumeAvailable: true,
        qualificationMet: candidate.educationLevel.toLowerCase().includes('bachelor') || candidate.educationLevel.toLowerCase().includes('master'),
        experienceMet: candidate.yearsOfExperience >= (job.experienceRequirement - 1),
        skillsMet: scoringResult.breakdown.skills.score >= 12
      };

      // Create Application
      const application = await Application.create({
        jobId: job.id,
        candidateId: candidate.id,
        status: targetStatus,
        score: scoringResult.totalScore,
        scoreBreakdown: scoringResult.breakdown,
        validationChecklist,
        isValidated,
        validatedById: isValidated ? recruiter1.id : null,
        validatedAt: isValidated ? new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) : null,
        validationNotes: isValidated ? 'Candidate profile meets primary experience and core skill prerequisites.' : null,
        appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      });

      // Populate Application Status History (chronological transitions)
      const stateProgression = ['APPLIED'];
      if (['SCREENING', 'VALIDATED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'SELECTED', 'HOLD'].includes(targetStatus)) {
        stateProgression.push('SCREENING');
      }
      if (['VALIDATED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'SELECTED', 'HOLD'].includes(targetStatus)) {
        stateProgression.push('VALIDATED');
      }
      if (['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'SELECTED'].includes(targetStatus)) {
        stateProgression.push('SHORTLISTED');
      }
      if (['INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'SELECTED'].includes(targetStatus)) {
        stateProgression.push('INTERVIEW_SCHEDULED');
      }
      if (['INTERVIEW_COMPLETED', 'SELECTED'].includes(targetStatus)) {
        stateProgression.push('INTERVIEW_COMPLETED');
      }
      if (targetStatus === 'SELECTED') {
        stateProgression.push('SELECTED');
      } else if (targetStatus === 'REJECTED') {
        stateProgression.push('REJECTED');
      } else if (targetStatus === 'HOLD' && !stateProgression.includes('HOLD')) {
        stateProgression.push('HOLD');
      }

      for (let i = 0; i < stateProgression.length; i++) {
        const prevStatus = i === 0 ? null : stateProgression[i - 1];
        const newStatus = stateProgression[i];
        await ApplicationStatusHistory.create({
          applicationId: application.id,
          previousStatus: prevStatus,
          newStatus: newStatus,
          changedById: recruiter1.id,
          reason: `Transitioned to ${newStatus} during recruitment pipeline review`,
          createdAt: new Date(Date.now() - (10 - i * 2) * 24 * 60 * 60 * 1000)
        });
      }

      // Add Recruiter Notes
      await RecruiterNote.create({
        candidateId: candidate.id,
        applicationId: application.id,
        authorId: recruiter1.id,
        note: `Initial screening: ${cData.firstName} demonstrates strong background in ${skillsArray.slice(0, 3).join(', ')} from ${cData.currentCompany}. Scored ${scoringResult.totalScore}/100.`
      });

      // Create Interview if scheduled or completed or selected
      if (['INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'SELECTED'].includes(targetStatus)) {
        const isCompleted = targetStatus === 'INTERVIEW_COMPLETED' || targetStatus === 'SELECTED';
        const assignedInterviewer = (job.department === 'Infrastructure') ? interviewer2 : interviewer1;

        // Schedule interview date: today (2026-10-08) for active rounds, past for completed, future for others
        let interviewDate = '2026-10-12';
        if (cData.scheduledForToday) {
          interviewDate = '2026-10-08';
        } else if (isCompleted) {
          interviewDate = targetStatus === 'SELECTED' ? '2026-10-05' : '2026-10-06';
        }

        const interviewTime = cData.interviewTime || '14:00:00';

        const interview = await Interview.create({
          applicationId: application.id,
          interviewerId: assignedInterviewer.id,
          scheduledDate: interviewDate,
          scheduledTime: interviewTime,
          interviewType: job.department === 'Infrastructure' ? 'Cloud Architecture & Live Systems' : 'Technical Architecture & Deep Dive',
          location: 'https://meet.google.com/hfl-tech-sync',
          notes: `Focus on distributed system patterns, concurrency bottlenecks, and practical experience at ${cData.currentCompany}.`,
          status: isCompleted ? 'COMPLETED' : 'SCHEDULED',
          scheduledById: recruiter1.id
        });

        // Add Interview Feedback if completed
        if (isCompleted) {
          const isSelected = targetStatus === 'SELECTED';
          await InterviewFeedback.create({
            interviewId: interview.id,
            applicationId: application.id,
            interviewerId: assignedInterviewer.id,
            technicalSkillsScore: isSelected ? 9.5 : 8.8,
            problemSolvingScore: isSelected ? 9.2 : 8.5,
            communicationScore: isSelected ? 9.4 : 8.7,
            projectKnowledgeScore: isSelected ? 9.6 : 8.4,
            roleFitScore: isSelected ? 9.8 : 8.6,
            overallScore: isSelected ? 9.5 : 8.6,
            recommendation: isSelected ? 'Strong Hire' : 'Hire',
            comments: isSelected 
              ? `Outstanding performance! Deep mastery of distributed systems and scalable databases. Clear and articulate communication throughout the session.`
              : `Solid performance on system design and algorithmic trade-offs. Candidate handled tricky concurrency edge cases comfortably.`
          });
        }
      }
    }

    // 5. Seed Realistic Operational Notifications
    console.log('Seeding operational activity notifications...');
    await Notification.bulkCreate([
      {
        userId: recruiter1.id,
        title: 'Interview Scorecard Submitted',
        message: 'Alex Rivera completed technical evaluation for Rahul Sharma (Score: 9.5/10 — Strong Hire).',
        type: 'INTERVIEW',
        link: '/evaluations',
        isRead: false
      },
      {
        userId: recruiter1.id,
        title: 'Interview Scheduled For Today',
        message: 'Priya Nair has a System Architecture interview today at 11:00 AM with Alex Rivera.',
        type: 'INTERVIEW',
        link: '/interviews',
        isRead: false
      },
      {
        userId: recruiter1.id,
        title: 'Candidate Screened & Validated',
        message: 'Sneha Deshmukh cleared screening checks for Frontend Platform Architect.',
        type: 'APPLICATION',
        link: '/pipeline',
        isRead: false
      },
      {
        userId: recruiter1.id,
        title: 'Panel Scorecard Archived',
        message: 'David Chen completed Principal Architecture round with Strong Hire recommendation.',
        type: 'INTERVIEW',
        link: '/evaluations',
        isRead: true
      },
      {
        userId: recruiter1.id,
        title: 'New Candidate Submission',
        message: 'Neha Singhania applied for Senior Full Stack Engineer (Core Platform).',
        type: 'APPLICATION',
        link: '/candidates',
        isRead: true
      },
      {
        userId: interviewer1.id,
        title: 'Upcoming Technical Round Today',
        message: 'Technical Deep Dive with Priya Nair is scheduled for 11:00 AM.',
        type: 'INTERVIEW',
        link: '/interviews',
        isRead: false
      },
      {
        userId: interviewer1.id,
        title: 'Candidate Dossier Ready',
        message: 'Candidate portfolio & parsed resume available for Ananya Iyer (3:30 PM round).',
        type: 'INFO',
        link: '/candidates',
        isRead: false
      },
      {
        userId: interviewer1.id,
        title: 'Scorecard Stored',
        message: 'Your evaluation for David Chen has been archived to the operational record.',
        type: 'SYSTEM',
        link: '/evaluations',
        isRead: true
      },
      {
        userId: adminUser.id,
        title: 'HireFlow ATS Synchronized',
        message: 'Enterprise candidate database synchronized with active recruitment pipelines.',
        type: 'SYSTEM',
        link: '/admin/users',
        isRead: false
      }
    ]);

    console.log('HireFlow database seeding completed successfully!');
    console.log('--- Default User Credentials ---');
    console.log('Admin:       admin@hireflow.dev / Password123!');
    console.log('Recruiter:   recruiter@hireflow.dev / Password123!');
    console.log('Interviewer: interviewer@hireflow.dev / Password123!');
    console.log('---------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
