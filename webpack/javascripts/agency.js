/*!
 * Start Bootstrap - Agnecy Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
});

$('div.modal').on('show.bs.modal', function() {
	var modal = this;
	var hash = modal.id;
    window.location.hash = hash;
	window.onhashchange = function() {
		if (!location.hash){
			$(modal).modal('hide');
		}
	}
});

$(function() {
  var fullPath = window.location.pathname.substring(1);
  var parentPath = fullPath.split('/')[0];
  var path = fullPath.replace(/\//g, '');

  if (path) {
    // For blog post pages.
    if (path.match(/^\d{4}/)) { path = 'blog' }

    $("#bs-example-navbar-collapse-1 a[href='/"+parentPath+"']").addClass('active');
  }
});
