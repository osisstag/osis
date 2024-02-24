//ToDo: Redo everything!!!

// Simple cache to do not monitor same values
var upload_procesing_cache = {};

/** //** ----= setFormsSubmit	 =----------------------------------------------\**//** \
*
* 	Sets forms to have submit control. Applies to forms with set onsubmit attribute.
*
* 	@param	MIXED element	- jQuery selector to search forms within 
*				  (set to speed up search).
*
* 	@return	bool		- Always FALSE.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function setFormsSubmit ( element ) {
	
	if ( element && !(element instanceof jQuery) )
		element = jQuery(element);
	
	// Searching for forms, only with onsubmit attribute
	var forms = ( element )? jQuery(element).find('FORM[onsubmit]') : jQuery('FORM[onsubmit]');

	// Processing each form for submit control
	forms.each( function() {
		
		var form	= jQuery(this);
		var form_id	= form.attr('id');
		
		// Checking if form has no submit already
		// ToDo: More complex check
		if ( form.find('[type=submit]').length ) return;

		// If still here - form have no submit, but have onsubmit attribute
		// So adding hidden submit control
		// Adding on top, to do not mess with winContents and layout
		form.prepend('<input type="submit" style="display: none;" />');

		if ( !form_id ) return;

		// If element is window with footer buttons related to form (by id) - set them to submit form too.
		element.find('.winFooter A[rel=' + form_id + ']')
			.addClass('hi')
			.unbind('click')
			.click( function () {
				
				jQuery('#' + form_id).submit();
				
				return false;
			} ); //FUNC onClick
		
	}); //FUNC each form

	return false;	
} //FUNC setFormsSubmit

/** //** ----= mwUpdateSelector	=--------------------------------------------------------------------------------------\**//** \
*
*	Updates selector options with items given. Optionally marks certain items as selected. 
*
\**//** ---------------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function mwUpdateSelector (input, options, selected) {

	input = _jq(input);

	// Removing all styles from selector
	var sel = unstyleInput(input);
	
	// Cleanning old options
	sel.find('OPTION').remove();

	// Adding given options
	// Supporting maps if one is given
	if ( isClass(options, 'Map') ) {

		
	/**/	// Using method to iterate, to stay compatible with older JS parsers
		options.forEach( function ( $val, $key ) {
			jQuery('<option value="' + $key + '">' + $val + '</option>').appendTo(sel);
		}); //forEach
	
	/*/
		for ( var i of options )
			jQuery('<option value="' + i[0] + '">' + i[1] + '</option>').appendTo(sel);
	/**/	
	} //IF map given
	
	else {

		for ( var i in options )
			jQuery('<option value="' + i + '">' + options[i] + '</option>').appendTo(sel);
	
	} //IF regular data object
	
	// Setting selected values if given some
	if ( selected )
		setValue_Select(sel.get(0), selected);
	
	// Restyling input back
	styleDialog( sel.parent() );
	
	// Triggering update
	sel.trigger('update');
	
	return false;
} //FUNC mwUpdateSelector

