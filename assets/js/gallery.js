(function() {
  var RESET_INTERVAL = 10000;
  var portrait = 'portrait';
  var background = 'background';
  var timedRemoval;
  var allToggleButtons = document.querySelectorAll('[data-fx="toggle-button"]');
  var teamProfiles = document.querySelectorAll('[data-fx="profile"]');
  var allNestedLinks = document.querySelectorAll('[data-info="nested-link"]');

  // TODO List
  // 1. Switch profile photo when toggle button is :checked
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
    allNestedLinks.forEach(function(nestedLink) {
      nestedLink.addEventListener('click', function(event) {
        event.stopPropagation();
      });
    });
  };

  var setBackground = function(targetProfile, imgType) {
    var slug = targetProfile.getAttribute('data-slug')
    targetProfile.style.backgroundImage = 'url("/assets/img/team/' + imgType + '/' + slug +'.jpg")';
  };

  var toggleMemberBackground = function() {
    console.log('eh hello');
    allToggleButtons.forEach(function(tgBtn) {
      tgBtn.addEventListener('click', function(event) {
        console.log('halp');
      });
    });
  };

  var expandProfile = function() {
    teamProfiles.forEach(function(profile, index) {
      profile.addEventListener('click', function(event) {
        // reset();
        setBackground(profile, portrait);
        toggleClass(this, 'fx-expand');
        // setTimer();
      })
    });
  };

  var init = function() {
    preventLinkBubble();
    expandProfile();
    toggleMemberBackground();
  };

  init();
})();
