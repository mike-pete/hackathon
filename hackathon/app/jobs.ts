type Job = {
  title: string,
  company: string, 
  baseRange: [number, number],
  description: string
}

const jobs: Record<number, Job> = {
  4472843078:{
    title: "Frontend Software Engineer, Codex App",
    company: "OpenAI",
    baseRange: [230000, 385000],
    description: `
      About the job
About The Team

The Codex App team builds and maintains the Codex desktop app and IDE extension — the primary ways developers interact with Codex. Our goal is to make AI feel like a real software engineering teammate inside real workflows: editing code, running tasks, reviewing changes, and coordinating long-running work.

We sit at the intersection of research, product, and design. We ship quickly, learn from real usage, and continuously refine both the experience and the harness that connects users to the model.

About The Role

We’re hiring a Frontend Software Engineer to build a top-tier desktop experience and push forward the interface for working with agents. This is a craft-heavy role: you’ll partner closely with design to prototype, iterate, and polish new interaction models — then turn them into reliable, high-performance product.

You’ll help define what great looks like for “human ↔ agent” collaboration: what belongs in the UI, how state is represented, how progress and uncertainty are communicated, and how users stay oriented across long-running and multi-step work.

What You’ll Do

Build and ship polished, high-performance UI across the Codex desktop app and IDE extension.
Partner tightly with design to turn prototypes into production-quality experiences (layout, motion, typography, interaction details).
Iterate on future interfaces for interacting with agents: delegation, task timelines, status/progress, handoffs, review, and control surfaces.
Own frontend architecture decisions (component systems, state management, navigation, rendering performance).
Improve quality and reliability through testing, instrumentation, and thoughtful UX for failure modes.
Collaborate with platform/model/backend partners to integrate new capabilities into cohesive product flows.

You Might Thrive Here If You

Have strong experience with modern frontend stacks (React, TypeScript) and a high bar for UI craft.
Love design engineering: sweating the details while keeping velocity.
Have built desktop-caliber product experiences (Electron or similar), and care about performance, responsiveness, and “it just feels right.”
Enjoy exploring ambiguous problems and iterating rapidly with design and product.
Think in end-to-end workflows, not isolated screens.
Have experience with developer tools or IDE extensions (nice-to-have).

About OpenAI

OpenAI is an AI research and deployment company dedicated to ensuring that general-purpose artificial intelligence benefits all of humanity. We push the boundaries of the capabilities of AI systems and seek to safely deploy them to the world through our products. AI is an extremely powerful tool that must be created with safety and human needs at its core, and to achieve our mission, we must encompass and value the many different perspectives, voices, and experiences that form the full spectrum of humanity.

We are an equal opportunity employer, and we do not discriminate on the basis of race, religion, color, national origin, sex, sexual orientation, age, veteran status, disability, genetic information, or other applicable legally protected characteristic.

For additional information, please see OpenAI’s Affirmative Action and Equal Employment Opportunity Policy Statement.

Background checks for applicants will be administered in accordance with applicable law, and qualified applicants with arrest or conviction records will be considered for employment consistent with those laws, including the San Francisco Fair Chance Ordinance, the Los Angeles County Fair Chance Ordinance for Employers, and the California Fair Chance Act, for US-based candidates. For unincorporated Los Angeles County workers: we reasonably believe that criminal history may have a direct, adverse and negative relationship with the following job duties, potentially resulting in the withdrawal of a conditional offer of employment: protect computer hardware entrusted to you from theft, loss or damage; return all computer hardware in your possession (including the data contained therein) upon termination of employment or end of assignment; and maintain the confidentiality of proprietary, confidential, and non-public information. In addition, job duties require access to secure and protected information technology systems and related data security obligations.

To notify OpenAI that you believe this job posting is non-compliant, please submit a report through this form. No response will be provided to inquiries unrelated to job posting compliance.

We are committed to providing reasonable accommodations to applicants with disabilities, and requests can be made via this link.

OpenAI Global Applicant Privacy Policy

At OpenAI, we believe artificial intelligence has the potential to help people solve immense global challenges, and we want the upside of AI to be widely shared. Join us in shaping the future of technology.

Compensation Range: $230K - $385K
    `
  },
  4435295561: {
    title: "Senior Product Engineer",
    company: "Together AI",
    baseRange: [160000, 230000],
    description: `
About The RoleTogether is hiring a Senior Product Engineer to join our central Product Engineering team and embed day-to-day with the Commerce engineering team. You will own the product UI surface for Together AI’s most revenue-critical user flows: enterprise spend controls and governance, usage-based pricing displays and metering dashboards, payment method management, and enterprise contract surfaces.This is a hands-on role for someone who enjoys operating at a high-quality, efficient pace: breaking ambiguous work into clear increments, shipping useful improvements quickly, and finding pragmatic ways to move customer and revenue impact forward. You will work alongside dedicated product, design, and backend engineers partners and use strong product judgment to make reasonable UX decisions within established patterns.Requirements

- 4+ years of frontend engineering experience building and shipping productions features to real users
- Strong React fundamentals in production, including complex, stateful UIs that users depend on
- Strong TypeScript proficiency, with the ability to design clean typed interfaces across components, API boundaries, and application state
- Strong observability habits: you instrument what you ship, monitor whether it works, and use data to guide follow-up improvements
- Ability to absorb complex product and business requirements and translate them into correctly sequenced frontend implementations
- Fluency consuming APIs: you can read schemas, understand data shapes, handle loading and error states, and build typed web app interfaces without being blocked by backend engineers
- Next.js, Tailwind, and shadcn/ui experience is a meaningful plus
- Experience with billing, payments, or usage-based pricing UIs is a strong differentiator, including Stripe SDKs, metering displays, subscription states, checkout flows, or enterprise invoicing

Responsibilities

- Own Commerce’s frontend layer end-to-end: from consuming service APIs and building typed interfaces to delivering polished, accessible, user experiences, jumping in to backend systems when necessary to unblock product work in a fast-paced environment
- Break down complex product requirements and business logic into an iterative roadmap, sequence implementations correctly, and execute without needing step-by-step direction
- Champion the customer experience across commerce surfaces: notice friction, identify product and UX gaps, and turn recurring customer issues into clear opportunities for the team to improve
- Build reusable, well-typed React components on top of Together’s UI Platform and component library, making future Commerce work faster to ship
- Instrument, measure, and verify the success of your own features using data-driven metrics and signals including product analytics, web vitals, and error rates
- Catch and address edge cases, error states, and failure modes that matter in commerce contexts, including payment failures, quota overages, upgrade blockers, and inconsistent billing states

About Together AITogether AI is a research-driven artificial intelligence company. We believe open and transparent AI systems will drive innovation and create the best outcomes for society, and together we are on a mission to significantly lower the cost of modern AI systems by co-designing software, hardware, algorithms, and models. We have contributed to leading open-source research, models, and datasets to advance the frontier of AI, and our team has been behind technological advancement such as FlashAttention, Hyena, FlexGen, and RedPajama. We invite you to join a passionate group of researchers in our journey in building the next generation AI infrastructure.CompensationWe offer competitive compensation, startup equity, health insurance and other competitive benefits. The US base salary range for this full-time position is: $160,000 - $230,000 + equity + benefits. Our salary ranges are determined by location, level and role. Individual compensation will be determined by experience, skills, and job-related knowledge.Equal OpportunityTogether AI is an Equal Opportunity Employer and is proud to offer equal employment opportunity to everyone regardless of race, color, ancestry, religion, sex, national origin, sexual orientation, age, citizenship, marital status, disability, gender identity, veteran status, and more.Please see our privacy policy at https://www.together.ai/privacy
    `
  },
  4340321621: {
    title: "Member of Technical Staff, Frontend Product",
    company: "LlamaIndex",
    baseRange: [180000, 250000],
    description: `
Join us and help shape the future of AI by defining the narrative around document understanding.About The RoleLlamaIndex is looking for a well-seasoned 🧂 frontend-leaning product engineer who can ship AI products fast and isn't afraid to wear multiple hats. You'll build our cloud platform frontend with Next.js, drive product vision for both developer and traditional enterprise user personas, help resolve issues in our Python backend as needed, and work directly with customers to turn wild ideas into production reality. If you've wrangled and optimized the frontend layer, launched AI apps that actual humans use, and can go from "what if?" to "MVP ready" faster than most people can schedule a kickoff meeting, let's talk.Responsibilities

- [Primary] Front-end/full-stack work for our managed applications/SaaS offering.
- - FE stack: Next.JS, React
- Useful exposure: Auth flows, Vitest, streaming AI SDKs, use analytics integrations
- [Secondary] General API and product development, SDK management.
- - Backend stack: Python, Temporal

Qualifications

- 3+ years of experience
- Experience with shipped web applications or completely new product features from scratch. Have gone from prototype to production serving end users in a short amount of time.
- Shipped AI/LLM-native applications - from UX to core algorithms.
- Iterated rapidly with customers - translate user feedback into features back to proactive user discovery. Help jointly develop and iterate on product roadmap for core features.
- Worked with product and design, demonstrating instances of wearing the PM hat yourself to proactively scope and design features.

LocationWe offer a hybrid-friendly culture based out of our downtown San Francisco office.Why Join Us?

- Impactful Mission: Work on innovative AI products that redefine how knowledge is accessed and utilized.
- Collaborative Team: Join a team of passionate individuals committed to pushing the boundaries of technology.
- Growth Opportunities: Be at the forefront of the AI revolution, with ample opportunities to grow alongside our scaling organization.

Additional Benefits

- Competitive base salary and equity compensation
- Comprehensive medical/dental/vision coverage for you and your family
- Unlimited paid time off policy
- Daily catered lunch and snacks in the San Francisco office

Pursuant to the San Francisco Fair Chance Ordinance, we will consider for employment qualified applicants with arrest and conviction records.LlamaIndex does not accept unsolicited agency resumes. Please do not forward resumes to our jobs alias, employees, or any other organization location. LlamaIndex is not responsible for any fees related to unsolicited resumes.Compensation Range: $180K - $250K
    `
  },
  4439376769: {
    title: "Staff Software Engineer, AI Developer Tooling",
    company: "Sentry",
    baseRange: [155000, 400000],
    description: `
About SentrySoftware runs the world and the pace is faster than ever. Sentry helps developers fix errors and performance issues before users notice, so teams can spend less time firefighting and more time building.Trusted by 200,000+ organizations, Sentry is today’s application monitoring standard and our team is building its AI-native future.About The RoleThis isn’t a typical engineering role. You won’t be embedded in a single product team or siloed in one product area. Instead, you’ll sit within Platform Engineering, own the AI-assisted coding domain, and work across all of engineering at Sentry, focused specifically on how AI coding agents participate in our software development lifecycle.For AI coding agents to work well in our repo, the internal systems they depend on need to be accessible via API, not locked behind UIs that require human interaction. Right now, many of those systems aren’t agent-ready. You’ll audit and prioritize that gap, expose those systems programmatically, and build the connections that let tools like Claude Code operate on them end-to-end. From there, the scope expands to improving the quality of AI-generated pull requests and automating the engineering work that’s important but consistently deprioritized. You will look from context engineering standpoint to see what to send to our model; you will look from harness engineering standpoint to see the tools it can use, the permissions it has, the state it carries forward, the tests it has to pass, the logs you capture, the retries, checkpoints, guardrails, and evals.You’ll work closely with the dev infrastructure team as your home base, then collaborate across every product team coding in our repo once the tooling foundation is in place. It’s a broad role with real impact, and the work you do will directly change how Sentry engineers ship software.What You’ll Do

- Audit Sentry’s internal developer systems and make them API-ready for AI agents. You’ll prioritize and drive the work of exposing those systems programmatically, and build the connections that allow agents to operate on them end-to-end.
- Build the harness tooling, context systems, and feedback loops that help agents generate high-quality, repository-aware pull requests, including automated pre-review checks and PR quality measurement tailored to Sentry’s codebase.
- Automate high-volume, low-priority engineering work: security dependency upgrades, minor bug fixes, and routine maintenance, so engineers can focus on higher-value work.
- Design and build internal tools that make engineering more effective: productivity dashboards, AI-assisted issue triage, CI/CD optimizations, and tooling that reduces toil.
- Identify and remove organizational friction. Use data and direct observation to find where engineering is slowing down, recommend solutions to senior leadership, and build cross-team buy-in for changes.

You’ll Love This Job If You…

- You’re passionate about AI coding tools and curious about how to make them better. You follow the space closely, have opinions about what works, and want to be at the frontier of how AI participates in real-world software development.
- You’re high agency. You don’t wait for permission. When you see a problem, you figure out the right solution and make it happen. You’re comfortable with ambiguity, can structure your own work, and know when to build it yourself, when to delegate, and when to say “this isn’t worth doing.”
- You’ve seen enough systems and codebases to pattern-match quickly. You can move between infrastructure, backend, and developer tooling without friction, and you bring seasoned judgment to technical decisions.
- You’re metric-driven but not metric-obsessed. You use data to make good decisions, and you know the best insights sometimes come from talking directly to the engineers feeling the pain.
- You thrive on variety. You enjoy the pace of “figure this out and build it, then move to something completely different,” and you can shift between strategic and hands-on work without losing momentum.
- You communicate clearly and can influence without authority. You work across team boundaries, present recommendations to senior leadership, and build buy-in for your ideas. People listen because you’ve done the work to understand things deeply.

Qualifications

- 10+ years of software engineering experience.
- Experience building tools or workflows that improve how developers or AI agents work. This could be CI/CD or dev infra experience, or it could be AI harness tooling, AI-first coding workflows, or public contributions in this space. We’re open to a range of backgrounds.
- Strong software and system design fundamentals.
- Genuine curiosity and hands-on experience with AI coding tools and agents. Prior machine learning experience isn’t required.
- Excellent written and verbal communication; comfortable presenting to senior technical leadership.
- A track record of driving cross-team technical initiatives to completion.
- Experience with large-scale distributed systems or monolith decomposition (nice to have).
- Prior work on developer experience or engineering productivity programs (nice to have).
- Familiarity with code review tooling, static analysis, or automated PR pipelines (nice to have).

The base salary range that Sentry reasonably expects to pay for this position is $155,000 to $400,000 USD plus up to 20% bonus. A successful candidate’s actual base salary amount will be determined by a variety of relevant factors including, without limitation, the candidate’s work location, education, work and other relevant experience, skills, and job-related knowledge. A successful candidate will be eligible to participate in Sentry’s employee benefit plans/programs applicable to the candidate’s position (including incentive compensation, equity grants, paid time off, and group health insurance coverage). See Sentry Benefits for more details about the Company’s benefit plans/programs.Equal Opportunity at SentrySentry is committed to providing equal employment opportunities to its employees and candidates for employment regardless of race, color, ancestry, religion, sex, national origin, sexual orientation, age, citizenship, marital status, disability, gender identity, veteran status, or other legally-protected characteristic. This commitment includes the provision of reasonable accommodations to employees and candidates for employment with physical or mental disabilities who require such accommodations in order to (a) perform the essential functions of their jobs, or (b) seek employment with Sentry. We strive to build a diverse team, with an inclusive culture where every teammate can thrive. Sentry is an open-source company because we believe that everyone, everywhere, should have the ability and tools to make great software. Software should be accessible. That starts with making our industry accessible.If you need assistance or an accommodation due to a disability, you may contact us at accommodations@sentry.io.Want to learn more about how Sentry handles applicant data? Get the details in our Applicant Privacy Policy.
    `
  },
  4434081520: {
    title: "Principal Software Engineer, Developer Tools (US West Coast)",
    company: "Docker",
    baseRange: [198000, 319000],
    description: `
Docker has been one of the most loved brands in developer tooling, trusted by more than 20 million monthly users and over 20 billion container image pulls. From solo founders to the world's largest companies, developers rely on Docker to build, share, and run their applications across our suite of products including Docker Desktop, Docker Hub, and Docker Scout.We are a globally distributed, remote-first team building the tools that define how software gets built and delivered. As AI agents redefine software development, Docker is at the center of that shift, providing the sandboxed environments, verified images, and secure infrastructure that make autonomous workflows trustworthy by default.Docker seeks a Principal Software Engineer to define the technical vision and architecture for our internal Developer Tools team. This is a rare opportunity to establish how software is designed, built, shipped, and operated at Docker. With the addition of AI we are modernizing our SDLC and building the mechanisms that make the right way the easy way for every engineer.You'll Own The Technical Strategy Across Four Interconnected PillarsPlatform Engineering & Self-Service: Design and build the internal developer platform that empowers teams across Docker to unblock themselves, rapidly scaffolding, prototyping, deploying, and operating their own services and tools.CI/CD & Build Systems: Define Docker's technical approach to continuous integration, delivery, and build infrastructure. Establish architectural standards for pipeline tooling, GitOps deployment patterns, build substrate, and release engineering.As Principal Software Engineer, you'll partner with engineering leadership across Docker, principal engineers, Security, Infrastructure, and the service teams to author the SDLC tenets that underpin all of this work, and build the mechanisms those tenets run through.Reporting to the Sr Manager of Developer Tools, you'll collaborate closely with engineering leadership across Docker, product engineering teams, platform teams, and ultimately customers as internal tools evolve into product offerings.What Would Make Someone Successful In This RoleYou're a technical leader who excels at the intersection of developer experience, platform engineering, and systems design. You think in platforms and golden paths, building once and enabling dozens of teams to move faster. You have strong opinions on what makes developer tools great: invisible by default, indispensable once adopted, and measurable in the workflows engineers already use.You have deep experience across the breadth of the developer tooling stack, CI/CD, build systems, observability infrastructure, and developer platforms, and working knowledge of LLM integration and AI agent development. You understand the nuances of internal platforms: designing for adoption, not mandate; plugging into existing workflows before standing up new ones; and earning trust through data before expanding scope.You have exceptional judgment on when to build custom solutions versus integrate existing tools, and you're comfortable navigating a rapidly evolving landscape across both AI and developer infrastructure. You balance technical excellence with pragmatism, shipping iteratively while maintaining high quality bars. Most importantly, you lead through influence and mentorship, elevating the entire engineering organization's technical capabilities.ResponsibilitiesTechnical Leadership & Architecture

- Define the long-term technical vision and architecture for Docker's developer tooling platform spanning platform engineering, CI/CD, and AI-powered tools
- Lead authoring of SDLC tenets in partnership with other principal engineers, Security, and Infrastructure and build the mechanisms those tenets bind to (design gates, code review gates, pipeline standards, visibility)
- Establish architectural patterns, technical standards, and best practices across the developer tooling stack
- Design highly available, scalable infrastructure for hosting developer tools, agents, and platform services
- Drive technical decisions on tooling choices, provider strategies, build/deploy substrate, and agent orchestration frameworks
- Partner with Senior Manager and product leadership to align technical architecture with business objectives and productization opportunities

Systems Design & Implementation

- Architect and build Docker's internal developer platform, the self-service substrate enabling teams to scaffold, deploy, and operate services with minimal friction
- Design and implement CI/CD and build infrastructure that supports Docker's SDLC tenets and GitOps deployment patterns
- Establish reliability, security, and performance standards across developer tooling including SLOs, monitoring, incident response, and cost management
- Design integration points between developer tools and existing infrastructure (CI/CD pipelines, observability platforms, deployment systems)

Strategic Impact & Innovation

- Evaluate emerging technologies across developer tooling, platform engineering, AI/LLM, and agent frameworks to inform Docker's technical strategy
- Define and enforce the golden path, the concrete, left-to-right walkthrough of how Docker builds software, and identify where tooling closes gaps vs. where human process does
- Drive technical standards for measuring developer tool effectiveness: adoption metrics, productivity gains, pipeline performance, and developer satisfaction
- Lead cross-functional technical discussions influencing company-wide developer tooling architecture
- Define technical approach for productizing successful internal developer tools into customer-facing offerings

Leadership & Mentorship

- Mentor senior and staff engineers on platform engineering, CI/CD patterns, design, and AI/LLM integration
- Lead design reviews and technical decision-making across all developer tooling work
- Foster culture of technical excellence, experimentation, and rapid prototyping within the Developer Tools team
- Serve as primary technical contact and thought leader for developer tooling across Docker's engineering organization
- Collaborate with platform teams (Infrastructure, Security, Agentic Platform, Supply Chain Security) to establish shared technical standards and integration patterns
- This role may require participation in an on-call rotation to provide support outside of standard business hours, including evenings, weekends, and holidays, as needed.

QualificationsRequired:

- 10+ years software engineering experience with 3+ years in Staff or Principal Engineer roles
- Bachelor’s degree in Computer Science, Engineering, or a related field, or equivalent practical experience.
- Proven track record architecting and operating developer-facing platforms, internal tools, or developer productivity systems at scale
- Deep expertise in CI/CD systems, build infrastructure, and GitOps deployment patterns
- Production experience with cloud-native infrastructure including Kubernetes, observability systems (Prometheus, Grafana, Loki), and deployment tooling
- Experience designing self-service platforms, developer portals, or golden path tooling that enable other teams to move faster
- Working knowledge of AI/ML technologies and hands-on experience with LLM APIs or AI agent development
- Proficiency in Go (preferred), Rust, Java, or Python with strong software engineering fundamentals
- Exceptional product and platform mindset considering developer experience, business outcomes, and technical/security trade-offs
- Strong communication skills with ability to influence technical and non-technical stakeholders
- Track record of technical mentorship and elevating engineering teams' capabilities
- Ownership mentality with bias for action and iterative delivery in ambiguous, fast-moving environments
- Comfortable with autonomous work in distributed, remote-first teams across multiple time zones

Preferred

- Experience with MCP (Model Context Protocol) or similar AI agent integration standards
- Background in DevOps, SRE, or platform engineering domains
- Contributions to open source developer tooling, platform engineering, or observability projects
- Experience productizing internal platforms into commercial offerings
- Deep knowledge of security, compliance, and operational best practices for production systems
- Experience with infrastructure-as-code frameworks (Terraform, Pulumi) and multi-cloud platforms (AWS, GCP, Azure)
- Track record driving org-wide adoption of developer tooling and engineering standards

What To ExpectFirst 30 Days

- Understand Docker's current developer tooling landscape: AI tools, CI/CD state, platform engineering gaps, and the foundational SDLC gap
- Meet with engineering leadership, principal engineers, and key technical stakeholders across product engineering, Security, Infrastructure, and Agentic Platform
- Conduct deep technical assessment of current developer tooling infrastructure to identify opportunities and constraints across all four pillars
- Review existing tools in production and understand what's working, what isn't, and the technical lessons learned
- Partner with Senior Manager to define initial technical priorities and 90-day technical roadmap across pillars

First 90 Days

- Define and document technical architecture for the Developer Tools platform across: system design, technology choices, integration patterns, and operational model
- Ship first production deliverable, either an extension of existing tooling or a net-new tool with architectural patterns and standards that scale to future work
- Establish technical foundations for the self-service platform: deployment pipeline, security controls, and cost management
- Lead or contribute to the SDLC tenets working session with principal engineers, Security, and Infrastructure
- Define success metrics and instrumentation strategy for measuring developer tool adoption, effectiveness, and productivity impact
- Create architectural decision records and best practices guides for teams building on the platform

First Year Outlook

- Establish mature technical architecture for the Developer Tools platform with multiple production tools demonstrating value
- Build production-ready self-service platform enabling multiple teams to build, deploy, and operate their own tools with minimal friction
- Define and implement technical standards for measuring developer productivity improvement: design quality, commit frequency, PR velocity, deployment reliability, and incident response times
- Lead technical strategy for productizing successful internal tools into customer-facing offerings
- Position Developer Tools as Docker's technical center of excellence for developer productivity, with regular technical talks, demos, and knowledge sharing
- Define multi-year technical roadmap including advanced platform capabilities, expanded AI tooling, and emerging technology adoption

Docker considers visa sponsorship on a case-by-case basis based on business needs.Perks

- Freedom & flexibility; fit your work around your life
- Designated quarterly Whaleness Days plus end of year Whaleness break
- Home office setup; we want you comfortable while you work
- 16 weeks of paid Parental leave (after 6 months of employment)
- Technology stipend equivalent to $100 USD net/month
- PTO plan that encourages you to take time to do the things you enjoy
- Training stipend for conferences, courses and classes
- Equity; we are a growing start-up and want all employees to have a share in the success of the company
- Docker Swag
- Medical benefits, retirement and holidays vary by country
- Remote-first culture, with offices in Seattle and Paris

Docker embraces diversity and equal opportunity. We are committed to building a team that represents a variety of backgrounds, perspectives, and skills. The more inclusive we are, the better our company will be.Compensation Range: $198K - $319K
    `
  },
  4432824117: {
    title: "Senior Software Engineer - Developer Platform",
    company: "Pave",
    baseRange: [195500, 264500],
    description: `
Who We AreAt Pave, we're building the industry’s leading compensation platform, combining the world's largest real-time compensation dataset with deep expertise in AI and machine learning. Our platform is perfecting the art and science of pay to give 8,500+ companies unparalleled confidence in every compensation decision.Top tier companies like OpenAI, McDonald’s, Instacart, Atlassian, Synopsys, Stripe, Databricks, and Waymo use Pave, transforming every pay decision into a competitive advantage. $190+ billion in total compensation spend is managed in our workflows, and 70% of Forbes AI 50 use Pave to benchmark compensation.The future of pay is real-time & predictive, and we’re making it happen right now. We’ve raised $160M in funding from leading investors like Andreessen Horowitz, Index Ventures, Y Combinator, Bessemer Venture Partners, and Craft Ventures.Developer Platform @ PaveThe Developer Platform team sits at the heart of Pave Engineering. Our customers are Pave's own engineers. We treat developer experience as a product - the leverage layer that lets every team ship enterprise-grade software fast and reliably.This is a high-impact, high-autonomy role where you'll help define how Pave builds software. As a senior engineer, you'll lead initiatives end to end, from CI/CD and observability standards to local development workflows and incident response. You'll also shape how AI-assisted and agentic workflows fit into Pave's development loop - from scaffolding to review to deploy. You'll partner closely with engineers across product and data to remove friction, boost developer velocity, and strengthen reliability. You'll own the metrics for developer velocity and reliability, and be accountable for moving them.What You'll BringExperience & skills

- 4+ years of experience in backend, infrastructure, or developer experience.
- Solid understanding of cloud architecture (GCP or similar), with a sharp sense of the reliability and security tradeoffs that come with handling sensitive compensation data.
- Strong debugging and systems thinking, with experience scaling production services.
- Hands on with modern AI tooling - agentic coding, AI-assisted review/testing - with a clear-eyed view of where it does and doesn't help.
- Experience with monorepo tooling and build systems - keeping builds fast and CI tractable as the codebase and team grow.

How you work

- High developer empathy - you love improving workflows and helping others move faster.
- Opinionated and pragmatic, with a genuine passion for engineering best practices and CI/CD craftsmanship: fast feedback loops, reliable pipelines, strong testing, safe progressive delivery.
- Comfortable in a fast-paced startup environment, with a proven ability to lead large, ambiguous projects that land cross-team impact.

Some core technologies we build with include: TypeScript, Node.js, MySQL, Orbstack, Kubernetes, Terraform, Datadog, GitHub Actions, E2B, ClickHouse, and Incident.io.Compensation, It's What We Do.Salary is just one component of Pave's total compensation package for employees. Your total rewards package at Pave will include equity, top-notch medical, dental, and vision coverage, an unlimited PTO policy, and many other region-specific benefits. Your level is based on our assessment of your interview performance and experience, which you can always ask the hiring manager about to understand in more detail. This salary range may include multiple levels.The targeted cash compensation for this position is (level depends on experience and performance in the interview process): $195,500 - $264,500Life @ Pave Founded in 2019 with a clear purpose and a team that has never wavered from it, Pave has grown into a global force in compensation management — giving thousands of companies the tools to take control, build confidence, and earn credibility in every pay decision they make. And we're just getting started. Headquartered in San Francisco's Financial District, with regional hubs in New York City's Flatiron District, Salt Lake City, Kraków (Poland), and the United Kingdom — wherever you're based, you'll find the same thing: people who genuinely care about the work, each other, and the customers that rely on Pave.We run a hybrid culture that brings teams together in person 3 to 4 days a week — and every Friday, the whole company gathers for our Team Sync: breakfast, new hire welcomes, product updates, fireside chats, and yes, the occasional Kahoot. It's one of the things people notice when they join us — that we truly enjoy spending time together.Our culture is shaped by five values we live every day:

- Be Intellectually Honest — Truth over comfort. We face reality clearly and speak directly, even when it's hard.
- Play to Win — We're not here to participate. We're here to be the #1 compensation platform in the world, and we act like it.
- Uphold the Pave Platinum Standard — We hold ourselves to the highest bar — for our customers, our data, and each other.
- One Team — We win and lose together. Titles don't drive decisions here — shared goals do.
- Hug of Jawn — Hard to define, impossible to miss. Ask your recruiter.

Our Vision: Unlock a labor market built on trust.Our Mission: Build confidence in every compensation decision.We build software that transforms how companies pay their people — and we believe the team behind that software deserves the same thoughtfulness. If you're ready to help shape the future of compensation alongside people who are smart, humble, and genuinely motivated by the problem we're solving, we'd love to meet you.Still deliberating? Just apply! We're always excited to meet people who are eager to contribute.
    `
  },
  4434416681: {
    title: "Sr. UI Engineer - React (Onsite, San Francisco 94108)",
    company: "Jeeva AI",
    baseRange: [130000, 180000],
    description: `
Location - 600 California Street, San Francisco, CA (ZIP 94108)

Mode of Work - Onsite, Full-Time

About Jeeva.AI:

Jeeva AI is an autonomous digital worker platform that builds long-horizon AI workers to automate the repetitive, manual work entire teams used to spend months on. Six revenue workers are in production today - Leads, Enrichment, Research, Inbound, Outreach, and Deals Intelligence - serving 36,000+ users with 30% month-over-month organic growth. Jeeva's 2026 roadmap expands across three product teams: Front Office Workers, Back Office Workers (targeting $190B+ in US IT labor), and the Worker Builder Platform launching June 2026, enabling enterprises to design, configure, and deploy their own autonomous digital workers.

Job Description:

- 3+ years of solid experience as a Software Development Engineer with a strong background in React.JS
- Develop and maintain modern, responsive web applications using React.js and related technologies.
- Build reusable components and front-end libraries for future use.
- Translate UI/UX designs and wireframes into high-quality code.
- Optimize components for maximum performance across a wide range of web-capable devices and browsers.
- Integrate front-end logic with APIs and backend systems.
- Participate in code reviews and ensure adherence to best Stay updated on the latest front-end trends, tools, and best practices.
- Competent in applying AI technologies, particularly in using GPT models for natural language processing, automation and creating intelligent systems.
- You've built and shipped products that users love and have seen the impact of your work at scale.
- You take pride in owning projects from start to finish and are comfortable wearing multiple hats to get the job done.
- You stay ahead of the curve, eager to explore and implement the latest technologies, particularly in AI.
- You thrive in a team environment and can work effectively with both technical and non-technical stakeholder.
- You have a hunger for success and are eager to contribute to a fast-growing company with big goals.

Compensation & Benefits:

- Compensation: Annual Salary Range $130,000 - $180,000
- Equity: Competitive
- Fully covered medical, dental, and vision insurance for employee
- PTO as per the company policy

Equal Opportunity

Jeeva is an equal-opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees.

Authorization to Work - Must be authorized to work in the US.

PLEASE NOTE - Direct applicants ONLY. Any recruiter/3rd party submissions we receive will be considered a gift.
    `
  },
  4417446229: {
    title: "Senior Engineer, Developer Platforms and Generative AI",
    company: "The New York Times",
    baseRange: [140000, 180000],
    description: `
- Design and build GenAI-powered developer tooling: prompts, IDE integrations, Cursor/Claude rules, and telemetry to understand how they’re used.
- Build and run the GenAI developer platform: Tools, services, and integrations leveraging LiteLLM to power both local and background/long-running agents, providing auth, configuration, and LLM routing.
- Own guardrails and observability for agentic workflows: integrate with Datadog, DX, and FinOut, define sensible standards, and make sure agents interact with Jira, GitHub, and internal platforms in a safe, auditable way.
- Work closely with engineers and managers across Product Engineering to understand how they build software today and to design solutions that actually fit the way they work.
- Support our mission and values, including journalistic independence, and keep ethics and safety central to how we use AI in developer workflows.
- This role includes limited on-call responsibilities; the schedule will be set when you join.Demonstrate support and understanding of our value of journalistic independence and a strong commitment to our mission to seek the truth and help people understand the world.
- You will report to the Engineering Manager of the DevEx Platforms team 

Basic Qualifications 

- 5+ years of professional software engineering experience
- 2+ years of experience improving developer experience through workflows, documentation, and capabilities of the internal platform
- Experience designing and building cloud native applications. We use Golang
- Hands-on experience building software using GenAI tools, like GitHub's Copilot, Cursor or Claude Code 

Preferred Qualifications 

- 3+ years of hands on experience managing and deploying resources in AWS
- 2+ years of experience managing workloads deployed on Kubernetes
- Experience in prompt engineering or building AI-powered tools 

This role requires limited on-call hours. An on-call schedule will be determined when you join, taking into account team size and other variables. REQ-020128 Compensation And Benefits For This Role In addition to base salary, this role is also eligible for variable pay, such as an annual bonus and restricted stock. Benefits include medical, dental and vision benefits, Flexible Spending Accounts (F.S.A.s), a company-matching 401(k) plan, employee stock purchase plan, paid vacation, paid sick days, paid parental leave, tuition reimbursement and professional development programs. The annual base pay range for this role is between: $140,000 - $180,000 USD Candidate Use Of GenAI Tools We’re excited to learn more about you and your experience. To keep our hiring process as fair and authentic as possible, we ask that you submit your own work and not use GenAI tools to generate substantive content during the application and interview process. If you’re an engineering candidate, we’ll let you know what specific GenAI tools you are permitted to use for your technical assessment. The New York Times Company is committed to being the world’s best source of independent, reliable and quality journalism. To do so, we embrace a diverse workforce that has a broad range of backgrounds and experiences across our ranks, at all levels of the organization. We encourage people from all backgrounds to apply. We are an Equal Opportunity Employer and do not discriminate on the basis of an individual's sex, age, race, color, creed, national origin, alienage, religion, marital status, pregnancy, sexual orientation or affectional preference, gender identity and expression, disability, genetic trait or predisposition, carrier status, citizenship, veteran or military status and other personal characteristics protected by law. All applications will receive consideration for employment without regard to legally protected characteristics. The U.S. Equal Employment Opportunity Commission (EEOC)’s Know Your Rights Poster is available here. The New York Times Company will provide reasonable accommodations as required by applicable federal, state, and/or local laws. Individuals seeking an accommodation for the application or interview process should email reasonable.accommodations@nytimes.com. Emails sent for unrelated issues, such as following up on an application, will not receive a response. For information about The New York Times' privacy practices for job applicants, click here. Please beware of fraudulent job postings. Scammers may post fraudulent job opportunities, and they may even make fraudulent employment offers. This is done by bad actors to collect personal information and money from victims. All legitimate job opportunities from The New York Times will be accessible through The New York Times careers site. The New York Times will not ask job applicants for financial information or for payment, and will not refer you to a third party to do so. You should never send money to anyone who suggests they can provide employment with The New York Times. If you see a fake or fraudulent job posting, or if you suspect you have received a fraudulent offer, you can report it to The New York Times at NYTapplicants@nytimes.com. You can also file a report with the Federal Trade Commission or your state attorney general.
    `
  },
  4428858352: {
    title: "Design Engineer",
    company: "Dedalus Labs",
    baseRange: [170000, 230000],
    description: `
Design Engineer @ Dedalus LabsMissionDedalus Labs is an AI research neolab building infrastructure for AI agents.We are looking for a design engineer who wants to build the UI for the platform that will power the AI agents of the future.You might be a fit if you

- Are obsessive about user experience.
- Measure thrice, cut once.
- Sweat the small details.
- Believe great products are built from millions of tiny perfected parts.
- Live at the bleeding edge of web and browser technology.
- Have strong opinions about frameworks, languages, rendering models, and where the web is going.
- Think the internet should be faster.
- Have shipped amazing work.
- Understand why a spring beats a tween.
- Care about optimal bundling strategies.
- View software engineering as simply moving typed data around.
- Believe actions speak louder than words.
- Are high agency and fiercely independent.
- Say how things ought to be built, then build them.
- Are a competitive teammate with a heart of gold.
- Are hungry to learn, improve, and reflect deeply on feedback.
- Go above and beyond in everything you do.

What We Look For

- Fluency with AI coding tools.
- Deep expertise in React and TypeScript.
- Experience with web frameworks like Next.js, Vite, or Remix.
- Wizardry with styling libraries like Tailwind CSS.
- Strong instincts in responsive design and motioning patterns.
- Performance-pilled engineers with exceptional core web vitals instincts.
- Good judgment around RSC, streaming, and loading states.
- Responsive, accessible work.
- Modern CSS you are a little smug about.

Nice-to-have

- Experience with Motion, GSAP, View Transitions, WebGL, Three.js, React Three Fiber, or similar tools.
- High-performance tooling, e.g. Vite+, the oxc stack, etc.
- Canvas, shaders, GLSL, or WebGPU.
- Open-source contributions we can look at.
- Tools or techniques we have not heard of yet.
- Experience writing APIs.
- Comfort with Supabase or a similar database.
- Strong knowledge of types.
- Interest in category theory.

TasteYou know what good looks like.Logistics

- In person in San Francisco.
- Remote considered case by case for exceptional applicants.
- We sponsor visas.

TipsThe first thing we look at is your GitHub and your personal website. Show us the best version of yourself!Compensation Range: $170K - $230K
    `
  }
}

export default jobs