/** //** ----= filterSelect	 =----------------------------------------------\**//** \
*
* 	Filters styled selector with values.
*
* 	@param	MIXED	select	- Valid jQuery element selector. 
* 				  Sould point to .mwinput.List control.
* 
* 	@param	string	filter	- Comma separated filters.
* 	@return	bool		- Always FALSE.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function filterSelect ( select, filter ) {

	if ( !filter ) {
//		jQuery(select).find('.Item').fadeIn(200);
		jQuery(select).find('.item').show();
		return false;
	} //IF empty filter

	// Trimming filters, and composing regex
	var filter	= strToArray(filter, ',');
	var reg		= new RegExp('(' + filter.join('|') + ')', 'i');
	
	jQuery(select + ' .item').each( function () {
		var el		= jQuery(this);
		
		var title	= el.find('div').first().html();

		if ( reg.test(title) )
			el.show();
		else
			el.hide();

	}); //jQuery each
	
	return false;
} //FUNC filterSelect

/** //** ----= selectAddItem	 =----------------------------------------------\**//** \
*
* 	Adds items to target styled selector.
*
* 	@param	MIXED	select	- Valid jQuery element selector.
* 	@param	string	values	- Comma separated values.
* 	@return	bool		- Always FALSE.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function selectAddItem ( select, values, checked ) {
	
	if ( !values ) return false;

	var select	= _jq(select);
	
	checked = ( checked )? ' selected="selected"' : ''; 

	// If input given as value, it should be cleaned after all	
	var relate = false; 
	if ( values instanceof jQuery ) {
		relate = values;
		values = relate.val();
	} //IF parent element given
	
	if ( isStr(values) ) {
		var tmp	= strToArray(values, ',');
		
		// Reindexing to have meaningfull keys to use as values
		// Normally associated arrays or objects should be passed
		values = {};
		
		for ( var i in tmp )
			values[tmp[i]] = tmp[i];
			
	} //IF string given

	// Before have to save selected inputs, cuz unstyle will reset all to beginning
	var checks	= []; 
	select.find('input:checked').each( function () {
		checks.push( jQuery(this).val() );
	}); //FUNC each.callback

	// Destyling select for easy add new inputs	
	select = unstyleInput(select);
	
	// Resetting options to to new setting
	select.find('option').each( function () {
		
		var el = jQuery(this);
		if ( checks.indexOf( el.val() ) != -1 )
			el.attr('selected', 'selected');
		else	
			el.removeAttr('selected');
			
	}); //FUNC each.callback
	
	for ( var i in values ) {
		select.prepend('<option value="' + i + '"' + checked + '>' + values[i] + '</option>');		
	} //FOR each value

	// Styling input back again
	styleDialog(select.parent());

	return false;
} //FUNC selectAddItem

/** //** ----= inputClassString	 =----------------------------------------------\**//** \
*
* 	Takes source element, and type classes. Prepares full class and style attributes.
*
* 	@param	object	el		- Source input jQuery object.
* 	@param	string	typeClass	- Additional classes to add.
* 	@return	string			- Attributes to add to element.
		bool			- FALSE if no modification necessary.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function inputClassString(el, typeClass) {

	// If already styled - nothing to do again
	if ( el.hasClass('mw') ) return false;

	// Saving source to allow fast unstyle
	el.data('source', getOuterHTML( el.get(0) ));

	// Getting existing attributes
	var cls		= el.attr('class');
	
	// Getting other transferrable attributes
	var $attr	= {'class' : ''};
	var $aList	= ['style', 'size', 'data-prefix', 'data-suffix'];
	for ( var $i in $aList ) 
		$attr[ $aList[$i] ] = el.attr($aList[$i]);

	var styles	= el.attr('style');
		
	// Composing classes
	var ctmp	= ['mwInput', typeClass, cls];
	
	var name	= el.attr('name');
	if ( name ) {
		name	= name.replace(/[\[\]]/g, '');
		ctmp.push('name-'+name);
	} //IF name
	
	// Storing class as attribute
	$attr['class'] = ctmp.join(' ').trim();

	// Processing results
	var $res = '';
	for ( var $i in $attr ) 
		if ( !isEmpty($attr[$i]) )
			$res += ' '+$i+'="'+$attr[$i]+'"';

	// Cleaning source attributes
	el[0].className = '';
	
	for ( var $i in $aList ) 
		el.removeAttr($aList[$i]);

	// Adding styled marker
	el.addClass('mw');
	
	return $res;
} //FUNC inputClassString

/** //** ----= styleDialog	 =----------------------------------------------\**//** \
*
* 	Applies style to all inputs childs to specified element.
*
* 	@param	MIXED	el	- Valid jQuery element selector.
* 	@return	bool		- Always FALSE.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function styleDialog ( dialog ) {

	dialog = _jq(dialog);

// ---- TEXT ---- 
	
	dialog.find('INPUT[type=text], INPUT[type=search], INPUT[type=password], INPUT[type=email], INPUT[type=date], INPUT[type=number], INPUT[type=tel], INPUT[type=url]').each( function () {
		
		var el		= jQuery(this);
		
		// Cleaning errors state on load
		//el.closest('.mwInput').removeClass('Error');
		
		// Checking if some of subcontrol classes are set and reading sub class
		var subs = false;
		var $sClass = ['plus', 'go', 'ok'];
		for ( var $i in $sClass )
			if ( el.is('.'+$sClass[$i]) )
				subs = $sClass[$i];
		
		// Compatabilty with renamed sub
		if ( subs == 'go' )
			subs = 'ok';
		
		var tclass	= 'text';
		if ( subs ) tclass += ' wSub';
		
		var attr	= inputClassString(el, tclass);
		if ( !attr ) return;

		var wrap = jQuery('<div ' + attr + '></div>');
		el.wrapAll(wrap);

		// Researching wrap
		wrap = el.closest('.mwInput');

		// Adding some common subcontrols if set
		if ( subs ) {
			
			var sub		= jQuery('<div class="subcontrol button hi icon light '+ subs+'"></div>').insertBefore(el);
			var click	= el.attr('onclick');
			
			if ( click )
				sub.attr('onclick', click);
			
			el.removeAttr('onclick');
		} //IF is Plus

		// Initiating date picker
		Date.format = 'yyyy-mm-dd';
		if ( wrap.is('.date') ) {
			el.datePicker({
				clickInput	: true, 
				createButton	: false, 
				verticalOffset	: 26,
				startDate	: '2000-01-01'
			});
		} //IF date input

		// Search input is special
		// Then adding icon and subcontrol
		// This allows better compatability than regular search, and finer styles control
		// Skipping manually added icons
		if ( wrap.is('.search:not(.icon)') ) {

			// Adding search icon on left (it's already search, so just adding icon class)
			wrap.addClass('icon left');

			// Padding right is exactly same as left
			wrap.css( 'padding-right', wrap.css('padding-left') );

			// Adding clear subcontrol
			var $sub = jQuery('<div class="subcontrol icon right declined" style="display:none"></div>').appendTo(wrap);

			// Adding change event on input
			el.on('keyup.mwInput.search', function () {
				
				if ( this.value )
					$sub.show();
				else
					$sub.hide();
				
			}); //On change
			
			// Adding clear action
			$sub.on('click.mwInput.search.clear', function () {
				
				el.val('');
				$sub.hide();
				
				el.trigger('keyup');
				
			}); //on click
			

		} //IF search found

		// Ensuring input size for prefix/suffix
		if ( wrap.is('[data-prefix], [data-suffix]') ) {
			
		} //IF pfx

		// Text inputs should select on forcus
		el.focus( function () { this.select() } );


		/*/
		// Adding required check
		if ( wrap.hasClass('required') ) {
			
			el.keyup( function () {
				var e = jQuery(this);
				if ( e.val().trim() ) 
					e.closest('.mwInput').removeClass('Error');
				else
					e.closest('.mwInput').addClass('Error');
			});
			
		} //IF required
		/**/
		
	}); //jQuery each text input
	
