(function(document, console) {
  'use strict';

  gsap.registerPlugin(MotionPathPlugin);
  gsap.registerPlugin(ScrollTrigger);

  // Store Elements
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

  var flyingPostit = document.querySelector('[data-fx="flying-postit"]');
  var postitPath = document.querySelector('[data-fx="postit-path"]');

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

  var timelineServices = gsap.timeline({
    scrollTrigger: {
      trigger: '[data-fx="services-section"]',
      toggleActions: 'restart pause resume pause',
      start: 'top center',
    },
    repeat: 2,
    repeatDelay: 1
  });

  var timelineCasestudies = gsap.timeline({
    scrollTrigger: {
      trigger: '[data-fx="casestudies-section"]',
      toggleActions: 'restart pause resume pause',
      start: 'top center',
    },
    repeat: 2,
    repeatDelay: 1
  });

  var timelineTeam = gsap.timeline({
    scrollTrigger: {
      trigger: '[data-fx="team-section"]',
      toggleActions: 'restart pause resume pause',
      start: 'top center',
    },
    repeat: 2,
    repeatDelay: 1
  });

  var timelineBlog = gsap.timeline({
    scrollTrigger: {
      trigger: '[data-fx="blog-section"]',
      toggleActions: 'restart pause resume pause',
      start: 'top center',
    },
    repeat: 2,
    repeatDelay: 1
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

  var postitFx = debounce(function() {
    timelineServices.to(flyingPostit, {
      duration: 1, 
      repeat: 12,
      repeatDelay: 3,
      yoyo: true,
      ease: 'power1.inOut',
      motionPath: {
        path: postitPath,
        align: postitPath,
        autoRotate: true,
        alignOrigin: [0.5, 0.5]
      }
    });
  }, 15);

  var teamFx = debounce(function() {
    if (isElementInView(teamSection)) {
      console.log('viewing the team section');
    }
    timelineTeam.from(speechBubble1, {x: 80, duration: 1, opacity:0});
    timelineTeam.from(speechBubble2, {x: -80, duration: 1, opacity:0});
    timelineTeam.from(speechBubble3, {x: 80, duration: 1, opacity:0});
    timelineTeam.from(speechBubble4, {x: -80, duration: 1, opacity:0});
    timelineTeam.from(speechBubble5, {x: 80, duration: 1, opacity:0});
  }, 15);

  var casestudiesFx = debounce(function() {
    if (isElementInView(casestudiesSection)) {
      console.log('viewing the case studies section');
    } 

    timelineCasestudies.from(casestudyPreview, {y: 80, duration: 1, opacity: 0}); 
    timelineCasestudies.from(casestudy1, {y: 5, duration: 1, opacity: 0});
    timelineCasestudies.from(casestudy2, {y: 5, duration: 1, opacity: 0});
    timelineCasestudies.from(casestudy3, {y: 5, duration: 1, opacity: 0});
  }, 15);

  var blogFx = debounce(function() {
    if (isElementInView(blogSection)) {
      console.log('viewing the blog section');
    }

    timelineBlog.from(readingIndicator1, {opacity: 0});
    timelineBlog.from(readingIndicator2, {opacity: 0});
    timelineBlog.from(readingIndicator3, {opacity: 0});
    timelineBlog.from(blogBubble1, {x: 5});
    timelineBlog.from(blogBubble2, {x: -5});
    timelineBlog.from(blogBubble3, {x: 5});
    timelineBlog.from(blogBubble4, {x: -5});
    timelineBlog.from(blogBubble5, {x: 5});
  }, 15);

  var animationPlayer = function() {
    postitFx();
    teamFx();
    casestudiesFx();
    blogFx();
    // gsap.utils.toArray('-section').forEach(function(section, index) {
    //   gsap.fromTo()
    // });
  };

  animationPlayer();


})(window.document, window.console)
