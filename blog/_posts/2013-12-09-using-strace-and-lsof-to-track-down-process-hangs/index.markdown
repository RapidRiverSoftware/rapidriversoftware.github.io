---
title: Using strace and lsof to Track Down Process Hangs
layout: blog_post
category: blog
date: 2013-12-09
description: Using an old-school tool from the Unix toolbox to find out what's going wrong when a process is inexplicably hung
author: Nick Marden
---

One common situation that I’ve run across as a sysadmin/[devops](http://www.jedi.be/blog/2010/02/12/what-is-this-devops-thing-anyway/) guy is the dreaded “it’s hanging and we don’t know why” problem. It usually manifests itself like this:

* A certain chunk of software works fine in the dev or QA environment
* The same chunk of code has completely reproducible or intermittent hangs in a staging or production environment
* There are no log messages or console errors that explain what is going wrong

If you follow the recipe in this post, you should be able to quickly identify and fix many cases that exhibit this behavior.

(Note that I’m assuming a Linux environment; there are similar utilities for [Solaris](http://www.idevelopment.info/data/Unix/Solaris/SOLARIS_UsingthetrussCommandinSolaris.shtml), BSD and [OS X](http://www.cyberciti.biz/tips/ktrace-freebsd-macosx-tool-howto.html). Regardless of which tool you use to track system calls, the rest of the logic of this article applies once you’ve used your OS-specific tool to locate which file handle is causing the hang.)

### strace Overview

To use this debugging recipe, we’ll need to be comfortable with [strace](http://en.wikipedia.org/wiki/Strace). If you’ve never used strace before, take a look at Vidar Hokstad’s [simple overview](http://www.hokstad.com/5-simple-ways-to-troubleshoot-using-strace.html) of various recipes for using strace to get a feel for it.

To understand how strace enables us to track down hangs, let’s start with a quick “Hello, world” program:

```bash
[root@nickdev ~]$ cat ./hw.c
#include <stdio.h>

int main(int argc, char **argv) {
    printf("Hello, world\n");
    return 0;
}
[root@nickdev ~]$ gcc -o hello_world hw.c
[root@nickdev ~]$ ./hello_world
Hello, world
```
 
Simple enough. Now what happens when we run that through strace?

```bash
[root@nickdev ~]$ strace ./hello_world
execve("./hello_world", ["./hello_world"], [/* 50 vars */]) = 0
brk(0)                                  = 0xa7e000
access("/etc/ld.so.nohwcap", F_OK)      = -1 ENOENT (No such file or directory)
mmap(NULL, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f7583380000
access("/etc/ld.so.preload", R_OK)      = -1 ENOENT (No such file or directory)
open("/etc/ld.so.cache", O_RDONLY)      = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=77737, ...}) = 0
mmap(NULL, 77737, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f758336d000
close(3)                                = 0
access("/etc/ld.so.nohwcap", F_OK)      = -1 ENOENT (No such file or directory)
open("/lib/libc.so.6", O_RDONLY)        = 3
read(3, "177ELF2113->13551"..., 832) = 832
fstat(3, {st_mode=S_IFREG|0755, st_size=1432968, ...}) = 0
mmap(NULL, 3541032, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7f7582e04000
mprotect(0x7f7582f5c000, 2093056, PROT_NONE) = 0
mmap(0x7f758315b000, 20480, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x157000) = 0x7f758315b000
mmap(0x7f7583160000, 18472, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_ANONYMOUS, -1, 0) = 0x7f7583160000
close(3)                                = 0
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f758336c000
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f758336b000
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f758336a000
arch_prctl(ARCH_SET_FS, 0x7f758336b700) = 0
mprotect(0x7f758315b000, 16384, PROT_READ) = 0
mprotect(0x7f7583382000, 4096, PROT_READ) = 0
munmap(0x7f758336d000, 77737)           = 0
fstat(1, {st_mode=S_IFCHR|0600, st_rdev=makedev(136, 6), ...}) = 0
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f758337f000
write(1, "Hello, world\n", 13Hello, world
)          = 13
exit_group(0)                           = ?
```
 
Wow...strace shows us every system call made by our program makes, including the parameters that were passed to the call and the return value that came back.

Now let’s look at one particular system call that occurred during the execution of the “Hello, world” program. Something subtle happened here, and it’s important to understand in order to follow the rest of this recipe.

First, the program made a system call to the write() function. The write function was told to print the string “Hello, world\n” to file handle #1, also known as “[standard output](http://www.livefirelabs.com/unix_tip_trick_shell_script/june_2003/06092003.htm)“. Since write() can handle null-terminated strings, it was also necessary for the write() function to be told the length of the string (13 characters).

```bash
write(1, "Hello, world\n", 13
```

Next, _because the output of strace and the output of the “Hello, world” program were being printed to the same terminal_, the actual string “Hello, world” was printed including a carriage return:

```bash
write(1, "Hello, world\n", 13Hello, world
```

Lastly, the write() function returned the number 13 to let the calling program know that it had, in fact, successfully written all 13 characters to the requested file handle. Because of the carriage return included in the “Hello, worldn” string, the remainder of the strace output appears on the next line in our terminal:

```bash
write(1, "Hello, world\n", 13Hello, world
)          = 13
```
 
The important thing to take away from this strace example is that:

* First, the strace program writes out the system call being made, and its arguments
* Next, the system call actually occurs
* Lastly, after the system call completes, the return value of the system call is printed

### What causes hangs anyway?

When you see a program hang, you’re looking at one of two things:

* The program is blocked waiting for a resource that isn’t available
* The program is in an infinite loop, burning through CPU

The easy way to distinguish between the two is that blocked programs generally consume no CPU while programs in an infinite loop burn 100% of the CPU. A program like [top](http://en.wikipedia.org/wiki/Top_\(software\)) (or better yet, [htop](http://htop.sourceforge.net/)) can quickly help you distinguish which of these two scenarios is occurring.

If you’ve got a program that’s pegged on 100% CPU in one environment (say, production) but never exhibited that behavior in another environment, then this exact recipe won’t apply. However, strace will probably still be a valuable tool in diagnosing its behavior; try attaching with `strace -p` to see what the program is doing. (I wrote [another post]({% post_url /_posts/2015-05-11-using-gdb-to-inspect-a-running-ruby-process-and-execute-arbitrary-commands/index%}) about how [gdb](https://www.gnu.org/software/gdb/) can be a useful tool in this situation, especially for interpreted languages.)

The rest of this post assumes that your program is showing low or zero CPU consumption during hangs. If that’s the case, then it’s almost certainly blocked waiting for a resource that isn’t available. Here are some categories of resource blocks that commonly occur:

1. You’re trying to connect() a TCP socket to a port on another machine, but it’s not responding
1. You’ve already got an open pipe or TCP socket, but there is no data to read() when you’re expecting some
1. You’re trying to lock a mutex or file, but it’s already locked and you’re blocked indefinitely waiting for it to get freed

Luckily the common thread in all of these problems (except for the mutex lock) is a _file handle_. If the program is blocked trying to connect(), read(), or write() a file handle, strace will tell us which file handle is the culprit.

To see this in action, let’s compare the strace of a successful MySQL database login with one that times out due to an unreachable server. (Note the use of `-e trace=connect` here to reduce the verbosity of the strace output by only logging connect() system calls.)

First, here’s a successful login:

```bash
[root@nickdev ~]$ strace -e trace=connect mysql -h nickdev.marden.reading.ma.us
connect(3, {sa_family=AF_FILE, path="/var/run/nscd/socket"}, 110) = 0
connect(4, {sa_family=AF_FILE, path="/var/run/nscd/socket"}, 110) = 0
connect(4, {sa_family=AF_FILE, path="/var/run/nscd/socket"}, 110) = 0
connect(4, {sa_family=AF_INET, sin_port=htons(53), sin_addr=inet_addr("192.168.1.1")}, 16) = 0
connect(3, {sa_family=AF_INET, sin_port=htons(3306), sin_addr=inet_addr("192.168.1.220")}, 16) = 0
Welcome to the MySQL monitor.  Commands end with ; or g.
Your MySQL connection id is 2630
Server version: 5.1.49-3 (Debian)

Copyright (c) 2000, 2010, Oracle and/or its affiliates. All rights reserved.
This software comes with ABSOLUTELY NO WARRANTY. This is free software,
and you are welcome to modify and redistribute it under the GPL v2 license

Type 'help;' or 'h' for help. Type 'c' to clear the current input statement.

mysql>
```

Now here’s a login that hangs at first (probably because there is no machine out there with the IP address 1.2.3.4):

```bash
[root@nickdev ~]$ </code<code>strace -e trace=connect mysql -h 1.2.3.4
connect(3, {sa_family=AF_FILE, path="/var/run/nscd/socket"}, 110) = 0
connect(3, {sa_family=AF_INET, sin_port=htons(3306), sin_addr=inet_addr("1.2.3.4")}, 16 
```

What has happened here is that the system call has occurred, but hasn’t returned yet. That’s why there is nothing – not even a carriage return – after the “16” at the end of the last line.

How does this particular hang resolve itself? After 60 seconds, the Linux IP stack gives up on the connection, and the connect() call returns a value (-1) that indicates failure. strace intercepts this result and prints the results to standard output along with some explanatory text; -1 becomes “-1 ETIMEDOUT (Connection timed out)”. After all of this, the MySQL client program prints its own error message to the standard error file handle as well.

```bash
[root@nickdev ~]$ strace -e trace=connect mysql -h 1.2.3.4
connect(3, {sa_family=AF_FILE, path="/var/run/nscd/socket"}, 110) = 0
connect(3, {sa_family=AF_INET, sin_port=htons(3306), sin_addr=inet_addr("1.2.3.4")}, 16) = -1 ETIMEDOUT (Connection timed out)
ERROR 2003 (HY000): Can't connect to MySQL server on '1.2.3.4' (110)
```

In this case, looking at log files probably would have – eventually – indicated what the problem was. However, sometimes a system call never returns at all! Without strace, diagnosing such a problem requires a lot of guesswork and sometimes a little bit of voodoo.

For the rest of this post, we will be looking at various examples of processes that have made a system call that has not yet returned. (After all, that’s what a hang is!) When we see an unfinished system call, we will know exactly what’s going on – or rather, what’s not going on, but should be.

### Using lsof to Identify File Handles

In the example above, connect() was being passed the file handle number 3 to make its doomed connection to the MySQL server at Internet host 1.2.3.4. What is file handle #3?

We know that file handles 0, 1, and 2 represent standard input, standard output, and standard error file handles in Unix. Everything after that is at the discretion of the C runtime. Typically the file handles will simply be handed out in increasing order each time that a process makes an open(), dup(), or socket() call. When a file handle is closed, it goes back into the pool of available handles.

In this case, our program open()’d and then close()’d (you’ll have to believe me on this; it’s in the full strace output) file handle #3 to connect to `/var/run/nscd/socket`. Then, it called socket() as part of the process of connecting to the remote server at 1.2.3.4. Since file handle #3 had been closed already – returned to the pool of available sockets – it was the one handed back to our process to be used in the connect() call to the remote MySQL server at 1.2.3.4:

```bash
[root@nickdev ~]$ strace -e trace=connect,socket mysql -h 1.2.3.4
socket(PF_FILE, SOCK_STREAM|SOCK_CLOEXEC|SOCK_NONBLOCK, 0) = 3
connect(3, {sa_family=AF_FILE, path="/var/run/nscd/socket"}, 110) = 0
socket(PF_INET, SOCK_STREAM, IPPROTO_IP) = 3
connect(3, {sa_family=AF_INET, sin_port=htons(3306), sin_addr=inet_addr("1.2.3.4")}, 16
```

With all this reuse of file handles, it would be nearly impossible to tell what’s going on without the [lsof](https://people.freebsd.org/~abe/) program. While this mysql client was hanging in one terminal, I used lsof to dump a partial list of files in another terminal, and sure enough file handle #3 was the socket that was timing out on the remote, nonexistent MySQL server:

```bash
[root@nickdev ~]$ ps auxwww | grep mysql | grep 1.2.3.4
root     11497  0.0  0.0  31760  2144 pts/6    S+   23:44   0:00 mysql -h 1.2.3.4

[root@nickdev ~]$ lsof -n -p 11497 | egrep -v '(DIR|REG)'
COMMAND   PID USER   FD   TYPE  DEVICE SIZE/OFF    NODE NAME
mysql   11497 root    0u   CHR   136,6      0t0       9 /dev/pts/6
mysql   11497 root    1u   CHR   136,6      0t0       9 /dev/pts/6
mysql   11497 root    2u   CHR   136,6      0t0       9 /dev/pts/6
mysql   11497 root    3u  IPv4 2203168      0t0     TCP 192.168.1.220:57646->1.2.3.4:mysql (SYN_SENT)
```

Here I used the ‘-n’ option for lsof, which makes it run much more quickly at the expense of not translating IP addresses to DNS host names. I also used ‘-p’ to specify the particular Unix process ID whose open files I wanted to examine, and then I did a little egrep magic to get rid of some less-interesting and noisy output from lsof.

The SYN_SENT flag is a classic source of system hangs. It means “I sent a [SYN](http://www.inetdaemon.com/tutorials/internet/tcp/3-way_handshake.shtml) (begin conversation) request to the server, but it has not yet responded back.” Common reasons for a hang on SYN_SENT include: the remote host doesn’t exist, doesn’t offer service on the specified port, or is otherwise dropping the traffic on the floor (e.g. because of firewall rules).

The reason this one shows up so often when moving from one environment to another – especially from dev/QA to staging/production is that dev and QA environments often lack the complex firewall rules that are common in production environments. So, even if everything is working great in dev, mysterious hangs appear when that new code tries to make a connection that isn’t allowed by the current production firewall rules!

### Tapping into Running Processes with strace

Everything so far has involved running a process under strace to identify which system call is hanging, and which file handle it is operating on when the hang occurs. Luckily the [ptrace](http://en.wikipedia.org/wiki/Ptrace) library – the source of strace’s power – is smart enough to keep track of the most recent uncompleted system call and its arguments. That means that if you connect to a process that is currently hanging, strace can tell you which system call it is hanging on, even though that system call has already started.

To simulate the collection of system call info from a running process, let’s run our doomed MySQL connection to 1.2.3.4 in one terminal and attach to it with strace in another terminal by specifying the process ID (-p):

```bash
[root@nickdev ~]$ ps auxwww | grep mysql | grep 1.2.3.4
root     11548  0.0  0.0  31760  2140 pts/6    S+   23:48   0:00 mysql -h 1.2.3.4
[root@nickdev ~]$ strace -p 11548
Process 11548 attached - interrupt to quit
connect(3, {sa_family=AF_INET, sin_port=htons(3306), sin_addr=inet_addr("1.2.3.4")}, 16
```

So now we’ve attached to a running process and determined that it is hanging on a connect() to file handle #3. Since we have the process ID (11548), we can use lsof and determine that the connection is hanging in the SYN_SENT state.

If this was a real production system issue, you’d now have gone from “my program is hanging, why is that?” to “my program is hanging due to a networking problem between my host and the MySQL server at 1.2.3.4; let me get a sysadmin involved” (or “let me put my sysadmin hat on”)

### Hanging on Pipe Reads

The connect() example is a bit pedantic because most of the information needed to diagnose the problem is right there in the strace output: IP address, port number, address family. In real life, hangs also occur on pipes between programs – and they can be a lot harder to debug. What’s more, they usually hang _forever_ rather than timing out after some long period of time, because after all reads from pipes are usually intended to be blocking reads!

Imagine, for example, if you connect to a hanging program (pid 11591) with strace and see this output:

```bash
[root@nickdev ~]$ strace -p 11591
Process 11591 attached - interrupt to quit
read(3,
```

The corresponding lsof data tells you that the process is hanging while trying to read from a pipe called `/tmp/a_pipe_between_programs`:

```bash
[root@nickdev ~]$ lsof -n -p 11591 | egrep -v '(DIR|REG)'
COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF    NODE NAME
cat     11591 root    0u   CHR  136,8      0t0      11 /dev/pts/8
cat     11591 root    1u   CHR  136,8      0t0      11 /dev/pts/8
cat     11591 root    2u   CHR  136,8      0t0      11 /dev/pts/8
cat     11591 root    3r  FIFO    8,1      0t0 5095543 /tmp/a_pipe_between_programs
```

(By the way, the ‘3r’ in the lsof output means “file handle 3, opened for reading”). Now what do you do? You look for the program at the other end of that pipe by removing the ‘-p’ option from lsof:

```bash
[root@nickdev ~]$ lsof -n | grep /tmp/a_pipe_between_programs
cat       11591       root    3r     FIFO                8,1       0t0    5095543 /tmp/a_pipe_between_programs
perl      11708       root    1w     FIFO                8,1       0t0    5095543 /tmp/a_pipe_between_programs
```

There’s the culprit…it’s the Perl script write_words_slowly.pl, which is writing (1w) to the same pipe that our hanging process is reading from. Now that we’ve identified the process ID (11708) that is causing our problem by looking at the other end of the file handle, we might be able to use strace to figure out what is wrong with that program:

```bash
[strace output snipped...]
write(1, "Aaliyahn", 8Aaliyah
)                = 8
write(1, "Aaliyah'sn", 10Aaliyah's
)             = 10
write(1, "Aaronn", 6Aaron
)                  = 6
gettimeofday({1318463626, 296583}, NULL) = 0
rt_sigprocmask(SIG_BLOCK, [CHLD], [], 8) = 0
rt_sigaction(SIGCHLD, NULL, {SIG_DFL, [], 0}, 8) = 0
rt_sigprocmask(SIG_SETMASK, [], NULL, 8) = 0
nanosleep({60, 0},
```
 
Looks like the author of `write_words_slowly.pl` put in a 60-second sleep() call in his main loop! There probably should have been a code review.

This example illustrates how easily strace and lsof can be used to determine who is clogging the plumbing between Unix processes that have been daisy-chained through named pipes.

### Hanging on flock()

The last and probably easiest-to-diagnose case is hangs which occur during flock() system calls. In general, these can be diagnosed using strace to identify the hanging system call, and then lsof -n (rather than lsof -n -p) to determine which other process(es) have locked the critical file.

Although rare, this sort of problem is also prone to arise when moving from a dev/QA environment to a staging/production environment. That’s because the usage patterns of a production site often differ drastically from the usage patterns that developers or even QA people will throw at their systems. If that happens, it means that you’re not adequately exercising your file locking code enough during your unit or integration tests and it’s best to solve the problem permanently by putting proper tests in place.

### Summary

In this post we’ve seen:

* How strace can be used to identify cases when read(), connect(), or write() calls are blocked and causing a process to hang
* How lsof can be used to determine the identify of files based on their file handle number
* How SYN_SENT commonly manifests itself as a source of “hangs” in otherwise working code when it is moved from one environment to another
* How to use lsof to find the identity of a pipe that is causing read() blocks, and how to find out which process is responsible for the write end of the pipe
* That strace can be used not only on hanging processes, but also on the processes that are causing them to hang, until the ultimate culprit is discovered

This is just a small sample of what you can accomplish on a running system using tools like strace, lsof, and gdb.

### Recommended Reading
* [Introducing strace](http://linuxgazette.net/148/saha.html)
* [Fun with strace and the GDB debugger](http://www.ibm.com/developerworks/aix/library/au-unix-strace.html)
