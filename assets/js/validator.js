(function() {
  var submitButton = document.querySelector('[data-fx="submit-button"]');
  submitButton.disabled = true;

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

  document.addEventListener('bouncerFormValid', function () {
    alert('Form submitted successfully!');
    // window.location.reload();
    submitButton.disabled = false;
  }, false);
})();
