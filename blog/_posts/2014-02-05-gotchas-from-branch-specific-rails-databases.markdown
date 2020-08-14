---
title: Gotchas With Branch-Specific Rails Databases
layout: blog_post
category: blog
date: 2014-02-05
description: A demonstration of a problem that can plague projects that use per-branch database names
author: Nick Marden
featured: true
---

One client project that we’re working on includes many concurrent development branches, often with different database schemas and seeds. To simplify life, a developer at the client company recently changed their application’s database.yml to derive the development database name from the current git branch name. This is a fairly common trick, documented [here](http://mislav.uniqpath.com/rails/branching-the-database-along-with-your-code/) and [here](http://www.reinteractive.net/posts/22-branch-specific-database-yml) and [here](https://github.com/schlick/Git-DB-Switcher).

However, it comes with some drawbacks as well. First, you need to remember to create the database for the new branch before you begin using it.

```bash
git checkout my_new_branch
rake db:setup
```

is usually sufficient for this task.

You also need to remember that every running application has a ConnectionPool to the database listed in database.yml as it existed at application start-up time. This true even with class caching turned off, as it typically is in development. In other words, changing branches itself won’t result in changing databases unless you restart all of your apps.

If you don’t believe this, or want to see the problem in nitty-gritty detail, check out this simple Rails app which demonstrates the problem:

[https://github.com/nickmarden/db-branch-switcher](https://github.com/nickmarden/db-branch-switcher)

As suggested in the README.rdoc, there are way to avoid shooting yourself in the foot: you can use a git post-checkout hook to build the database, and you can use a Guardfile (or something similar) to restart applications whenever the current Git branch changes.

Oh, and the reason that the model for this sample app is called “Bar” is not because I’m obsessed with bars; it’s because the original name of the sample app was “foo”.
