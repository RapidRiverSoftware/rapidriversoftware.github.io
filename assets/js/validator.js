window.onload = function() {
  var recaptcha = document.querySelector('#g-recaptcha-response');

  if (recaptcha) {
    recaptcha.setAttribute("required", "required");
  }
};

(function() {
  var bouncer = new Bouncer('[data-validate]', {
    customValidations: {
      recaptcha: function() {}
    },
    messages: {
      missingValue: {
        text: '💔 Please fill out this required field.',
        textarea: '💔 Please fill out this required field.',
        email: '💔 Please let us know how we can email you.',
      },
    }
  });

})();
