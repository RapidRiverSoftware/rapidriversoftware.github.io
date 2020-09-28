(function() {
  var RESET_INTERVAL = 5000;
  var IMG_DIR = '/assets/img/team/';
  var IMG_FORMAT = '.jpg';

  var portrait = 'portrait';
  var background = 'background';
  var thumbnail = 'thumbnail';
  var thumbBg = 'thumbnail-background';
  var thumbImgEl = '[data-fx="thumbnail-photo"]';
  var profileImgEl = '[data-fx="profile-bg"]';

  var screenResolution = window.innerWidth;
  var allToggleButtons = document.querySelectorAll('[data-fx="toggle-button"] input');
  var teamProfiles = document.querySelectorAll('[data-fx="profile"]');
  var allNestedLinks = document.querySelectorAll('[data-info="nested-link"]');

  var inactivityTime = function () {
    var time;
    window.onload = resetTimer;
    document.onmousemove = resetTimer;
    document.onlick = resetTimer;
    document.onchange = resetTimer;
    document.onkeypress = resetTimer;

    function resetTimer() {
        clearTimeout(time);
        time = setTimeout(removeExpand, RESET_INTERVAL);
    }
};

  var toggleClass = function(e, c) {
    (e).classList.toggle(c)
  };

  var setImgSrc = function(element, targetProfile, imgType) {
    var slug = targetProfile.getAttribute('data-slug');
    var targetElement = targetProfile.querySelector(`${element}`);
    var srcPath = `${IMG_DIR}${imgType}/${slug}${IMG_FORMAT}`;
    targetElement.src = srcPath;
  };

  var removeExpand = function() {
    teamProfiles.forEach(function(profile) {
      profile.classList.remove('fx-expand');
      setImgSrc(thumbImgEl, profile, thumbnail);
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
      tgBtn.addEventListener('change', function() {
        var parentProfile = this.closest('[data-fx="profile"]')
        if (this.checked) {
          setImgSrc(profileImgEl, parentProfile, background);
          setImgSrc(thumbImgEl, parentProfile, thumbnail);
        } else {
          setImgSrc(profileImgEl, parentProfile, portrait);
          setImgSrc(thumbImgEl, parentProfile, thumbBg);
        }
      });
    });
  };

  var expandProfile = function() {
    teamProfiles.forEach(function(profile) {
      profile.addEventListener('click', function() {
        removeExpand();
        setImgSrc(profileImgEl, profile, portrait);
        setImgSrc(thumbImgEl, profile, thumbBg);
        toggleClass(this, 'fx-expand');
      })
    });
  };
  
  var init = function() {
    preventLinkBubble();
    expandProfile();
    toggleMemberBackground();
  };

  window.onload = function() {
    if (screenResolution >= 1024) {
      inactivityTime();
      init();
    }
  }
})();
