(function() {
  var teamProfiles = document.querySelectorAll('.profile');

  teamProfiles.forEach(function(profile, index) {
    profile.addEventListener('click', function(event) {
      removeExpand();
      // this.classList.toggle('fx-expand');
      toggleClass(this, 'fx-expand');
      // console.log(this.classList.contains('fx-expand'));
    })
  });

  var toggleClass = function(e, c) {
    (e).classList.toggle(c)
  };

  var removeExpand = function() {
    teamProfiles.forEach(function(profile) {
      profile.classList.remove('fx-expand');
    });
  };

})();
