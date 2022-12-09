/**
 * MAIN LAYOUT JS
 */

//  mobile navbar toggle
$('#mobile-toggle').click(function(){
    $('#mobile-menu').slideToggle(100, function () {
        $(this).removeAttr('style').toggleClass('hidden', 'block');
    });
    $('#mobile-toggle > svg').each(function () {
        $(this).toggle();
    });
});

// log out modal
$('#logout-toggle').click(function(){
    $('#logout-dialog').fadeToggle(100).css('display', 'flex');
    $('body').css('overflow-y', 'hidden');
    $('#profile-dropdown').slideToggle(100);
})
$('#logout-close').click(function(){
    $('#logout-dialog').fadeToggle(100).css('display', '');
    $('body').css('overflow-y', 'auto');
})

// lazy load images
document.addEventListener("DOMContentLoaded", function () {
    var lazyloadImages = document.querySelectorAll("img.lazy");
    var lazyloadThrottleTimeout;

    function lazyload() {
        if (lazyloadThrottleTimeout) {
            clearTimeout(lazyloadThrottleTimeout);
        }

        lazyloadThrottleTimeout = setTimeout(function () {
            var scrollTop = window.pageYOffset;
            lazyloadImages.forEach(function (img) {
                if (img.offsetTop < (window.innerHeight + scrollTop + 500)) {
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                }
            });
            if (lazyloadImages.length == 0) {
                document.removeEventListener("scroll", lazyload);
                window.removeEventListener("resize", lazyload);
                window.removeEventListener("orientationChange", lazyload);
            }
        }, 20);
    }
    lazyload();
    document.addEventListener("scroll", lazyload);
    window.addEventListener("resize", lazyload);
    window.addEventListener("orientationChange", lazyload);
});



/**
 * ROOM DETAILS JS
 */
$(document).ready(function () {
    // mobile carousel toggles
    $('#carousel-open').click(function(){
        $('#carousel').slideToggle(100);
        $('#scree').fadeToggle(100);
        $('body').css('overflow-y', 'hidden');
    })
    $('#carousel-close').click(function(){
        $('#carousel').slideToggle(100);
        $('#scree').fadeToggle(100);
        $('body').css('overflow-y', 'auto');
    })

    // mobile bills panel toggles
    $('#bills-open').click(function(){
        $('#bills-mobile').slideToggle(100);
        $('#scree').fadeToggle(100);
        $('body').css('overflow-y', 'hidden');
    })
    $('#bills-close').click(function(){
        $('#bills-mobile').slideToggle(100);
        $('#scree').fadeToggle(100);
        $('body').css('overflow-y', 'auto');
    })
});


/**
 * SEARCH PAGE JS
 */

// mobile filter form toggle
$('#search-toggle').click(function (evt) {
    $(this).parent().toggleClass('border-t', '');
    $('#search-form').slideToggle(100, function () {
        $(this).removeAttr('style').toggleClass('hidden', 'block');
    });
    $('body').toggleClass('overflow-y-hidden', '');
    $('#search-toggle > svg').each(function () {
        $(this).toggle(100)
    });
    $('#scree').fadeToggle(100);
});


/**
 * PROFILE PAGE JS
 */

// password modal
$('#modal-close').click(function (e) {
    e.preventDefault();
    $('#change-password-modal').fadeToggle(100).css('display', '');
    $('body').css('overflow-y', 'auto');
});
$('button#change-password').click(function (e) {
    $('#change-password-modal').fadeToggle(100).css('display', 'flex');
    $('body').css('overflow-y', 'hidden');
});



/**
 * BOOKINHG DETAILS JS
 */
$('button#confirm-booking').click(function (e) {
    $('#confirm-booking-modal').fadeToggle(100).css('display', 'flex');
    $('body').css('overflow-y', 'hidden');
});
$('button#cancel-booking').click(function (e) {
    $('#cancel-booking-modal').fadeToggle(100).css('display', 'flex');
    $('body').css('overflow-y', 'hidden');
});
$('.modal-close').click(function (e) {
    e.preventDefault();
    $('.booking-modal').fadeToggle(100).css('display', '');
    $('body').css('overflow-y', 'auto');
});