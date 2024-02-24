/** //** ----= CLASS mwSelectInput	=------------------------------------------------------------------------------\**//** \
*
*	Selector input JS model. Supports dropdowns, multiselects, custom item input, inline filtering and adding new items.	
*
* 	@package	morweb
* 	@subpackage	system
* 	@category	model
*
\**//** ---------------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
jQuery.fn.mwSelectInput = function ($options) {

	if ( !this.length )
		return;

	// Retrieving or creating model
	var $obj = this.data('mwSelectInput') || mwSelectInput(this);	//.set($options);
	
	// Storing in element
	this.data('mwSelectInput', $obj);

	// Done
	return $obj;

} //FUNC mwSelectInput

function mwSelectInput ( $el, $options ) { return vEventObject(['onInit', 'onChange', 'onFilter', 'onAdd'], {

	dom			: {			// Contains shortcuts to usable elements
	
		// Main
		container		: false,		// mwInput element
		input			: false, 		// Main input (hidden)

		// Panels
		face			: false,		// Face bar, wrapping around value input and dropdown button 
		filter			: false, 		// Filter input, used to filter items in list
		body			: false, 		// Main dropdown body (filter and items container)
		list			: false, 		// Items wrapper

		// Controls 		
		iValue			: false,		// Value input, used to to display selected value or as custom input 
		iSearch			: false, 		// Search input, used to filter items in list
		btnDown			: false,		// Dropdown button subcontrol
		btnAdd			: false,		// Button for adding custom values
		btnClear		: false,		// Button for resetting search filter

		// Misc		
		items			: false, 		// Individual rendered option items

		overlay			: false, 		// Overlay, when used
		
	}, //dom

	multiselect		: false,			// Set TRUE to allow multiple values (checkList) 
	multiline		: false,			// Set TRUE to use as multiline input 
	filter			: false,			// Set TRUE to use inline filtering
	custom			: false,			// Set TRUE to allow custom values (additinal input)
	noMobile		: false,			// Set TRUE to skip init when used with mobile device (relies on native experience)

	resizeDelay		: 5,				// Resize update delay
	resizeTimout		: false,			// Stores timout during window resizing

/* ==== SETUP =============================================================================================================== */

	/** //** ----= set	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Updates self properties with given values.
	*
	*	@param	MIXED	$option		- Option to set. Can be data object to setup several properties.
	*	@param	MIXED	[$value]	- Value to set. Not used if object passes as first parameter.
	*
	*	@return SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	set		: function ($option, $value) {

		var $this = this;

		// Values can come as object, or single value
		// Applying using object, for code unification below
		// Any variable are accepted, to allow custom data storage
		var $o = {};

		if ( arguments.length === 1 )
			$o = $option;
		else
			$o[$option] = $value;

	// ==== Events ====

		// Processing events, as those should be cleared before extending
		for ( var $i in $o ) {

			// Skipping non events and non funcitons
			if ( !this.__events[$i] || !isFunction($o[$i]) )
				continue;

			// Setting up event, and removing it from opitons
			this[$i]($o[$i]);
			delete($o[$i]);

		} //FOR each opiton

	// ==== Self ====

		jQuery.extend(this, $o);

		return this;

	}, //FUNC set

/* ==== INIT ================================================================================================================ */ 

	/** //** ----= init	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Initiates payment form.
	*
	*	@return self
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	init			: function () {

		var $this = this;
	
	// ---- Main ----	
		
		// Saving main input and looking for wrapper
		$this.dom.input		= $el;
		$this.dom.container	= $el.closest('.mwInput');
		
		// Few shortcuts
		var $container		= $this.dom.container;
		var $input		= $this.dom.input;

		// Adding required classes to wrapper
		$this.dom.container.addClass('list');

	// ---- Flags ----

		// Reading flags from wrapper and input
		// ToDo: improove flags management: classes should be guaranteed during render, for CSS. 
		// Need to put back applied flags	
		$this.set({
			multiselect	: $input.is('[multiple]'),
			multiline	: $container.is('.multiline'),
			filter		: $container.is('.filter'),
			custom		: $container.is('.custom'),
			noMobile	: $container.is('.noMobile'),
		}); //set

	// ---- Mobile ----
	
		// If mobile is used - need to skip render optionally
		if ( $this.noMobile && isTouchScreen() ) {
			
			// For mobile version - skipping render, but showing regular select instead
			// Adding marker
			$this.dom.container.addClass('isMobile');
			
			return;
			
		} //IF mobile

	// ---- DOM ----	

		// Hiding main select element
		$this.dom.input.hide();

		// Rendering face first
		$this.renderFace();

		// Then goes body, everything else would be inside
		$this.renderBody();

	// ---- Styles ----


	// ---- Events ----

		$this.initEvents();

		// Initial update
		$this.update();

		return $this;
		
	}, //FUNC init

	/** //** ----= initEvents	=------------------------------------------------------------------------------\**//** \
	*
	*	Initializes events. All in one place, for easier management.
	*
	*	@return SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	initEvents		: function ( ) {
	
		// Few shortucts
		var $this	= this;
		var $input	= $this.dom.input;
		var $container	= $this.dom.container;
		
		// When select updates - it should update items and face
		$this.dom.input.on('change.mwSelect', function () {
			
			$this.update();
			
		}); //FUNC input.onchange

		// Adding item clicks, listening on body, in case reinit/changes happen in list or items 
		$this.dom.body.on( 'click.mwSelect', '.item', function () {
		
			// Getting elements
			var $item	= jQuery(this);
			var $option	= $item.data('option');
			
			// No need to do anything if already selected option is clicked again
			// Applicable only for non-multiselect
			if ( !$this.multiselect && $option.prop('selected') )
				return;
		
			// Updating property only. Attribute will be also updated by updateItems()
			// Doing this way to ensure that correct attributes are updated on all items 
			$option.prop( 'selected', !$option.prop('selected') );

			// Triggering change on main input
			$this.dom.input.trigger('change');
		
		}); //FUNC item.onclick	

		// Filter executs on key presses, if input available
		if ( $this.filter ) {
			
			$this.dom.iSearch.on('keyup.mwSelect', function () {

				// Updating items, this will apply filter
				$this.update();
				
			}); //FUNC input.onchange

			$this.dom.btnClear.on('click.mwSelect', function () {

				// Just clearing filter value and updating items
				$this.dom.iSearch.val('');	

				// Updating items, this will apply filter
				$this.update();

			}); //FUNC input.onchange
			
		} //IF filter enabled

		// In inline mode - need to show/hide body
		if ( !$this.multiline ) {

			// Dropdown button always works
			$this.dom.btnDown.on('click.mwSelect', function () {

				// Showing/hiding depending on state
				$this.toggleBody();
				
			}); //FUNC button.onclick

			// For non-custom inputs - value also toggles body
			if ( !$this.custom )
				// Dropdown button always works
				$this.dom.iValue.on('click.mwSelect', function () {
	
					// Showing/hiding depending on state
					$this.toggleBody();
					
				}); //FUNC input.onclick

			
		} //IF inline mode
		
	}, //FUNC initEvents

/* ==== Render ============================================================================================================== */ 

	/** //** ----= renderBody	=------------------------------------------------------------------------------\**//** \
	*
	*	Renders main body element.
	*
	*	@return SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	renderBody		: function ( ) {

		// Few shortucts
		var $this	= this;
		var $input	= $this.dom.input;
		var $container	= $this.dom.container;
		
		// Marking body as inline if necessary for CSS
		var $mode	= $this.multiline ? 'multiline absoluteFill' : 'mwInput oneline';
		$this.dom.body	= jQuery('<div class="body '+$mode+'"></div>').appendTo($container);
		
		// Reset of css would be set on display
	
	// ---- Children ----	
		
		// Rendering filter, it goes inside body
		$this.renderFilter();
		
		// Now can render items list
		$this.renderList();
		
		return $this;
		
	}, //FUNC renderBody

	/** //** ----= renderFace	=------------------------------------------------------------------------------\**//** \
	*
	*	Renders face panel. Used to display current value and entering custom value for inline mode. 
	*
	*	@return SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	renderFace		: function ( ) {

		// Few shortucts
		var $this	= this;
		var $input	= $this.dom.input;
		var $container	= $this.dom.container;

		// Adding face controls only for inline input
		if ( $this.multiline )
			return $this;
		
		// Creating elements as one html chunk, then finding referrences afterwards
		var $html	= '';
		
		// Subcontrol button goes first, as it's floating
		$html		= '<div class="subcontrol right icon gray dropdown"></div>';
		
		// Input is wrapped in div to behave properly with floated element nearby
		$html		= $html+'<div class="subInput value"><input type="text" class="mw" /></div>';
		
		// Finally - entire thing is wrapped into another element
		$html		= '<div class="face">'+$html+'</div>';

		// Appending entire thing to container
		jQuery($html).appendTo($container);

		// Looking for individual elements now
		$this.dom.iValue	= $container.find('.subInput.value input');
		$this.dom.btnDown	= $container.find('.subcontrol.dropdown');
		$this.dom.face		= $container.find('.face');

		// If custom input is not used - value is only for display, so making it readonly
		if ( !$this.custom )
			$this.dom.iValue.attr('readonly', 'readonly');

		return $this;

	}, //FUNC renderFace

	/** //** ----= renderFilter	=------------------------------------------------------------------------------\**//** \
	*
	*	Renders filter panel. Used to filter items list, and adding custom values for multiselects.
	*
	*	@return SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	renderFilter		: function ( ) {
		
		// Few shortucts
		var $this	= this;
		var $input	= $this.dom.input;
		var $container	= $this.dom.container;

		// Adding filter only if it's allowed
		if ( !$this.filter )
			return $this;

		// Filter is positioned inside body wrapper, to display and hide together with list
		// Preparing html for filter bar
		
		// Subcontrols buttons go first, as they're floating
		var $html	= '';
		$html		+= '<div class="subcontrol left icon gray search"></div>';
		$html		+= '<div class="subcontrol right button icon hi plus add"></div>';
		$html		+= '<div class="subcontrol right icon delete clear gray"></div>';
		
		// Input is wrapped in div to behave properly with floated element nearby
		$html		= $html+'<div class="subInput search"><input type="text" class="mw" /></div>';
		
		// Finally - entire thing is wrapped into another element
		$html		= '<div class="filter">'+$html+'</div>';

		// Appending entire thing to container
		jQuery($html).appendTo($this.dom.body);

		// Looking for individual elements now
		$this.dom.filter	= $this.dom.body.find('.filter');
		
		$this.dom.iSearch	= $this.dom.filter.find('.subInput.search input');
		$this.dom.btnAdd	= $this.dom.filter.find('.subcontrol.add');
		$this.dom.btnClear	= $this.dom.filter.find('.subcontrol.clear');
		
		return $this;
		
	}, //FUNC renderFilter

	/** //** ----= renderList	=------------------------------------------------------------------------------\**//** \
	*
	*	Renders items panel, including individual items.
	*
	*	@return SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	renderList		: function ( ) {
		
		// Few shortucts
		var $this	= this;
		var $input	= $this.dom.input;
		var $container	= $this.dom.container;

	// ---- Wrap ----
		
		// Clearing old wrapper if any happen
		if ( $this.dom.list )
			$this.dom.list.remove();

	 	// Recreating items wrapper
	 	$this.dom.list	= jQuery('<div class="list"></div>').appendTo( $this.dom.body );

	// ---- Items ----

		// Resetting items collection		
		$this.dom.items	= jQuery([]);

		// Looping through options and generating items
		// ToDo: support grouping, custom icons, columns and more
		$input.find('option').each( function () {
			
			var $option	= jQuery(this);
			
			// Rendering item into body
			var $item	= $this.renderItem($option).appendTo( $this.dom.list );
			
			// And storing it in self for future reuse
			$this.dom.items	= $this.dom.items.add($item); 
			
		}); //FOR each item
	 
		return $this;
		
	}, //FUNC renderList

	/** //** ----= renderItem	=------------------------------------------------------------------------------\**//** \
	*
	*	Renders single item.
	*
	*	@return SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	renderItem		: function ( $option ) {

		// Few shortucts
		var $this	= this;
		var $text	= $option.html(); 
		
		// Creating item
		var $item	= jQuery('<div class="item icon hi left">'+$text+'</div>');
		
		// Setting up links
		$option.data('item', $item);
		$item.data('option', $option);
			
		return $item;
		
	}, //FUNC renderItem

	/** //** ----= renderOverlay	=------------------------------------------------------------------------------\**//** \
	*
	*	Renders overlay.
	*
	*	@return SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	renderOverlay		: function ( ) {

		// Few shortucts
		var $this	= this;
		
		// Adding overlay to page
		$this.dom.overlay	= jQuery('<div class="mwInputOverlay mwInput list"></div>').appendTo('body');
		
		// Marking body with class as flag 
		// And Moving body inside overlay
		$this.dom.body
		//	.addClass('show')
			.appendTo($this.dom.overlay);
		
		// Click on overlay hides stuff
		$this.dom.overlay.on('click', function ($e) {
			
			$this.hideBody();

			$e.stopPropagation();
			
		}); //FUNC overlay.click
		
		// Preventing click on body for closing (only for multiselects)

		if ( $this.multiselect )
			$this.dom.body.on('click', function ($e) {
				
				$e.stopPropagation();
				
			}); //FUNC body.click

		// Filter never closes anyway
		if ( $this.filter )
			$this.dom.filter.on('click', function ($e) {
				
				$e.stopPropagation();
				
			}); //FUNC body.click

	// ---- Resize ----

		// If body resizes for some readon - need to update selector position
		// Doing this only for inline mode
		
		// Initiating window resize after small delay
		// to skip initial browser resizie events
		setTimeout( function () {

			// Updating dimensions on resize
			jQuery(window).on('resize.mwSelect', function ($e) {
	
				// Using timeout during resize, to reduce updates count
				if ( $this.resizeTimout )
					clearTimeout($this.resizeTimout);
								
				$this.resizeTimout = setTimeout( function () {
			
					$this.updatePosition();
			
				}, $this.resizeDelay);
				
			}); //window.onResize
			
		}, 50);
			
		return $this;
		
	}, //FUNC renderOverlay

/* ==== Display ============================================================================================================= */ 

	/** //** ----= showBody	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Displays body, recalculating positions.
	*
	*	@return SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	showBody		: function (  ) {

		// Few shortucts
		var $this	= this;
		
		// Creating overlay, this will also move body inside
		$this.renderOverlay();

		// Displaying overlay
		$this.dom.overlay.show();
		
		setTimeout( function () {

			// While it adjusts - can now reposition body
			// At this point - everything is rendered and have dimensions
			$this.updatePosition();

			// Finally - executing fade/slide animation			
			$this.dom.body.addClass('show')
			$this.dom.overlay.addClass('show');

		}, 1);
		
	}, //FUNC showBody

	/** //** ----= hideBody	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Hides body.
	*
	*	@return SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	hideBody		: function (  ) {

		// Few shortucts
		var $this	= this;

		// Hiding overlay and unflagging body
		$this.dom.overlay.removeClass('show');
		$this.dom.body.removeClass('show');

		// Allowing it to play animation with timeout
		setTimeout( function () {

			// Putting body back, where it belongs :)
			// This will also hide it. Inline body is display:none outside overlay
			$this.dom.body.appendTo( $this.dom.container );
	
			// Removing overlay from DOM now 
			$this.dom.overlay.remove();

			// Clearing resizing tracking
			jQuery(window).off('resize.mwSelect');

		}, 200);

	}, //FUNC hideBody

	/** //** ----= toggleBody	=------------------------------------------------------------------------------\**//** \
	*
	*	Toggles body visibility, depending on current state.
	*
	*	@return SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	toggleBody		: function (  ) {

		// Few shortucts
		var $this	= this;

		// Just looking at body state
		if ( $this.dom.body.is('.show') ) {
			$this.hideBody();
		} //IF visible
		else {
			$this.showBody();
		} //IF hidden

	}, //FUNC toggleBody
	
/* ==== HELPERS ============================================================================================================= */ 
	
	/** //** ----= getPosition	=-------------------------------------------------------------------------------\**//** \
	*
	* 	Returns panel position relative to screen.
	* 
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	getPosition		: function () {

		var $this	= this;
		var $el		= $this.dom.container;
		 
		var $offs	= $el.offset();
		var $sTop	= jQuery(window).scrollTop();
		var $sLeft	= jQuery(window).scrollLeft();
		
		// Recalculating coords based on scroll position
		$offs.top	= $offs.top - $sTop;
		$offs.left	= $offs.left - $sLeft;
		
		return $offs;
		
	}, //FUNC getPosition

	/** //** ----= updatePosition	=-------------------------------------------------------------------------------\**//** \
	*
	* 	Updates body position against element
	* 
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	updatePosition		: function () {

		var $this	= this;
		
		// Not doing anything for non-inline mode and if not visible
		if ( $this.multiline )
			return;

		// Few shortcuts
		var $input	= $this.dom.container;
		var $body	= $this.dom.body;

		// Getting input coordinates and screen size
		var $pos	= $this.getPosition();
		var $screen	= screenSize();

		// Calculating margi as % of screen height
		// Carrying only about height, since that's what is mostly positioned
		var $margin	= $screen.height * 0.05;
		
		// Getting real body height and calculating max allowed
		// For this - clearing height first
		$this.dom.list.css('max-height', '');
 
		var $height	= $body.height();
		var $limit	= $height; 
		var $max	= $screen.height - ($margin * 2);

		// Calculating real height limit (should be set on list inside body)
		// Clearing if not necessary anymore (screen resize)
		if ( $height > $max ) {
			
			$limit	= $max;
			
			// Accounting for filter if present
			$this.dom.list.css('max-height', $limit - ($this.filter ? $this.dom.filter.outerHeight() : 0));
			
		} //IF too big 
		
		// Calculating new top based on real height and limits
		// Starting from middle of input
		var $top	= ($pos.top + ($this.dom.container.height() / 2)) - ($limit / 2);

		// Correcting top: it should be lower than margin
		if ( $top < $margin )
			$top = $margin;

		// But also can't be too low (top+height higher than margin)
		if ( $top + $limit > $screen.height - $margin )
			$top = $screen.height - $margin - $limit;
		
		// Adjusting body
		// Slightly adjusting sizes, to do not mess with borders recalculations
		// ToDo: read borders from skin			
		$this.dom.body.css({
			width		: $this.dom.container.width() - 2,
			left		: $pos.left + 1,
			top		: $top, //$pos.top + ($this.dom.container.height() / 2),
		}); //$css
		
	}, //FUNC updatePosition
	
	/** //** ----= update	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Updates item states based on current selector state. Uses filtering if available.
	*	Additionally updats filter states, and face if available.
	*
	*	@return SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	update		: function (  ) {

		// Few shortucts
		var $this	= this;
		
		// Reading/updating filter
		var $filter	= '';
		
		if ( $this.filter ) {

			$filter	= $this.dom.iSearch.val();

			// Showing/hiding clear button
			if ( $filter )
				$this.dom.btnClear.show();
			else
				$this.dom.btnClear.hide();
			
		} //IF filter used

		// Updating face when applicable
		// For this - collecting selected values, and concatenating them into lavel afterwards
		var $val	= [];
				
		// Just looping through items list and setting selected class
		$this.dom.items.each( function () {

			var $item	= jQuery(this);
			var $option	= $item.data('option');

			// Checking if matching filter, or just showing them all
			if ( $filter ) {
				
				// Using regex seaerch for case insensitivity
				// ToDo: escape filter value
				if ( $option.html().search( new RegExp($filter, 'i') ) == -1 )
					$item.hide();
				else
					$item.show();
				
			} //If filter applied
			else {

				// Just showing, this makes sure we display all items if filter was just cleared
				$item.show();

			} //IF filter not applied or just cleared
		
			// Marking item as selected
			if ( $option.prop('selected') )	
				$item.addClass('selected');
			else
				$item.removeClass('selected');

			// Collecting selected values for face update
			if ( $option.prop('selected') )	
				$val.push( $option.text().trim() );

		
		/*/ 			
			// Additionally - setting selected atribute on option, for whoever needs this
			// But this is supported only on multiselects
			// This appears to be quite slow for obvious reasons, so skipping it for now as noone really needs it :) 
			if ( !$this.dom.input.is('[multiple]')  )
				return;

			if ( $option.prop('selected') )	
				$option.attr('selected', 'selected');
			else
				$option.removeAttr('selected', '');
		/**/

		}); //FOR each item

		// If nothing found - using first option to display something (that's what would be submitted in the end)
		if ( isEmpty($val) && $this.dom.items.length ) {
			$val.push( $this.dom.items.first().data('option').text().trim() );
		} //IF no values
		
		// Now can apply value
		if ( !$this.multiline )
			$this.dom.iValue.val( $val.join(', ') );
			
	}, //FUNC update

}).init()} //CONSTRUCTOR mwCodeInput
