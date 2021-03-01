(function() {
  var RESET_INTERVAL = 5000;
  var IMG_DIR = '/assets/img/team/';
  var IMG_FORMAT = '.jpg';

  var portrait = 'portrait';
  var background = 'background';
  var thumbnail = 'thumbnail';
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
        time = setTimeout(removeAllExpand, RESET_INTERVAL);
    }
  };

  var setImgSrc = function(element, targetProfile, imgType) {
    var slug = targetProfile.getAttribute('data-slug');
    var targetElement = targetProfile.querySelector(`${element}`);
    var srcPath = `${IMG_DIR}${imgType}/${slug}${IMG_FORMAT}`;
    targetElement.src = srcPath;
  };

  var removeAllExpand = function() {
    teamProfiles.forEach(function(profile) {
      profile.classList.remove('fx-expand');
      setImgSrc(profileImgEl, profile, portrait);
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
          setImgSrc(thumbImgEl, parentProfile, portrait);
        } else {
          setImgSrc(profileImgEl, parentProfile, portrait);
          setImgSrc(thumbImgEl, parentProfile, background);
        }
      });
    });
  };

  var expandProfile = function() {
    teamProfiles.forEach(function(profile) {
      profile.addEventListener('click', function() {
        removeAllExpand();
        this.classList.add('fx-expand');
        setImgSrc(profileImgEl, profile, portrait);
        setImgSrc(thumbImgEl, profile, background);
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
