---
id: 01
title: A Web Stats System is Liberated
slug: webstats
alt: image-alt
client: Martindale-Hubbell
tags: clickstream, analytics, RoR, postgres, oracle, pl-sql, project-rescue
project-url: ''
status: published
---

<div class="problem">
<h2 class="subheading">The Problem</h2>
<p>
A web stats system, collecting key information about ad metrics, had become troublesome to maintain and expensive to run. Complex business logic necessary to translate raw event data into meaningful reports was embedded in opaque database functions.
</p>
</div>

<div class="solution">
<h2 class="subheading">Our Solution</h2>
<p>
We observed that the business logic of the application was too complex to be defined in database functions. A more appropriate home for such logic was a web application coupled with high test coverage. We built a tool which showed us discrepancies between the output of the system we were building and the existing system. As we migrated functionality, we continually compared old and new behaviour and adjusted our solution to suit. We included reporting tools in our app to allow us to look at the data we were transferring. We included tools in our implementation which allow for convenient review and fixing of problematic incoming data. We launched our re-implementation without any disruption to the system.
</p>
</div>

<div class="value">
<h2 class="subheading">Proven Results / Value Add</h2>
<p>
Our client let go of an expensive DB license, which reduced operating costs significantly. Stats collection and report generation was able to continue, and iterative development of the application was able to start as the codebase was conveniently extensible.
</p>
</div>
