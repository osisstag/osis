
var FILES_BACKEND_AJAX = '/site/ajax/files';
var FILES_BACKEND_CALL = '/site/call/files';

/* ==== HELPERS ================================================================================================================ */

function getFileCap (file, limit) {
	
	// First trying regular title
	file.__title	= file.title;
	
	// If not - mb some set in data
	if ( !file.__title && file.data && file.data.titles )
		file.__title = file.data.titles + ''; // Forcing string
		
	// If still not - file using filename
	if ( !file.__title )
		file.__title = file.file;

	if ( limit && file.__title.limit )
		return file.__title.limit(23, '...');
	
	return file.__title;		
} //FUNC getFileCap

/* ==== Galleries editor ======================================================================================================= */

var mwGalleryEd = {

	Defaults	: {		// Default properties
		'id'		: 0,
		'title'		: '',
		'use_tags'	: 0,
		'tags'		: []
	}, //OBJECT Defaults
	
	ID		: 0,		// Stores current gallery ID

	Window		: false,	// Editor window object
	Body		: false,	// Editor window body element
	Form		: false,	// Editor form

/* ---- Helpers ---- */
	
	reloadTags	: function () {

		var tags = {};
		
		// Preparing list of tags for selector creation
		for ( var i in mwData.Tags )
			tags[mwData.Tags[i]] = mwData.Tags[i]; 

		// Getting selector to update
		var sel = jQuery('#mwGalleryEd_tagsContainer').find('.name-tags');

		mwUpdateSelector(sel, tags);
		
		return false;
	}, //FUNC reloadTags

	addTags	: function (source) {

		// Source for this have separate button, should target to text instead
		var source = _jq(source).next('INPUT');
	
		// Adding items to selector
		selectAddItem(jQuery('#mwGalleryEd_form .name-tags'), source, true);
		
		// Adding items to files editor
		selectAddItem(jQuery('#filesProperties_form .name-tags'), source);
		
		// Cleaning source
		source.val('');		
		
		return false;
	}, //FUNC addTags
	
	tagsSearch	: function (state) {
		
		if ( state ) 
			jQuery('#mwGalleryEd_tagsOptions', this.Body).show();
		else	
			jQuery('#mwGalleryEd_tagsOptions', this.Body).hide();
		
		if ( this.Window )
			this.Window.Window.align();
	}, //FUNC tagsSearch

/* ---- General Tools ---- */
	
	dialog		: function (id) {
		
		// Initiating shortcuts
		if ( !this.Window ) {
			this.Window	= mwWindow('mwGalleryEd');
			this.Body	= this.Window.Body;
			this.Form	= this.Body.find('#mwGalleryEd_form');
		} //IF not initiated
		
		id = id || 0;
		
		// Checking if real ID given
		if ( id && !mwData.Galleries[id] )
			return mwState( mwError('Invalid folder specified for editing.') ); 
		
		// Rebuilding tags control
	//	this.reloadTags();
		
		// Saving ID for later
		this.ID = id;
		
		// Shortcut for given data
		var data = id  ? mwData.Galleries[id] : this.Defaults;
		
		// Splitting tags if necessary
		if ( !isArray(data.tags) )
			data.tags = strToArray(data.tags);
		
		// Initiating form
		this.Form.fromArray(data);
		jQuery('#mwGalleryEd_tagsOptions', this.Body).hide();
		
		if ( !id )
			this.Window.Title('Add Folder');
		else
			this.Window.Title(data.title);
		
		this.Window.show();

		return false;
	}, //FUNC dialog
	
	save		: function () {

		// Cleaning files cache (files list may change depending on tags options)
		if ( mwData.Files[this.ID] )
			delete(mwData.Files[this.ID]);

		mwAjax(FILES_BACKEND_AJAX + '/saveGallery/', '#mwGalleryEd_form', 'mwGalleryEd')
			.index();

		return false;
	}, //FUNC save

	clop		: function () {

		// Getting currently selected private setting
		var $val = this.Form.find('[name=private]').val();
		
		// Cleaning files cache (files list may change depending on tags options)
		if ( mwData.Files[this.ID] )
			delete(mwData.Files[this.ID]);
		
		// Requesting update, keeping dialog open
		mwAjax(FILES_BACKEND_AJAX + '/clopGallery/' + this.ID + '/' + $val, {} , 'mwGalleryEd')
			.go();

		return false;
	}, //FUNC clop
	
} //OBJECT mwGalleryEd

/* ==== Files editor =========================================================================================================== */

