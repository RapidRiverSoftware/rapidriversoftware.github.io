(function() {
  var timedRemoval;
  var teamProfiles = document.querySelectorAll('.profile');

  var toggleClass = function(e, c) {
    (e).classList.toggle(c)
  };

  var setTimer = function() {
    timedRemoval = setTimeout(removeExpand, 8000);
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

  // TODO: put this in an init function once you're a little more happy with it
  teamProfiles.forEach(function(profile, index) {
    profile.addEventListener('click', function(event) {
      reset();
      toggleClass(this, 'fx-expand');
      setTimer();
    })
  });
})();
