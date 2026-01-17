(function () {
  var header = document.querySelector('.dr-header');
  if (!header) return;

  var toggle = header.querySelector('.dr-nav-toggle');
  var navList = header.querySelector('.dr-nav-list');
  if (!toggle || !navList) return;

  toggle.addEventListener('click', function () {
    var isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
    if (!isExpanded) {
      header.classList.add('dr-header--nav-open');
    } else {
      header.classList.remove('dr-header--nav-open');
    }
  });
})();