var mwFilesEd = {

/* ---- Meta ---- */
	
	ID			: 0,				// Stores current gallery ID
	Mode			: 'thumbs',			// Current view mode. Modes should be supplied by backend as subContents
	Props			: 'propsDetails',		// Default properties tab
	File			: false,			// Selected file SN
	FileMeta		: {},				// Selected file Meta object. Normally should not be written, 
								// used to fast read current file properties.

	Loader			: false,			// Alternate loader to use

	galleriesSelector	: true,				// Galleries selector use flag

/* ---- jQuery shortcuts ---- */	
	
	windowId		: 'mwFilesEd',			// Editor window ID
	window			: false,			// Editor window object
	
	dom			: {},				// Stores interesting window elements
	
/* ---- Misc ---- */	

	cellWidth		: 217,
	panelWidth		: 434,
	
	orderChange		: false,			// Change order marker. Triggers when elements were sorted. 
								// When TRUE - elements new order will be attached to save request.
	
	defaults		: {				// Default file properties
		id			: 0,
		title			: '',
		sn			: ''
	}, //OBJECT defaults

	Actions			: {}, 				// Custom actions callbacks

	special			: {				// Special gallery definition, for fast creation and setup
		section			: '',				// Special gallery target section
		title			: '',				// Gallery title
		windowTitle		: '',				// Window title for this gallery
	}, // special			

	delayTimer		: false,			// Timer for timed out operations (like save on keypress)

/* ---- Settings --------------------------------------------------------------------------------------------------------------- */

	setActions	: function (actions) {

		if ( !actions )
			return this;
			
		this.Actions = actions;

		return this;
	}, //FUNC setActions

	initActions	: function () {
		
		var self = this;
		
		if ( isEmpty(this.Actions) )
			return this;

	// ---- Setting up buttons ----
	
		// ToDo: Implement mwWindow buttons/grouping setup

		var buttons = this.window.Window.find('#mwFilesEd_actions'); 

		// Cleaning old buttons
		buttons.html('');

		// Disabling Hi class on own buttons
		this.window.Window.find('.winSubmit .Hi').removeClass('Hi'); 
		
		for ( var i in this.Actions ) {
			
			var $class = this.Actions[i]['class'] ? ' class="' + this.Actions[i]['class'] + ' apply"' : '';
			
//			var button = jQuery('<a' + $class + '>' + i + '</a>'); 
			var button = jQuery('<a' + $class + '></a>'); 
			
			button.appendTo(buttons);
			
			if ( !isFunction(this.Actions[i]['action']) ) continue;
			
			button.click( function () {

				// Saving any changes done with files
				mwFilesEd.save();
				
				// Additionally checking if still pointing to file
			//	if ( !self.File ) return;
				
				self.Actions[i]['action'](self.FileMeta);
				
			}); //button.click.fn
			
		} //FOR each action

		// When displaying custom buttons - hiding own save, and displaying only customs
		this.dom.footApply.hide();

		return this;
	}, //FUNC initActions

/* ---- Init ---------------------------------------------------------------------------------------------------------------- */
	
	initDom		: function () {
		
		var $this = this;
		
		// Creating shortcuts to window and it's body
		this.window		= mwWindow(this.windowId);
		this.dom.body		= this.window.Body;
		
		// Defining complete element prefix
		var $pfx		= this.windowId+'_';
		
		// Looking for special elements in entire window 
		this.window.Window.find('[id^='+$pfx+']').each( function () {
			
			var $el		= jQuery(this);
			
			// Cutting element name from ID
			var $name	= this.id.substr($pfx.length); 

			// Adding class marker to these items
			$el.addClass($name);

			// Storing it as part of DOM set
			$this.dom[$name] = $el;
			
		}); //FUNC each.id
		
		// Reordering elements for fast debug
		// For this - recreating object in order
		var $keys	= Object.keys(this.dom).sort();
		var $tmp	= {};
		
		for ( var $i in $keys )
			$tmp[ $keys[$i] ] = this.dom[$keys[$i]];
		
		// Resaving back in dom
		this.dom = $tmp;

//		__(this.dom);
		
	}, //FUNC initDom
	
	init		: function ( ) {

		var self		= this;

		if ( this.window ) return;

		this.initDom();
		this.initBrowsers();
		
	}, //FUNC init
	
	initBrowsers	: function () {

		var $this = this;

		// Initiating add file input
		if ( isFilesAPI() ) {
			
			// Binding new file input
			this.dom.fileAdd
				.attr('multiple', 'multiple')
				.bind('change', function () {
					$this.addFileModern(this.files);
				}) //FUNC onChange
			; //jQuery addFileInput

			// Binding drop to container, 
			// and hovers to container and all childs due to dragleave HTML5 behavior 
			// dragleave fires on parent when entering childs
			this.dom.itemsPanel.bind({

				dragenter	: function() {
					jQuery(this).addClass('dropHover');
					return false;
				}, //FUNC dragenter
				
				// Drag over should presend and return false for drag to trigger
				dragover	: function() {
					return false;
				}, //FUNC dragover
			/*/
				dragleave	: function() {
					jQuery(this).removeClass('dropHover');
					return false;
				}, //FUNC dragleave
			/**/
				drop		: function($e) {
					
					// Removing hover here as indication of succesfull drop
					// Unfortunately current behavior of dragenter/dragleave
					// does not allows to use dragleave as meant 
					jQuery(this).removeClass('dropHover');
					
					var $dt = $e.originalEvent.dataTransfer;
					$this.addFileModern($dt.files);
					
					return false;
				} //FUNC drop
				
			}); //itemsContainer.bind 

		}  //IF modern upload
		else {
			
		} //IF classic upload
		
	}, //FUNC initBrowsers
	
	load		: function ( id, file, $options ) {
		
		var $this	= this;
		var self	= this;
		
		// Remathing file searched in case something else but SN was given as file
		var $f	= $this.findFile(id, file);
		if ( $f ) {
			id	= $f.galleryId;
			file	= $f.fileSn;
		} //IF found file
		
		// If ID omited - trying to use last ID
		if ( id )
			this.ID	= id;
		
		// Special case for exact FALSE - gallery autoselect
		if ( id === false )
			this.ID = 0;
			
		file		= file || '';
		$options	= $options || {};
			
		// Passing file as option
		if ( file )
			$options.file = file;

		// If files are loaded, then window is loaded too, so no need to check this separately
		if ( this.ID && mwData.Files && mwData.Files[this.ID] ) 
			return self.dialog($options);

		// Testing for window presence
		// ToDo: window search should happen only once in a time
		// ToDo: implement isInit in mwWindow
		var wnd = jQuery('#w_'+this.windowId).length ? 0 : 1;

		// Might need to load as nested dialog, using topmost window as loader
		$dlg = this.Loader ? this.Loader : this.windowId;
		// Preparing loader post		
		var $post	= {
			window		: wnd,
		}; //$post

		// If special gallery load - sending that with post
		if ( $options && !isEmpty($options.special) )
			$post.special	= $options.special;
		
		mwAjax(FILES_BACKEND_AJAX + '/loadGallery/' + this.ID + '/' + file, $post, $dlg)
			.content( function (data) {

				// Correcting galery ID, if come
				if ( data.gallery )
					self.ID = data.gallery;

				// Remathing file searched in case something else but SN was given
				// Limiting to current gallery, since that's what server decided to use
				var $f	= $this.findFile($this.ID, file);
				if ( $f ) 
					$options.file	= $f.fileSn;

				// Calling callback
				if ( $options && isFunction($options.onLoad) )
					$options.onLoad(data);

				self.dialog($options);
				
			}); //FUNC mwAjax.content.target
		
		return false;
	}, //FUNC load
	
	dialog		: function ($options) {

		var $this = this;
		$options = $options || {};

		this.init();

		// Applying options
		jQuery.extend(true, this, $options);

	// ---- Resetting ----

		// File SN could be passed instead of options list
		// Checking that and adding as option instead
		if ( isString($options) )
			$options = {file : $options};

		// Cleaning old editions
		mwData.FilesEd = {};
		
		// Cleaning order marker
		this.orderChange = false;

		this.File	= false;
		this.FileMeta	= {};

	// ---- Init ----

		this.initActions();

	// ---- Contents ----
	
		this.index();

		// Setting up selector
		// ToDo: rebuilding selectors each time dialog loads - not best solution, but time saving
		this.updateGalleriesSelector();
	
	// ---- Displaying ----	

		// Resetting properties panel, it should be closed at load
		this.hideProperties();

		var $title	= this.special.windowTitle || mwData.Galleries[this.ID].title;
	
		this.window
			.Title($title)
			.show()
		; //Window

	// ---- Dimensions ----

		setTimeout( function () {
			$this.initDimensions();
		}, 2);

		// Making sure dimensions are fresh during browser resize
		// Only if window is visible
		jQuery(window).resize( function () {

			if ( !$this.window.Visible )
				return;
				
			$this.initDimensions();
			
		}); //jQuery.onResize

	// ---- Preselect File ----
	
		// If file provided - selecting it after small delay
		if ( $options.file ) {

			setTimeout( function () {
				
				// First: Looking if valid file given 
				var $jFile = $this.dom.itemsList.find('#file_'+$options.file);
				
				// Doing nothing if something is wrong 
				if ( !$jFile.length )
					return;
				
				$this.selectFile( $jFile );	
							
			}, 50);
			
		} //FUNC

	}, //FUNC dialog
	
	initDimensions		: function () {
	
		// Updating panel controls and panel widths
		this.dom.propsPanel.width( this.panelWidth );
		this.dom.props.width( this.panelWidth );
		this.dom.tabsPanel.width( this.panelWidth );

		// Calculating window width
		var $width		= 1000;
		
		// Giving 20px for scroller
		var $scroller		= 18;

		// Calculating maximum available width
		// Can take from body current, since using maximized widnow
		var $maxWidth		= this.window.Body.width();
		
		// Checking paddings
		var $pad		= parseInt( this.dom.itemsList.closest('.winContent').css('padding-left') );
		var $pads		= $pad * 2 + $scroller;
		
		// Fixing width to perfectly fit thumbs. Leaving space for scroller and pads
		// Items list have negative margins, to compensate items margins
		var $count = Math.floor( ($maxWidth - $pads)  / this.cellWidth );

		// Calculating optimal window width for cells count	
		$width = this.cellWidth * $count + $pads - 12;
		
		// Adding count to list, for css adjustment
		// Adjusting depending on visibility
		this.dom.itemsList.attr('data-count', $count - (!this.dom.propsPanel.is('.hidden') * 2) );

	}, //FUNC initDimensions
	
	updateGalleriesSelector	: function () {

		// ToDo: Add some checkup if necessary to update
	//	var gals = {};
		var gals = new Map;
		
		
		// Listing present galleries
		// Using separate index to maintain order (JS reorders numeric indexes)
		// Using map instead of object to guarantee order
		for ( var i in mwData.GalleriesIdx ) {
			
			var $gId = mwData.GalleriesIdx[i];

		/*/		
			gals[$gId] = mwData.Galleries[$gId].title;
		/*/
			gals.set($gId, mwData.Galleries[$gId].title);
		/**/

		} //FOR each galery

		// Setting up galleries selector in editor and gallery swapper
		mwUpdateSelector( this.dom.propsForm.find('.name-galleries'), gals);
		mwUpdateSelector( this.dom.swapInput, gals, this.ID);

		// Toggling selector based on setting 
		if ( this.galleriesSelector && isEmpty(this.special.section) ) 
			this.dom.swapInput.parent().show();	
		else
			this.dom.swapInput.parent().hide();	

		return this;
	}, //FUNC updateGalleriesSelector

	swapGallery	: function (id) {

		// Saving current changes
		this.save(true);

		// Loading gallery
		this.load(id);

		return this;
	}, //FUNC swapGallery
	
/* ---- Properties ------------------------------------------------------------------------------------------------------------- */
	
	showProperties	: function  ($el) {

		var $this = this;

		// Showing only if there is smth to show
		if ( !this.File )
			return false;
			
		// If no element specified - defaulting
		$el = $el || this.dom.tabs.find('[rel=' + this.Props + ']');	
			
		// Updating toggle panel button
		this.dom.propsToggle.html('&gt;');

		// Updating items count. Panel always takes 2 cells
		// Doing only if panel was not visible already (refresh)
		if ( this.dom.propsPanel.is('.hidden') ) {
		
			var $count = this.dom.itemsList.attr('data-count');
			if ( !isUndefined($count) )
				this.dom.itemsList.attr('data-count', $count - 2);
		
		} //IF panel was hidden
				
		// Displaying panel
		this.dom.propsPanel.removeClass('hidden');

		// Swithing to specified tab and storing current tab and props
		this.dom.propsActive	= mwSwitchTab($el, false, false);
		this.dom.tabsActive	= $el;

		// If anything is selected, making sure page is scrolled to element, 
		// checking position with delay to make sure all animaitons are done
		// and system have updated all elements
		if ( this.dom.item )
			setTimeout( function () {
				
				// Few shortcuts
				var $item	= $this.dom.item;
				var $container	= $this.dom.itemsPanel;
	
				// Getting dimensions
				var $top	= $item.offset().top;
				var $height	= $container.height();
				
				// If item is outside viewport - scrolling so that it will be in second row
				if ( $top > $height )
					$container.scrollTop( $top - $item.outerHeight(true) );
				
			}, 300); //FUNC setTimeout.listener

		return false;
	}, //FUNC showProperties

	hideProperties	: function  () {

		var wdt = this.tileWidth * 2;

		// Updating toggle panel button
		this.dom.propsToggle.html('&lt;');

		// Updating items count. Panel always takes 2 cells
		// Doing only if panel was not hidden already (refresh)
		if ( !this.dom.propsPanel.is('.hidden') ) {
		
			var $count = this.dom.itemsList.attr('data-count');
			if ( !isUndefined($count) )
				this.dom.itemsList.attr('data-count', $count*1 + 2);
		
		} //IF panel was hidden


		// Hiding panel
		this.dom.propsPanel.addClass('hidden');

		// Resetting current tab
		this.dom.propsActive	= false;
		this.dom.tabsActive	= false;

		// Updating subform (normally only toggle should go here)
		mwSwitchTab( this.dom.propsToggle, false, false );

		return false;
	}, //FUNC hideProperties

	fillProps	: function (sn, details) {
		
		var self = this;
		
		// Shortcut for code simplify
		var file	= mwData.Files[this.ID][sn];
		
		// Filling rename field for modification tests
		file.rename	= file.file; 
		
		// IF file type not found - no details for it
		// Also - no details for private files
		if ( file['private'] == 0 && file['type'] && mwSubContents['details' + file['type']] ) {

			var html	= mwSubContents['details' + file['type']];
		
			html = parseVariables(html, file);
			this.dom.fileDetails.html(html);
		
		} else { //IF can fill details
			this.dom.fileDetails.html('');
		} //IF no type or subContent
		
		// For errored files - showing error in window status
		this.window.State( file.__error ? mwError(file.__error) : false );
		
		// While file is loading - renaming and uploading is unavailable, otherwise available
		if ( file.__loading ) {
			
			// Disabling input and marking parent with class
			this.dom.propsForm.find('[name=base]')
				.attr('disabled', 'disabled')
				.closest('.mwInput').addClass('Disabled');
				
		} else { //IF loading
			
			// Cleaning disabled for rename
			this.dom.propsForm.find('[name=base]')
				.val(file.base).removeAttr('disabled')
				.closest('.mwInput').removeClass('Disabled');
	
		} //IF not loading

		// If need only details - then done already
		if ( details ) 
			return false;

		// Setting download link
		this.dom.fileDownload.attr('href', FILES_BACKEND_CALL + '/download/' + file.file);

		// Restyling update input to reset
		unstyleInput( this.dom.fileUpload.closest('.mwInput') );

		this.dom.propsForm.fromArray(file);
		
		// Updating SN		
		this.dom.fileUpload = this.dom.propsForm.find('input[name=upload]'); 
		this.dom.fileUpload.attr('sn', sn);
		
		// Now restyling it back
		styleDialog( this.dom.fileUpload.parent() );
		
		// Rebinding file update input
		this.dom.fileUpload
			.removeAttr('multiple')
			.bind('change', function () {
				self.updateFileModern(this.files);
			}) //FUNC onChange
		; //jQuery addFileInput

		// Initiating media if happens there
		mwInitMedia( this.dom.propsForm );

		return false;		
	}, //FUNC fillProps
	
	addTags	: function (source) {

		// Source for this have separate button, should target to text instead
		var source	= _jq(source);
		var $tags	= source.val();
	
		// Adding items to selector
		selectAddItem( this.dom.propsForm.find('.name-tags'), $tags, true);

		// Adding items to galleries editor
		selectAddItem(jQuery('#mwGalleryEd_form .name-tags'), $tags);
		
		// Cleaning source
		source.val('').trigger('keyup');		
		
		return false;
	}, //FUNC addTags

	addGalleries	: function (source) {

		var $this = this;
		source = _jq(source);
		
		// Getting galleries text, to preprocess for existing ones, and skip if they exists already
		var galleries = source.val();
		if ( !galleries )
			return false;
		
		galleries = strToArray(galleries);
		
		// Checking each gallery against existing in cache
		for ( var i = 0; i < galleries.length; i++) {
			
			for ( var j in mwData.Galleries ) {
				
				if ( galleries[i].toLocaleLowerCase() != mwData.Galleries[j].title.toLocaleLowerCase() ) 
					continue;

				galleries.splice(i, 1);
				i--;

				break;
			} //FOR each gallery in cache
			
		} //FOR each gallery

		// Cleaning source
		source.val('');		
		
		// If there are still galleries - then have to request galleries addition
		if ( galleries.length < 1 ) 
			return false;
		
		var self = this;
		
		mwAjax(FILES_BACKEND_AJAX + '/getGalleries/', { 'galleries' : galleries} , this.window.ID)
			.content( function (data) {
				
				if ( !data.galleries )
					return;
					
				data.galleries = JSON.parse(data.galleries);
				
				// Adding items to selector as text values, they will be proceesed on server side as necessary
				selectAddItem( $this.dom.propsForm.find('.name-galleries'), data.galleries, true);
				
			}); //FUNC mwAjax.content.target
		
		return false;
	}, //FUNC addGalleries
	
/* ---- Files ------------------------------------------------------------------------------------------------------------------ */

	findFile	: function ($gallery, $file) {

		// Searches file specified by ID, SN or filename and returns galleryId and fileSn
		// Used to lookup file when no proper fileSN provided
		
		// If no cache yet - nothing to search
		if ( !mwData.Files )
			return false;
			
		// File should be provided :)	
		if ( !$file )
			return false;
		
		// Quickly checking if real gallery/sn provided
		// Just returning them back
		if ( $gallery && $file && mwData.Files[$gallery] && mwData.Files[$gallery][$file] )
			return {
				'galleryId'	: $gallery,
				'fileSn'	: $file,
			}; //IF file found

		// Looks like not found yet
		// Looking inside galleries
		// Limiting to specified gallery if necessary
		// Operating on keys to optimize code
		var $gals	= !isEmpty($gallery) ? [$gallery] : Object.keys(mwData.Files);
		
		for ( var $g in $gals ) {

			// Getting ID			
			var $gId = $gals[$g];
			
			// Looping through gallery files and comparing each to file given
			for ( var $f in mwData.Files[$gId] ) {
				
				var $fData	= mwData.Files[$gId][$f]; 
				
				// Comparing multiple fields, any matching would work
				// Returning imideately on found file
				if ( $fData.sn == $file || $fData.id == $file || $fData.file == $file )
					return {
						'galleryId'	: $gId,
						'fileSn'	: $fData.sn,
					}; //IF file found
				
			} //FOR each file
			
		} //FOR each gallery

		// If still here - no file found
		return false;

	}, //FUNC findFile

	setFileName	: function (fileObj, File) {

		fileObj.file		= fileName(File);
		fileObj.ext		= fileExt(fileObj.file); 

		// Filling viwes
		fileObj.__thumb		= '/res/files/images/Types/' + fileObj.ext.toLowerCase() + '.32x.png';

		return fileObj;
	}, //FUNC setFileName

	createFile	: function (File) {
		
		// Creating file object with defaults
		var fileObj	= {};
		jQuery.extend(fileObj, this.defaults);
		
		// Initializing known parameters
		fileObj.sn		= 'F'+randomString('capnum', 15);	// Length 15 + 1 prefix = 16

		fileObj.title		= '';
		
		fileObj.order		= 0;
		fileObj.date		= new Date().getTime();

		// Filling meta
		fileObj.tags		= [];
		// Forcing gallery id it to be string
		// ToDo: Workaround in fromArray(), fix checks values search
		fileObj.galleries	= [this.ID+''];
		
		// Using default private option
		if ( isSet(mwData.Galleries[this.ID]) )
			fileObj['private'] = mwData.Galleries[this.ID]['private']; 
			
		// Setting filename
		this.setFileName(fileObj, File);

		// Saving new file data in files data cache, creating gallery index if was not there
		if ( isEmpty(mwData.Files[this.ID]) || !isObject(mwData.Files[this.ID]) )
			mwData.Files[this.ID] = {};
		
		mwData.Files[this.ID][fileObj.sn]	= fileObj;

		return fileObj; 
	}, //FUNC createFile

	saveFile	: function () {
		
		if ( !this.File || !mwData.Files[this.ID][this.File] ) 
			return false;
		
		var sn		= this.File;
		var file	= mwData.Files[this.ID][sn];
		var ed		= this.dom.propsForm.asArray();

		// ToDo: Clear file in gallery cache if unchecked. 
		// Actually just make sure all galleries contain proper files

		// Cleaning uploading controls in case if there are any
		delete(ed['UPLOAD_IDENTIFIER']);
		delete(ed['APC_UPLOAD_PROGRESS']);
		delete(ed['upload']);
		
		// Cleaning unmodified fields
		for ( var i in ed ) {
			
			// Preparing values for comparation, to ensure same meaning values are compared correctly
			var eds = ed[i];
			var fs	= file[i];
			
			// Making sure both (for safety) are defined (and not null) at least as empty strings
			if ( eds == undefined || eds == null ) eds = '';
			if ( fs == undefined || fs == null ) fs = '';
			
			// Arrays should be sorted for comparation
			if ( isArray(eds) ) eds.sort();
			if ( isArray(fs) ) fs.sort();

			// Forcing to compare as strings to ensure they are same type (arrays will be aways sorted same way)
			if ( String(eds) == String(fs) )
				delete(ed[i]);

		} //FOR each ed field
		
		// At this point - only modified fields are in ed, so can quit if none
		if ( Object.keys(ed).length < 1 ) 
			return false;
		
		// Making sure that with modifications come some helpers (to do not load them from DB)
		ed.id	= file.id;
		ed.sn	= file.sn;
		
		// File and ext required only if base set
		// Also private flag is required in this case
		if ( ed.base ) {
			ed.file	= file.file;
			ed.ext	= file.ext;
			ed['private'] = file['private'];
		} //IF there was rename
		
		// File also required in case of private setting changed
		if ( isSet(ed['private']) ) {
			ed.private_file	= file.file;
		} //IF private is set
		
		// Saving modified file info: 
		// 1. Uniting with general files info for index
		// 2. Saving separate copy of clean data to send to server (merging with previous modifications if any)

		if ( !mwData.FilesEd[sn] )
			mwData.FilesEd[sn] = {};

		jQuery.extend(mwData.FilesEd[sn], ed);
		jQuery.extend(mwData.Files[this.ID][sn], ed);

		// Updating face with changes
		this.itemFace(sn, 'update');
			
	}, //FUNC saveFile

	saveFileDelay	: function () {
		
		var self = this;
		
		clearTimeout(this.delayTimer);
		
		this.delayTimer = setTimeout( function () {
			self.saveFile();
		}, 300); //FUNC setTimeout.listener 
		
		return false;
	}, //FUNC saveFileDelay

	deleteFile	: function () {
	
		// ToDo: implement canceling on upload
		// ToDo: Bugs out with cache. Review.
	
		if ( !this.File || !mwData.Files[this.ID][this.File] )
			return false;

		// Setting editor to delete mode, cleaning modifications
		mwData.FilesEd[this.File] = { 
			id	: mwData.Files[this.ID][this.File].id,
			sn	: this.File,
			edit	: 'D', 
			file	: mwData.Files[this.ID][this.File].file
		}; //OBJECT mwData.FilesEd
			
		// Cleaning files cache
		// ToDo: Clean other galleries as well
		delete(mwData.Files[this.ID][this.File]);
		
		// Removing from index
		var el = this.dom.itemsList.find('#file_' + this.File);
		mwHide(el, function () {
			el.remove();
		}); //FUNC mwHide.callback
		
		// Resetting properties panel
		this.hideProperties();
	
		// Unselecting file
		this.File	= false;
		this.FileMeta	= {};
	
		return false;
	}, //FUNC deleteFile

	selectFile	: function ($el) {

		$el = _jq($el);
		
		var $this	= this;
		var $sn		= $el.attr('sn');
		
		if ( !$sn || !mwData.Files[this.ID][$sn] ) 
			return false;

		// Adding selection marker
		this.dom.itemsList.find('.selected').removeClass('selected');
		$el.addClass('selected');

		// Hiding current tab, if any happen
		mwHide( this.dom.propsActive, function () {

			// Saving curernt file
			$this.saveFile();
	
			$this.File	= $sn;
			$this.FileMeta	= mwData.Files[$this.ID][$sn];

			// Storing current item in dom
			$this.dom.item = $el;
			
			// Filling properties form
			$this.fillProps($sn);
	
			// Showing panel
			// Specifying current or default tab
			$this.showProperties( $this.dom.tabsActive );

		}); //FUNC mwHide.callback
		
	}, //FUNC selectFile
	
/* ---- Index ------------------------------------------------------------------------------------------------------------------ */

	itemFace	: function (sn, action) {

		var self = this;

	// ---- Validating environment ----

		// Checking if have everything needed

		if ( !mwData.Files[this.ID][sn] )	 	
		 	return '';

 		if ( !mwSubContents['filesMode_' + this.Mode] ) 
		 	return '';

		var file = mwData.Files[this.ID][sn];
		 	
	// ---- Template ----
	
		// Updating title to match last changes if there was some
		file.__title	= getFileCap(file);
		
		// Reading and parsing template, getting new element from it
	 	var template	= mwSubContents['filesMode_' + this.Mode];
		var el 		= jQuery(parseVariables(template, file) ); 

		// Adding loading marker if set
		if ( file.__loading )
			el.addClass('loading');

		// Adding selected for current files
		if ( this.File == sn ) 
			el.addClass('selected');

		// If there was error - indicating it and adding title with error to item
		if ( file.__error ) {
			el.addClass('error');
			el.attr('title', file.__error);
		} //IF error

		// Assigning click action
		el.click( function () {
			self.selectFile(this); 
		}); //FUNC onClick

	// ---- Thumbs processing ----
	
		var bg_el = el.find('.bg').add(el).first();
	
		// Getting thumb width
		var width = bg_el.attr('width');
		
		var bg = '';
		
		// If private file - always using icons, and have nothing in preview/details
	 	// If thumb data is given using it instead, dynamically resizing
	 	// This will happen only with modern upload for unsecured files
	 	if ( file['private'] != 0 ) {

	 		bg = file.__icon;
	 		
	 		// Setting icon directly
	 		bg_el.css('background-image', 'url("' + bg + '")');
			bg_el.css('background-size', '');

			// Forcing icon class for private files, even if one was not set
			el.removeClass('thumb');
			el.addClass('icon');
			el.addClass('private');

	 	} //IF private file
	 	else if ( file.__thumbData ) {

			// Setting bg using image for preload
			var data_img = new Image();

	 		if ( !width )
	 			bg = file.__thumbData['source'];
			
			if ( width && file.__thumbData[width] )
				bg = file.__thumbData[width];

			// IF bg found - just setting it
			// Setting anyway instead of default loader, better pregerated thumn instead
			if ( bg ) {

				// If background is ready as data, loading it directly
				bg_el.css('background-image', 'url("' + bg + '")');
				bg_el.css('background-size', 'cover');
				
			} else { //IF bg from data found

				data_img.onload = function() {
	
					// Generating info and info_cap (once we here we can do this)
					file.info	= data_img.width + 'x' + data_img.height;
					file.info_cap	= 'Resolution: ';
	
					// Creating tmp canvas to resize with
					var canvas	= document.createElement('canvas');  
					var ctx		= canvas.getContext('2d'); 
	
				// ---- Generating Thumb ----
					
					// Calculating ratio by width
					var ratio	= data_img.width / width;
					
					canvas.width	= width;
					canvas.height	= data_img.height / ratio;
					
					ctx.drawImage(data_img, 0, 0, width, data_img.height / ratio);
					
					// Saving in cache
					file.__thumbData[width] = canvas.toDataURL();
					
				// ---- Updating Item ----	
					
					bg_el.css('background-image', 'url("' + file.__thumbData[width] + '")');
					bg_el.css('background-size', 'cover');
					
				}; //FUNC onLoad
				
				data_img.src = file.__thumbData['source'];
			
			} //IF width and data set, but no resized image
 		
	 	} //IF thumbData given
 		else {

			// If thumb url given - loading it instead of default bg (which is loader)
		 	if ( file.__thumb ) {
		 		
		 		bg = file.__thumb;
				if ( width )
					bg = bg + '?' + width + 'x1000';  
	
				// For new images - loading through image onload (for loader)
				// For updating - can set directly, browser most likely have this one already in cache (or data was used)
				if ( action == 'update' ) {

					bg_el.css('background-image', 'url("' + bg + '")');
					bg_el.css('background-size', file.__class == 'thumb' ? 'cover' : '');
					
				} else { //IF update issued

					// Setting bg using image for preload
					var bg_img = new Image();
					bg_img.onload = function () {
						bg_el.css('background-image', 'url("' + bg + '")');
						bg_el.css('background-size', file.__class == 'thumb' ? 'cover' : '');
					}; //FUNC onLoad 
			
					bg_img.src = bg;
					
				} //IF loading new
				 
		 	} //IF thumb url given

		} //IF thumb url given

	// ---- Action ----

		// If no action - returning blank element
		if ( !action )
			return el;
		
		switch ( action ) {
		
			case 'append'	: 
				this.dom.itemsList.append( el );
				break;
		
			case 'prepend'	: 
				this.dom.itemsList.prepend( el );
				break;
		
			case 'update'	: 
			default		:
				this.dom.itemsList.find('#file_' + sn).replaceWith( el );
		
		} //SWITCH action
		
		return el;
	}, //FUNC itemFace

	index	: function (mode, el) {
 
 		var self = this;
 
 		if ( mode )
 			this.Mode = mode;

		if ( !mwData.Files[this.ID] )	 	
		 	return false;

		mwHide(self.dom.itemsList, function () {
			
			// Destroying sortables
			self.dom.itemsList.sortable('destroy');
			
			// Cleaning old index contents
			self.dom.itemsList.html('');
			
			// Presorting items before render
			// Normally they will come sorted from server (so sort will be fast), 
			// but new items, or manually ordered will not have right positions in cache
			// untill section reload. To keep them always sorted in all situations
			// better to ensure right order
			
			// Creating temporary index array

			var presort = [];
			
	 		for ( var i in mwData.Files[self.ID] ) {
	 			presort.push(mwData.Files[self.ID][i]);
 			} //FOR each item in cache
			
			// Now sorting: by order, keeping new items on top
			// Unsored items go bottom
			presort.sort( function (a, b) {
				
				// If both are new - newwer is less
				if ( isEmpty(a.id) && isEmpty(b.id) )
					return a.date - b.date;
				
				// If some is new - new is less
				if ( isEmpty(a.id) ) return 1;
				if ( isEmpty(b.id) ) return -1;

				// If both are unordered - sorted by id (needs integers)
				if ( isEmpty(a.order) && isEmpty(b.order) )
					return a.id - b.id;

				// If only one does not have order - no order go dowm
				if ( isEmpty(a.order) ) return 1;
				if ( isEmpty(b.order) ) return -1;
				
				// Rest are sorted by order
				return a.order - b.order;
				
			}); //FUNC sort.compareFunction			
	
	 		for ( var i in presort ) {
	
				self.itemFace(presort[i]['sn'], 'append');
				
	 		} //FOR each file

			// Checking, if need to apply floating width
		/**/
			if ( presort.length < 3 )
				self.dom.itemsList.addClass('noCol');
			else
				self.dom.itemsList.removeClass('noCol');
		/*/
			var $count = self.dom.itemsList.data('count');
			if ( presort.length < $count )
				self.dom.itemsList.addClass('noCol');
			else
				self.dom.itemsList.removeClass('noCol');
		/**/

			// Initiating sortables on new list.
			self.dom.itemsList.sortable({
				items		: 'li',
				containment	: self.dom.itemsPanel,
				cursor		: 'crosshair',
				tolerance	: 'pointer',
				distance	: 15,
				helper		: 'clone',

			//	placeholder	: 'placeholder',
			//	forcePlaceholderSize	: true
				update		: function(event, ui) {
					// Marking order change
					self.orderChange = true;
					self.saveOrder();
				} //FUNC sortable.onUpdate
			
			}); //OBJECT jQuery.sortable.options
			
			// Preventing selection with mouse
			self.dom.itemsList.disableSelection();
	 		
	 		mwShow(self.dom.itemsList);

			// Switching tab
			if ( el )	 		
				mwSwitchTab(el, false, false);
				
		}); //mwHide.callback
		 	
 		return false;
	}, //FUNC index
	
/* ---- UPLOADING -------------------------------------------------------------------------------------------------------------- */	

	upload		: function (data, fileObj) {
	
		var self	= this;
		
		// Saving gallery id, to allow galleries switching while uploading
		var gal_id	= this.ID;

		// Cleaning file data - it should be returned from ajax
		delete(fileObj.data);

		// Sending private flag if available
		if ( fileObj['private'] )
			if ( instanceName(data) == 'FormData' )
				data.append('private', fileObj['private']);
			else		
				data['private'] = fileObj['private']; 
		
		mwAjax(FILES_BACKEND_AJAX + '/upload/', data, false)
		
			// Progress listener
			.progress( function (proc) {
				// Updating bars, forcing them to be fisible
				self.dom.body.find('.num.uBar_' + fileObj.sn).show().html(proc+'%');
				self.dom.body.find('.fill.uBar_' + fileObj.sn).show().width(proc+'%');
			}) //FUNC mwAjax.progress.listener

			// On success updating
			.index( function (data) {
				
				// Cleaning upload state
				delete(fileObj['__loading']);
			//	delete(mwData.Files[gal_id][fileObj.sn]['__loading']);
				
				// Updating item in index
				var el = self.itemFace(fileObj.sn, 'update');
				
				// If file was selected - need to update meta and item details
				if ( self.File == fileObj.sn ) {
					self.fillProps(fileObj.sn, true);
				} //IF file is selected
				
			}); //FUNC mwAjax.content.callback
		
	}, //FUNC upload
		
/* ---- Uploading Classic ------------------------------------------------------------------------------------------------------ */

	addFileClassic	: function ( input ) {
		
		// ToDo: Last version was unstable.
		// Redo with mwAjax
		// Though still will require file INPUT positioning tricks
		
	}, //FUNC addFileModern

	uploadClassic	: function ( input ) {
		
	}, //FUNC uploadClassic

/* ---- Uploading Modern ------------------------------------------------------------------------------------------------------- */
	
	addFileModern	: function ( files ) {
		
		var self = this;

		// Looping through all files given
		jQuery.each(files, function(i, file) {
			
			var fileObj = self.createFile(file.name);
			
			self.itemFace(fileObj.sn, 'prepend');
			
			self.uploadModern(file, fileObj);

		}); //FUNC jQuery.each.callback	
		
	}, //FUNC addFileModern

	updateFileModern	: function ( files ) {
		
		var self = this;
		
		// Current meta should be saved, as part of it might be sent with new file
		this.saveFile();

		jQuery.each(files, function(i, file) {
			
			if ( !mwData.Files[self.ID] || !mwData.Files[self.ID][self.File] ) 
				return;

			// Uploading file
			self.uploadModern(file, mwData.Files[self.ID][self.File], true);

		}); //FUNC jQuery.each.callback	
		
	}, //FUNC addFileModern
	
	uploadModern	: function ( file, fileObj, update ) {
		
		var self = this;

		// Adding additional views
		fileObj.__size		= formatFileSize(file.size);
		fileObj.__loading	= true;

	//	// Adding element to index
	//	var el		= self.itemFace(fileObj.sn, 'update');

		// Looking for if there is prepared image for temporary thumb
		//var img		= el.find('IMG.tmpThumb');

		// For images attempting to compile real thumb, 
		// if mode template supports it 
		if ( file.type.match(/image.*/) ) {

			var reader = new FileReader();
			
			reader.onload = function (e) {
				
				// Saving thumb data (possibly overwriting old values)
				fileObj.__thumbData = [];
				
				fileObj.__thumbData['source'] = e.target.result;
				
				// And removing existing thumb, we are uploading new anyway
				delete(fileObj.__thumb);
				
				// Updating item
				self.itemFace(fileObj.sn, 'update');

			}; //FUNC reader.onload
			
			reader.readAsDataURL(file);

		} else { //IF image given

			// Remofing thumbdata if was set previously
			delete(fileObj.__thumbData);

			// Updating item
			self.itemFace(fileObj.sn, 'update');

		} //IF other files

		// Sending each file in own request for async uploading and real progress bars
		// ToDo: implement files uploading stack
		
		// Sending using FormData: if we here this is supported
		var FD = new FormData();
		
		// Adding meta
		FD.append('sn', fileObj.sn);
		FD.append('gallery_id', self.ID);
		
		// Marking update if applicable
		if ( update )
			FD.append('update', '1');
		
		// Adding progress monitor markers
		FD.append('UPLOAD_IDENTIFIER', fileObj.sn);
		FD.append('APC_UPLOAD_PROGRESS', fileObj.sn);

		// Adding file
		FD.append('file', file);

		// Sending file to server, and updating on success
		self.upload(FD, fileObj);

	}, //FUNC uploadModern

/* ---- Saving ----------------------------------------------------------------------------------------------------------------- */

	save		: function (stay) {

		var self = this;

		if ( !this.ID )
			return false;

		// First saving currently opened file
		this.saveFile();
		
		// Closing properties
		this.hideProperties();

		// Nothing to do if nothing edited
		if ( Object.keys(mwData.FilesEd).length < 1 ) {

			if ( !stay )
				this.window.hide();
				
			return this;
		} //IF nothing to do
			
		var post = {};
		
		post.id		= this.ID;
		post.files	= mwData.FilesEd;

		// Sending all modified files to server to proceed. On success will clean those.
		mwAjax(FILES_BACKEND_AJAX + '/save/', post, 'mwFilesEd')
			.index( function (data) {
				
				// ToDo: Update other cached galleries with new info
				
				// Cleaning modifications
				mwData.FilesEd = {};
				
				if ( !stay )
					self.window.hide();
					
				// If all ok - just done
				if ( !data.errors ) 
					return;
				
				// If there was errors - have to update items
				for (var i in data.errors )
					self.itemFace(i, 'update');
				
			}); //mwAjax.content.callback
		
		return false;
	}, //FUNC save

	saveOrder	: function () {

		var post	= this.dom.itemsForm.asArray();
		post.id		= this.ID;
		
		mwAjax(FILES_BACKEND_AJAX + '/saveOrder/', post, 'mwFilesEd').content();
		
		return false;
	} //FUNC saveOrder

} //OBJECT mwFilesEd

