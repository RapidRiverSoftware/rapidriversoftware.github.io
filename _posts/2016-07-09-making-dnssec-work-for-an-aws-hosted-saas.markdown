---
title: Making DNSSEC Work for an AWS-Hosted SaaS
layout: blog_post
date: 2016-07-09
description: Not everything in the Internet clicks together as easily as you might think. This post details the approach that we took to solve the hard problem of securing DNS for our government agency's SaaS servers - as well as their customers' CNAMEs to the SaaS servers - in the AWS environment.
author: Nick Marden
---

### Introduction

Software-as-a-Service is a great thing. With just a swipe of a credit card, what once took months to provision and set up has now become something that can be purchased and configured before lunch.  But as great as it is to use a SaaS service, building a reliable one can be equally challenging - especially in the cloud, where servers can disappear at any moment and infrastructure is expected to heal dynamically.

[search.usa.gov](http://search.digitalgov.gov/) is a SaaS that serves thousands of other government agencies. During our recent project to migrate the search.usa.gov server infrastructure to Amazon Web Services' (AWS) Elastic Compute Cloud (EC2), we were presented with a challenging combination of requirements whose solution seems worth sharing:

1. The search.usa.gov EC2 infrastructure needed to support the addition, removal, or replacement of servers on-the-fly without interruption of service
1. The search.usa.gov customers - other government agencies - needed to be able to direct their users to the SaaS offering either at `search.usa.gov`, or at "masked" domain name such as `search.someagency.gov`
1. The DNS for all `search.usa.gov` records were [required to be signed by DNSSEC](https://www.whitehouse.gov/sites/default/files/omb/memoranda/fy2008/m08-23.pdf)

As we'll see, this seemed at first to be a "pick two out of three" situation. Satisfying all three requirements at once required a spiffy open-source software feature and a two-tier DNS server architecture that we'll describe in this post.

### Wildcard Records and Another Level of Indirection

> All problems in computer science can be solved by another level of indirection, except of course for the problem of too many indirections. - [David Wheeler](https://en.wikipedia.org/wiki/David_Wheeler_(British_computer_scientist))

The simplest of our three requirements was to allow customers to choose whether to use the `search.usa.gov` website directly, or whether to create a "masked" domain name such as `search.someagency.gov`. This was entirely in the customer's control; they could simply create a [CNAME](https://en.wikipedia.org/wiki/CNAME_record) in their own DNS zone to point `search.someagency.gov` to `search.usa.gov` if they wanted a masked domain name.

We knew that we wanted to avoid a "Big Bang" migration event in which all of our customers were suddenly pointed to the new AWS hosting infrastructure, so we went one step further by asking search.usa.gov customers to CNAME their agency-specific hostnames to _customer-specific_ CNAMEs. This would allow us to shift traffic around on a customer-by-customer basis - both to the new infrastructure, but also back to the old infrastructure if the need arose:

```
$ORIGIN someagency.gov.
search IN CNAME someagency.sites.infr.search.usa.gov
```

Once a fair number of our customers had these CNAMEs in place, we were able to switch them over to our new AWS infrastructure one-at-a-time rather than switching everyone at once:

```
$ORIGIN sites.infr.search.usa.gov.
earlyadopteragency   IN CNAME aws.search.usa.gov
anotherdaringagency  IN CNAME aws.search.usa.gov
notchangingnowagency IN CNAME old-hosting-provider.search.usa.gov
```

The snippet above is a bit of a lie, however. We used [wildcard DNS records](https://en.wikipedia.org/wiki/Wildcard_DNS_record) at first to direct the majority of our customers to our previous hosting provider, and then later to our AWS-hosted site:

*Before:*

```
$ORIGIN sites.infr.search.usa.gov.
earlyadopteragency   IN CNAME aws.search.usa.gov
anotherdaringagency  IN CNAME aws.search.usa.gov
; All customers not listed above will go to the old hosting provider
*                    IN CNAME old-hosting-provider.search.usa.gov
```

*Later:*

```
$ORIGIN sites.infr.search.usa.gov.
*                    IN CNAME aws.search.usa.gov
; All customers not listed below will go to the new infrastructure
notchangingnowagency IN CNAME old-hosting-provider.search.usa.gov
```

*Finally:*

```
$ORIGIN sites.infr.search.usa.gov.
; Everyone goes to the new infrastructure
*               IN CNAME aws.search.usa.gov
```

At any step in this process, we were always able to go back to our zone file and add a customer-specific CNAME to direct traffic as needed for that customer, but eventually the migration came to an end and we were left with just the single wildcard record `*.sites.infr.search.usa.gov`, pointing to our AWS infrastructure.

### Elastic Load Balancers and the Zone Apex Problem

In Amazon Web Services (AWS), the problem of unreliable servers is solved by [Elastic Load Balancing](https://aws.amazon.com/elasticloadbalancing/) (ELB). An ELB containing one or more servers is presented to the world as a single hostname - say, `usasearch-elb.ec2.aws.com` - and requests are routed to individual servers in the ELB pool based on health and capacity.

For practical reasons, ELBs for human-visible web sites are almost always hidden behind CNAME records in the DNS:

```
~ host search.usa.gov
search.usa.gov is an alias for usasearch-elb.ec2.aws.com.
usasearch-elb.ec2.aws.com has address 209.85.232.121
```

This is a fantastic and invaluable abstraction: what appears to be a single hostname called `search.usa.gov` is actually a multi-datacenter, self-healing, auto-scaling pool of servers.

However, it runs afoul of one critical restriction of the DNS: the fact the top-most entry in a DNS zone (known as the "zone apex") [cannot be a CNAME](http://serverfault.com/questions/613829/why-cant-a-cname-record-be-used-at-the-apex-aka-root-of-a-domain). So if you want to add this ELB CNAME to the `service.gov` zone, you'll have no problem:

```
$ORIGIN service.gov.
; search.usa.gov is a CNAME to the ELB hostname
search IN CNAME usasearch-elb.ec2.aws.com.
```

but if you only control the `search.usa.gov` zone (which is the situation we found ourselves in), you're out of luck:

```
$ORIGIN search.usa.gov
; This following line is not a valid DNS configuration
@ IN CNAME usasearch-elb.ec2.aws.com.
```

There are numerous vendor-specific solutions to this problem, typically called [ANAME](https://www.dnsmadeeasy.com/services/anamerecords/) or [ALIAS](http://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-choosing-alias-non-alias.html) records. They work around the zone apex problem by allowing you to _configure_ the zone apex entry as though it were a CNAME, but _presenting_ the answer to the caller as though it were an A record:

```
$ORIGIN search.usa.gov
; '@' means "the zone apex", i.e. search.usa.gov
@ 60 IN ALIAS usasearch-elb.ec2.aws.com.
```

```
# Here are the current IP addresses for our ELB
~ host usasearch-elb.ec2.aws.com
usasearch-elb.ec2.aws.com has address 52.86.186.226
usasearch-elb.ec2.aws.com has address 52.0.72.176
usasearch-elb.ec2.aws.com has address 52.23.22.193

# Notice that there are no mentions of CNAMEs in this answer
~ host search.usa.gov
search.usa.gov has address 52.86.186.226
search.usa.gov has address 52.0.72.176
search.usa.gov has address 52.23.22.193
```

This sleight-of-hand is accomplished by dynamically resolving the A record request _at the authoritative nameserver_ by looking at the underlying ALIAS and getting its current value. By design, the answer issued by the authoritative nameserver has a short (60-second) TTL, because the "correct" answer for `usasearch-elb.ec2.aws.com` could change suddenly in an environment where servers pop in and out of existence without warning. At the cost of additional traffic to the authoritative nameservers, incorrect results are quickly flushed out of the global DNS cache when the ALIAS lookup results change.

### Great Solution! What About DNSSEC?

With ANAME/ALIAS records (I'll just call them ALIAS records for the rest of this post) at our disposal, we could easily satisfy our first two requirements. However, doing so required picking a DNS provider with ALIAS support - and no government-approved hosted DNS providers who support ALIAS also support DNSSEC. Therefore we knew we needed something more.

(As an aside: if we had been willing to forgo the ELBs and their capability for dynamic server replacement, the DNSSEC requirement would have been no problem. We could have have chosen instead to build proxy servers with static IP addresses so that our DNS record contents would never change. This would have made it easy to satisfy requirements #1 and #3  - hence the earlier comment about a "pick two out of three" situation - but we would have lost the ability to dynamically scale or replace servers using Elastic Load Balancers.)

To find the solution, it was valuable to look at *why* DNS providers don't provide DNSSEC support along with ALIAS records. The design of DNSSEC - and the cryptographic assurance it provides about DNS record values - requires taking all of the records in a zone file and computing a cryptographic hash of them, called an [RRSIG](https://www.ietf.org/rfc/rfc4034.txt). Computationally, this is a very expensive operation, especially compared to the cost of answering a single DNS request. Therefore RRSIG calculations are done when the contents of the zone change, not on-the-fly while answering requests.

Behind-the-scenes ALIAS expansion throws a wrench into the works here. If the result of a lookup can be different at different times (such as when the list of IP addresses for the `usasearch-elb.ec2.aws.com` ALIAS changes), then the RRSIG itself might need to be recomputed at any moment. In the general sense, this is not practical for DNS services that may be serving hundreds of thousands or millions of requests per minute.

After we came to this realization, we had to rummage around the Internet for help. A lot. [This discussion thread](https://www.ietf.org/mail-archive/web/dnsop/current/msg12352.html) told us that this issue was at the forefront of the minds of some Very Smart People working on IETF-related projects, and so we pursued it to the people who were proposing a solution: [PowerDNS](https://www.powerdns.com/), an open-source DNS software provider based in The Netherlands.

[Peter van Dijk](https://github.com/Habbie), one of PowerDNS' software developers, was quick to clarify the realizations that we'd had:

* ALIAS resolution is a useful feature that works by dynamically changing the record values in a zone
* DNSSEC doesn't work for zones whose contents change dynamically
* Most of the time, ALIAS expansion continues to return the same results
* Most of the time, therefore, DNSSEC signatures that were correct, will continue to be correct

Peter then suggested a [very simple improvement](https://github.com/PowerDNS/pdns/pull/3733) to the PowerDNS software that could solve our problem: adding the ability for a DNS server to expand ALIAS records (which it already supported) into A records during a zone transfer, or [AXFR](https://cr.yp.to/djbdns/axfr-notes.html).

This small change, called [outgoing-axfr-expand-alias](https://doc.powerdns.com/md/authoritative/howtos/#using-alias-records) and available beginning in [PowerDNS Authoritative 4.0.0](https://www.powerdns.com/downloads.html), allows one server (the so-called "DNS master") to be the only one that knew about our ALIAS records. Then, every minute, "DNS Slaves" acting as the authoritative nameservers for `search.usa.gov` would initiate an AXFR of the zone from the DNS master, and would receive a copy of the zone file containing the most up-to-date values for those ALIAS records, expressed as A records. The result of this AXFR would then be compared with the current contents of the zone on the slave server. If the contents had not changed - almost always the case - then no action would be taken. If the contents had changed, then the zone be would reloaded entirely and re-signed using existing DNSSEC signing features, with notification sent to sysadmins.

Overall, the process looks like this:

![Two-step ALIAS and DNSSEC handling](/img/posts/multi-tier-alias-and-dnssec-architecture.png)

You can see the script that we wrote to request the AXFR from the master server and compare its contents to the current slave server zone file [here](https://gist.github.com/nickmarden/9092c99cf3e201510ca83455fc2d2dab). It's quite simple, and relies on straightforward zone management features already built into the PowerDNS software. [Strictly speaking, this script is no longer necessary and was developed as a precaution against the possibility of a failed AXFR "emptying" the zone on the slave server. In the released version of PowerDNS 4.0.0, a standard zone slaving configuration will have such protection enabled automatically.]

### But What About Wildcards?

Remember that bit earlier about how we used wildcard DNS records to simplify the process of creating customer-specific CNAMEs? You might have expected that to cause a problem with respect to DNSSEC and dynamic records. However, as it turns out, wildcard records don't present the same problem to DNSSEC ALIAS records present.

Let's take a closer look at what happened in our two-step zone updating process. First, the master server contains a wildcard ALIAS record that points customer sites to an ELB CNAME:

```
$ORIGIN search.usa.gov.
*.sites.infr IN ALIAS usasearch-elb.ec2.aws.com
```

After outbound ALIAS expansion during a zone AXFR, that becomes

```
$ORIGIN search.usa.gov.
*.sites.infr IN A 52.86.186.226
*.sites.infr IN A 52.0.72.176
*.sites.infr IN A 52.23.22.193
```

Those records, although wildcards, are no longer dynamic. And [DNSSEC supports signing wildcard records](https://tools.ietf.org/html/rfc7129#section-5.3), making these results as valid as any other A record that might appear after ALIAS expansion.

### Conclusion

So, thanks to some tricky multi-tier design, our solution now works as follows:

* The master DNS server knows nothing about DNSSEC. Its job is just to publish up-to-date zone contents:
  * The zone apex search.usa.gov is an ALIAS to an ELB, and gets evaluated into an A record
  * Wildcard records are just ALIASes to ELBs, and also get evaluated into wildcard records that are A records
  * All other records are transferred untouched
* Every 60 seconds, the authoritative nameservers for search.usa.gov poll for a current "alias-expanded" version of the search.usa.gov zone file
* Whenever any change appears in "alias-expanded" search.usa.gov zone, the entire zone file is re-signed and re-published to the Internet-facing authoritative nameservers

For search.usa.gov agency customers with DNSSEC-signed zones of their own, this setup allows them to select their own customer-specific CNAME, delegate it to `search.usa.gov`, and operate with confidence that the entire chain of DNS resolution is signed with DNSSEC and safe from cache poisoning or man-in-the-middle attacks.
