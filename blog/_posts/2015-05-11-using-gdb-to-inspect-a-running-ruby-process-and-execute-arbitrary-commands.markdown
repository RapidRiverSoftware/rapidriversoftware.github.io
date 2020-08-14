---
title: Using gdb to Inspect a Running Ruby Process and Execute Arbitrary Commands
layout: blog_post
category: blog
date: 2015-05-11
description: How Unix utilities helped me dive beneath the covers to spot a problem deep in some Ruby code
author: Nick Marden
featured: true
---

#### The Problem

A client recently asked me to help debug a [Resque](https://github.com/resque/resque) task that was stuck in a tight CPU loop. Since the loop never finished (and never logged any details) it was impossible to determine what was going on by examining side effects like log files.

I reached for my handy friend [strace](http://linux.die.net/man/1/strace) and quickly found that the CPU loop was in a call to the regex-processing function `match_at`:

```
match_at (reg=0xf5d8940, str=0xe28d840 "https://url.redacted.here/12345/#/",
    end=0xe28d87d "", sstart=0xe28d840 "https://url.redacted.here/12345/#/",
    sprev=0xe28d879 "0/#/", msa=0x7fff5744b3c0) at regexec.c:1797
```

So a regex was to blame. Specifically, it was a regex that appeared to be looping forever on a match of the terminating characters of the string in question. Unfortunately this was in a code base with dozens of regexes – so although I knew the offending input string, I had no idea which regex was the guilty party.

#### The Tricky Solution

I decided to reach for a slightly more powerful tool, [gdb](http://www.gnu.org/software/gdb/). With gdb I was able to attach to the tight-looping process. Since Ruby is written in C, I was then able to use gdb to call a function called `rb_eval_string_protect` from the Ruby internals, which functions much like a call to `eval` in Ruby code.

In my case, I injected code that would dump the [caller](http://ruby-doc.org/core-2.2.2/Kernel.html#method-i-caller) output to a file on disk. This would provide me with a stack trace-style context that should pinpoint the cause of the tight loop.

Here’s the exact recipe I used:

* Wait for Resque worker to go into a 100% CPU loop
* Attach with gdb: `sudo gdb -p <PID of Resque worker>`
* Run this command at the gdb prompt:

```
(gdb) call (void)rb_p((unsigned long)rb_eval_string_protect("File.open('caller.out', 'w') { |f| f.write caller.join($/) }",(int*)0))
```

* Look in the [current working directory](http://en.wikipedia.org/wiki/Working_directory) of the Resque worker (`/srv/www/customername/current`) for the file caller.out, which contained this information:

```
[deploy@resque1.prod current] (deploy)$ more caller.out
eval:1:in `open'
eval:1:in `some_parsing_function'
/srv/www/customername/releases/20150506020421/lib/with/some/parsing/function.rb:291:in `==='
/srv/www/customername/releases/20150506020421/lib/with/some/parsing/function.rb:291:in `some_parsing_function'
...
```

This pointed to exactly the regex that was causing the problem, and from there it was an easy fix.

#### Follow-up Note about Safe Handling

This approach allows you to execute arbitrary code inside the context of the attached, running process. However, if the code you execute raises an exception, your process will likely throw a SIGABRT and exit. Therefore it’s good to make sure that your command (in this example,`File.open('caller.out', 'w') { |f| f.write caller.join($/) }` actually works by running it in a safe environment before trying it in production. I learned this the hard way by trying to re-use this trick on a Resque process whose current working directory was not writable by the UID of the Resque process.

For Rails apps in particular, this command:

```
call (void)rb_p((unsigned long)rb_eval_string_protect("caller.each { |f| Rails.logger.info f }",(int*)0))
```

will likely be safe regardless of file permissions or the cwd of the Ruby process.

### In Summary

Ruby is clearly designed to hide nasty C code bits (like regex implementations) from the programmer. 99.9% of the time, that’s great – but sometimes it’s worth jumping down to the C code or debugger level in order to see what’s really going on. The recipe here should be reusable in a wide variety of circumstances where you have no visibility about what’s gone off the, uh, rails in your code. So, throw this in the bag of tricks for later – you’ll use it sooner than you might think.
