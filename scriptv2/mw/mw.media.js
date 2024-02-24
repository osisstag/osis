/** //** ----= mwImageReader	=--------------------------------------------------------------------------------------\**//** \
*
*	Fast loads image from File object and runs callback on it.	
*
*	@param		object(File)	$file		- File object to use as source.
*	@param		function	$callback	- Callback to execute.
*
\**//** ---------------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function mwImageReader ($file, $callback) {

	// Using native DOM, so need to fallback if jQuery happen
	if ( $file instanceof jQuery )
		$file = $file.get(0);

	// If file is DOM input - using first file
	if ( $file instanceof HTMLInputElement ) 
		$file = $file.files[0];

	// Nothng to do if no files selected
	if ( !$file )
		return;

	// Nothing to do for non image file
	if ( !$file.type.match(/image.*/) )
		return;

	// Reading file
	var $reader = new FileReader();
	$reader.onload = function ($e) {
		
		// Issuing callback
		if ( typeof($callback) == 'function' )
			$callback($reader.result);
		
	}; //FUNC reader.onload
	
	$reader.readAsDataURL($file);
	
} //FUNC mwImageReader

/** //** ----= mwImagePreview	=--------------------------------------------------------------------------------------\**//** \
*
*	Fast loads image from File object (usually obtained from file input) into <img> element using HTML5 filesAPI.	
*
*	@param		jQuery		$image	- Image to update.
*	@param		object(File)	$file	- File object to use as source.
*
\**//** ---------------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function mwImagePreview ($image, $file, $callback) {

	// Using native DOM, so need to fallback if jQuery happen
	if ( $image instanceof jQuery )
		$image = $image.get(0);

	// Reading image from file input and applying to image
	mwImageReader($file, function ($src) {
		
		// Saving old event handler, replacing with own and then returning it back
		var $oe = $image.onload; 

		// Triggering callback after image was actually drawn
		// Setting this before
		$image.onload = function () {
			
			// Resetting onload we just added
			$image.onload = $oe;
			
			// Issuing callback
			if ( typeof($callback) == 'function' )
				$callback($src);
				
		}; //FUNC image.onLoad
		
		// Now after event is setup, we can actually apply loaded image
		$image.src = $src;
		
	}); //mwImageReader.callback

} //FUNC mwImagePreview

/** //** ----= mwBackgroundPreview	=------------------------------------------------------------------------------\**//** \
*
*	Fast loads image from File object (usually obtained from file input) into background of element using HTML5 filesAPI.	
*
*	@param		jQuery		$image	- Image to update.
*	@param		object(File)	$file	- File object to use as source.
*
\**//** ---------------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function mwBackgroundPreview ($image, $file, $callback) {

	// Reading image from file input and applying to image
	mwImageReader($file, function ($src) {

		// Now after event is setup, we can actually apply loaded image
		$image.css('background-image', "url('"+$src+"')");
	
		// Issuing callback
		if ( typeof($callback) == 'function' )
			$callback($src);
		
	}); //mwImageReader.callback

} //FUNC mwBackgroundPreview

/** //** ----= mwOnImageChange	=--------------------------------------------------------------------------------------\**//** \
*
*	Binds onChange event to given file input, and updates specified <img> element using HTML5 files API once input changes.	
*
*	@param		jQuery		$image		- Image to update.
*	@param		jQuery		$imageInput	- File input to bing.
*
\**//** ---------------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function mwOnImageChange ($image, $imageInput) {

	// Need to check if files API is really available before do fancy tricks
	if ( !isFilesAPI() ) return;

	$imageInput
		.off('change.mwOnImageChange')
		.on('change.mwOnImageChange', function () {
			
			// Safety check
			if ( !this.files.length )
				return;
			
			// Using first given file (single image update essencially)
			mwImagePreview($image, this.files[0]);

		}) //onChange
	; //jQuery imageInput
	
} //FUNC mwOnImageChange

/** //** ----= mwLoadImage	=--------------------------------------------------------------------------------------\**//** \
*
*	Adds preloader to specified <img> element. Uses expected dimensions to draw proper loading box. 
*	Uses native DOM tree methods, to be less depended on onLoad event (no need to wait other libs to load).
*	Detects element proportinal changes (in case of dynamic image widths of responsive images).
*
*	@param		DOMElement	$image		- Image to load.
*	@param		int		$width, $height	- Expected image dimensions.
*
\**//** ---------------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function mwLoadImage ($image, $width, $height) {

	if ( !$image )
		return;

	// Using native DOM, so need to fallback if jQuery happen
	if ( $image instanceof jQuery || $image.jquery )
		$image = $image.get(0);

	// Not doing anyting if image is loaded already (cache?)
	if ( $image.naturalWidth || $image.naturalHeight )
		return;

	// Have to have some defaults,
	$width	= $width || $image.scrollWidth;
	$height	= $height || 30;

	// Calculating ratio for scticking sizes. Will calculate on place from width, for full responsive behavior
	var $ratio	= $width / $height;
	
	// Saving original image styles, to restore after it's loaded
	var $css = {
		'width'		: $image.style.width,
		'height'	: $image.style.height,
	} //$css

	// Also temprary removing alt text, so saving it too
	var $alt = $image.getAttribute('alt');
	$image.setAttribute('alt', '');

	// Setting loading state	
	$image.className += ' loading';

	// Setting image size strictly while it loads (to make sure loader look correctly)
	// Calculating through ratio, to make sure % widths/heights are handled correctly on responsive
	// ToDo: Test source dimensions, might be clientWidth better to use as source
	$image.style.width	= $width + 'px';
	$image.style.height	= Math.round($width / $ratio) + 'px';
	
	// When image loaded - need to revert changes and remove loading state
	$image.onload = function () {

		// Removing class
		$image.className = $image.className.replace('loading', '');
		
		// Setting height/width back
		$image.style.width = $css.width;
		$image.style.height = $css.height;
		
		// Restoring alt
		$image.setAttribute('alt', $alt);
		
		// Unsetting onload
		$image.onload = false;
	} //FUNC $image.onLoad			
	
} //FUNC mwLoadImage

/** //** ----= mwInitMedia	=--------------------------------------------------------------------------------------\**//** \
*
*	Initiates common morweb audion/video players on page.
*
*	@param		jQuery	[$context]	- Context to search within.	
*
\**//** ---------------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function mwInitMedia ($context) {

	// ToDo: Implement conditional media resources initiating
	var $el = jQuery('audio, video', $context);
	
	if ( !$el.length )
		return;
		
	// Initiating common audio/video
	$el.mediaelementplayer({
		enableAutosize		: false,
		alwaysShowControls	: false,
	//	controls		: false,
	//	useDefaultControls	: true,

	/*/	// For user with CDN
		pluginPath		: '/cms/res/mediaelement/',
		shimScriptAccess	: 'always',
	/**/
		success                 : function( $mediaElement, $originalNode, $instance ) {
			
			// Storing instance as element data for easy access later
			jQuery($originalNode).data('mediaelement', $instance);
			
			// Workaround to retain controls attribute on video
			// Somehow mediaelement looses it, and fails to init
			// Required only on video
			// ToDo: invesitgate conditions
			// Discovered in 4.2.5
		/**/
			jQuery($originalNode).attr({
				'controls'      :       'controls'
			});
		
			setTimeout( function () {
			//	jQuery($originalNode).removeAttr('controls');
			}, 10);
		
		/*/
			jQuery($originalNode).removeAttr('controls');
		/**/	
		}, //FUNC success

	}); //mediaelementplayer.options
	
	// ToDo: Implement widget based initiations
	
} //FUNC mwInitMedia
