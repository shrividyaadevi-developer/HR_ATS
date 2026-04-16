export const MONTHLY_JOBS = [
  {month:"Jan",jobs:4,applicants:28},{month:"Feb",jobs:6,applicants:40},
  {month:"Mar",jobs:5,applicants:35},{month:"Apr",jobs:8,applicants:55},
  {month:"May",jobs:7,applicants:48},{month:"Jun",jobs:10,applicants:72},
  {month:"Jul",jobs:9,applicants:60},{month:"Aug",jobs:12,applicants:88},
  {month:"Sep",jobs:11,applicants:76},{month:"Oct",jobs:14,applicants:95},
  {month:"Nov",jobs:13,applicants:84},{month:"Dec",jobs:16,applicants:110},
];
export const YEARLY_JOBS = [
  {year:"2021",jobs:42,applicants:310},{year:"2022",jobs:67,applicants:520},
  {year:"2023",jobs:88,applicants:740},{year:"2024",jobs:120,applicants:980},
  {year:"2025",jobs:105,applicants:860},
];
export const JOB_APPLICANTS = [
  {job:"Frontend",count:32},{job:"Backend",count:27},{job:"Designer",count:18},
  {job:"PM",count:14},{job:"DevOps",count:9},{job:"QA",count:22},
];
export const JOBS_INIT = [
  {id:"J001",name:"Frontend Developer",status:"Active",candidates:12,filled:"No",skills:"React, TypeScript, CSS",description:"Build and maintain our customer-facing React apps.",location:"Chennai",type:"Full-time",salary:"₹8–14 LPA"},
  {id:"J002",name:"Backend Engineer",status:"Active",candidates:8,filled:"No",skills:"Node.js, PostgreSQL, REST",description:"Design and build scalable APIs for our platform.",location:"Bangalore",type:"Full-time",salary:"₹10–18 LPA"},
  {id:"J003",name:"UX Designer",status:"Closed",candidates:5,filled:"Yes",skills:"Figma, User Research, Prototyping",description:"Craft delightful experiences across our product suite.",location:"Remote",type:"Full-time",salary:"₹7–12 LPA"},
  {id:"J004",name:"Product Manager",status:"Active",candidates:3,filled:"No",skills:"Roadmapping, Agile, SQL",description:"Drive product strategy and execution with cross-functional teams.",location:"Mumbai",type:"Full-time",salary:"₹15–25 LPA"},
  {id:"J005",name:"DevOps Engineer",status:"Paused",candidates:7,filled:"No",skills:"Docker, Kubernetes, AWS",description:"Own CI/CD pipelines and cloud infrastructure.",location:"Hyderabad",type:"Full-time",salary:"₹12–20 LPA"},
  {id:"J006",name:"QA Engineer",status:"Active",candidates:4,filled:"No",skills:"Selenium, Jest, Cypress",description:"Ensure product quality through automated and manual testing.",location:"Chennai",type:"Full-time",salary:"₹6–10 LPA"},
];
export const CANDIDATES_INIT = [
  {id:1,name:"Arjun Mehta",email:"arjun@email.com",similarity:92,aiScore:88,status:"Shortlisted",reason:"Strong React & TS",hr:null},
  {id:2,name:"Priya Sharma",email:"priya@email.com",similarity:85,aiScore:80,status:"Under Review",reason:"Good portfolio",hr:null},
  {id:3,name:"Rahul Nair",email:"rahul@email.com",similarity:76,aiScore:71,status:"Rejected",reason:"Missing Node.js",hr:"No"},
  {id:4,name:"Sneha Iyer",email:"sneha@email.com",similarity:95,aiScore:93,status:"Selected",reason:"Excellent full-stack",hr:"Yes"},
  {id:5,name:"Vikram Patel",email:"vikram@email.com",similarity:68,aiScore:65,status:"Applied",reason:"Average match",hr:null},
];
export const INTERVIEWS_INIT = [
  {id:1,candidate:"Arjun Mehta",email:"arjun@email.com",date:"2026-03-26",notes:"React + System Design",sent:false},
  {id:2,candidate:"Sneha Iyer",email:"sneha@email.com",date:"2026-03-27",notes:"HR Round",sent:true},
  {id:3,candidate:"Priya Sharma",email:"priya@email.com",date:"2026-04-02",notes:"Portfolio Review",sent:false},
];
export const HR_USERS_INIT = [
  {id:1,name:"Meera Rajan",email:"meera@company.com",status:"Active"},
  {id:2,name:"Karan Desai",email:"karan@company.com",status:"Active"},
];
// Seeded users — register page appends to this at runtime (in-memory)
export const DEMO_USERS = [
  {email:"admin@company.com",password:"admin123",name:"Rohan Verma",role:"admin"},
  {email:"hr@company.com",password:"hr123",name:"Meera Rajan",role:"hr"},
  {email:"candidate@email.com",password:"cand123",name:"Arjun Mehta",role:"candidate"},
];
export const REPORTS = [
  {name:"Monthly Hiring Report",desc:"Jobs posted, applicants, offers — March 2026",icon:"📊"},
  {name:"Interview Summary",desc:"Scheduled, completed, no-shows",icon:"📅"},
  {name:"HR Decision Log",desc:"Approve / reject with reasons",icon:"📋"},
  {name:"Year-over-Year Comparison",desc:"2024 vs 2025 vs 2026 metrics",icon:"📈"},
];
