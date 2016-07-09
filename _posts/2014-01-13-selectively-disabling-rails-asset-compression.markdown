---
title: Selectively Disabling Rails Asset Compression
layout: blog_post
date: 2014-01-13
description: Asset compression can break your specs. But disabling it for tests can also mean disabling in production - or having tests that don't reflect production behavior. Here's how to strike a middle ground.
author: Nick Marden
---

Recently a client asked me to make their Jenkins CI test suite function correctly with Rails asset compilation turned on. The goal was to come as close as possible to testing a staging- or production-like environment in CI.

It seemed simple enough to add something like this to `config/environments/test.rb`:

```
if ENV['BUILD_NUMBER'] # this is set by Jenkins in CI
  config.assets.compress = true # Compress precompiled assets
  config.assets.compile = false # Refuse to compile assets on-the-fly
  config.assets.digest = true   # Add a cache-busting extension to asset filenames
end
```

And then test my changes like this:

```
RAILS_ENV=test BUILD_NUMBER=1 rake assets:clean assets:precompile
BUILD_NUMBER=1 rake konacha:run spec
```

Everything seemed to work OK, except that a small subset of their Konacha specs now started failing. After some investigation, I discovered that the problem was this: asset compression had broken the Konacha spec itself! (It was compression and not compilation that broke things, as I discovered by trying various combinations of the config.assets.\* settings.)

Konacha specs are written in Javascript and are in fact also part of the precompiled assets that are served by Rails during the rspec run. In other words, if the Konacha spec lives in `spec/konacha/my_spec.js` then the konacha:run test actually requests [http://localhost:3500/my_spec.js](http://localhost:3500/my_spec.js) from the Konacha server. With asset precompilation turned on, `my_spec.js` is precompiled and compressed using the same process that precompiles and compresses files in app/assets and other directories.

Since I had no desire to test the compressibility of the Konacha specs, Calum Halcrow and I decided that it made the most sense to simply take compression out of the picture altogether for the Konacha specs. But how to do this? After all, the Rails asset pipeline offers only

```
config.assets.compress = true
```

and

```
config.assets.compress = false
```

So I was stuck between a rock and a hard place. If I turned on compression, the Konacha specs would fail. If I turned off compression, the Konacha specs would pass but the app assets themselves would also be uncompressed. In this case the Jenkins CI wouldn’t really be testing a production-like asset setup at all!

After a little reading, I discovered that I could replace the compression engine itself with class of my own, so I did exactly that:

```
if ENV['BUILD_NUMBER'] # this is set by Jenkins in CI
  config.assets.compress = true # Compress precompiled assets
  config.assets.compile = false # Refuse to compile assets on-the-fly
  config.assets.digest = true   # Add a cache-busting extension to asset filenames
  config.assets.js_compressor = SelectiveAssetsCompressor.new # Use my own asset compressor
end
```

My new asset compressor is very simple, delegating all the work to Uglifier:

```
class SelectiveAssetsCompressor < Uglifier
 def initialize(options = { })
   options.merge(comments: :all)
   super(options)
 end

 def compress(string)
   if string =~ /no_asset_compression/
     string
   else
     super(string)
   end
 end
end
```

Note that the SelectiveAssetsCompressor class overrides the provided Uglifier configuration options to set

```
comments: :all
```

which guarantees that all comments in all Javascript files will be preserved during the compilation phase. This is important, because I use a comment to indicate that I do not want `spec/konacha/spec_helper.js` (or anything that includes it) to be compressed:

```
/**
 * DO NOT REMOVE THIS COMMENT
 * It turns off compression of the Konacha specs
 * during the asset precompilation phase, to avoid
 * spec failures caused by unwanted side effects
 * of compression.
 *
 * no_asset_compression
 *
 **/
//= require vendor-common
//= require ember-common
//= require sinon
//= require chai-jquery
//= require chai-spies
...
```

Tada! Now the asset precompilation process precompiles (concatenates) all of the JS and CSS files – including Konacha specs – but does not compress any precompiled file that contains the magic string no_sprockets_compression. Since all of the Konacha specs include spec_helper.js, they are therefore no longer compressed during the rake assets:precompile step.