// ---- TEXTAREA ---- 
	
	dialog.find('TEXTAREA').not('.mw, .tinyMCE, .mwTinyMCE, .richEdit').each( function () {
		var $el = jQuery(this);
		
		$el.addClass('multiline');
		
		var $attr = inputClassString($el, 'textarea');
		if ( !$attr ) return;

		$el.wrapAll('<div ' + $attr + '></div>');

		// Researching wrapper
		var $wrap	= $el.parent();

		// 100% size inputs are marked with class instead
		// and triggers default size for fallbacks
		if ( $wrap.attr('size') == '100%' )
			$wrap.addClass('fullHeight').removeAttr('size');

		// Adding default height
		if ( !$wrap.attr('size') )
			$wrap.attr('size', '3');

	}); //jQuery each textarea input

	dialog.find('TEXTAREA.richEdit').not('.mw').each( function () {
		
		// Doing nothing if no tinyMCE defined on page
		// No fallbacks, as developer should see that smth went wrong
		if ( typeof(tinyMCE) == 'undefined' )
			return; 
		
		var el = jQuery(this);

		el.addClass('multiline');
		
		// Marking element as initiated
		el.addClass('mw');

		// 100% size inputs are marked with class instead
		// and triggers default size for fallbacks
		if ( el.attr('size') == '100%' )
			el.addClass('fullHeight').removeAttr('size');

		// Adding default height
		if ( !el.attr('size') )
			el.attr('size', '5');
	
		// Giving it small delay, to let freshly loaded windows to cool a bit.
		setTimeout( function () {
			mwTinyMCE().init(el);
		}, 10);
		
	}); //jQuery each textarea input
	
