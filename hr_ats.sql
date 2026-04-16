-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 16, 2026 at 02:07 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hr_ats`
--

-- --------------------------------------------------------

--
-- Table structure for table `candidates`
--

CREATE TABLE `candidates` (
  `id` varchar(36) NOT NULL,
  `job_id` varchar(36) NOT NULL,
  `job_title` varchar(100) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `resume_path` varchar(300) NOT NULL,
  `resume_text` text DEFAULT NULL,
  `linkedin_url` varchar(255) DEFAULT NULL,
  `similarity_score` int(11) DEFAULT NULL,
  `ai_score` int(11) DEFAULT NULL,
  `ai_reason` text DEFAULT NULL,
  `ai_status` varchar(20) DEFAULT NULL,
  `hr_override` enum('yes','no','none') DEFAULT NULL,
  `final_status` enum('pending','shortlisted','rejected','selected') DEFAULT NULL,
  `applied_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `candidates`
--

INSERT INTO `candidates` (`id`, `job_id`, `job_title`, `name`, `email`, `phone`, `resume_path`, `resume_text`, `linkedin_url`, `similarity_score`, `ai_score`, `ai_reason`, `ai_status`, `hr_override`, `final_status`, `applied_at`) VALUES
('2ae972c6-a90c-4f75-93bc-b3ae14a566ca', '93d0bc58-2733-41de-aa6a-779cc061c610', 'Backend Developer', 'Dinesh', 'dineshkumar@auriseg.com', '1234569307', 'uploads/resumes\\b2f42af1-d1cb-4796-8993-63c23e586100_Match.pdf', 'Name: Vidyaa \nExperience: 2.5 Years \nMail: shrividyaadevi.v@gmail.com \nSummary: \nCybersecurity professional with 2.5 years of experience in VAPT, SIEM monitoring, and \nincident response. \nSkills: \n• Vulnerability Assessment & Penetration Testing \n• Splunk SIEM \n• Network Security \n• Incident Response \n• ISO 27001 Compliance \n• Python (basic scripting) \nExperience: \nCybersecurity Analyst – SecureTech Pvt Ltd (2023–Present) \n• Performed regular penetration testing on web applications \n• Monitored logs using Splunk and handled alerts \n• Investigated and resolved security incid ents \nCertifications: \n• CEH (Certified Ethical Hacker)', 'https://www.linkedin.com/in/shrividyaadevi-v-84a62b403/', 42, 0, 'The candidate\'s skills and experience do not match the required skills for the Backend Developer position, as they specialize in cybersecurity and do not have experience with Node.js, Express.js, MySQL, or REST APIs.', 'Not Shortlisted', 'yes', 'selected', '2026-04-16 09:41:57'),
('405a0076-ddd7-46f9-8181-6b03ab922a49', 'ca44aaf2-5067-4bec-8819-2de32d69596c', 'Senior Cybersecurity Consultant', 'Poorna', 'poorna@123.com', '9952883169', 'uploads/resumes\\fc970ea6-0b2e-4f7b-a4c8-411ca071ff66_Match.pdf', 'Name: Vidyaa \nExperience: 2.5 Years \nMail: shrividyaadevi.v@gmail.com \nSummary: \nCybersecurity professional with 2.5 years of experience in VAPT, SIEM monitoring, and \nincident response. \nSkills: \n• Vulnerability Assessment & Penetration Testing \n• Splunk SIEM \n• Network Security \n• Incident Response \n• ISO 27001 Compliance \n• Python (basic scripting) \nExperience: \nCybersecurity Analyst – SecureTech Pvt Ltd (2023–Present) \n• Performed regular penetration testing on web applications \n• Monitored logs using Splunk and handled alerts \n• Investigated and resolved security incid ents \nCertifications: \n• CEH (Certified Ethical Hacker)', 'https://www.linkedin.com/in/shrividyaadevi-v-84a62b403/', 79, 90, 'The candidate\'s resume and LinkedIn profile demonstrate a strong match with the required skills for the Senior Cybersecurity Consultant position, including VAPT, SIEM tools like Splunk, incident response, and compliance with ISO 27001, as well as basic Python scripting skills. The candidate\'s 2.5 years of experience and CEH certification further verify their professional identity and skill set. The provided information aligns well with the job description.', 'Shortlisted', 'none', 'pending', '2026-04-16 09:51:29'),
('56ed6b90-d71e-44e8-96fb-3e8d7dc8f625', 'ca44aaf2-5067-4bec-8819-2de32d69596c', 'Senior Cybersecurity Consultant', 'Sid', 'sid@123.com', '4561235751', 'uploads/resumes\\4137c82c-f8df-446b-9afa-663265795d83_noMatch.pdf', 'Name: Rani \nExperience: 2 Years \nEmail: shrivid yaadevi@auris eg.ai \nSummary: \nFrontend developer with experience in building responsive web applications. \nSkills: \n• HTML, CSS, JavaScript \n• React.js \n• UI/UX Design \n• Git \nExperience: \nFrontend Developer – WebWorks Pvt Ltd (2024–Present) \n• Developed user interfaces using React \n• Improved website performance and responsiveness \nCertifications: \n• Web Development Bootcamp', 'https://www.linkedin.com/in/shrividyaadevi-venkatachalam', 45, 0, 'The candidate\'s skills and experience do not match the required skills for the Senior Cybersecurity Consultant position, as they have a background in frontend development and no mentioned experience in cybersecurity, VAPT, SIEM, or related fields.', 'Not Shortlisted', 'no', 'rejected', '2026-04-06 17:52:55'),
('c45b7435-df7e-42e3-b583-5eeaf2905176', 'ca44aaf2-5067-4bec-8819-2de32d69596c', 'Senior Cybersecurity Consultant', 'Vidyaa', 'shrividyaadevi.v@gmail.com', '8248875559', 'uploads/resumes\\5cc2c72a-8d3b-4d2d-a41e-6a7ab9efbd4a_Match.pdf', 'Name: Vidyaa \nExperience: 2.5 Years \nMail: shrividyaadevi.v@gmail.com \nSummary: \nCybersecurity professional with 2.5 years of experience in VAPT, SIEM monitoring, and \nincident response. \nSkills: \n• Vulnerability Assessment & Penetration Testing \n• Splunk SIEM \n• Network Security \n• Incident Response \n• ISO 27001 Compliance \n• Python (basic scripting) \nExperience: \nCybersecurity Analyst – SecureTech Pvt Ltd (2023–Present) \n• Performed regular penetration testing on web applications \n• Monitored logs using Splunk and handled alerts \n• Investigated and resolved security incid ents \nCertifications: \n• CEH (Certified Ethical Hacker)', NULL, 79, 85, 'The candidate has 2.5 years of experience in VAPT, SIEM monitoring, and incident response, and possesses required skills such as Splunk SIEM, Network Security, and ISO 27001 Compliance, with a certification in CEH, but lacks explicit mention of QRadar, NIST, Firewalls & IDS/IPS, and Bash scripting.', 'Shortlisted', 'no', 'selected', '2026-04-02 18:06:59'),
('d9ef3e44-0108-4b19-a152-b71544abd307', '13bc592e-abb5-4427-b3e4-d747489fa401', 'Full Stack Developer', 'Sid', 'sid@123.com', '4513548451', 'uploads/resumes\\0b47a790-2b53-4696-a2df-880861c63e45_Match.pdf', 'Name: Vidyaa \nExperience: 2.5 Years \nMail: shrividyaadevi.v@gmail.com \nSummary: \nCybersecurity professional with 2.5 years of experience in VAPT, SIEM monitoring, and \nincident response. \nSkills: \n• Vulnerability Assessment & Penetration Testing \n• Splunk SIEM \n• Network Security \n• Incident Response \n• ISO 27001 Compliance \n• Python (basic scripting) \nExperience: \nCybersecurity Analyst – SecureTech Pvt Ltd (2023–Present) \n• Performed regular penetration testing on web applications \n• Monitored logs using Splunk and handled alerts \n• Investigated and resolved security incid ents \nCertifications: \n• CEH (Certified Ethical Hacker)', 'http://linkedin.com/in/shrividyaadevi-venkatachalam', 35, 0, 'The candidate\'s skills and experience do not match the required skills for a Full Stack Developer, as they specialize in cybersecurity with skills in Vulnerability Assessment & Penetration Testing, Splunk SIEM, and Network Security, with no mention of React, Node.js, MySQL, or other required technologies.', 'Not Shortlisted', 'no', 'rejected', '2026-04-06 18:10:30'),
('f67144b1-c3c4-49e3-ade4-f961344e55fa', '93d0bc58-2733-41de-aa6a-779cc061c610', 'Backend Developer', 'Sid', 'sid@123.com', '5124565695', 'uploads/resumes\\de681a33-08eb-4d06-9e8f-7d9b0cc092ea_Match.pdf', 'Name: Vidyaa \nExperience: 2.5 Years \nMail: shrividyaadevi.v@gmail.com \nSummary: \nCybersecurity professional with 2.5 years of experience in VAPT, SIEM monitoring, and \nincident response. \nSkills: \n• Vulnerability Assessment & Penetration Testing \n• Splunk SIEM \n• Network Security \n• Incident Response \n• ISO 27001 Compliance \n• Python (basic scripting) \nExperience: \nCybersecurity Analyst – SecureTech Pvt Ltd (2023–Present) \n• Performed regular penetration testing on web applications \n• Monitored logs using Splunk and handled alerts \n• Investigated and resolved security incid ents \nCertifications: \n• CEH (Certified Ethical Hacker)', 'https://www.linkedin.com/in/shrividyaadevi-venkatachalam', 42, 0, 'The candidate\'s skills and experience do not match the required skills for the Backend Developer position, with no mention of Node.js, Express.js, MySQL, REST APIs, or Database Design, and their background is in cybersecurity rather than backend development.', 'Not Shortlisted', 'none', 'pending', '2026-04-06 17:57:51');

