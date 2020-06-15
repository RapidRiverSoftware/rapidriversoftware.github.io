---
title: Maintaining SSL Certificates for a Multi-Tenant SaaS using Let's Encrypt
layout: blog_post
category: blog
date: 2016-07-11
description: It's a well-known fact that acquiring SSL certificates can be a difficult process. It's even more difficult to acquire SSL certificates that are valid for an arbitrary list of domains, many of which are controlled by different agencies. This post describes how we use Let's Encrypt to easily keep our SAN SSL certificate up to date with all of the domains of our customers who require HTTPS support in a multi-server environment.
author: Nathan Smith
---

## Introduction

As mentioned in a [previous post]({% post_url /_posts/2016-07-09-making-dnssec-work-for-an-aws-hosted-saas/index %}), we recently undertook a project to migrate the server infrastructure behind search.usa.gov to Amazon Web Services' (AWS) Elastic Compute Cloud (EC2). This post references that previous post frequently, so please read that post before reading this one if you haven't done so already. In addition to the DNS challenges created by offering "masked" domains such as `nasasearch.search.gov`, we also had to solve the problem of how to maintain SSL certificates for the main `search.usa.gov` domain along with the "masked" domains of all customers that wanted HTTPS support for their own domains. As also noted in our previous post, this all needed to be done in a multi-app-server environment with no interruption of service.

## SAN SSL Certificates and Let's Encrypt

