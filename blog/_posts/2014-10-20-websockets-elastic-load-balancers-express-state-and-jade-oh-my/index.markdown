---
title: Websockets, Elastic Load Balancers, express-state and jade! Oh my!
layout: blog_post
category: blog
date: 2014-10-20
description: Websocket upgrades in the context of AWS Elastic Load Balancers
author: Nick Marden
---

I was working on a client project last week in which we were placing their NodeJS-based app behind Elastic Load Balancers to improve security (via SSL termination) as well as scalability and fault tolerance (by having multiple back-end servers).

Unfortunately, it wasn’t as simple as creating an ELB that pointed to the back-end NodeJS app, because the NodeJS app included a [socket.io](http://socket.io/)-based endpoint. Therefore some of the requests to the back-end server were regular HTTP requests and some [needed to undergo an HTTP protocol upgrade](http://en.wikipedia.org/wiki/WebSocket#WebSocket_protocol_handshake) to become Websocket connections. This HTTP upgrade procedure [doesn’t play nice with Elastic Load Balancers](http://stackoverflow.com/questions/9184895/how-do-you-get-amazons-elb-with-https-ssl-to-work-with-web-sockets), so we needed a workaround.

My solution was to modify the ELB to map two ports back to the same back-end NodeJS server port. One would use the HTTPS ELB protocol for regular web requests; the other would use raw TCP/SSL for the Websocket requests. Here’s how that looked in my [CloudFormation](http://aws.amazon.com/cloudformation/) template:

```

"Listeners" : [
      {
          "InstancePort" : "3000",
          "InstanceProtocol" : "HTTP",
          "LoadBalancerPort" : "443",
          "Protocol" : "HTTPS",
          "SSLCertificateId" : { "Ref" : "AWSSSLCertificateARN" }
      },
      {
          "InstancePort" : "3000",
          "InstanceProtocol" : "TCP",
          "LoadBalancerPort" : "12345",
          "Protocol" : "TCP",
          "SSLCertificateId" : { "Ref" : "AWSSSLCertificateARN" }
      }
],
```

I then used an environment variable to inform the NodeJS app if it needed to use use different URLs for Websocket vs. regular HTTP(S) requests. Here’s what the [daemontools](http://cr.yp.to/daemontools.html) run file looked like:


```
export AWESOMEAPP_URL="https://awesomeapp.customer.com/"
export AWESOMEAPP_WEBSOCKET_URL="https://awesomeapp.customer.com:12345/"
cd /path/to/app
exec setuidgid ec2-user node app.js
```

Problem solved? Not really.

While the server-side NodeJS code now had the required endpoint information, it was ultimately the client code that needed to consume it. Of course, server-side environment variables aren’t available to the client-side Javascript, so I had to find a way to transport this information through the [express](http://expressjs.com/)-based app over to the client code. I used [express-state](https://github.com/yahoo/express-state) combined with the existing [Jade](http://jade-lang.com/) templates.

In app.js I added this:

```javascript
var expstate = require('express-state');
expstate.extend(app);
app.set('state namespace', 'AWESOMEAPP');
app.expose({
    endpoints: {
        websocketURL: process.env.AWESOMEAPP_WEBSOCKET_URL ||
                      process.env.AWESOMEAPP_URL
    }
}, 'AWESOMEAPP.config', {cache: true});
```

Note that by default AWESOMEAPP_WEBSOCKET_URL would just be understood to be the same as AWESOMEAPP_URL. This allowed for localhost-only development on a shared port, where ELBs weren’t around to cause any problems.

Since express-state locals need to be made visible somewhere in the client code, I added this to `<HEAD>` section of the global layout template:

```html
<script>// <![CDATA[
!= state
// ]]></script>
```

Note the use of != instead of = in order to avoid escaping of the state contents.

With this configuration available on the client side, the socket.io connections were created by using the provided endpoint information:

```javascript
module.exports.ready = function() {
    // AWESOMEAPP is defined via express-state
    var url = AWESOMEAPP.config.endpoints.websocketURL;
    var socket = io.connect(url);
    ...
}
```

And presto! Everything started working for our client-initiated websockets through the ELBs.