-- --------------------------------------------------------

--
-- Table structure for table `interviews`
--

CREATE TABLE `interviews` (
  `id` varchar(36) NOT NULL,
  `candidate_id` varchar(36) NOT NULL,
  `job_id` varchar(36) DEFAULT NULL,
  `job_title` varchar(100) DEFAULT NULL,
  `scheduled_at` datetime NOT NULL,
  `round` varchar(10) DEFAULT NULL,
  `mode` varchar(50) DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `email_sent` varchar(5) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `interviews`
--

INSERT INTO `interviews` (`id`, `candidate_id`, `job_id`, `job_title`, `scheduled_at`, `round`, `mode`, `location`, `notes`, `email_sent`, `created_at`) VALUES
('86baedd4-048f-494c-94f4-c1a890b2ebcc', 'c45b7435-df7e-42e3-b583-5eeaf2905176', 'ca44aaf2-5067-4bec-8819-2de32d69596c', 'Senior Cybersecurity Consultant', '2026-04-02 21:12:00', '1', 'Online', 'meet', '', 'true', '2026-04-02 18:08:22'),
('c7de3c1e-8906-464a-94af-30783094fe19', '2ae972c6-a90c-4f75-93bc-b3ae14a566ca', '93d0bc58-2733-41de-aa6a-779cc061c610', 'Backend Developer', '2026-04-23 10:45:00', '1', 'Online', 'teams', 'Prepare technical topics', 'true', '2026-04-16 09:43:57');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` varchar(36) NOT NULL,
  `job_title` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `skills` text NOT NULL,
  `keywords` text DEFAULT NULL,
  `status` enum('active','expired') DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jobs`
--

INSERT INTO `jobs` (`id`, `job_title`, `description`, `skills`, `keywords`, `status`, `created_at`) VALUES
('13bc592e-abb5-4427-b3e4-d747489fa401', 'Full Stack Developer', 'Develop and maintain web applications using frontend and backend technologies. Should be capable of handling databases and API integrations.', 'React, Node.js, MySQL, REST APIs, JavaScript, HTML, CSS', 'full stack, react, node, mysql, web developer, javascript', 'active', '2026-03-27 14:31:44'),
('3adf8805-d6ee-43c7-9d08-08129a5fddcc', 'Cyber Security Analyst', 'Responsible for monitoring security systems, identifying vulnerabilities, and preventing cyber threats. \nShould have knowledge of penetration testing and security tools.', 'Network Security, Ethical Hacking, Python, SIEM, Vulnerability Assessment', 'cyber security, ethical hacking, SIEM, network security, penetration testing', 'active', '2026-03-27 14:30:54'),
('93d0bc58-2733-41de-aa6a-779cc061c610', 'Backend Developer', 'Responsible for designing, developing, and maintaining server-side logic and databases. The candidate should ensure high performance and responsiveness of applications. Must have experience in building APIs, handling databases, and implementing secure authentication systems. Knowledge of scalable architecture and backend optimization is a plus.', 'Node.js, Express.js, MySQL, REST APIs, Python (optional), Database Design, Authentication & Authorization', 'backend developer, node.js, express, mysql, rest api, server-side, database, authentication, api development', 'active', '2026-03-27 17:13:17'),
('ca44aaf2-5067-4bec-8819-2de32d69596c', 'Senior Cybersecurity Consultant', 'We are seeking a skilled Senior Cybersecurity Consultant with at least 2 years of hands-on experience in securing enterprise environments. The candidate will be responsible for identifying vulnerabilities, performing penetration testing, monitoring security systems, and responding to incidents.', 'Network Security Vulnerability Assessment & Penetration Testing (VAPT) SIEM Tools (Splunk / QRadar) Incident Response Risk Assessment & Compliance (ISO 27001, NIST) Firewalls & IDS/IPS Python / Bash scripting (basic automation)', 'Cybersecurity, VAPT, SIEM, Splunk, Ethical Hacking, Incident Response, Network Security, Risk Management', 'active', '2026-04-02 17:45:08');

-- --------------------------------------------------------

--
-- Table structure for table `selected_candidates`
--

CREATE TABLE `selected_candidates` (
  `id` varchar(36) NOT NULL,
  `candidate_id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `job_title` varchar(200) NOT NULL,
  `job_id` varchar(36) NOT NULL,
  `rounds_cleared` varchar(10) DEFAULT NULL,
  `offer_letter_path` varchar(300) DEFAULT NULL,
  `selected_at` datetime DEFAULT current_timestamp(),
  `offer_letter_status` enum('pending','sent') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `selected_candidates`
--

INSERT INTO `selected_candidates` (`id`, `candidate_id`, `name`, `email`, `job_title`, `job_id`, `rounds_cleared`, `offer_letter_path`, `selected_at`, `offer_letter_status`) VALUES
('62711be8-76eb-4f05-a727-50b19bb18651', 'c45b7435-df7e-42e3-b583-5eeaf2905176', 'Vidyaa', 'shrividyaadevi.v@gmail.com', 'Senior Cybersecurity Consultant', 'ca44aaf2-5067-4bec-8819-2de32d69596c', '3', 'uploads/offer_letters\\be963a70-6a9c-4f2b-a584-2baf74d5a1e1_offer letter.pdf', '2026-04-02 18:11:49', 'sent'),
('ff3aed10-c05f-4a74-8f9c-08ddd30bea40', '2ae972c6-a90c-4f75-93bc-b3ae14a566ca', 'Dinesh', 'dineshkumar@auriseg.com', 'Backend Developer', '93d0bc58-2733-41de-aa6a-779cc061c610', '3', 'uploads/offer_letters\\5f8c9fe2-bef7-40ee-80bf-19b29482c044_offer letter.pdf', '2026-04-16 09:46:02', 'sent');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `hashed_password` varchar(255) NOT NULL,
  `role` enum('admin','hr','candidate') NOT NULL,
  `is_active` varchar(5) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `hashed_password`, `role`, `is_active`, `created_at`) VALUES
('108bb16f-efe8-4a74-833d-bacdf46cbdab', 'Sid', 'sid@123.com', '$2b$12$sD7T9HBKf5R0ctyZ44.tr.0fFgnQFUGjktlGgemiMCOTDci79Nk3e', 'candidate', 'true', '2026-04-06 17:48:06'),
('502a89e7-76ca-4613-8030-82dd36111114', 'Alex', 'alex@123.com', '$2b$12$KriIclv2vjrspbKfdX1zDOCxsxc27T3isJUfvFYbic8.0neB.uAlu', 'hr', 'true', '2026-04-02 17:42:20'),
('615d6e7a-0eb1-4732-a03e-3425d40b101d', 'Rani', 'shrividyaadevi@auriseg.ai', '$2b$12$S59I1LQhWNTrabRoc9ju8e29baic709tBI7zs92w7NhDPPZ.Z.tIK', 'candidate', 'true', '2026-04-03 09:19:23'),
('63bbfd11-c159-4850-88cb-7081812fd758', 'Vidyaa', 'shrividyaadevi.v@gmail.com', '$2b$12$onZOIyjEiMf8h9yunJR4QueHwlQfk8.CVhCmzFkvjML7D8SMXh8de', 'candidate', 'true', '2026-04-02 17:50:59'),
('70f457e0-c823-4982-abb7-15e4f33c99ba', 'Dinesh', 'dineshkumar@auriseg.com', '$2b$12$1Gv77p/RfXHxb3rZWulx7.17c/lX.ExP7/fWCkZY7/3eBxNmTc/76', 'candidate', 'true', '2026-04-16 09:38:19'),
('7ed9971e-2c0b-4e5f-8fd0-0353ee768caa', 'Poorna', 'poorna@123.com', '$2b$12$7oCcDZP4vde2aQmyJc3g3OOy18n7PCEVoHqJJdHRfDFSs8/9SY8yS', 'candidate', 'true', '2026-04-16 09:51:06'),
('85f6e574-7660-42a3-9ef2-ef5fa8706f22', 'Admin', 'admin@123.com', '$2b$12$t0Ge31Ar8hAi4K4wKuF06.anB5Ip01u.oLC8AkqoORvoIiMFsNRpK', 'admin', 'true', '2026-04-02 17:39:05'),
('c4ba25c8-6e44-44c3-8608-fef995fc1e50', 'Bob', 'bob@123.com', '$2b$12$veZBr8K2bcAmqtqhfJOiv.Cnnaho0LibjcoXvWrd8hITSFManGMNK', 'hr', 'true', '2026-04-02 17:42:35');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `candidates`
--
ALTER TABLE `candidates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `job_id` (`job_id`),
  ADD KEY `ix_candidates_id` (`id`);

--
-- Indexes for table `interviews`
--
ALTER TABLE `interviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `candidate_id` (`candidate_id`),
  ADD KEY `job_id` (`job_id`),
  ADD KEY `ix_interviews_id` (`id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_jobs_id` (`id`);

--
-- Indexes for table `selected_candidates`
--
ALTER TABLE `selected_candidates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `candidate_id` (`candidate_id`),
  ADD KEY `ix_selected_candidates_id` (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ix_users_email` (`email`),
  ADD KEY `ix_users_id` (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `candidates`
--
ALTER TABLE `candidates`
  ADD CONSTRAINT `candidates_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `interviews`
--
ALTER TABLE `interviews`
  ADD CONSTRAINT `interviews_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `interviews_ibfk_2` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `selected_candidates`
--
ALTER TABLE `selected_candidates`
  ADD CONSTRAINT `selected_candidates_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
