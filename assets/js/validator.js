(function() {
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
})();
