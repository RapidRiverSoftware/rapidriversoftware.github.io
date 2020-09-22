(function() {
  var RESET_INTERVAL = 7000;
  var IMG_DIR = '/assets/img/team/';
  var IMG_FORMAT = '.jpg';
  var portrait = 'portrait';
  var background = 'background';
  var thumbnail = 'thumbnail';
  var thumbBg = 'thumbnail-background';
  var timedRemoval;
  var allToggleButtons = document.querySelectorAll('[data-fx="toggle-button"] input');
  var teamProfiles = document.querySelectorAll('[data-fx="profile"]');
  var allNestedLinks = document.querySelectorAll('[data-info="nested-link"]');

  // TODO List
  // 1. Do something about mobile. Reduce functionality so as not
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

  var reset = function() {
    clearTimer();
    removeExpand();
  };

  var setBackground = function(targetProfile, imgType) {
    var slug = targetProfile.getAttribute('data-slug');
    var imgPath = `${IMG_DIR}${imgType}/${slug}${IMG_FORMAT}`;
    targetProfile.style.backgroundImage = `url(${imgPath})`;
  };

  var setThumbnailSrc = function(targetProfile, thumbnailType) {
    var slug = targetProfile.getAttribute('data-slug');
    var thumbnail = targetProfile.querySelector('[data-fx="thumbnail-photo"]');
    var srcPath = `${IMG_DIR}${thumbnailType}/${slug}${IMG_FORMAT}`;
    thumbnail.src = srcPath;
  };

  var removeExpand = function() {
    teamProfiles.forEach(function(profile) {
      profile.classList.remove('fx-expand');
      setThumbnailSrc(profile, thumbnail);
    });
  };

  var preventLinkBubble = function() {
    allNestedLinks.forEach(function(nestedLink) {
      nestedLink.addEventListener('click', function(event) {
        event.stopPropagation();
      });
    });
  };

  var toggleMemberBackground = function() {
    allToggleButtons.forEach(function(tgBtn) {
      tgBtn.addEventListener('change', function(event) {
        var parentProfile = this.closest('[data-fx="profile"]')
        if (this.checked) {
          setBackground(parentProfile, background);
          setThumbnailSrc(parentProfile, thumbnail);
        } else {
          setBackground(parentProfile, portrait);
          setThumbnailSrc(parentProfile, thumbBg);
        }
      });
    });
  };

  var expandProfile = function() {
    teamProfiles.forEach(function(profile, index) {
      profile.addEventListener('click', function(event) {
        reset();
        setBackground(profile, portrait);
        setThumbnailSrc(profile, thumbBg);
        toggleClass(this, 'fx-expand');
        setTimer();
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
