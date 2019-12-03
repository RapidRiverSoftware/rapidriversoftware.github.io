---
title: Non-Destructive Debugging of Chef Recipes
layout: blog_post
category: blog
date: 2013-12-23
description: How to debug Chef recipes in an environment where recipe modification isn't possible
author: Nick Marden
---

Since Chef recipes are data-driven, sometimes you can’t get a Chef recipe to run correctly on a remote server because of attribute values or other inputs that differ from what you’re expecting. A very common solution to this problem is to put a few debugger statements into the code, re-upload the offending cookbook, and run rdebug chef-client on the remote server to pry into the internals of the chef-client run. By inspecting the values of attributes and/or variables during the chef-client invocation, the source of the bug can be quickly located.

However, sometimes you don’t have the option to add debugger statements into the recipe in order to set the necessary breakpoints. For example, perhaps the cookbook in question has been [frozen](http://docs.opscode.com/essentials_cookbook_versions.html#VersionConstraints-FreezingCookbooks) at a specific version. In that case any attempt to edit the local cached copy of the cookbook on the server will be nullified by a fresh download of the “correct” version of the cookbook that does not contain debugger statements.

In this case you can use this approach to non-destructively debug the chef-client invocation. First, identify the file that you need to debug; it will be located in `/var/chef/cache/cookbooks/`. In my example, I’ve identified that the offending code is at line 168 of `/var/chef/cache/cookbooks/gsfn_mysql/recipes/custom.rb`.

To debug this code, first make sure that you have the [debugger](http://rubygems.org/gems/debugger) gem installed where chef-client can see it:

```
# How to correctly install http://rubygems.org/gems/debugger
# for use with chef-client

# If you are using the self-contained Ruby installation of Chef
# that is installed in /opt/chef, make sure that the 'gem' command
# that you invoke is the one that modifies the self-contained
# Ruby installation belonging to chef, rather than the system Ruby
# in /usr/bin.

# If the Ruby used by your chef-client is the system Ruby, this line
# should not be executed.
[root@my-server]$ export PATH=/opt/chef/embedded/bin:$PATH

# At this point `which gem` should point to the copy of gem that controls
# the Ruby environment used by chef-client.
#
# Run this if the debugger gem is not already installed.

[root@my-server]$ gem install debugger
```

Now, start the debugger and set a breakpoint at the offending line:

```
[root@my-server]$ rdebug `which chef-client`
(rdb:1) break /var/chef/cache/cookbooks/gsfn_mysql/recipes/custom.rb:168
Breakpoint 1 file /var/chef/cache/cookbooks/gsfn_mysql/recipes/custom.rb, line 168
(rdb:1) continue
```

With the breakpoint set, chef-client will continue executing until the offending line is encountered, at which point it will stop:

```
[2012-11-19T18:16:09+00:00] INFO: *** Chef 10.14.4 ***
[2012-11-19T18:16:16+00:00] INFO: Run List is [recipe[xfs], role[gsfn_auth_prod], role[volumes]...
Breakpoint 1 at /var/chef/cache/cookbooks/gsfn_mysql/recipes/custom.rb:168
/var/chef/cache/cookbooks/gsfn_mysql/recipes/custom.rb:168
route53_rr "sql-#{node['gsfn']['mysql']['serverid']}" do
(rdb:1) list
[163, 172] in /var/chef/cache/cookbooks/gsfn_mysql/recipes/custom.rb
163 execute "lower swappiness threshold" do
164 command "echo 0 > /proc/sys/vm/swappiness"
165 action :run
166 end
167
> 168 route53_rr "sql-#{node['gsfn']['mysql']['serverid']}" do
169 fqdn "sql-#{node['gsfn']['mysql']['serverid']}.#{node['route53']['zone']}"
170 type "CNAME"
171 values (["#{node['cloud']['public_hostname']}."])
172 ttl node['route53']['ttl']
```

Now that I’m inside the running code, I can inspect the node object, local variables, etc. and trace the execution of my recipe until I find the source of my bug.

For more help on using the debugger gem, see these resources:

* [ruby-debug in 30 seconds (we don’t need no stinkin’ GUI!)](http://pivotallabs.com/users/chad/blog/articles/366-ruby-debug-in-30-seconds-we-don-t-need-no-stinkin-gui-)
* [debugger documentation](http://rubydoc.info/gems/debugger/1.2.2/frames)
