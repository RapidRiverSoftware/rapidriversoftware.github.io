(function(document, console) {
  'use strict';

  gsap.registerPlugin(MotionPathPlugin);

  // Store Elements
  var myElement = document.querySelector('[data-fx="flying-postit"]');

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

var blargh = debounce(function() {
  console.log(isElementInView(myElement));
  gsap.to(myElement, {
    duration: 5,
    repeat: 5,
    repeatDelay: 5,
    ease: "power1.inOut",
    motionPath: {
      path: "[data-fx='postit-path']",
      align: "[data-fx='postit-path']",
      autoRotate: true,
      alignOrigin: [0.5, 0.5]
    }
  });
}, 15);

window.addEventListener('scroll', blargh);


})(window.document, window.console)
