// Highlight active navigation menu item
(function() {
  var fullPath = window.location.pathname.substring(1);
  var parentPath = fullPath.split('/')[0];
  var path = fullPath.replace(/\//g, '');

  if (path) {
    // For blog post pages.
    if (/blog/.test(path)) {
      parentPath = parentPath +'/'; 
    }
    
    document.querySelector("[data-fx='main-nav'] a[href='/"+parentPath+"']").classList.add('active');
  }
})();


// Helper function to set bloglist classes to be used for backgrounds
(function() {
  var pathname = window.location.pathname;

  if (/blog/.test(pathname)) {
    var pageNum = parseInt(pathname.split('/')[3], 10);

    if (!pageNum) {
      pageNum = 1;
    }

    if (pageNum <= 4) {
      pageNum = pageNum;
    }

    if (pageNum > 4) {
      if (pageNum % 4 === 0) {
        pageNum = 4;
      } else {
        pageNum = pageNum % 4;
      }
    }

    document.querySelector("[data-fx='blog-list']").classList.add('page' + pageNum);
  }
})();
