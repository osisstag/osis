var CONTACTS_FRONTEND_AJAX = '/ajax/intouch/contacts';

mwListForm = function ($form) {
	
	var $class = {

// ---- PROPERTIES ----
	
	ajax		: mwAjax,		// Ajax constructor
	
// ---- METHODS ----

	state		: function ($el, $state) {
		
		// State can be loading/idle
		
		if ( $state ) {
			
			$el.find('.mwFormSubmit').animate({ opacity: 0 }, 300);
			$el.find('.mwFormLoader').fadeIn(300);

			// Classic compatable 
			$el.find('.mwFormSubmitRow .mwInput.Button').fadeOut(300);
			$el.find('.mwFormSubmitRow .mwInput.Loader').fadeIn(300);
			
		} else { //If loader 
		
			$el.find('.mwFormSubmit').animate({ opacity: 1 }, 300);
			$el.find('.mwFormLoader').fadeOut(300);

			// Classic compatable 
			$el.find('.mwFormSubmitRow .mwInput.Button').fadeIn(300);
			$el.find('.mwFormSubmitRow .mwInput.Loader').fadeOut(300);
			
		} //IF idle

	}, //FUNC state

	submit		: function () {

		var $this = this;


		// Getting form elements
		var $el		= _jq($form);
		var $sn		= $el.attr('id');
		var $status	= $el.find('.mwFormStatus');

		// Cleaning status
		$status.html('');

		// Cleaning status and validations
		$status.html('');
		setValidations($el, {});

		// Setting loading state
		$this.state($el, true);
		
		// Getting form url		
		var $url = $el.attr('action') || CONTACTS_FRONTEND_AJAX + '/submit';

		$this.ajax($url, $el, false)

			.success( function ($data) {

				// Not hiding loader if redirecting or reloading
				// Othewise hiding

				if ( $data.redirect )
					window.location.href = $data.redirect;
				else
					$this.state($el, false);
					
			}) //FUNC mwAjax.success

			.error( function ($data) {

				// Error causes idling
				$this.state($el, false);

				// Setting status if error returned
				$status.html( mwError($data.status.text) );

				// Lasy support for recaptcha
				// Need to reset captcha on errors
				//ToDo: Inputs based customization
				if ( typeof(grecaptcha) !== UNDEFINED )
					grecaptcha.reset();

				// Each validation message should be captured
				if ( $data._validations && $data._validations[$sn] ) {
					
					// Manually processing messages yet.
					// ToDo: Implement erorrs handling API for frontend
			
					// Looping through each failed field and each message for that field
					// All validatinos are indexed by form ID				
					for ( var $field in $data._validations[$sn] ) {
						for ( var $msg in $data._validations[$sn][$field] ) {
							
							// Appending each message to status area
							$status.append( mwError($data._validations[$sn][$field][$msg]) );
			
						} //FOR each message for field
					} //FOR each fail field
			
				} //IF validations come

			}) //FUNC mwAjax.error.callback
			
			.stop( function () {
			
			// ---- Scrolling to form top ----
			
				// Giving some space above form (for titles/headers)
				var $delta = 100;

				// Floating height can be specified in page template
				var $f = jQuery('DIV[data-floatHeight]');
				
				if ( $f.length ) {

					$delta += $f.attr('data-floatHeight')*1;

				} else { //IF height specified
					
					// If not specified directly - trying to get some common
					var $f = jQuery('.menuWrap');
					if ( $f.css('position') == 'fixed' )
						$delta += $f.height();
					
				} //If nothing found
			
				// Animating to show errors
				jQuery('html, body').animate({
					scrollTop: jQuery('#' + $sn).offset().top - $delta
				}, 300); //jQuery.animate.options

			}) //FUNC mwAjax.stop
			
			.go();
			
		return false; 
		
	} //FUNC submit

// ---- END ----
	
	} //CLASS mwListForm
	
	return $class;
} //CONSTRUCTOR mwListForm
