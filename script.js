(function() {
  'use strict';

  if (window.__app && window.__app.initialized) {
    return;
  }

  window.__app = {
    initialized: true
  };

  const debounce = function(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  };

  const throttle = function(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  function initBurgerMenu() {
    const toggle = document.querySelector('.c-nav__toggle, .navbar-toggler');
    const navbar = document.querySelector('.navbar-collapse');
    const body = document.body;

    if (!toggle || !navbar) return;

    let isOpen = false;

    const openMenu = () => {
      isOpen = true;
      navbar.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
    };

    const closeMenu = () => {
      isOpen = false;
      navbar.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
    };

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
      }
    });

    document.addEventListener('click', (e) => {
      if (isOpen && !navbar.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    const navLinks = document.querySelectorAll('.nav-link, .c-nav__link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (isOpen) {
          closeMenu();
        }
      });
    });

    const resizeHandler = debounce(() => {
      if (window.innerWidth >= 1024 && isOpen) {
        closeMenu();
      }
    }, 200);

    window.addEventListener('resize', resizeHandler);
  }

  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (!href || href === '#' || href === '#!') return;

        const targetId = href.replace('#', '');
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          e.preventDefault();
          const header = document.querySelector('.l-header, .navbar');
          const headerHeight = header ? header.offsetHeight : 80;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  function initScrollSpy() {
    const sections = document.querySelectorAll('section[id], main[id]');
    const navLinks = document.querySelectorAll('.nav-link, .c-nav__link');

    if (sections.length === 0 || navLinks.length === 0) return;

    const header = document.querySelector('.l-header, .navbar');
    const headerHeight = header ? header.offsetHeight : 80;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
              const href = link.getAttribute('href');
              link.classList.remove('active');
              link.removeAttribute('aria-current');
              if (href === `#${id}`) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
              }
            });
          }
        });
      },
      {
        rootMargin: `-${headerHeight}px 0px -80% 0px`,
        threshold: 0
      }
    );

    sections.forEach(section => observer.observe(section));
  }

  function initActiveMenuState() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .c-nav__link');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.remove('active');
      link.removeAttribute('aria-current');

      if (href === currentPath || (href === '/' && (currentPath === '/' || currentPath === '/index.html'))) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  function initFormValidation() {
    const forms = document.querySelectorAll('form');
    if (forms.length === 0) return;

    const notify = (message, type = 'info') => {
      let container = document.querySelector('.notification-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `alert alert-${type} alert-dismissible fade show`;
      toast.setAttribute('role', 'alert');
      toast.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;

      container.appendChild(toast);

      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 150);
      }, 5000);

      const closeBtn = toast.querySelector('.btn-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          toast.classList.remove('show');
          setTimeout(() => toast.remove(), 150);
        });
      }
    };

    const validateEmail = (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    };

    const validatePhone = (phone) => {
      const re = /^[\+\d\s\(\)\-]{10,20}$/;
      return re.test(phone);
    };

    const validateName = (name) => {
      const re = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;
      return re.test(name);
    };

    const showFieldError = (field, message) => {
      field.classList.add('is-invalid');
      let errorElement = field.nextElementSibling;
      if (!errorElement || !errorElement.classList.contains('invalid-feedback')) {
        errorElement = document.createElement('div');
        errorElement.className = 'invalid-feedback';
        field.parentNode.appendChild(errorElement);
      }
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    };

    const clearFieldError = (field) => {
      field.classList.remove('is-invalid');
      const errorElement = field.nextElementSibling;
      if (errorElement && errorElement.classList.contains('invalid-feedback')) {
        errorElement.style.display = 'none';
      }
    };

    forms.forEach(form => {
      const fields = form.querySelectorAll('input, textarea, select');
      fields.forEach(field => {
        field.addEventListener('input', () => clearFieldError(field));
        field.addEventListener('blur', () => clearFieldError(field));
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        let isValid = true;

        const firstName = form.querySelector('#firstName, input[name="firstName"]');
        if (firstName) {
          const value = firstName.value.trim();
          if (!value) {
            showFieldError(firstName, 'Voornaam is verplicht');
            isValid = false;
          } else if (!validateName(value)) {
            showFieldError(firstName, 'Ongeldige voornaam');
            isValid = false;
          } else {
            clearFieldError(firstName);
          }
        }

        const lastName = form.querySelector('#lastName, input[name="lastName"]');
        if (lastName) {
          const value = lastName.value.trim();
          if (!value) {
            showFieldError(lastName, 'Achternaam is verplicht');
            isValid = false;
          } else if (!validateName(value)) {
            showFieldError(lastName, 'Ongeldige achternaam');
            isValid = false;
          } else {
            clearFieldError(lastName);
          }
        }

        const email = form.querySelector('#email, input[name="email"]');
        if (email) {
          const value = email.value.trim();
          if (!value) {
            showFieldError(email, 'E-mail is verplicht');
            isValid = false;
          } else if (!validateEmail(value)) {
            showFieldError(email, 'Ongeldig e-mailadres');
            isValid = false;
          } else {
            clearFieldError(email);
          }
        }

        const phone = form.querySelector('#phone, input[name="phone"]');
        if (phone) {
          const value = phone.value.trim();
          if (!value) {
            showFieldError(phone, 'Telefoonnummer is verplicht');
            isValid = false;
          } else if (!validatePhone(value)) {
            showFieldError(phone, 'Ongeldig telefoonnummer');
            isValid = false;
          } else {
            clearFieldError(phone);
          }
        }

        const message = form.querySelector('#message, textarea[name="message"]');
        if (message) {
          const value = message.value.trim();
          if (value && value.length < 10) {
            showFieldError(message, 'Bericht moet minimaal 10 tekens bevatten');
            isValid = false;
          } else {
            clearFieldError(message);
          }
        }

        const service = form.querySelector('#service, select[name="service"]');
        if (service && service.hasAttribute('required')) {
          const value = service.value;
          if (!value) {
            showFieldError(service, 'Selecteer een dienst');
            isValid = false;
          } else {
            clearFieldError(service);
          }
        }

        const subject = form.querySelector('#subject, select[name="subject"]');
        if (subject && subject.hasAttribute('required')) {
          const value = subject.value;
          if (!value) {
            showFieldError(subject, 'Selecteer een onderwerp');
            isValid = false;
          } else {
            clearFieldError(subject);
          }
        }

        const privacy = form.querySelector('#privacy, #privacyConsent, input[name="privacy"], input[name="privacyConsent"]');
        if (privacy) {
          if (!privacy.checked) {
            showFieldError(privacy, 'U moet akkoord gaan met het privacybeleid');
            isValid = false;
          } else {
            clearFieldError(privacy);
          }
        }

        if (!isValid) {
          notify('Controleer de formuliervelden', 'danger');
          return false;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          const originalText = submitBtn.innerHTML;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Verzenden...';

          setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            notify('Bedankt! Uw bericht is verzonden.', 'success');
            form.reset();
            setTimeout(() => {
              window.location.href = 'thank_you.html';
            }, 1000);
          }, 1500);
        }

        return false;
      });
    });
  }

  function initCookieBanner() {
    const banner = document.getElementById('cookieBanner');
    if (!banner) return;

    const accepted = localStorage.getItem('cookiesAccepted');
    const declined = localStorage.getItem('cookiesDeclined');

    if (!accepted && !declined) {
      banner.style.display = 'block';
    }

    const acceptBtn = document.getElementById('acceptCookies');
    const declineBtn = document.getElementById('declineCookies');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        banner.style.display = 'none';
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', () => {
        localStorage.setItem('cookiesDeclined', 'true');
        banner.style.display = 'none';
      });
    }
  }

  function initScrollToTop() {
    let scrollBtn = document.querySelector('.scroll-to-top');
    
    if (!scrollBtn) {
      scrollBtn = document.createElement('button');
      scrollBtn.className = 'c-button c-button--primary scroll-to-top';
      scrollBtn.setAttribute('aria-label', 'Scroll naar boven');
      scrollBtn.innerHTML = '↑';
      scrollBtn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:999;width:48px;height:48px;border-radius:50%;display:none;';
      document.body.appendChild(scrollBtn);
    }

    const toggleVisibility = throttle(() => {
      if (window.pageYOffset > 300) {
        scrollBtn.style.display = 'flex';
      } else {
        scrollBtn.style.display = 'none';
      }
    }, 200);

    window.addEventListener('scroll', toggleVisibility);

    scrollBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  function initCountUp() {
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length === 0) return;

    const animateCount = (element) => {
      const target = parseInt(element.getAttribute('data-count'));
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;

      const updateCount = () => {
        current += step;
        if (current < target) {
          element.textContent = Math.floor(current);
          requestAnimationFrame(updateCount);
        } else {
          element.textContent = target;
        }
      };

      updateCount();
    };

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(counter => observer.observe(counter));
  }

  function initLazyLoading() {
    const images = document.querySelectorAll('img:not([loading])');
    const videos = document.querySelectorAll('video:not([loading])');

    images.forEach(img => {
      if (!img.classList.contains('c-logo__img') && !img.hasAttribute('data-critical')) {
        img.setAttribute('loading', 'lazy');
      }
    });

    videos.forEach(video => {
      video.setAttribute('loading', 'lazy');
    });
  }

  function initImageErrorHandling() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      img.addEventListener('error', function() {
        if (this.dataset.fallbackApplied) return;
        this.dataset.fallbackApplied = 'true';

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="#e9ecef" width="400" height="300"/><text x="50%" y="50%" fill="#6c757d" font-family="sans-serif" font-size="18" text-anchor="middle" dominant-baseline="middle">Afbeelding niet beschikbaar</text></svg>`;
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        this.src = url;
        this.style.objectFit = 'contain';
      });
    });
  }

  function initCarousel() {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;

    const inner = carousel.querySelector('.carousel-inner');
    const items = carousel.querySelectorAll('.carousel-item');
    const prevBtn = carousel.querySelector('.carousel-control-prev');
    const nextBtn = carousel.querySelector('.carousel-control-next');
    const indicators = carousel.querySelectorAll('.carousel-indicators button');

    if (items.length === 0) return;

    let currentIndex = 0;

    const showSlide = (index) => {
      items.forEach((item, i) => {
        item.classList.toggle('active', i === index);
      });
      indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
      });
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        showSlide(currentIndex);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % items.length;
        showSlide(currentIndex);
      });
    }

    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        currentIndex = index;
        showSlide(currentIndex);
      });
    });

    let autoplayInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % items.length;
      showSlide(currentIndex);
    }, 5000);

    carousel.addEventListener('mouseenter', () => {
      clearInterval(autoplayInterval);
    });

    carousel.addEventListener('mouseleave', () => {
      autoplayInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % items.length;
        showSlide(currentIndex);
      }, 5000);
    });
  }

  function init() {
    initBurgerMenu();
    initSmoothScroll();
    initScrollSpy();
    initActiveMenuState();
    initFormValidation();
    initCookieBanner();
    initScrollToTop();
    initCountUp();
    initLazyLoading();
    initImageErrorHandling();
    initCarousel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();