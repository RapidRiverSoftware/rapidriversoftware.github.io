(function() {
  var RESET_INTERVAL = 10000;
  var portrait = 'portrait';
  var background = 'background';
  var timedRemoval;
  var teamProfiles = document.querySelectorAll('[data-fx="profile"]');
  var allSocialLinks = document.querySelectorAll('[data-fx="social-link"]');

  // TODO List
  // 1. Switch profile photo
  // 2. Add portrait/background toggle feature
  // 3. Edit all images down to the appropriate size
  // 4. Do something about mobile. Reduce functionality so as not
  //    to overload it.

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

  var setBackgroundPortrait = function(targetProfile, imgType) {
    var slug = targetProfile.getAttribute('data-slug')
    targetProfile.style.backgroundImage = 'url("/assets/img/team/' + imgType + '/' + slug +'.jpg")';
  };

  var expandProfile = function() {
    teamProfiles.forEach(function(profile, index) {
      profile.addEventListener('click', function(event) {
        // reset();
        setBackgroundPortrait(profile, portrait);
        toggleClass(this, 'fx-expand');
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
