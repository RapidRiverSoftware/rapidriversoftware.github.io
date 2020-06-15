---
title: Rehosting a Heavily-Used SaaS Search Engine to AWS
layout: blog_post
category: blog
date: 2016-07-23
description: How we moved search.usa.gov from a traditional datacenter to Amazon Web Services (AWS), and how that move saved money while improving operational quality
author: Nick Marden
---

## Introduction

[search.usa.gov](http://search.digitalgov.gov) is a free service provided by the United States' [General Services Administration](http://www.gsa.gov/) to more than 2,600 other federal, state, or local government agencies. This service allows agencies to easily and intuitively configure a search engine results page (SERP) experience that covers their domains, their documents, and their social media footprint, so that citizens can easily search government web sites to find the information they need. Customers include the [Internal Revenue Service](http://find.irs.gov/search?utf8=%E2%9C%93&affiliate=irs&query=tax+extension&commit=Search), the [Department of Defense](http://search.defense.gov/search?utf8=%E2%9C%93&affiliate=dod-search&query=f-35+fighter+jet), and the [White House](https://search.whitehouse.gov/search?query=birth+certificate&op=Search&affiliate=wh) among others.

Rapid River has supported operations and application development for search.usa.gov since 2015. When the search.usa.gov product management approached us late last year about finding ways to reduce operational overhead, we were eager to see what we could do.

In this post we'll explain how we re-architected and migrated the search.usa.gov infrastructure in Amazon Web Services (AWS) in order to:

  * Reduce datacenter costs by 40% per month
  * Remove an expensive Content Delivery Network (CDN)/Web Application Firewall (WAF) provider from our framework, reducing monthly CDN costs by a whopping **97.5%**
  * Improve reliability by creating self-healing servers and distributing the service across four physically isolated datacenters

## Original Architecture

In the prior search.usa.gov datacenters - one in Chicago and one in Virgina - we had a pools of high-powered Dell "pizza box" servers running a mishmosh of services in a composition that had been tuned to the observed traffic patterns of search.usa.gov:

![Old Datacenter Network Diagram](/assets/img/posts/old_datacenter_network_diagram.png)

The layout of services across the servers didn't seem to have much rhyme or reason. The fact that these were physical, pizza-box servers that were expensive to add and difficult to push through the security update process had led to the barnacle-like accumulations of services on servers over time.

We made it a primary goal of our new architecture to separate each of our services by _role_ and to build flexible pools for each role that could be scaled up or down as demand increased or decreased for each service. This sounds great on the drawing board, but who has time or budget to build robust, role-specific deployment recipes for multiple applications and services?

## AWS OpsWorks (and Chef) to the Rescue

The answer to the previous question is: certainly not us. However, the search.usa.gov infrastructure is fortunate because it is comprised of applications that have very well understood deployment practices:

* usasearch: The core Rails 3.x application that serves SERP pages and provides customer administration tools
* search_consumer: A NodeJS application that uses the usasearch API endpoints to render a new generation of search.usa.gov SERP pages
* [i14y](https://github.com/gsa/i14y): A Rails 4.x application that allows government agencies to index their own documents for inclusion in search.usa.gov SERP results
* [asis](https://github.com/gsa/asis): The Advanced Social Image Search Rails 4.x application that indexes social images from Flickr, Instagram, and RSS feeds for inclusion in search.usa.gov SERP results
* [jobs_api](https://github.com/gsa/jobs_api): The DigitalGov Search Jobs API Rails 3.x application that allows users to search government job listings
* [govt-urls.usa.gov](http://govt-urls.usa.gov/tematres): A [Tematres](https://sourceforge.net/projects/tematres/) PHP application for managing the URLs that belong to federal, state, and local agencies
* [Elasticsearch](http://elastic.co): A Java-based search engine that supports clustering and failover

The first five applications - usasearch, search_consumer, i14y, asis, and jobs_api, could be deployed quite easily using [AWS OpsWorks](https://aws.amazon.com/opsworks/)' well-known deployment recipes. We simply pointed OpsWorks to the GitHub repos for each app, and it took care of the rest with robust [Capistrano](http://capistranorb.com/)-style deployments of the Rails and NodeJS apps.

That left us with with just Tematres and Elasticsearch, so we reached into the bag of tricks and wrote [Chef](http://chef.io) recipes that would fit into the OpsWorks deployment cycle for these two applications. (An enormous hat tip goes to [Nathan Smith](https://www.linkedin.com/in/noremmie) for his work on all of these recipes!)

## Deployment in AWS

We then enabled [Auto Healing](http://docs.aws.amazon.com/opsworks/latest/userguide/workinginstances-autohealing.html) on our application layers to ensure that servers would be replaced automatically if they failed. With robust recipes to build servers in place, we knew that this replacement would be seamless if it occurred. (But, of course, we tested it to make sure.)

To replace our *very* expensive CDN and web application firewall (WAF) provider, we implemented our own Apache proxy server layer using a modified version of the [OWASP](https://www.owasp.org/index.php/Main_Page) WAF rules for the [modsecurity](https://www.modsecurity.org/) Apache module. (In fact, our expensive hosted WAF was itself based on modified version of the OWASP rules.) This took a bit of iterative tuning that we'll discuss later.

We also migrated our database services (MySQL and Redis) with the hosted AWS equivalents (RDS MySQL and Elasticache Redis), in configurations that were designed to automatically withstand loss of an AWS availability zone (AZ). This was an inexpensive way to take the hassle of database availability, backups, and upgrades out of our hands.

With all of these pieces in place we were able to build out the following architecture in AWS:

![AWS Network Diagram](/assets/img/posts/aws_network_diagram.png)

The key thing to note about this architecture is that it has four new characteristics that our old environment did not:

* Servers will be replaced automatically when they fail
* Service pool capacity can be scaled independently, in response to short-term or long-term traffic patterns
* The size and cost of servers can be adjusted to match actual resource consumption, including OpsWorks [Automatic Load-Based Scaling](http://docs.aws.amazon.com/opsworks/latest/userguide/workinginstances-autoscaling-loadbased.html) for peaks in traffic
* By design, every service is spread across multiple datacenters, known as Availability Zones (AZs) in AWS parlance. This ensures that an _entire AWS datacenter outage_ will not bring down any service pool in particular, or the overall search.usa.gov service in general.

Also, by focusing our expenses on the CPU capacity of the application server pool and the [provisioned IOPS](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-io-characteristics.html) needed for Elasticsearch, we were able to achieve a cost reduction of 40% for monthly server costs in this new configuration. (Furthermore, our program manager can increase savings in the future by pre-purchasing server time through [Reserved Instance pricing](https://aws.amazon.com/ec2/purchasing-options/reserved-instances/).)

## Proxy Servers, Web Application Firewalling, and CDN Cost Reduction

One of the original drivers of this project was to get away from the very expensive cost of our CDN/WAF provider.

As you can see in our network diagram, we accomplished this by creating our own proxy servers that run a modified version of the OWASP WAF software. How we did this is probably worthy of its own blog post, but the basic recipe was this:

* Build a proxy server that sits in front of our production application
* Add the default OWASP rules
* Using DNS changes, route a small percentage of our live traffic to the proxy servers
* Note the false positives and use them to tune the OWASP rule set to match our application traffic
* Rinse, lather, repeat until we are comfortable routing 100% of our traffic through the new proxy servers

The CDN component was even more straightforward. With our proxy servers in place, we verified that we were setting correct [expiration headers](http://httpd.apache.org/docs/current/mod/mod_expires.html) on our assets and then enabled [mod_disk_cache](https://httpd.apache.org/docs/2.4/mod/mod_cache_disk.html) on our proxy servers. Once we verified that assets were being served from our proxy servers without calls to our origin servers, we enabled a [Rails asset host](http://api.rubyonrails.org/classes/ActionView/Helpers/AssetUrlHelper.html) configuration on our production application to send all asset requests to a [CloudFront Distribution](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-working-with.html) whose origin server was our proxy server pool. This took all asset traffic off our expensive CDN provider without directing it to our origin servers.

The final savings calculation looked like this:

* Old CDN/WAF provider: $16,000 per month
* CloudFront distribution and OWASP-enabled proxy servers: $400 per month (including traffic costs)

That's a **97.5%** savings we were delighted to return to the operating budget of the project for more important things like developing new features!

In other blog posts we discuss in more detail the complexities of supporting [SSL certificates for our government customers's hostnames]({% post_url blog/_posts/2016-07-11-using-lets-encrypt-for-a-multi-tenant-web-application/index %}) and how we managed to comply with the [DNSSEC requirement]({% post_url blog/_posts/2016-07-09-making-dnssec-work-for-an-aws-hosted-saas/index %}) for government agencies. Those posts go into much more technical detail and are worth reading if you're interested in how we solved the security challenges of providing SaaS services for thousands of government agencies.

## Challenges in the ATO Process

The great thing about pools of servers built by hardened recipes is that individual server failures are a non-event: a new server is spun up automatically to replace one that failed. However, the Authority to Operate (ATO) process in particular and the government security auditing process in general become a bit tricky for an architecture like ours because these processes require (among many other things):

* Vulnerability testing of individual servers
* Compliance testing of individual servers
* Penetration testing of individual servers and exposed pool endpoints

Since individual servers are identified by IP address, these tests get a little bit more complicated when individual servers can be rebuilt without warning due to server failure, load spikes, or data center outages - because the new server will often come online with a different DHCP'd IP address than the one it replaced. Similarly, if a new server is spun up in response to increased load, it will have an IP address that is unknown to the security testing infrastructure and will cause unnecesssary red flags.

We have worked closely with GSA security personnel to understand their security auditing requirements and to help them understand the new terrain in which we are operating. We hope this two-way conversation will lead to updated security practices that can take the dynamic nature of cloud hosting environments into account without sacrificing completeness or quality.

## Conclusions

By applying some very commonly-understood modern operations practices - role-based deployment, server redundancy and pooling - to our application, we were able to achieve substantial cost savings while making the search.usa.gov service more resilient to failure. While some government security practices are still evolving to incorporate dynamic server environments, the success of our migration bodes well for the future of cost-effective and reliable cloud computing in government applications.
