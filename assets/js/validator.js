(function() {
  var submitButton = document.querySelector('[data-fx="submit-button"]');
  var recaptchaResponse = document.querySelector('g-recaptcha-response');
  submitButton.disabled = 'disabled';

  var bouncer = new Bouncer('[data-validate]', {
    disableSubmit: true,

    messages: {
      missingValue: {
        text: '💔 Please fill out this required field.',
        textarea: '💔 Please fill out this required field.',
        email: '💔 Please let us know how we can email you.',
      },
    }
  });

  var recaptcha_callback = function() {
    if (recaptchaResponse) {
      submitButton.removeAttribute('disabled');
      console.log('recaptcha response');
    }
  };

  recaptcha_callback();

  document.addEventListener('bouncerFormValid', function () {
    // alert('Form submitted successfully!');
    recaptcha_callback();
    // window.location.reload();
  }, false);
})();