// ---- BUTTONS ---- 
	
//	dialog.find('BUTTON, INPUT[type=button], INPUT[type=submit]').each( function () {
	dialog.find('INPUT[type=button], INPUT[type=submit]').each( function () {

		var el = jQuery(this);
		
		// Quickly skipping tinyMCE buttons
		// Bit dirty, but tiny is supported natively
		// ToDo: init styles from original input instead (would come naturally once proper mwForms are implemented)
		if ( el.parent().is('.mce-btn') )
			return;

		var attr = inputClassString(el, 'button');
		if ( !attr ) return;

		el.wrapAll('<div ' + attr + '></div>');
		
		// Sumulating active for parent
		el
			.bind('mousedown', function () {
				jQuery(this).parent().addClass('active');
			}) //FUNC onMouseDown
			.bind('mouseup', function () {
				jQuery(this).parent().removeClass('active');
			}) //FUNC onMouseUp
		; //jQuery element
	}); //jQuery each textarea input

	dialog.find('INPUT[type=image]').each( function () {
		var el = jQuery(this);
		
		var attr = inputClassString(el, 'button image');
		if ( !attr ) return;

		el.wrapAll('<div ' + attr + '></div>');
		
		// Sumulating active for parent
		el
			.bind('mousedown', function () {
				jQuery(this).parent().addClass('active');
			}) //FUNC onMouseDown
			.bind('mouseup', function () {
				jQuery(this).parent().removeClass('active');
			}) //FUNC onMouseUp
		; //jQuery element
	}); //jQuery each textarea input
	
// ---- SELECT ---- 
	
	dialog.find('SELECT').not('.checkList, .radioList, .browseButton, .selectEx').each( function () {
		var el = jQuery(this);
		
		if ( el.is('SELECT[multiple], SELECT[size]') ) {

			el.addClass('multiline');

			var attr = inputClassString(el, 'multiple');
			if ( !attr ) return;
	
			el.wrapAll('<div ' + attr + '></div>');

			// Researching wrapper
			var $wrap	= el.parent();
	
			// 100% size inputs are marked with class instead
			// and triggers default size for fallbacks
			if ( $wrap.attr('size') == '100%' )
				$wrap.addClass('fullHeight').removeAttr('size');

			// Adding default height
			if ( !$wrap.attr('size') )
				$wrap.attr('size', '3');
			
		} //IF multiselect
		else {
			
			var nowidth = el.hasClass('nowidth');
			
			var attr = inputClassString(el, 'select');
			if ( !attr ) return;
	
		// ---- Calculating selector min width ----
	
			var width = '';
	
			if ( !nowidth ) {
				var tmp = el.clone();
				tmp.appendTo('BODY');
				width = tmp.width() + 30;
				tmp.remove();
				
				width = ' style="min-width : ' + width + 'px"';
			} //IF need width 
			
			el.wrapAll('<div ' + attr + '></div>');
			el.addClass('hidden');
			
			var val = el.find('OPTION:selected').text();
			
			el.before('<div class="subcontrol icon gray dropdown"></div>');
			el.before('<div class="value"' + width + '>' + val + '</div>');
	
			el.on('change update', function () {
				el.prev('.value').html( el.find('OPTION:selected').text() );
			}); //jQuery onChange

		} //IF regular select

	}); //jQuery each select input

