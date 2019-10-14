---
title: Full Slate
subtitle: Full Slate is appointment scheduling software for businesses. They provide their customers (typically small businesses) with a convenient way of letting their clients book appointments online.
layout: work_post
img: fullslate.png
thumbnail: fullslate-thumbnail.png
slug: fullslate
alt: image-alt
client: Full Slate
tags: Ruby on Rails, JavaScript, Data
description: Full Slate is an appointment scheduling software for small businesses. The Rapid River successfully upgraded the Rails version from 2 to 5.
project-url: https://www.fullslate.com/
status: published
---

###### Full Slate is appointment scheduling software for businesses. They provide their customers (typically small businesses) with a convenient way of letting their clients book appointments online.

## The Problem

Full Slate was serving thousands of businesses daily, but a major piece of technical debt had been present for some time: the app was built on Rails version 2.3, which at the time had been in an end-of-life state for more than three years. The ask was to upgrade the app to the latest version of Rails (at the time 5.0), as a prerequisite to doing new feature development.

## Our Approach

We prepared ourselves for this task by doing the following:
Putting together an upgrade roadmap by following [several](http://www.rails-upgrade-checklist.com/) [guides](https://guides.rubyonrails.org/upgrading_ruby_on_rails.html).
Deciding what our testing strategy would be, both in terms of what we'd do internally on our Rapid River team and what we'd do together with QA teams at Full Slate.
Getting a baseline understanding of the app itself (its codebase and functionality), in order to identify areas which would be particularly tricky for us to deal with.
We found that the upgrade roadmap itself would be fairly straight-forward (we'd move up one minor version at a time). After each minor version bump we'd get the app to run locally before continuing. We didn't intend to ensure that the app worked fully after each of these bumps; we'd hone in on that as we approached version 5.0.

For testing, the QA team we were working with planned to concurrently build out a manual testing process (to be replaced by a Selenium-based automated suite later), meaning that we could rely on them to provide regular test runs covering all major app functionality. The existing test suite provided unit test coverage of some core features. We decided that ensuring the existing test suite passed, plus relying on the QA team to perform walk-throughs of the app on staging environments, would provide sufficient test coverage.

We did however anticipate that many errors would be encountered during testing on staging environments, so we decided early on to add [Rollbar](https://rollbar.com/) to the project, and to act on items as they came in. This proved to be a very effective way of detecting and fixing problems introduced by the upgrade at all stages of the project.

<!-- <div class="client-quote">
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc pulvinar scelerisque purus. Sed pharetra tempor est quis ultricies. Vestibulum ut tellus tortor. Etiam lacinia libero id enim porttitor scelerisque. Ut eget nisl et risus aliquam tempor. Aliquam et risus a ante tempus viverra a eget nisl. Praesent congue magna non scelerisque convallis.
</div> -->

## Some App-Specific Trickiness

There were a few obstacles specific to the app which we had to overcome:

In order to bend older versions of gems to the will of the app, a lot of monkey patching had been put in place. For each case, we had to understand why the monkey patch had been necessary, and figure out if newer versions of the gem in question could provide the functionality without the need for a patch. In most cases this was so, but oftentimes we had to either adjust the way in which the gem was used, or even find another gem which provided the necessary functionality instead.

The app had been an early adopter of the [single-page application](https://en.wikipedia.org/wiki/Single-page_application) concept, and so had a large and sophisticated front-end JavaScript component to it. To support this, the [Sprockets](https://github.com/rails/sprockets)-based Asset Pipeline had been adjusted heavily and was barely recognizable. We judged that getting the app's bespoke asset compilation onto Rails 5.0 using Sprockets was going to be very challenging, and that using Webpack instead would be much more straight-forward. So, we introduced Webpack and moved asset compilation out of Rails completely (the front-end JS code already lived outside of the Rails app).

The app relied heavily on Rails dynamic routing, which Rails 5.x didn't support. We had to manually define many of the app's routes, which was difficult to do fully as it was time-consuming to figure out what they all were. Exploratory testing, both in dev and staging environments combined with Rollbar proved valuable here.

Composite primary keys were used in places, which Rails 5.x didn't like. We had to eradicate this, which involved database migrations. We therefore had to make this change ahead of the upgrade, as we didn't want the upgrade itself to involve migrations (i.e. we wanted a convenient rollback mechanism in place for the release of the upgrade).

## The Outcome

After six months of focused work, our four person development team released the upgrade to production. We encountered only minor issues post release, which we detected using Rollbar and rectified proactively. All in all the upgrade was considered a huge success, and has allowed Full Slate to continue to grow as a modern web application.

In the two years which followed our team continued to contribute to Full Slate by building new features and continuing to carry our maintenance and modernization tasks. We're now starting work on a revamp of the front-end of the app, with particular focus on mobile-first development.
