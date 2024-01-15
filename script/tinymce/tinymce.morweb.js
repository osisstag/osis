/** //** ----= mwTinyMCE	=--------------------------------------------------------------------------------------\**//** \
*
* 	Morweb common tinyMCE init wrapper.
*
* 	@param	object	[$options]	- Custom options. Will extend defaults on object.
*
* 	@return	object			- TinyMCE initialization object.
*
\**//** ---------------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function mwTinyMCE($options) {

	$options	= $options || {};

	var $class = {

// ==== CLASS ==================================================================================================================
	
	DefaultTheme		: 'default',		// Default theme to use
		
	Defaults		: {			// Default init options
	
		theme			: 'modern', 
		skin			: 'morweb',
	//	toolbar_items_size	: 'small',

		menubar			: false,
		resize			: false,
		statusbar		: false,

		convert_urls		: false,
	//	relative_urls		: false,
	
	//	relative_urls		: true,
	//	convert_urls		: true,
	//	remove_script_host	: true,
	//	document_base_url	: 'http://localhost:82/',
			
		delta_height		: 0,
		width			: '100%',
		height			: '100%',

		link_list		: '/site/call/system/links_json',


		fontsize_formats	: '8pt 9pt 10pt 11pt 12pt 13pt 14pt 18pt 24pt 36pt',	
			
	// ---- Intersting options to check and test
		
	//	preview_styles		: false,
	//	convert_fonts_to_spans	: true,
	//	entity_encoding		: 'raw',
	//	indentation		: '20pt',
	//	keep_styles		: false,

	// ---- Browser spellcheck
	
	//	browser_spellcheck	: true,
	//	gecko_spellcheck	: true,
	
	// ---- Custom spellchecks
		
	//	ed.execCommand('mceSpellCheck');
		
	/**/	
		// ---- PHP "native" Enchant based
		// URL: http://www.tinymce.com/wiki.php/PHP_Spellchecker
		// URL: http://www.tinymce.com/wiki.php/Plugin:spellchecker
		// URL: http://blog.iwanluijks.nl/?!=/post/1-using-enchant-with-php-on-windowspart-1.html	
		// URL: https://stackoverflow.com/questions/16728842/php-enchant-spell-checking-not-working-configuration-in-windows
		// DIC: https://github.com/titoBouzout/Dictionaries
		// DIC: https://github.com/mercutiodesign/texmaker-3.3.3/tree/master/dictionaries
		// Native, thus good availability, but requires additional php configuration and setup (and dictionaries search, install)
		// CMD: apt install aspell-en aspell-fr aspell-de aspell-es aspell-it ; apt install hunspell hunspell-en-us hunspell-fr-classical hunspell-fr hunspell-de-de hunspell-es hunspell-it
		
		
		browser_spellcheck	: false,
		
	//	plugins			: ['spellchecker'],
	//	toolbar			: 'spellchecker',
	/**/
		spellchecker_language	: 'en_US',
		spellchecker_languages	: 'English=en_US,French=fr_FR,German=de_DE,Spanish=es_ES,Italian=it_IT',

		// There is a bug when tinyMCE ends up with fake host full url. Supplying full url to make sure it behaves
		// https://github.com/tinymce/tinymce/issues/841
		spellchecker_rpc_url	: window.location.origin+mwUrl().res('tinymce/spellchecker/spellchecker.php'),
	/**/
	
	/*/
		// ---- Yandex.speller 
		// URL: https://tech.yandex.ru/speller/doc/dg/tasks/how-to-spellcheck-tinymce-docpage/
		// Simple to use, but requires additional setup on server (optional redirect) and is based on russian service
	//	plugins			: ['spellchecker'],
	//	toolbar			: 'spellchecker',
		spellchecker_languages	: 'English=en,French=fr,Russian=ru',
		spellchecker_rpc_url	: 'http://speller.yandex.net/services/tinyspell?options=514',
	/**/

	/*/	
		// ---- nanospell
		// URL: http://tinymcespellcheck.com/
		// Simple and fast, but costs money
		
		external_plugins	: {"nanospell": "/nanospell/plugin.js"},
		nanospell_server	: "php", // choose "php" "asp" "asp.net" or "java"	
	/**/
	
	// ---- P behavior options

		// Not totally sure if I want to disable those P it creates left and right :)
		// Needs to be tested
	//	force_p_newlines	: false,
	//	forced_root_block	: false,

	// ---- Inline use options (might be used as replace of content editing in liveEd)

	//	inline			: true,
	//	selector		: 'div#edit',
	//	fixed_toolbar_container : '#mytoolbar',

		// Default tinyMCE dimensions corrections
		oninit	: function ($ed) {

			//contentAreaContainer
			//editorContainer
			
			var $editor	= jQuery($ed.editorContainer);		// Shortcut to container
			var $content	= jQuery($ed.contentAreaContainer);			
			var $txt	= jQuery($ed.getElement());
			
			// Applying autowidth + mwInput class
			$editor.addClass('mwInput').css('width', '');

			// Applying class modifiers from source text area
			$editor.addClass( $txt.attr('class') );
			
			// Copying size attribute. It will be used to calculate height by mwInput
			if ( $txt.attr('size') )
				$editor.attr('size', $txt.attr('size') );
			
			// Always using dynamic height on tinyMce, but if static height given - copying it to mwInput
			$content.css({
		 		'position'	: 'absolute',
		 		'left'		: '0px',
		 		'right'		: '0px',
		 		'top'		: $ed.settings.tools_height,
		 		'bottom'	: '0px'
			});//OBJECT conent.css

			if ( $ed.settings.sourceHeight )
				$editor.css('height', $ed.settings.sourceHeight);								
									
			// Removing tiny skin classes
			$editor.removeClass('mce-container mce-panel').css('border-width', '');

			// Removing iframe hint
			jQuery('#' + $ed.id + '_ifr').removeAttr('title');

			// Tricky events capturing for focus and blur
			// Actually capturing from iframe body, cuz Tiny does not have proper focus/blur events
			
			if ( isFunction($ed.getDoc) ) {
			
				jQuery($ed.getDoc()).contents().find('body').focus( function() {
					$editor.addClass('focus');
				}); //jQuery.onFocus
	
				jQuery($ed.getDoc()).contents().find('body').blur( function() {
					$editor.removeClass('focus');
				}); //jQuery.onBlur

			} //IF getDoc exists

		}, //FUNC oninit

	}, //OBJECT Defaults

	Themes		: {	// Available themes 

		// Default morweb layout (fits 700px)
		'default'	: {

			plugins		: ['advlist lists link image mwgallery hr anchor searchreplace code media table contextmenu paste textcolor colorpicker charmap visualblocks visualchars insertdatetime spellchecker_rt'],

			toolbar1	: 'undo redo | pastetext pasteword searchreplace | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | forecolor backcolor | spellchecker | formatselect ', 
			toolbar2	: 'bullist numlist | outdent indent blockquote | hr charmap inserttime | table | link unlink anchor image media mwgallery | visualchars code | fontsizeselect', // visualchars visualblocks removeformat

			tools_height	: 67

		}, //OBJECT default

		// Extra layout, when have free space (fits 800px)
		'extra'	: {

			plugins		: ['advlist link image hr anchor searchreplace code media table contextmenu paste textcolor colorpicker charmap visualblocks visualchars insertdatetime mwgallery spellchecker_rt'],

			toolbar1	: 'bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | forecolor backcolor | subscript superscript | formatselect fontselect fontsizeselect', 
			toolbar2	: 'undo redo pastetext pasteword searchreplace | spellchecker | bullist numlist | outdent indent blockquote | hr charmap inserttime | table | link unlink anchor image media mwgallery | visualchars visualblocks removeformat code',
			
			tools_height	: 67

		}, //OBJECT default

		'modern'	: {
			menubar			: true,
			tools_height		: 71
		}, //OBJECT modern 

		// Default tiny MCE init (3.x classic), most controls
		'full'		: {
			plugins		: [
				'advlist autolink autosave link image lists charmap print preview hr anchor pagebreak spellchecker_rt',
				'searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking',
				'table contextmenu directionality emoticons template textcolor colorpicker paste fullpage mwgallery'
			],
			
			toolbar1	: 'newdocument fullpage | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | styleselect formatselect fontselect fontsizeselect',
			toolbar2	: 'cut copy paste | searchreplace | bullist numlist | outdent indent blockquote | undo redo | link unlink anchor image media code | inserttime preview | forecolor backcolor',
			toolbar3	: 'table | hr removeformat | subscript superscript | charmap emoticons | print fullscreen | ltr rtl | spellchecker | visualchars visualblocks nonbreaking template pagebreak restoredraft | mwgallery',

			tools_height	: 101
			
		}, //OBJECT full 
		
		// Compact layout, for limited space (350px fit, 2 lines) 
		'compact'	: {

			plugins		: ['lists link hr anchor code contextmenu paste'],

			toolbar1	: 'bold italic underline | alignleft aligncenter alignright alignjustify | formatselect', 
			toolbar2	: 'bullist numlist | outdent indent blockquote | hr | link unlink | removeformat code',
			
			tools_height	: 67

		}, //OBJECT compact

		// Compact 1 row layout (400px fit with 1 line)
		'simple'	: {
			plugins		: ['lists link hr anchor code contextmenu paste'],

			toolbar1	: 'bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | link unlink | code', 
			
			tools_height	: 34

		} //OBJECT compact

	}, //OBJECT Themes
	
	/** //** ----= getTheme	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Searches theme by given className
	*
	*	@param	string	$class	- Class name to search in.
	*
	*	@return string		- Found theme name, or default if nothing found.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	getTheme	: function ($class) {

	// ---- Theme ----

		// If just existing theme specified - using it
		if ( this.Themes[$class] )
			return this.Themes[$class];
		
		// Collecting theme, for futher modification
		var $theme	= false; 
		
		// Looping through each theme and checking if specified.
		// First found will be result, none found will be default
		$class = ' '+$class+' ';
		for ( var $i in this.Themes ) {
		
			if ( $class.indexOf(' '+$i+' ') != -1 ) {
				$theme = this.Themes[$i];
				break;
			} //IF 
			
		} //FOR each Theme
		
		// If nothing found - using default theme
		if ( !$theme )
			$theme = this.Themes[this.DefaultTheme];
	
	// ---- Modifiers -----
	
		// Frontend modifier. Removes backend/admin speciefic 
		if ( $class.indexOf(' front ') != -1 ) {

			// Removing dangerous or backend only plugins
			// Defining search subjects to simlify code
			var $tmp	= [$theme, $theme.plugins];
			
			for ( var $j in $tmp ) {
				for ( var $i in $tmp[$j] ) {
					
					// Skipping non-strings
					if ( !isString($tmp[$j][$i]) )
						continue;
					
					// Replacing 
					$tmp[$j][$i] = $tmp[$j][$i].replace( new RegExp('mwgallery', 'g'), '');
					
				} //FOR each theme setting
			} //FOR each search subject
			
		} //IF front modifier
	
		return $theme;
		
	}, //FUNC getTheme

	/** //** ----= getOptions	=------------------------------------------------------------------------------\**//** \
	*
	*	Compiles tinyMCE init options, based on theme given. Includes customized options. 
	*
	*	@param	string	$theme	- Theme to use.
	*
	*	@return object		- Init options.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	getOptions	: function ($theme) {

		// Getting theme options
		var $t = this.getTheme($theme);
		
		// Composing new init object, from defaults, theme and options given
		return jQuery.extend({}, this.Defaults, $t, $options);
	}, //FUNC getOptions

	/** //** ----= init	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Initiates tinyMCE for given element. 
	*
	*	@param	jQuery	$el	- jQuery to element to init.
	*
	*	@return object		- Init options.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	init		: function ($el) {

		$el = _jq($el);
		
		// If no elements, no need to do smth.
		if ( !$el.length )
			return this;
		
		// Getting options based on elmeent class
		var $class	= $el.get(0).className;
		var $o		= this.getOptions($class);
	
		// Setting height, based on source element
		var $h = $el.get(0).style.height;
		if ( $el.is('[style*=height]') && $h && $o.tools_height ) {
			// Saving source height for init
			$o.sourceHeight = $h;
		} //IF static height

		// Marking element
		$el.addClass('mwTinyMCE');

		// Running tiny
		$el.tinymce($o);

		return this;
	}, //FUNC init

// ==== END OF CLASS ===========================================================================================================
		 
	}; //CLASS 
	
	return $class;
} //FUNC mwTinyMCE
