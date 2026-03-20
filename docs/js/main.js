/* ─────────────────────────────────────────────
   ReflexDuels — Main JS
   Carousel, scroll animations, mobile nav
───────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Mobile Navigation ── */
  function initMobileNav() {
    var hamburger = document.querySelector('.hamburger');
    var mobileNav = document.querySelector('.mobile-nav');
    if (!hamburger || !mobileNav) return;

    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Scroll Reveal Animations ── */
  function initScrollReveal() {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ── Carousel ── */
  function initCarousel() {
    var track = document.querySelector('.carousel__track');
    var dots = document.querySelectorAll('.carousel__dot');
    if (!track || !dots.length) return;

    var slides = track.querySelectorAll('.carousel__slide');
    var autoplayInterval = null;
    var autoplayDelay = 4000;
    var resumeTimeout = null;

    function updateDots() {
      var scrollLeft = track.scrollLeft;
      var trackWidth = track.scrollWidth - track.clientWidth;
      var progress = trackWidth > 0 ? scrollLeft / trackWidth : 0;
      var activeIndex = Math.round(progress * (dots.length - 1));

      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === activeIndex);
      });
    }

    function scrollToSlide(index) {
      if (!slides[index]) return;
      var slideLeft = slides[index].offsetLeft;
      var trackCenter = track.clientWidth / 2;
      var slideCenter = slides[index].offsetWidth / 2;
      track.scrollTo({
        left: slideLeft - trackCenter + slideCenter,
        behavior: 'smooth'
      });
    }

    function nextSlide() {
      var scrollLeft = track.scrollLeft;
      var trackWidth = track.scrollWidth - track.clientWidth;
      var progress = trackWidth > 0 ? scrollLeft / trackWidth : 0;
      var currentIndex = Math.round(progress * (slides.length - 1));
      var nextIndex = (currentIndex + 1) % slides.length;
      scrollToSlide(nextIndex);
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayInterval = setInterval(nextSlide, autoplayDelay);
    }

    function stopAutoplay() {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
      }
    }

    function pauseAndResume() {
      stopAutoplay();
      if (resumeTimeout) clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(startAutoplay, 8000);
    }

    // Dot click
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        scrollToSlide(i);
        pauseAndResume();
      });
    });

    // Track scroll
    var scrollTimer = null;
    track.addEventListener('scroll', function () {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(updateDots, 50);
    }, { passive: true });

    // Pause on user interaction
    track.addEventListener('touchstart', pauseAndResume, { passive: true });
    track.addEventListener('mousedown', pauseAndResume);

    // Init
    updateDots();
    startAutoplay();
  }

  /* ── Smooth Scroll for Nav Links ── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = link.getAttribute('href');
        if (targetId === '#') return;
        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ── Initialize ── */
  function init() {
    initMobileNav();
    initScrollReveal();
    initCarousel();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
