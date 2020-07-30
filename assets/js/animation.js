(function(document, console) {
  'use strict';

  gsap.registerPlugin(MotionPathPlugin);

  // Store Elements
  var servicesSection = document.querySelector('[data-fx="services-section"]');
  var teamSection = document.querySelector('[data-fx="team-section"]');
  var myElement = document.querySelector('[data-fx="flying-postit"]');

  var speechBubble1 = document.querySelector('[data-fx="speech-bubble-1"]');
  var speechBubble2 = document.querySelector('[data-fx="speech-bubble-2"]');
  var speechBubble3 = document.querySelector('[data-fx="speech-bubble-3"]');
  var speechBubble4 = document.querySelector('[data-fx="speech-bubble-4"]');
  var speechBubble5 = document.querySelector('[data-fx="speech-bubble-5"]');

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
    console.log(isElementInView(servicesSection));
    gsap.to(myElement, {
      duration: 5,
      repeat: 5,
      repeatDelay: 5,
      yoyo: true,
      ease: "power1.inOut",
      motionPath: {
        path: "[data-fx='postit-path']",
        align: "[data-fx='postit-path']",
        autoRotate: true,
        alignOrigin: [0.5, 0.5]
      }
    });
  }, 15);

  var teamFx = debounce(function() {
    console.log(isElementInView(teamSection));
    var timelineTeam = gsap.timeline({repeat: 2, repeatDelay: 1});
    timelineTeam.from(speechBubble1, {x: 80, duration: 1, opacity:0});
    timelineTeam.from(speechBubble2, {x: -80, duration: 1, opacity:0});
    timelineTeam.from(speechBubble3, {x: 80, duration: 1, opacity:0});
    timelineTeam.from(speechBubble4, {x: -80, duration: 1, opacity:0});
    timelineTeam.from(speechBubble5, {x: 80, duration: 1, opacity:0});
  }, 15);

  var animationPlayer = function() {
    if (isElementInView(servicesSection)) {
      postitFx();
    } else if (isElementInView(teamSection)) {
      teamFx();
    }
  };

  window.addEventListener('scroll', animationPlayer);


})(window.document, window.console)
