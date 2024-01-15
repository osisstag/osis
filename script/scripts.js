/*Martin Luther King Jr. Day Accordion */

jQuery(document).ready(function(jQuery) {

    jQuery('.accordionContent').hide();

    jQuery('.accordionBtn a').click(function() {

        if (jQuery(this).hasClass('selected')) {

            jQuery(this).removeClass('selected');

            jQuery(this).parent().next().slideUp();

        } else {

            jQuery('accordionBtn a').removeClass('selected');

            jQuery(this).addClass('selected');

            jQuery('.accordionContent').slideUp();

            jQuery(this).parent().next().slideDown();

        }

        return false;

    });

});





/* Sticky Menu Add Class and Animation */

jQuery(window).scroll(function() {

    var scroll = $(window).scrollTop();

    if (scroll >= 45) {

        jQuery(".headerWrap").addClass("stuck");

    }

    if (scroll <= 45) {

        jQuery(".headerWrap").removeClass("stuck")

    }

});









/* Search Icon */



jQuery('.searchIcon').click(function() {

    jQuery('.searchWrap').toggleClass("searchWrapShow");

});



jQuery('.searchClose').click(function() {

    jQuery('.searchWrap').toggleClass("searchWrapShow");

});



/* Mobile Menu Icon */

jQuery(document).ready(function() {

    jQuery('#navIcon').click(function() {

        jQuery(this).toggleClass('open');

    });

});





/* Wow Animations */

 wow = new WOW(

                      {

                      boxClass:     'wow',      // default

                      animateClass: 'animated', // default

                      offset:       0,          // default

                      mobile:       false,       // default

                      live:         true        // default

                    }

                    )

                    wow.init();



// Scroll to Top



jQuery('.toTop').click(function() {

    //window.scrollTo(0, 0);

    jQuery('html').animate({

        scrollTop: 0

    }, 'slow'); //IE, FF

    jQuery('body').animate({

        scrollTop: 0

    }, 'slow'); //chrome, don't know if Safari works

});





// Image Popup

jQuery(document).ready(function() {

    jQuery('.popup').magnificPopup({

        disableOn: 700,

        type: 'image',

        mainClass: 'mfp-fade',

        removalDelay: 160,

        preloader: false,

        fixedContentPos: false

    });

});



// Video Popup

jQuery(document).ready(function() {

    jQuery('.popup2').magnificPopup({

        disableOn: 700,

        type: 'iframe',

        mainClass: 'mfp-fade',

        removalDelay: 160,

        preloader: false,

        fixedContentPos: false

    });

});







jQuery(".slideOutShareBtn").click(function() {

    jQuery(".slideOutShare").toggleClass("open");

    return false;

});





$(document).ready(function(){

  $(".hamburger").click(function(){

    $(this).toggleClass("is-active");

  });

});













jQuery(document).ready(function () {

/** **/

$('.sidr ul li').append('<a class="arrow">');

});







// Mobile Menu
jQuery(document).ready(function () {
    $('.arrow').attr('style', 'width: 100%; background-color: transparent !important;')

 $('.sidr ul li ul').hide();

	$('.sidr ul > li > a.arrow').on('click', function (e) {

    $(this).toggleClass('downarrow');

    //e.preventDefault();



	var elem = $(this).prev('.sidr ul li ul')

	// $('.sidr ul li ul').not(elem).hide('slow');

	elem.toggle('fast');

	//console.log('.sidr ul li ul');

    });



});







// $(document).ready(function() {

// //    $(".arrow").click(function(e) {

// //       if($(this).hasClass("open")) {

// //          // if it's open then just close it

// //          $(this).removeClass("open");

// //       } else {

// //          // if it's closed, then close everything else and open it

// //          $(".arrow").removeClass("open");

// //          $(this).addClass("open");

// //       }



// //    });

//    var open = false
//    $(".arrow").click(function(e) {
//        open = !open
//        if(open){
//            $(this).addClass("open");
//        }else{
//             $(this).removeClass("open");
//        }
//    });





// });

//-----------------------------------------------------------
//
// Hide Empty (video)
//
//-----------------------------------------------------------
//
function handleVideoPlayer() {
	$('.videoPlayer').each(function () {
		var $this = $(this);
		var $cover = $('.videoCover', $this);
		var $video = $('video', $this);

		$cover.on('click', function () {
			$video.css('opacity', 1);
			$cover.fadeOut('fast', function () {
				$video[0].play();
			});
		});
	});
}

$(document).ready(function() {
    handleVideoPlayer();
});