/**/
// ---- CHECKLIST and RADIOLIST ---- 

//	dialog.find('SELECT.checkList, SELECT.radioList').not('.old').each( function () {
	dialog.find('SELECT.checkList.new, SELECT.radioList.new').each( function () {
		
		var $input	= jQuery(this);

	// ---- Defaults -----

		// Checklist forces multiselect
		if ( $input.is('.checkList') )
			$input.attr('multiple', 'multiple');

		// Adding default height
		if ( !$input.attr('size') ) {
			
			if ( $input.is('[multiple], .checkList, .radioList') )
				$input.attr('size', '5');
			else
				$input.attr('size', '1');
			
			// For mobiles - size is always 1
			if ( $input.is('.noMobile') && isTouchScreen() ) 
				$input.attr('size', '1');
				
		} //IF autodeciding on size

		// Preparing attributes
		var $attr	= inputClassString($input, '');
		if ( !$attr ) return;

	// ---- Creating container element ----
	
		$input.wrapAll('<div ' + $attr + '></div>');
		
		// Researching wrapper, for later use
		var $wrap	= $input.parent();

		// Flagging input type: inline/multiline
		if ( $wrap.attr('size') != '1' )
			$wrap.addClass('multiline');

		// 100% size inputs are marked with class instead
		// and triggers default size for fallbacks
		if ( $wrap.attr('size') == '100%' )
			$wrap.addClass('fullHeight').removeAttr('size');

	// ---- Model ----
		
		// Initiating selector model
		var $select = $input.mwSelectInput();
		
	}); //jQuery each morweb selector input

	dialog.find('SELECT.checkList, SELECT.radioList').not('.new').each( function () {
//	dialog.find('SELECT.checkList.old, SELECT.radioList.old').each( function () {

		var sel = jQuery(this);

		sel.addClass('multiline');
		
		if ( sel.is('.checkList') )
			sel.attr('multiple', 'multiple');
		
		var attr = inputClassString(sel, 'list');
		if ( !attr ) return;

	// ---- Creating container and subcontainer elements ----
	
		var el		= jQuery('<div ' + attr + '><div class="list"></div></div>');
		var items	= el.find('.list');

		// 100% size inputs are marked with class instead
		// and triggers default size for fallbacks
		if ( el.attr('size') == '100%' )
			el.addClass('fullHeight').removeAttr('size');

		// Adding default height
		if ( !el.attr('size') )
			el.attr('size', '5');

	// ---- Saving source ----
	
		// Selector itself will be replaced, so we need to save source in separate hidden element which will not affect nothing
		
		var source_data	= sel.data('source');
		
		var source	= jQuery('<input type="hidden" class="mw">');
		source.data('source', source_data);
		source.appendTo(el);

	// ---- Transferring hint ----
	
		var hint	= sel.attr('hint');
		if ( hint )
			items.attr('hint', hint);

	// ---- Composing common attributes ----

		var radio	= el.hasClass('radioList'); 
		var name	= sel.attr('name');
		
		// Checkboxes should be arrays
		// Not doing for selects that alrady had this
		if ( !radio && name && !name.endsWith('[]') )
			name += '[]';
		
		// Input type
		var type = ( radio )? 'radio' : 'checkbox';
		
	// ---- Processing sub controls ----		

		sel.find('OPTION').each( function () {
		
			var op		= jQuery(this);
			var title	= op.html();

		// ---- Parsing title for special things ----

			// Column		
			var col		= '';
			var d		= title.indexOf('|');
			if ( d >= 0 ) {
				col = title.substr(d + 1);
				title = title.substr(0, d) + '<div class="col">' + col + '</div>';
			} //IF divider come
			
			var $icon	= op.attr('data-icon');
			if ( $icon )
				$icon = '<div class="icon" style="background-image: url(' + $icon + ');"></div>';				


			// Value/checked
			var val		= op.val();
			var checked	= op.attr('selected'); 

			title		= $icon + '<div class="title">' + title + '</div>';			

			var titem	= jQuery(title);

			var input	= jQuery('<input type="' + type + '" class="meta" name="' + name + '" value="' + val + '" />');
			if ( checked ) input.attr('checked', 'checked');

			// Setting up actions
			var actions	= ['onclick', 'onchange', 'ondblclick']; 
			for ( var i in actions )
				input.attr(actions[i], sel.attr(actions[i]) );
			  
			input.change( function () {
				
				var check = this.checked;
				
				var el = jQuery(this);
				
				if ( check ) {
					el.parent().addClass('selected icon hi left');
				} else { //IF checked
					el.parent().removeClass('selected icon hi left')	
				} //IF not checked
		
				if ( this.type == 'radio') {
					if ( this.checked ) {
						jQuery(this)
							.parents('.mwInput.list')				// Searching parent container
							.find('INPUT[type="radio"][name="' + this.name + '"]')	// Searching all items
							.not(this)						// Excluding self
							.each( function () {					// Triggering change on each
								jQuery(this).change();
							}); //each radio
					} //IF got cheked state
				} //IF radio
		
			}); //jQuery onChange

			var $itemClass	= 'item';
			var $itemStyle	= '';

			if ( checked ) $itemClass+=' selected icon hi left';
/*/
			var $src	= op.attr('data-icon');
			if ( $src ) {
				$itemClass += ' icon';
				$itemStyle = 'background-image: url(' + $src + ');';
			} //IF class
/**/
			
			$itemClass = $itemClass ? ' class="' + $itemClass + '"' : '';
			$itemStyle = $itemStyle ? ' style="' + $itemStyle + '"' : '';

			var item	= jQuery('<div' + $itemClass + $itemStyle + '></div>');
			item.append(titem).append(input);
			
			item.appendTo(items);
		}); //jQuery each option

		sel.replaceWith(el);
	}); //jQuery each multiselect input

	// ---- CHECKBOX and RADIO ---- 
	
	dialog.find('INPUT[type="checkbox"], INPUT[type="radio"]').not('.meta').each( function () {

		var el		= jQuery(this);
		
		// Checking if custom titles are set
		var custom	= el.attr('cap');
		
		var attr = inputClassString(el, 'checkbox' + ((custom)? ' custom' : ''));
		if ( !attr ) return;

// ---- Processing custom titles ----	
		
		// Webkit browsers require smth to have inside to propertly align, so setting nbsp as default
		var on		= '&nbsp;';
		var off		= '&nbsp;';
		
		if ( custom ) {
			
		//	el.removeAttr('cap');
	
			custom = custom.split('|');
	
			var on	= custom[0];
			var off	= (custom[1])? custom[1] : custom[0];
		
		} //IF title set

	// ---- Wrapping layout structure ----
		
		el.wrapAll('<div ' + attr + '></div>');
		el.addClass('hidden');

		el.before('<div class="icon hi left">_</div>');
				
	// ---- Applying change function ----	
	
		el.change( function () {
			
			var check = this.checked;
			
			if ( check ) {
				el.parent().addClass('checked');
				el.prev().html(on).addClass('selected');
				el.addClass('checked');
			} else { //IF checked
				el.parent().removeClass('checked')	
				el.prev().html(off).removeClass('selected');
				el.removeClass('checked');
			} //IF not checked

		}); //jQuery onChange

		// Initiating first time
		el.change();

	// ---- Radio buttins refresh fix ----	
		
		if ( this.type == 'radio' ) {
			
			el.change( function () {

				var radio = jQuery(this);

				if ( this.checked ) {
					
					// Searching neighbours via closest parent form. Fastest way. Usually there is form around.
					radio.closest('FORM')
						.find('INPUT[type="radio"][name="' + this.name + '"].checked')
							.not(this).change();
					
				} //IF got cheked state
				
			}); //jQuery onChange
			
		} //IF radio button

	}); //jQuery each checbox and radio input

