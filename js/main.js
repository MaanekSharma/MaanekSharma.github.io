/* ===================================================================
 * Epitome - Main JS
 *
 * ------------------------------------------------------------------- */

(function($) {

    "use strict";
    
    var cfg = {
        scrollDuration : 800, // smoothscroll duration
        mailChimpURL   : ''   // mailchimp url
    },

    $WIN = $(window);

    // Add the User Agent to the <html>
    // will be used for IE10/IE11 detection (Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0; rv:11.0))
    var doc = document.documentElement;
    doc.setAttribute('data-useragent', navigator.userAgent);


   /* Intro Checkerboard
    * ------------------------------------------------------ */
    var ssIntroCheckerboard = function() {

        var intro = document.querySelector('.s-intro'),
            board = intro ? intro.querySelector('.intro-board') : null;

        if (!intro || !board) return;

        var reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)'),
            finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)'),
            state = {
                columns: 0,
                rows: 0,
                cellWidth: 0,
                cellHeight: 0,
                cells: [],
                resizeFrame: null,
                moveFrame: null,
                ambientTimer: null,
                pointerX: -9999,
                pointerY: -9999
            };

        var getCellSize = function(width) {
            if (width <= 600) return 18;
            if (width <= 800) return 24;
            return 30;
        };

        var refreshCellGeometry = function() {
            state.cells.forEach(function(cell) {
                cell.centerX = (cell.column + 0.5) * state.cellWidth;
                cell.centerY = (cell.row + 0.5) * state.cellHeight;
            });
        };

        var activateCell = function(cell, intensity, hold) {
            if (!cell) return;

            if (cell.timeoutId) {
                window.clearTimeout(cell.timeoutId);
            }

            cell.el.style.setProperty('--tile-glow', (0.18 + (intensity * 0.42)).toFixed(2));
            cell.el.style.setProperty('--flip-angle', (176 + (intensity * 10)).toFixed(2) + 'deg');
            cell.el.classList.add('is-active');

            cell.timeoutId = window.setTimeout(function() {
                cell.el.classList.remove('is-active');
            }, hold);
        };

        var activateCluster = function(originX, originY, radius, holdBase) {
            if (!state.cells.length) return;

            var centerColumn = Math.max(0, Math.min(state.columns - 1, Math.floor(originX / state.cellWidth))),
                centerRow = Math.max(0, Math.min(state.rows - 1, Math.floor(originY / state.cellHeight))),
                horizontalSpan = Math.max(1, Math.ceil(radius / state.cellWidth)),
                verticalSpan = Math.max(1, Math.ceil(radius / state.cellHeight)),
                row, column, cell, dx, dy, distance, intensity, hold;

            for (row = centerRow - verticalSpan; row <= centerRow + verticalSpan; row += 1) {
                if (row < 0 || row >= state.rows) continue;

                for (column = centerColumn - horizontalSpan; column <= centerColumn + horizontalSpan; column += 1) {
                    if (column < 0 || column >= state.columns) continue;

                    cell = state.cells[(row * state.columns) + column];
                    dx = cell.centerX - originX;
                    dy = cell.centerY - originY;
                    distance = Math.sqrt((dx * dx) + (dy * dy));

                    if (distance > radius) continue;

                    intensity = 1 - (distance / radius);
                    hold = holdBase + Math.round((1 - intensity) * 120) + (((row + column) % 3) * 35);
                    activateCell(cell, intensity, hold);
                }
            }
        };

        var processPointer = function() {
            state.moveFrame = null;
            activateCluster(
                state.pointerX,
                state.pointerY,
                Math.max(state.cellWidth, state.cellHeight) * 1.75,
                240
            );
        };

        var onPointerMove = function(event) {
            if (!finePointerQuery.matches || reducedMotionQuery.matches || !state.cells.length) return;

            var rect = intro.getBoundingClientRect();

            state.pointerX = event.clientX - rect.left;
            state.pointerY = event.clientY - rect.top;

            if (state.pointerX < 0 || state.pointerX > rect.width || state.pointerY < 0 || state.pointerY > rect.height) {
                return;
            }

            if (state.moveFrame) return;

            state.moveFrame = window.requestAnimationFrame(processPointer);
        };

        var stopAmbient = function() {
            if (!state.ambientTimer) return;

            window.clearInterval(state.ambientTimer);
            state.ambientTimer = null;
        };

        var runAmbientPulse = function() {
            if (!state.cells.length || finePointerQuery.matches || reducedMotionQuery.matches) return;

            var anchorColumn = Math.floor(Math.random() * state.columns),
                anchorRow = Math.floor(Math.random() * state.rows),
                sweep = Math.random() > 0.55,
                row, column, cell, distance, intensity, hold;

            if (sweep) {
                row = anchorRow;

                for (column = 0; column < state.columns; column += 1) {
                    cell = state.cells[(row * state.columns) + column];
                    distance = Math.abs(column - anchorColumn);

                    if (distance > 3) continue;

                    intensity = 1 - (distance / 4);
                    hold = 260 + (column * 12);
                    activateCell(cell, intensity * 0.85, hold);
                }

                return;
            }

            activateCluster(
                (anchorColumn + 0.5) * state.cellWidth,
                (anchorRow + 0.5) * state.cellHeight,
                Math.max(state.cellWidth, state.cellHeight) * 1.8,
                280
            );
        };

        var startAmbient = function() {
            stopAmbient();

            if (finePointerQuery.matches || reducedMotionQuery.matches) return;

            runAmbientPulse();
            state.ambientTimer = window.setInterval(runAmbientPulse, 1400);
        };

        var buildBoard = function() {
            var rect = intro.getBoundingClientRect(),
                width = Math.max(intro.clientWidth, Math.round(rect.width)),
                height = Math.max(intro.clientHeight, Math.round(rect.height)),
                targetSize = getCellSize(width),
                columns = Math.max(1, Math.ceil(width / targetSize)),
                rows = Math.max(1, Math.ceil(height / targetSize)),
                fragment, row, column, cellElement;

            state.cellWidth = width / columns;
            state.cellHeight = height / rows;

            if (columns === state.columns && rows === state.rows) {
                refreshCellGeometry();
                startAmbient();
                return;
            }

            stopAmbient();

            state.cells.forEach(function(cell) {
                if (cell.timeoutId) {
                    window.clearTimeout(cell.timeoutId);
                }
            });

            state.columns = columns;
            state.rows = rows;
            state.cells = [];
            board.innerHTML = '';
            board.style.setProperty('--board-columns', columns);
            board.style.setProperty('--board-rows', rows);

            fragment = document.createDocumentFragment();

            for (row = 0; row < rows; row += 1) {
                for (column = 0; column < columns; column += 1) {
                    cellElement = document.createElement('span');
                    cellElement.className = 'intro-board__cell';

                    if ((row + column) % 2 === 1) {
                        cellElement.className += ' intro-board__cell--alt';
                    }

                    fragment.appendChild(cellElement);
                    state.cells.push({
                        el: cellElement,
                        row: row,
                        column: column,
                        centerX: 0,
                        centerY: 0,
                        timeoutId: null
                    });
                }
            }

            board.appendChild(fragment);
            refreshCellGeometry();
            startAmbient();
        };

        var queueBuild = function() {
            if (state.resizeFrame) {
                window.cancelAnimationFrame(state.resizeFrame);
            }

            state.resizeFrame = window.requestAnimationFrame(function() {
                state.resizeFrame = null;
                buildBoard();
            });
        };

        intro.addEventListener('mousemove', onPointerMove);
        intro.addEventListener('mouseleave', function() {
            if (!state.moveFrame) return;

            window.cancelAnimationFrame(state.moveFrame);
            state.moveFrame = null;
        });

        $WIN.on('resize', queueBuild);
        $WIN.on('load', buildBoard);

        if (typeof reducedMotionQuery.addEventListener === 'function') {
            reducedMotionQuery.addEventListener('change', queueBuild);
            finePointerQuery.addEventListener('change', queueBuild);
        } else if (typeof reducedMotionQuery.addListener === 'function') {
            reducedMotionQuery.addListener(queueBuild);
            finePointerQuery.addListener(queueBuild);
        }

        buildBoard();
    };


   /* Preloader
    * -------------------------------------------------- */
    var ssPreloader = function() {
        
        $("html").addClass('ss-preload');

        $WIN.on('load', function() {

            //force page scroll position to top at page refresh
            $('html, body').animate({ scrollTop: 0 }, 'normal');

            // will first fade out the loading animation 
            $("#loader").fadeOut("slow", function() {
                // will fade out the whole DIV that covers the website.
                $("#preloader").delay(300).fadeOut("slow");
            }); 
            
            // for hero content animations 
            $("html").removeClass('ss-preload');
            $("html").addClass('ss-loaded');
        
        });
    };


   /* Menu on Scrolldown
    * ------------------------------------------------------ */
    var ssMenuOnScrolldown = function() {
        
        var hdr = $('.s-header'),
            hdrTop = $('.s-header').offset().top;

        $WIN.on('scroll', function() {

            if ($WIN.scrollTop() > hdrTop) {
                hdr.addClass('sticky');
            }
            else {
                hdr.removeClass('sticky');
            }

        });
    };


   /* Mobile Menu
    * ---------------------------------------------------- */ 
    var ssMobileMenu = function() {

        var toggleButton = $('.header-menu-toggle'),
            nav = $('.header-nav-wrap');

        toggleButton.on('click', function(event){
            event.preventDefault();

            toggleButton.toggleClass('is-clicked');
            nav.slideToggle();
        });

        if (toggleButton.is(':visible')) nav.addClass('mobile');

        $WIN.on('resize', function() {
            if (toggleButton.is(':visible')) nav.addClass('mobile');
            else nav.removeClass('mobile');
        });

        nav.find('a').on("click", function() {

            if (nav.hasClass('mobile')) {
                toggleButton.toggleClass('is-clicked');
                nav.slideToggle(); 
            }
        });

    };

   /* Highlight the current section in the navigation bar
    * ------------------------------------------------------ */
    var ssWaypoints = function() {

        var sections = $(".target-section"),
            navigation_links = $(".header-main-nav li a");

        sections.waypoint( {

            handler: function(direction) {

                var active_section;

                active_section = $('section#' + this.element.id);

                if (direction === "up") active_section = active_section.prevAll(".target-section").first();

                var active_link = $('.header-main-nav li a[href="#' + active_section.attr("id") + '"]');

                navigation_links.parent().removeClass("current");
                active_link.parent().addClass("current");

            },

            offset: '25%'

        });
        
    };


   /* Masonry
    * ---------------------------------------------------- */ 
    var ssMasonryFolio = function () {
        
        var containerBricks = $('.masonry');

        containerBricks.imagesLoaded(function () {
            containerBricks.masonry({
                itemSelector: '.masonry__brick',
                resize: true
            });
        });

    };


   /* photoswipe
    * ----------------------------------------------------- */
    var ssPhotoswipe = function() {
        var items = [],
            $pswp = $('.pswp')[0],
            $folioItems = $('.item-folio');

        // get items
        $folioItems.each( function(i) {

            var $folio = $(this),
                $thumbLink =  $folio.find('.thumb-link'),
                $title = $folio.find('.item-folio__title'),
                $caption = $folio.find('.item-folio__caption'),
                $titleText = '<h4>' + $.trim($title.html()) + '</h4>',
                $captionText = $.trim($caption.html()),
                $href = $thumbLink.attr('href'),
                $size = $thumbLink.data('size').split('x'),
                $width  = $size[0],
                $height = $size[1];
        
            var item = {
                src  : $href,
                w    : $width,
                h    : $height
            }

            if ($caption.length > 0) {
                item.title = $.trim($titleText + $captionText);
            }

            items.push(item);
        });

        // bind click event
        $folioItems.each(function(i) {

            $(this).find('.thumb-link').on('click', function(e) {
                e.preventDefault();
                var options = {
                    index: i,
                    showHideOpacity: true
                }

                // initialize PhotoSwipe
                var lightBox = new PhotoSwipe($pswp, PhotoSwipeUI_Default, items, options);
                lightBox.init();
            });

        });
    };


   /* slick slider
    * ------------------------------------------------------ */
    var ssSlickSlider = function() {
        
        $('.testimonials__slider').slick({
            arrows: false,
            dots: true,
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            pauseOnFocus: false,
            autoplaySpeed: 1500,
            fade: true,
            cssEase: 'linear'
        });
    };


   /* Smooth Scrolling
    * ------------------------------------------------------ */
    var ssSmoothScroll = function() {
        
        $('.smoothscroll').on('click', function (e) {
            var target = this.hash,
            $target    = $(target);
            
                e.preventDefault();
                e.stopPropagation();

            $('html, body').stop().animate({
                'scrollTop': $target.offset().top
            }, cfg.scrollDuration, 'swing').promise().done(function () {

                // check if menu is open
                if ($('body').hasClass('menu-is-open')) {
                    $('.header-menu-toggle').trigger('click');
                }

                window.location.hash = target;
            });
        });

    };


   /* Alert Boxes
    * ------------------------------------------------------ */
    var ssAlertBoxes = function() {

        $('.alert-box').on('click', '.alert-box__close', function() {
            $(this).parent().fadeOut(500);
        }); 

    };


   /* Animate On Scroll
    * ------------------------------------------------------ */
    var ssAOS = function() {
        
        AOS.init( {
            offset: 200,
            duration: 600,
            easing: 'ease-in-sine',
            delay: 300,
            once: true,
            disable: 'mobile'
        });

    };


   /* Initialize
    * ------------------------------------------------------ */
    (function clInit() {

        ssIntroCheckerboard();
        ssPreloader();
        ssMenuOnScrolldown();
        ssMobileMenu();
        ssWaypoints();
        ssMasonryFolio();
        ssPhotoswipe();
        ssSlickSlider();
        ssSmoothScroll();
        ssAlertBoxes();
        ssAOS();

    })();

})(jQuery);
