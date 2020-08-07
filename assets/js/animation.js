(function(document, console) {
  'use strict';

  gsap.registerPlugin(MotionPathPlugin);
  gsap.registerPlugin(ScrollTrigger);

  // Store Elements
  var headerSection = document.querySelector('[data-fx="header-section"]');
  var servicesSection = document.querySelector('[data-fx="services-section"]');
  var casestudiesSection = document.querySelector('[data-fx="casestudies-section"]');
  var teamSection = document.querySelector('[data-fx="team-section"]');
  var blogSection = document.querySelector('[data-fx="blog-section"]');

  var sectionArray = [
    servicesSection,
    casestudiesSection,
    teamSection,
    blogSection
  ];

  var glow1 = document.querySelector('[data-fx="glow-1"]');
  var glow2 = document.querySelector('[data-fx="glow-2"]');
  var glow3 = document.querySelector('[data-fx="glow-3"]');
  var glowPath1 = document.querySelector('[data-fx="glow-path-1"]');
  var glowPath2 = document.querySelector('[data-fx="glow-path-2"]');
  var glowPath3 = document.querySelector('[data-fx="glow-path-3"]');

  var flyingPostit = document.querySelector('[data-fx="flying-postit"]');
  var postitPath = document.querySelector('[data-fx="postit-path"]');
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

  var timelineExample = gsap.timeline({
    scrollTrigger: {
      trigger: ".trigger",
      start: "center bottom",
      end: "center top",
      scrub: true,
      markers: true
    }
  });

  var timelineHeader = gsap.timeline({
    scrollTrigger: {
      trigger: '[data-fx="header-section"]',
      // toggleActions: 'restart pause resume pause',
      // start: 'top top',
    },
    repeat: -1,
    repeatDelay: 1
  });

  var timelineServices = gsap.timeline({
    scrollTrigger: {
      trigger: '[data-fx="services-section"]',
      toggleActions: 'restart pause resume pause',
      start: 'top center',
    },
    repeat: -1,
    repeatDelay: 1
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

  function isElementInView(el) {
    var bounding = el.getBoundingClientRect();

    while (bounding.top >= 0 
      && bounding.left >= 0 
      && bounding.right <= (window.innerWidth || document.documentElement.clientWidth) 
      && bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      ) {
        return true;
      }
  }
  
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
    timelineServices.from(postit1, {opacity: 0});
    timelineServices.from(postit2, {opacity: 0});
    timelineServices.from(postit3, {opacity: 0});

    timelineServices.to(postit1, {x: 100});
    timelineServices.to(postit3, {x: 70});

    timelineServices.from(postit4, {opacity: 0});

    timelineServices.to(postit2, {x: 30});

    timelineServices.from(postit5, {opacity: 0});

    timelineServices.to(postit1, {x: 160});

    timelineServices.to(postit5, {x: 40});

    timelineServices.to(postit4, {x: 80});

    timelineServices.to(postit2, {x: 120});
    timelineServices.to(postit1, {opacity: 0});


    timelineServices.to(postit4, {x: 130});
    timelineServices.to(postit3, {x: 120});

    timelineServices.to(postit5, {x: 140});

    // timelineServices.to(flyingPostit, {
    //   duration: 1, 
    //   yoyo: true,
    //   ease: 'power1.inOut',
    //   motionPath: {
    //     path: postitPath,
    //     align: postitPath,
    //     autoRotate: true,
    //     alignOrigin: [0.5, 0.5]
    //   }
    // });
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

  var animationPlayer = function() {
    headerFx();
    servicesFx();
    teamFx();
    casestudiesFx();
    blogFx1();
    blogFx2();
    // gsap.utils.toArray('-section').forEach(function(section, index) {
    //   gsap.fromTo()
    // });
  };

  animationPlayer();


})(window.document, window.console)
