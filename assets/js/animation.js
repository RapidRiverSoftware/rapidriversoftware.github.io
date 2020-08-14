(function(document, console) {
  'use strict';

  gsap.registerPlugin(MotionPathPlugin);
  gsap.registerPlugin(ScrollTrigger);

  // Store Elements
  var glow1 = document.querySelector('[data-fx="glow-1"]');
  var glow2 = document.querySelector('[data-fx="glow-2"]');
  var glow3 = document.querySelector('[data-fx="glow-3"]');
  var glowPath1 = document.querySelector('[data-fx="glow-path-1"]');
  var glowPath2 = document.querySelector('[data-fx="glow-path-2"]');
  var glowPath3 = document.querySelector('[data-fx="glow-path-3"]');

  var postit1 = document.querySelector('[data-fx="postit-1"]');
  var postit2 = document.querySelector('[data-fx="postit-2"]');
  var postit3 = document.querySelector('[data-fx="postit-3"]');
  var postit4 = document.querySelector('[data-fx="postit-4"]');
  var postit5 = document.querySelector('[data-fx="postit-5"]');

  var casestudyPreview = document.querySelector('[data-fx="case-study-preview"]');
  var casestudy1 = document.querySelector('[data-fx="case-study-1"]');
  var casestudy2 = document.querySelector('[data-fx="case-study-2"]');
  var casestudy3 = document.querySelector('[data-fx="case-study-3"]');

  var speechBubble1 = document.querySelector('[data-fx="speech-bubble-1"]');
  var speechBubble2 = document.querySelector('[data-fx="speech-bubble-2"]');
  var speechBubble3 = document.querySelector('[data-fx="speech-bubble-3"]');
  var speechBubble4 = document.querySelector('[data-fx="speech-bubble-4"]');
  var speechBubble5 = document.querySelector('[data-fx="speech-bubble-5"]');

  var readingIndicator1 = document.querySelector('[data-fx="reading-indicator-1"]');
  var readingIndicator2 = document.querySelector('[data-fx="reading-indicator-2"]');
  var readingIndicator3 = document.querySelector('[data-fx="reading-indicator-3"]');
  var blogBubble1 = document.querySelector('[data-fx="blog-bubble-1"]');
  var blogBubble2 = document.querySelector('[data-fx="blog-bubble-2"]');
  var blogBubble3 = document.querySelector('[data-fx="blog-bubble-3"]');
  var blogBubble4 = document.querySelector('[data-fx="blog-bubble-4"]');
  var blogBubble5 = document.querySelector('[data-fx="blog-bubble-5"]');

  // Timelines
  var timelineServices = gsap.timeline({
    scrollTrigger: {
      trigger: '[data-fx="services-section"]',
      toggleActions: 'restart pause resume pause',
      start: 'top center',
    },
    repeat: -1
  });

  var timelineCasestudies = gsap.timeline({
    scrollTrigger: {
      trigger: '[data-fx="casestudies-section"]',
      toggleActions: 'restart pause resume pause',
      start: 'top center',
    },
    repeat: -1,
    repeatDelay: 1
  });

  var timelineTeam = gsap.timeline({
    scrollTrigger: {
      trigger: '[data-fx="team-section"]',
      toggleActions: 'restart pause resume pause',
      start: 'top center',
    },
    repeat: -1,
    repeatDelay: 1
  });

  var timelineBlog1 = gsap.timeline({
    scrollTrigger: {
      trigger: '[data-fx="blog-section"]',
      toggleActions: 'restart pause resume pause',
      start: 'top center',
    },
    repeat: -1,
    repeatDelay: 1
  });

  var timelineBlog2 = gsap.timeline({
    scrollTrigger: {
      trigger: '[data-fx="blog-section"]',
      toggleActions: 'restart pause resume pause',
      start: 'top center',
    },
    repeat: -1,
    repeatDelay: 1,
    yoyo: true,
  });

  // Helper Functions
  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };
  
  // Animation Functions
  var headerFx = debounce(function() {
    gsap.to(glow1, {
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inout',
      motionPath: {
        path: glowPath1,
        align: glowPath1,
        alignOrigin: [0.5, 0.5]
      }
    });

    gsap.to(glow2, {
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inout',
      motionPath: {
        path: glowPath2,
        align: glowPath2,
        alignOrigin: [0.5, 0.5]
      }
    });

    gsap.to(glow3, {
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inout',
      motionPath: {
        path: glowPath3,
        align: glowPath3,
        alignOrigin: [0.5, 0.5]
      }
    });
  }, 15);

  var servicesFx = debounce(function() {
    // Frame 1
    timelineServices.to(postit5, {opacity: 0, ease: 'power1.inOut'});
    timelineServices.from(postit1, {opacity: 0, ease: 'power1.inOut'});
    timelineServices.from(postit2, {opacity: 0, ease: 'power1.inOut'});
    timelineServices.to(postit3, {x: 80, ease: 'power1.inOut'});
    timelineServices.to(postit4, {x: 100, ease: 'power1.inOut'});

    // Frame 2
    timelineServices.to(postit5, {x: -140, ease: 'power1.inOut'});
    timelineServices.to(postit5, {opacity: 1, ease: 'power1.inOut'});
    timelineServices.to(postit1, {x: 80, ease: 'power1.inOut'});
    timelineServices.to(postit2, {x: 125, ease: 'power1.inOut'});
    timelineServices.to(postit3, {opacity: 0, ease: 'power1.inOut'});
    timelineServices.to(postit3, {x: -20, ease: 'power1.inOut'})
    timelineServices.to(postit4, {opacity: 0, ease: 'power1.inOut'});
    timelineServices.to(postit4, {x: -30, ease: 'power1.inOut'});

    // Frame 3
    timelineServices.to(postit5, {x: -90, ease: 'power1.inOut'});
    timelineServices.to(postit1, {x: 130, ease: 'power1.inOut'});
    timelineServices.to(postit3, {opacity: 1, ease: 'power1.inOut'});
    timelineServices.to(postit4, {opacity: 1, ease: 'power1.inOut'});
    timelineServices.to(postit1, {opacity: 0, ease: 'power1.inOut'});

    // Frame 4
    timelineServices.to(postit5, {x: 0, ease: 'power1.inOut'});
    timelineServices.to(postit3, {x: 0, ease: 'power1.inOut'});
    timelineServices.to(postit2, {opacity: 0, ease: 'power1.inOut'});
    timelineServices.to(postit4, {x: 0, ease: 'power1.inOut'});
  }, 15);

  var teamFx = debounce(function() {
    timelineTeam.from(speechBubble1, {x: 80, duration: 1, opacity:0});
    timelineTeam.from(speechBubble2, {x: -80, duration: 1, opacity:0});
    timelineTeam.from(speechBubble3, {x: 80, duration: 1, opacity:0});
    timelineTeam.from(speechBubble4, {x: -80, duration: 1, opacity:0});
    timelineTeam.from(speechBubble5, {x: 80, duration: 1, opacity:0});
  }, 15);

  var casestudiesFx = debounce(function() {
    timelineCasestudies.from(casestudyPreview, {y: 80, duration: 1, opacity: 0}); 
    timelineCasestudies.from(casestudy1, {y: 5, duration: 1, opacity: 0});
    timelineCasestudies.from(casestudy2, {y: 5, duration: 1, opacity: 0});
    timelineCasestudies.from(casestudy3, {y: 5, duration: 1, opacity: 0});
  }, 15);

  var blogFx1 = debounce(function() {
    timelineBlog1.from(readingIndicator1, {opacity: 0});
    timelineBlog1.from(readingIndicator2, {opacity: 0});
    timelineBlog1.from(readingIndicator3, {opacity: 0});
  }, 15);

  var blogFx2 = debounce(function() {
    timelineBlog2.from(blogBubble1, {x: 5});
    timelineBlog2.from(blogBubble2, {x: -5});
    timelineBlog2.from(blogBubble3, {x: 5});
    timelineBlog2.from(blogBubble4, {x: -5});
    timelineBlog2.from(blogBubble5, {x: 5});
  }, 15);

  var initAnimations = function() {
    headerFx();
    servicesFx();
    teamFx();
    casestudiesFx();
    blogFx1();
    blogFx2();
  };

  initAnimations();


})(window.document, window.console)
