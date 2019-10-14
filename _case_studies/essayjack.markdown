---
title: EssayJack
subtitle: EssayJack is an essay templating platform that has an interactive essay editor that pre-structures student essays. Created by professors, it provides a way for instructors to guide students through the daunting task of essay writing.
layout: work_post
img: essayjack.png
thumbnail: essayjack-thumbnail.png
slug: essayjack
alt: image-alt
client: EssayJack
tags: [Ruby, React, Project+Rescue]
description: EssayJack is an essay writing system that takes the stress out of essay-writing. The Rapid River team inherited a clunky beta app and was tasked with transforming it into a sleak, modern, React frontend.
project-url: https://www.essayjack.com
status: published
---

###### EssayJack is an essay templating platform that has an interactive essay editor that pre-structures student essays. Created by professors, it provides a way for instructors to guide students through the daunting task of essay writing.

## The Challenge
EssayJack founder Lindy came to us with a “traditional” Rails app that needed some intensive care. The app had been developed as an MVP, had gained some traction and had a user base. But key features of this beta version of the app behaved unpredictably, at times breaking the UX in a jarring way. The app’s test suite was not in a state where we could rely on it to provide the security we needed to conduct a refactoring exercise. Being a team who isn’t afraid of anything, we welcomed this opportunity. A Project Rescue operation began.

## Our Approach
Our contribution to the project began with a thorough audit. This helped us familiarise ourselves with the codebase, and over the course of a month, we presented our findings to EssayJack. During this time, we also helped the existing development team fix critical bugs that were impeding the users’ experience on the app. This first month of work demonstrated our ability to manage such projects, giving EssayJack the assurance they needed to continue their engagement with us.

The next order of business was stabilize the product. This stabilization process included a period of further bug fixing. We got the test suite into a state where it could be relied on. We expanded it’s coverage and hooked it into our CI process. To solve certain performance issues and make deployment more convenient, we migrated the app to AWS OpsWorks.

With a reliable test suite in place, we began refactoring. The first major area we tackled was the template editor. Rebuilding this key feature was a crucial step in moving the product into a phase where it was open for extension. The refactoring put us in a good place for a front-end revamp to be considered.

A design firm called <a href="http://d-n.io/essayjack/" target="_blank" rel="noopener noreferrer">Digital Natives</a> were brought in at this point to design a brand new app for EssayJack. Our goal was to bring this reimagined EssayJack to life. The complex essay editor had a lot of moving parts, so we needed a solution that would give us a way to manage state and provide us with a view layer. We went with React.

The re-design of the frontend was an intense period of development for us, carried out over a four month period. We turned off access to the old app once EssayJack users were comfortably using the new app. Thus bidding farewell to the beta phase of the project.

<!-- 
<div class="client-quote">
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc pulvinar scelerisque purus. Sed pharetra tempor est quis ultricies. Vestibulum ut tellus tortor. Etiam lacinia libero id enim porttitor scelerisque. Ut eget nisl et risus aliquam tempor. Aliquam et risus a ante tempus viverra a eget nisl. Praesent congue magna non scelerisque convallis.
</div> -->

## Against the Clock
The desired delivery date for the new frontend was rather tight. In order to meet it we decided to get creative with our internal team structure. We temporarily expanded our team by adding developers who could write React components. This allowed us to ship on the timeline that EssayJack wanted.

<!-- <div class="client-quote">
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc pulvinar scelerisque purus. Sed pharetra tempor est quis ultricies. Vestibulum ut tellus tortor. Etiam lacinia libero id enim porttitor scelerisque. Ut eget nisl et risus aliquam tempor. Aliquam et risus a ante tempus viverra a eget nisl. Praesent congue magna non scelerisque convallis.
</div> -->

## The Outcome
Getting the app stable was instrumental in keeping EssayJack users engaged. The new front-end allowed the EssayJack team to push sales and marketing a lot harder. It looked modern and stylish, and worked a whole lot better as it fixed many performance issues that simply could not be addressed in the old app.

These days, our efforts are largely focused on the implementation of new features and the refinement of our processes and workflows. Our EssayJack team now practice Scrum and have been having great success as a result.