We knew we wanted to make use of a [multi-domain Subject Alternative Name](https://tools.ietf.org/html/rfc5280#section-4.2.1.6) (SAN) SSL certificate, but the prospect of wrangling all the permissions and documentation required for authorizing such a certificate seemed quite daunting. The previous process for adding a new domain to our SSL certificate often took weeks and involved coordinating activities between many parties: the owner of the domain, the hosting provider, the certificate authority, and us:

* domain owner asks us to add their domain to our certificate
* we send the request to the hosting provider
* the hosting provider sends the request to the certificate authority
* the certificate authority performs a domain validation process which is opaque to us
* the certificate authority generates a new certificate
* the certificate authority sends the certificate to the hosting provider
* the hosting provider replaces our certificate with the new one and notifies us

![previous certificate process](/assets/img/posts/ssl_certificate_process_before.png)

[Let's Encrypt](https://letsencrypt.org/) offers an automated process for obtaining and renewing SSL certificates -- including SAN SSL certificates for up to 100 domains -- as long as you can prove to them that you control any domain that's included in a requested certificate. Given that we wanted to be able to quickly offer HTTPS support to new or existing "masked" domain customers, this automation seemed very promising to us. The fact that Let's Encrypt is a free service made it all the more compelling. So we set ourselves about the task of making sure we could always prove our ownership of the `search.usa.gov` domain as well as "masked" customer domains while keeping the site available for customer use at all times.

## The ACME Protocol and DNS vs. HTTP Domain Validation

The process of requesting an SSL certificate from Let's Encrypt involves running a Let's Encrypt agent locally which communicates with the Let's Encrypt Certificate Authority (CA) using the [ACME Protocol](https://github.com/letsencrypt/acme-spec). The CA issues challenges that the agent attempts to respond to, and the challenges come in the user's choice of two forms:

* DNS challenge: the agent creates a DNS record for a particular sub-domain requested by the CA in order to prove that it has control over DNS for that domain
* HTTP challenge: the agent creates a text file at a particular location with particular content that the CA can then request in order to prove that the agent has control over web page content for that domain

Since it was not at all possible for us to create DNS records for our customers' "masked" domains and not easy to even publish `search.usa.gov` DNS records, that left HTTP as the only Domain Validation option for us. Our goal then was to make sure we could have the Let's Encrypt agent create web resources as needed to respond to any HTTP challenge issued by the CA.

## Certbot

We chose EFF's Certbot and followed [their straightforward installation instructions](https://certbot.eff.org/all-instructions/). Certbot has options that will instruct it to attempt to install newly acquired SSL certificates in an Apache or Nginx setup, but we chose to use the `certonly` mode of operation which tells Certbot to simply store the new certificates in an output directory. We use this in conjunction with the `--webroot` option which tells Certbot that it will be writing files somewhere underneath the webserver's document root so that they can be publicly available via HTTP requests.

To ask Let's Encrypt for a SAN SSL certificate for our primary domain `search.usa.gov` and, say, two of our customer domains: `find.irs.gov`, and `nasasearch.nasa.gov`, first we would make sure that our webserver is responding to requests for all three of those domains. Then we would use the following Certbot command from the directory where Certbot is installed:

```
./certbot-auto certonly --webroot --webroot-path /var/www/http --domain search.usa.gov --domain find.irs.gov --domain nasasearch.nasa.gov
```

Roughly following the [Domain Validation example](https://letsencrypt.org/how-it-works/) in the Let's Encrypt documentation, the process of fulfilling this certificate request would complete the two steps illustrated in these diagrams for each domain.

#### Challenge

![challenge](https://letsencrypt.org/images/howitworks_challenge.png)

#### Authorization

![authorization](https://letsencrypt.org/images/howitworks_authorization.png)

#### Challenge / Authorization for each Domain

* Certbot communicates with the Let's Encrypt CA indicating we want a SAN SSL certificate for domains `search.usa.gov`, `find.irs.gov`, and `nasasearch.nasa.gov`
* the CA instructs the agent to create a file with particular content that will be visible at `http://search.usa.gov/.well-known/acme-challenge/XXXX`
* the agent writes the desired content to `/var/www/http/.well-known/acme-challenge/XXXX`, and the CA's HTTP request for that file succeeds
* the CA instructs the agent to create a file with particular content that will be visible at `http://find.irs.gov/.well-known/acme-challenge/YYYY`
* the agent writes the desired content to `/var/www/http/.well-known/acme-challenge/YYYY`, and the CA's HTTP request for that file succeeds
* the CA instructs the agent to create a file with particular contnet that will be visible at `http://nasasearch.nasa.gov/.well-known/acme-challenge/ZZZZ`
* the agent writes the desired content to `/var/www/http/.well-known/acme-challenge/ZZZZ`, and the CA's HTTP request for that file succeeds

This reduces the convoluted many-party, multi-step process to one that involves only three parties. Since one of these parties, Let's Encrypt, is automated, this reduces the entire process time from weeks to minutes.

![new certificate process](/assets/img/posts/ssl_certificate_process_after.png)

## HTTP Domain Validation in a Multi-app-server Environment

This process works great in a single-server environment because all HTTP requests issued by the CA go to the one host where Certbot is running. But if you recall from our previous post that our SaaS operates in a multi-server environment with various hosts sitting behind an Elastic Load Balancer, you'll immediately see a problem. There's no guarantee that an HTTP request issued by the CA will be served by the same host that's running Certbot. Also, since our site needed to remain up and running at all times, we couldn't simply send all traffic to one Certbot-controlled server for the duration of the domain validation process. We needed to be able to serve content to our users and serve domain validation responses to Let's Encrypt at the same time.

The solution to running Certbot in a multi-server environment stems from the fact that all HTTP Domain Validation requests made by the Let's Encrypt CA have paths that begin with `/.well-known/acme-challenge/`. We set up a single Certbot EC2 instance with an [Elastic IP address](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/elastic-ip-addresses-eip.html), assigned the domain name `lets-encrypt.infr.search.usa.gov` to that address, and set up Certbot on the instance. As we are using Apache to direct requests to our application, we set up special `<Location>` blocks in the Apache config files for all our application servers to proxy HTTP Domain Validation requests to our "Let's Encrypt" instance:

```
<Location /.well-known/acme-challenge/>
  ProxyPass http://lets-encrypt.infr.search.usa.gov/.well-known/acme-challenge/
  Require all granted
</Location>
```

![let's encrypt and customer requests](/assets/img/posts/lets_encrypt_and_customer_requests.png)

This guarantees that Domain Validation requests go to our Certbot host and all other traffic goes to our pool of application servers. We set up all our proxy EC2 application servers with these special `<Location>` blocks as well as all of the application servers in the old hosting environment (not shown in the diagram). So whether the Let's Encrypt CA issues a Domain Validation request for a domain that was still being handled by the old hosting environment or a domain that was being handled by the new AWS hosting environment, we were guaranteed that the request would eventually get proxied to the host that's running Certbot.

## Tips & Tricks

At the time of this writing, Certbot is still in its infancy, and installing it varies across environments. The first time you run Certbot, be prepared for the wrapper script to install dependencies on your system.

SAN SSL certificates are valid for any domain listed within their Subject Alternative Name field, but they also have a primary domain name listed in their Common Name field. Let's Encrypt will use the first domain listed in your request as the Common Name field. Our convention is to always list `search.usa.gov` as the first domain name in the requested list and then provide the rest of the domain names in alphabetical order. That way the Common Name on our certificate is always `search.usa.gov` instead of whichever customer domain happens to be first alphabetically.

If you issue too many certificate requests to Let's Encrypt, you'll find yourself receiving rate-limiting error messages. To avoid being rate limited, use Certbot's `--staging` options which instructs it to use the Let's Encrypt staging CA.

Typing out a bunch of domain names in a Certbot command is tedious and error-prone, and while our example above lists three different domain names, in reality we currently include 36 domain names in our SAN SSL certificate! To save ourselves time and to prevent mistakes, we make use of the fact that Certbot looks for a config file in `/etc/letsencrypt/cli.ini` for its options. For the above example, we would end up using the following `cli.ini` config file:

```
domains = search.usa.gov, find.irs.gov, nasasearch.nasa.gov
authenticator = webroot
webroot-path = /var/www/html
```

This allows us to use the following Certbot command no matter how many customer domains we want to include:

```
./certbot-auto certonly
```

## Conclusion

Our HTTP Domain Validation request proxy design ensures that as long as DNS is properly set up for all of our customers' domains, we can quickly and easily generate a new SAN SSL certificate that is valid for all of those domains. It currently takes us only a few minutes to respond to customer requests for HTTPS support as long as they have their DNS set up properly. This combined with the free cost of the Let's Encrypt service makes it a great solution for us.
