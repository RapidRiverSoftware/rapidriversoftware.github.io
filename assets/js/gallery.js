(function() {
  var RESET_INTERVAL = 10000;
  var timedRemoval;
  var teamProfiles = document.querySelectorAll('[data-fx="profile"]');
  var allSocialLinks = document.querySelectorAll('[data-fx="social-link"]');

  var toggleClass = function(e, c) {
    (e).classList.toggle(c)
  };

  var setTimer = function() {
    timedRemoval = setTimeout(removeExpand, RESET_INTERVAL);
  };

  var clearTimer = function() {
    clearTimeout(timedRemoval);
  };

  var removeExpand = function() {
    teamProfiles.forEach(function(profile) {
      profile.classList.remove('fx-expand');
    });
  };

  var reset = function() {
    clearTimer();
    removeExpand();
  };

  var preventLinkBubble = function() {
    allSocialLinks.forEach(function(socialLink) {
      socialLink.addEventListener('click', function(event) {
        event.stopPropagation();
      });
    });
  };

  var setBackgroundPortrait = function(targetProfile) {
    targetProfile.style.backgroundColor = 'red';
  };

  var expandProfile = function() {
    teamProfiles.forEach(function(profile, index) {
      profile.addEventListener('click', function(event) {
        // reset();
        toggleClass(this, 'fx-expand');
        setBackgroundPortrait(profile);
        // setTimer();
      })
    });
  };

  var init = function() {
    preventLinkBubble();
    expandProfile();
  };

  init();
})();