/* ==== Tiny editor ============================================================================================================ */

var mwFilesTinyEd = {

	ED		: false,	// Associated tinyMCE editor. Should be set on dialog display.

	ID		: 0,		// Current editing file ID
	SN		: '',		// Current editing file SN
	
	File		: {},		// Current file info

	Window		: false,	// Editor window object
	Body		: false,	// Editor window body element
	Form		: false,	// Editor form
	
	inMath		: false,	// TRUE when doing calculaitons, prevents events triggering in concurrent events
	
	iWidth		: false,	// Width input
	iHeight		: false,	// Height input
	iRatio		: false,	// Constrain proportin input
	iSlider		: false,	// Slider input

/* ---- Helpers ---- */
	
	loadWindow	: function (callback) {
		
		if ( !jQuery('#w_mwFilesTinyEd').length )
			mwAjax(FILES_BACKEND_AJAX + '/tinyDialog')
				.content(callback);

	}, //FUNC loadWindow

	setupForm	: function ($data) {
		
		this.inMath = true;
		
		this.Form.fromArray($data);
		
		this.inMath = false;
		
	}, //FUNC setupForm

/* ---- General Tools ---- */
	
	dialog		: function (editor, file) {

		if ( !editor || !file )
			return;

		// Initiating shortcuts
		if ( !this.Window ) {
			this.Window	= mwWindow('mwFilesTinyEd');
			this.Body	= this.Window.Body;
			this.Form	= this.Body.find('#mwFilesTinyEd_form');
			this.iWidth	= this.Form.find('[name=width]');
			this.iHeight	= this.Form.find('[name=height]');
			this.iRatio	= this.Form.find('[name=ratio]');
			this.iSlider	= this.Form.find('[name=slider]');
		} //IF not initiated

		// Saving associated editor
		this.ED = editor;
		
		// Saving meta for later
		this.File	= file; 
		this.ID		= file.id;
		this.SN		= file.sn;

		// Preparing form data
		var $data = {
			width		: file.width || '',
			height		: file.height || '',
			slider		: 100,
			ratio		: 1
		}; //OBJECT $data
		
		// Initiating data form
		this.setupForm($data);
	
		// Should not ask dimensions for non-media types
		// ToDo: Widget based solution
		var $media = ['Image', 'Audio', 'Video'];
		
		if ( $media.indexOf(file.type) == -1 ) {
			
			return this.apply();
			
		} //IF non media given
		
		this.Window.Title('Insert file: <span>' + getFileCap(file) + '</span>');
		
		this.Window.show();

		return false;
	}, //FUNC dialog

	onSlider	: function () {
		
		if ( this.inMath )
			return;
		
		// Getting initial width/height
		var $w = this.File.width || 0;
		var $h = this.File.height || 0;
		
		var $s = this.iSlider.val();
		
		if ( !$w || !$h )
			return;
		
		// Preparing form data
		var $data = {
			width		: Math.floor($w * $s / 100),
			height		: Math.floor($h * $s / 100),
			slider		: $s,
			ratio	: 1
		}; //OBJECT $data
		
		// Initiating data form
		this.setupForm($data);
		
	}, //FUNC onSlider

	setDims	: function ($width, $height) {

		if ( this.inMath )
			return;
		
		// Checking proportion slider
		var $r = this.iRatio.get(0).checked;
		
		if ( !$r )
			return;
		
		// Getting initial width/height
		var $w = this.File.width || 0;
		var $h = this.File.height || 0;
		
		// If some of original dimensions were not set - skipping
		if ( !$w || !$h )
			return;

		// If both dimensins were not set (host was cleaned and relate given as 0) skipping too
		if ( !$width && !$height )
			return;

		// Calculating ratio and height
		$w = ( $height ) ? Math.floor($height / $h * $w) : $w; 
		$h = ( $width ) ? Math.floor($width / $w * $h) : $h; 

		// Calcualting slider
		$s = ( $width ) ? Math.floor($width / $w * 100) : Math.floor($height / $h * 100);
		
		// Resetting out of boundaries values
		if ( $s > 200 )
			$s = 100;
		
		// Preparing form data
		var $data = {
			width		: $width ? $width : $w,
			height		: $height ? $height : $h,
			slider		: $s,
			ratio		: $r
		}; //OBJECT $data
		
		// Initiating data form
		this.setupForm($data);

	}, //FUNC setDims

	setWidth	: function ($height) {
		
		this.setDims(0, $height);
		
	}, //FUNC setWidth

	setHeight	: function ($width) {
		
		this.setDims($width, 0);
		
	}, //FUNC setWidth

	getView		: function (file, options) {
		
	// ---- Checking environment ----	
		
		// Width and height can be set manually or provided by gallery loader
		var width	= options.width || file.width;
		var height	= options.height || file.height;

		// Though styles can be ommited totally		
		var style	= '';
		var attrs	= '';
		var dims	= '';
	
		if ( width ) {
			style += 'width: ' + width + 'px;';
			attrs += ' width="' + width + '"';
		} //IF width set

		if ( height ) {
			style += 'height: ' + height + 'px;';
			attrs += ' height="' + height + '"';
		} //IF height set
	
		if ( width && height )
			dims = '?' + width + 'x' + height;
		
	// ---- Forming html ----	
		
		var html	= '';

		// ToDo: Implement proper filetype based templating

		// Private files always return just a link
		
		if ( file['private'] != 0 )
			return '<a href="/' + CMS_DOWNLOAD + '/galleries/' + file.file + '" target="_blank">' + getFileCap(file) + '</a>'

		switch ( file.type ) {
			
		// ---- IMAGES ----	
			
			case 'Image'	:
			
				html	= '<img src="' + FILES_GET + 'galleries/' + file.file + dims + '"';
				html += ' alt="' + getFileCap(file) + '"';

			 	html += ' />';
			 
			break;
		
		// ---- AUDIO ----
		
			case 'Audio'	:
				html  = '<audio controls="controls"' + attrs + '>';
				html += '<source src="/files/galleries/' + file.file + '" type="' + file.mime + '" />';
				html += 'Playback is currently unsupported in Your browser. Try to update to latest version.';
				html += '</audio>'; 
			break;
		
		// ---- VIDEO ----

			case 'Video'	:
				html  = '<video controls="controls"' + attrs + '>';
				html += '<source src="/files/galleries/' + file.file + '" type="video/' + file.format + '" />';
				html += 'Playback is currently unsupported in Your browser. Try to update to latest version.';
				html += '</video>'; 
			break;

		// ---- OTHERS ----		
			
			default		: 
			
				html = '<a href="/' + SITE_FILES + '/galleries/' + file.file + '" target="_blank">' + getFileCap(file) + '</a>'; 
			
		} //SWITCH file

		return html; 
	}, //FUNC getView
	
	apply		: function () {

		// Getting placement options
		var o = this.Form.asArray();
		
		var html = this.getView(this.File, o);

		this.ED.execCommand('mceInsertContent', false, html);
		
		this.Window.hide();

		return false;
	} //FUNC apply

} //OBJECT mwFilesTinyEd
