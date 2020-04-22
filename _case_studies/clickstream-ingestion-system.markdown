---
id: 5
title: Clickstream Ingestion System
slug: clickstream-ingestion-system
alt: image-alt
client: Internet Brands
tags: API, kafka, data-engineering, devops, custom-software-development
project-url: ''
status: published
---

<div class="problem">
<h2 class="subheading">The Problem</h2>
<p>
Our client wanted to capture user activity across the many websites they operate. A clickstream solution (JS snippet, API, message bus) seemed like a straight-forward solution to implement. The catch? They anticipated around 2000 events per second during peak times.
</p>
</div>

<div class="solution">
<h2 class="subheading">Our Solution</h2>
<p>
We built a simple solution with high-scale needs baked in. Our JS snippet was designed to work in an extensive range of browsers (with automated testing via BrowserStack to boot), under no circumstances impeding user experience. Each component in the stack was clustered for redundancy and to support horizontal scaling. Components were observable, allowing us to monitor the performance and health of the system constantly.
</p>
</div>

<div class="value">
<h2 class="subheading">Proven Results / Value Add</h2>
<p>
The collection of this information opened a window to cross website user activity. This allowed for the creation of user segments for marketing purposes, and for various personalised user experience efforts to get underway.
</p>
</div>
