/**
 * Rahul's real resume, reconstructed as a "Big CV" dump so the agent can parse
 * and tailor it. Source: ~/Documents/Personal Mac Documents/Rahul_Tuladhar_Resume.pdf
 *
 * This is the local, real-world test case: messy career history in, tailored
 * application out.
 */
export const RAHUL_RESUME = `Rahul Tuladhar — Founder and full-stack AI engineer
San Francisco, CA | rahul.tuladhar97@gmail.com | linkedin.com/in/rahul-tuladhar

Summary
- Founder with enthusiasm developing AI products from 0 to 1, with effective full-stack engineering and collaboration skills.

LexIQ (Techstars Oakland S24) — Co-Founder, Founding Engineer (May 2024 - June 2025)
- Went through Techstars Oakland Spring 2024 with $120K in funding, building a legal tech AI platform to draft, review, and redline contracts 10x faster alongside custom AI agents for lawyers.
- Built and designed the entire UX/UI and core backend platform for LexIQ; scaled it from pre-product, pre-revenue to a fully functional Word plugin published on the Microsoft Office 365 App Store with ~$11K ARR.
- Engineered LexIQ's AI agentic workflows as part of the first two SMB subscriptions and contracts.
- Built the core React TypeScript RAG chatbot capabilities for legal documents using the OpenAI Assistants SDK.
- Developed and deployed Golang and FastAPI Python backend servers with Redis caching and MongoDB, integrating OpenAI and Anthropic APIs, serving the first 40+ solo and SMB users.
- Designed and integrated Microsoft SSO and Stripe webhooks through Azure Container Apps and Azure Service Bus message queues for user login and subscription payments.

Microsoft — Software Engineer, Dynamics 365 Fraud Protection (Aug 2022 - May 2024)
- Implemented feature flag deployment of memory optimizations for bot detection ML models in C#.
- Designed and implemented WHOIS IP fingerprinting data integration into production machine learning model inference pipelines.

Capital One — Software Engineer, Monitoring Intelligence (Aug 2021 - July 2022)
- Upgraded, deployed, and tested enterprise Splunk clusters on AWS EC2 using Ansible Cloudworks.
- Implemented Python scripts diagnosing infrastructure network connectivity across cloud environments.
- Designed a backend service using AWS ELB to distribute TCP connections across AWS EC2 worker servers.
- Persisted infrastructure resource data to AWS DynamoDB, used by a three-tiered web application written in Go for monitoring NxLog agents.

Lockheed Martin Space — Software Engineer Associate (July 2019 - Aug 2021)
- Designed and implemented satellite state and transaction handlers for message bus event fulfillment in C++.
- Generated gRPC message schemas for inter-component data transport and processing in C++.
- Implemented and tested resource allocation and scheduling algorithms in C for LTE-over-satellite.
- Augmented over 200 integration-level regression test cases using Bash, Python, and Robot Framework.
- Developed regression and integration testing of software builds on LTE-over-satellite hardware systems.

IST Research Corp. — Data Science Intern (May - Sept 2018)
- Researched characteristics of bot-like behavior based on Twitter user datasets.
- Implemented and tested a social media bot classifier with semantic text categorization using AWS Lambda.
- Generated predictive machine learning models for user-level social media statistics.

Education
- Georgia Institute of Technology, College of Computing — M.S. Computer Science (Fall 2022 - Spring 2023).
- University of Virginia, School of Engineering and Applied Science — B.S. Computer Science (Fall 2015 - Spring 2019).

Technical skills
- Languages and frameworks: TypeScript, React, Python, Go, C/C++, C#, FastAPI, Django, Next.js, Docker, Vercel.
- Certification: AWS Certified Solutions Architect Associate.`;

export const RAHUL_DEFAULT_INTENT =
  "Tailor my resume for this role. Lead with the most relevant experience, quantify impact, and keep it to one page and ATS-friendly.";