// ---- FILES ---- 
	
	dialog.find('INPUT[type=file]').each( function () {
		var el = jQuery(this);
		
		var attr = inputClassString(el, 'file');
		if ( !attr ) return;
		
		// Detecting SN if set, and applying it as uBar
		var fid = el.attr('sn') || '';
		
		if ( fid )
			fid = ' uBar_' + fid;

		// Detecting value is present, and using as visual title
		var title = el.attr('value') || el.attr('src') || el.attr('img') || el.attr('cap') || 'Select File...';
		
		el.wrapAll('<div ' + attr + '></div>');

		el.before('<div class="subcontrol hi fill progressFill' + fid + '"></div>');
		el.before('<div class="fileName">' + title + '</div>');
		el.before('<div class="num progressNum' + fid + '">&nbsp;</div>');
		el.before('<div class="subcontrol button icon upload"><div></div></div>');

		el.change( function () {
			var file = fileName(this.value);
			if ( !file ) file = el.attr('cap') || 'Select File...';
			
			jQuery(this).parent().find('.fileName').html( file );
		}); //jQuery onChange

	}); //jQuery each select input

// ---- BROWSER ---- 

	dialog.find('SELECT.selectEx').each( function () {

		var $el = jQuery(this);

		$el.addClass('multiline');
		
		var $attr = inputClassString($el, '');
		if ( !$attr ) return;

	// ---- Creating container element ----
	
		$el.wrapAll('<div ' + $attr + '></div>');
		
		// Researching wrapper, for later use
		var $wrap	= $el.parent();

		// 100% size inputs are marked with class instead
		// and triggers default size for fallbacks
		if ( $wrap.attr('size') == '100%' )
			$wrap.addClass('fullHeight').removeAttr('size');

		// Adding default height
		if ( !$wrap.attr('size') )
			$wrap.attr('size', '6');

	// ---- Options ----
	
		var $o	= { 
			inline : $wrap.is('.inline') 
		}; //$o
		
		if ( $el.data('title') )
			$o.title = $el.data('title'); 
			
		// Initiating selector
		// Checking inline mode by resulitng wrapper class
		var $sx = mwSelectEx($el, $o);
		
		$el.data('selectEx', $sx);
		
	}); //jQuery.each select

