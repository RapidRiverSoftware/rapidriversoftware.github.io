---
id: 07
title: Rails Web Framework Upgrade
slug: full-slate-rails-upgrade
alt: image-alt
client: Full Slate
tags: RoR, JS, frontend, backend, project-rescue, audit-and-optimization
project-url: ''
status: published
---

<div class="problem">
<h2 class="subheading">The Problem</h2>
<p>
Full Slate was serving thousands of businesses daily, but a major piece of technical debt had been present for some time: the app was built on Rails version 2.3, which had been end-of-life for more than three years. The ask was to upgrade to the latest version (5.0 at the time).
</p>
</div>

<div class="solution">
<h2 class="subheading">Our Solution</h2>
<p>
We formulated an upgrade roadmap and testing plan. We upgraded one version number at a time, ensuring the app functioned and tests passed before continuing to the next. We captured errors in a tracking system, so that we were aware of every little problem that QA, Product and ourselves encountered when testing. We undid monkey patches which had been added to deal with the older Rails version, and straightened out many gnarly things like composite primary key usage, home-grown asset compilation and dynamic routing. After six months we delivered with minimal disruption and fanfare.
</p>
</div>

<div class="value">
<h2 class="subheading">Proven Results / Value Add</h2>
<p>
This project provided the groundwork necessary to get development restarted on the product. The months (and years) which followed saw many new and significant features being built, allowing the product to remain relevant and keeping the extensive user base it had grown happily engaged.
</p>
</div>
