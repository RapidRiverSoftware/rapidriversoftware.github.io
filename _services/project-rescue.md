---
title: Project Rescue
layout: service_post
description: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus varius nisl vitae elit imperdiet laoreet. Curabitur nec turpis eu dolor scelerisque commodo ac in lacus. Donec auctor nibh dui, a mattis velit convallis ac. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nam tristique volutpat velit, ac gravida erat placerat in.
slug: project-rescue
related-projects:
  essayjack: '/essayjack'
  fullslate: '/fullslate'
---

Project Rescue is something that Rapid River has performed several times on other projects. Two such projects are owned by IB: LDC Webstats and Full Slate. The general process that we follow is:

#### Code Audit
We review the codebase and ensure we understand the system thoroughly. We take notes while doing this and compile them into an Audit Report. This report will guide the groundwork and tech debt repayment tasks we decide to do first.

#### Product Direction Briefing
We get a better understanding of desired product direction. We meet with the Product team, etc.

#### Groundwork
Based on the Code Audit, we complete a variety of tasks that bring the development process itself into a workable state. Typical tasks which we complete in this step are to ensure that:

The project has a test suite which covers critical app functionality.
 - A VCS is in use, and that code review of code changes is possible via Merge Requests (MR).
 - A CI system is being used, and that the project’s test suite is run against every MR, and is integrated with the VCS.
 - The app’s deployment mechanism is set up according to desired best practices.
 - Adequate staging environments exist, or that an ability to create staging environments on demand exists.
 - Standing up a dev environment for developer onboarding is straight-forward.
- Tech Debt Repayment. Again based on the Code Audit, we complete a variety of tasks which repay the most pressing Tech Debts. We remove the most significant pain points. This step may include some in-depth refactoring work, or every complete rewrites of services within the application stack.
- Feature Development. With the project rescued, feature development becomes the primary focus of dev team.