// ---- COMMON ----
	
	// Tracking hovers/focus via java and classes to have extra styling options.
	// Unfortunately have to exclude few inputs

	dialog.find('.mwInput').each( function () {
		
		var $el = jQuery(this);
		
		// Hover
		$el
			.off('mouseenter.mwInput') 
			.on('mouseenter.mwInput', function () {
				$el.addClass('hover');

				if ( $el.parent().is('.combo') )
					$el.parent().addClass('hover');

			}) //FUNC hoverin

			.off('mouseleave.mwInput')
			.on('mouseleave.mwInput', function () {
				$el.removeClass('hover');

				if ( $el.parent().is('.combo') )
					$el.parent().removeClass('hover');

			}) //FUNC hoverout
		; //$el  

		$el.not('.selectEx')
			.off('focusin.mwInput') 
			.on('focusin.mwInput', function () {
				$el.addClass('focus');

				if ( $el.parent().is('.combo') )
					$el.parent().addClass('focus');
			}) //FUNC hoverout

			.off('focusout.mwInput')
			.on('focusout.mwInput', function () {
				$el.removeClass('focus');

				if ( $el.parent().is('.combo') )
					$el.parent().removeClass('focus');
			}) //FUNC hoverout
		; //$el  
		
	}); //jQuery.each input

	return false;	
} //FUNC styleDialog

/** //** ----= unstyleInput	 =----------------------------------------------\**//** \
*
* 	Removes styles from input given.
*
* 	@param	jQuery	input	- Valid jQuery input element selector.
* 	@return	jQuery		- New input element.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function unstyleInput ( input ) {

	// All styled inputs have .mw class.
	// Source is stored under jQuery's .data().
	input = _jq(input);
	
	// Making sure that we are pointing to input itself
/*/
	if ( !input.is('.mw') )
		input = input.find('.mw');
	
	var source	= input.data('source');
/*/
	var source	= input.find('.mw').data('source');
/**/

	if ( source ) {
		source = jQuery(source);
		input.replaceWith(source);
		return source;
	} //IF source was stored
		
	return input;
} //FUNC unstyleInput

/** //** ----= unstyleDialog	 =----------------------------------------------\**//** \
*
* 	Removes styles from inputs in given element.
*
* 	@param	MIXED	el	- Valid jQuery element selector.
* 	@return	bool		- Always FALSE.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function unstyleDialog ( dialog ) {

	// All styled inputs have .mw class.
	// Source is stored under jQuery's .data().
	dialog.find('.mw').each( function () {
		
		var el		= jQuery(this);
		
		var source	= el.data('source');

		if ( source )
			el.closest('.mwInput', dialog).replaceWith(source);
		
	}); //jQuery each .mw 
	
	return false;
} //FUNC unstyleDialog

function setValidations (dialog, validations) {
	
	if ( !dialog )
		return;
	
	dialog.find('INPUT, SELECT, TEXTAREA')
		.each( function () {
			
			// Shortcuts to input and it's parent (morweb forms)
			var input	= jQuery(this);
			var parent	= input.closest('.mwInput');
			if ( !parent.length )
				parent = input;
			
			// Input should have name to be validatable
			var name	= input.attr('name');
			if ( !name ) return; 
			
			// Shortcut to messages array to simplify code
			var msgs	= validations[name];

			// Might be complex input name, so checking for that
			if ( isUndefined(msgs) ) {
			
				// Splitting name to parts
				// Safe to do event if it's not complext - will end up with same name
				var $tmp	= name.split(/\[|\]/);
				
				// Clearing empties
			//	$tmp		= $tmp.filter(n => n);
				$tmp		= $tmp.filter(Boolean);
				
				// Finally - using last element
				name		= $tmp.slice(-1)[0];
				msgs		= validations[name];
				
			} //IF nothing found

			// TinyMCE support
			// Marking tinyEditor instead of input itself
			if ( input.is('.mwTinyMCE') ) {

				// If it's tinyMCE input - there should be sibling mceEditor input
				input	= input.siblings('.mceEditor');
				parent	= input;
				
				// If none - smth went wrong
				if ( !input.length )
					return;
		 	} //IF tinyMCE input
			
			// Removing errors attribute if no messages
			if ( !msgs ) {
				
				input.removeAttr('error');
				
				// Class for parent
				parent.removeClass('error');								

				return;									
			} //IF no messages
			
			// Compiling messages, very simple br can be stored inside attribute
			var msg = implode('<br />', msgs);

			// Setting error
			input.attr('error', msg);								

			// Class for parent
			parent.addClass('error');								
			
		}); //jQuery.each.callback
	
	return;
} //FUNC setValidations

/** //** ----= 	fillViews	 =----------------------------------------------\**//** \
*
* 	Fills fileds views within specified element.
*
*	@param	jQuery	el	- Context element.
*	@param	object	obj	- Data object to pull views from.
*	
* 	@return	bool		- Always FALSE.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function fillViews (el, obj) {

	el = _jq(el);

	for ( var i in obj ) {
		el.find('.view-' + i).html(obj[i]);
	} //FOR each field

	return false;
} //FUNC fillViews