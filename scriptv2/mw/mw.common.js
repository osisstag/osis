/** ************************************************************************************************************************ **\
* 
*	Set of classes and functions that will help generate and process AJAX queries.
* 
* 	@package	VIT-Lib
* 	@subpackage	Ajax
*
* 	@license	MIT License
*			Permission  is  hereby  granted,  free  of  charge, to any person obtaining a copy of this software and
*			associated documentation files (the "Software"), to deal in the Software without restriction, including
*			without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*			copies  of  the  Software, and to permit persons to whom the Software is furnished to do so, subject to
*			the following conditions:
*			
*			The  above  copyright  notice and this permission notice shall be included in all copies or substantial
*			portions of the Software.
*			
*			THE  SOFTWARE  IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
*			LIMITED  TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
*			NO  EVENT  SHALL  THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
*			WHETHER  IN  AN  ACTION  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
*			SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
*	@author		Victor Denisenkov aka Mr.V!T
*	@copyright	Copyright (c) 2008 - 2012 Victor Denisenkov aka Mr.V!T
*	@version	1.0
* 
\** ************************************************************************************************************************ **/

/** //** ----= OBJECT vAjax	=--------------------------------------------------------------------------------------\**//** \
*
* 	Ajax procesing object. Implements both jQuery common ajax and ajaxUpload plugin for iframe upload tricks (for old 
*	browsers). Designed to use together with server side vAjax object. Supports POST progress monitoring using server 
*	side plugins like APC or HTML5 files API. By default enables progress monitoring for forms with files and progressbar 
*	present.
*
* 	@package	VIT-Lib
* 	@subpackage	Ajax
* 	@category	Helper
*
*	@param	string	url		- Path to controller to make request to.
*
*	@param	MIXED	[data]		- Data to post on request. Can be DOM form, HTML5 FormData object, jQuery selector 
*					  or object which points to form, or plain object with parameters.
*
*	@param	object	[options]	- Additional options if necessary.
*
*	@todo	Known bug: ajaxUpload can't handle server errors. Need workaround (possible write own iframe upload?)
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/

// ToDo: Cross domain support with both JSONP and Access-Control-Allow-Origin: *

function vAjax (url, data, options) {

	// Creating basic object with events assigned
	var obj = vEventObject(['success', 'error', 'start', 'stop', 'done', 'progressStart', 'progressStop'], {
	
	opt		: {				// Default object options
		simple			: false,		// Expect simple answers and threat them as success or trigger errors on those.
		modern			: true,			// Allow or not modern APIs

		progress		: '.progressFill',	// Default progressbar fill element selector. Can be replaced with callback or own selector.
		progressNum		: '.progressNum',	// Default progressbar Numeric indicator. Will be set to current %. Ignored if callback given for fill.
		progressOn		: false,		// Forces progress monitoring (not used currently).

		progressUrl		: '/upload/?key=',	// Progress monitoring controller. Key marker will be added to end of this.
		progressDelay		: 500,			// Delay before starting progress monitoring using server side plugin.
		progressInterval	: 500			// Interval to update progress.
	}, //OBJECT options
	
	resSplit	: "-=-CUT-=-",			// Unique marker used to split results.

	controller	: url,				// Url to make request to.
	source		: data || {},			// Source given.

	sourceForm	: false,			// Source form if available.
	sourceData	: {},				// Source data if available (if form given - will contain form inputs as array).
	sourceElement	: false,			// Source form as jQuery pointer.
	
	isModern	: false,			// HMTL5 usage marker. Will be set to TRUE if system decides to use HTML5 
							// formData and XHR2 to post data

	Method		: '',				// Will store used upload method.
	
							
	prgInterval	: false,			// Progress bar monitor interval resource
	prgTimeout	: false,			// Progress bar monitoring timeout resource
	
	_processor	: false,			// Stores custom XHR processor if specified. 
	
	/** //** ----= options	=--------------------------------------------------------------------------------------\**//** \
	*
	* 	Used to setup options on run time.
	*
	*	@param	object	options	- Data object with options to setup.
	* 
	*	@return SELF
	* 
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	options	: function (options) {
		
		options = options || {};

		// Merging options
		jQuery.extend(this.opt, options);

		// Testing browser to be modern
		this.isModern = this.opt.modern && isXHR2();
		
		return this;
	}, //FUNC options

	/** //** ----= processor	=------------------------------------------------------------------------------\**//** \
	*
	* 	Custom processor is used to use external ajax xhr implementation. vAjax is passed as parameter to processor to 
	*	allow implementation of final events. Processor should call .ajaxSuccess() / .ajaxError() for appropiate events.
	*
	*	@param	function	proc	- Processor callback.
	* 
	*	@return SELF
	* 
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	processor	: function ( proc ) {
		this._processor = proc;
		return this;		
	}, //FUNC processor
	
	/** //** ----= parseResult	=------------------------------------------------------------------------------\**//** \
	*
	* 	Prses and format result data. Generates result to pass to callbacks. For internal use.
	*
	* 	@param	object	result		- Request responce.
	* 
	*	@return	object			- Object with result data.
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	parseResult	: function (result) {

		var self = this;
		
		// Making sure that result have all vields
		if ( !result.responseText )
			result.responseText = '';

	// ---- Preparing data ----

		// Preparing result wrapper
		var data	= {
			
			req	: self.sourceData,	// Request source data.
			
			status	: {			// Responce meta like status and fields list. Default one for simple responces. Full responce will provide own head.
				major	: (result.statusMinor == 'success'),	// Major operation status TRUE or FALSE. Simples are TRUE normally.
				minor	: result.statusMinor,			// Minor/detailed status as string (like 'success', 'error', 'warning', 'simple' etc)
				code	: result.status,			// Satus code if available
				text	: result.statusText,			// Request status text
				full	: false,				// Full(complex) responce marker
				fields	: []					// Custom responce fileds/types list
			}, //OBJECT meta
			
			res	: ''			// Request basic response - whole simple request, or head/status message for complex response. Will be added with parsing below.
		}; //OBJECT data

		// Trying to split as complex result
		var tmp		= result.responseText.split(this.resSplit);

		// Smth basic will present even for plain responce 
		// (for example in case of server script fatal erorrs).
		// Correcting res to have at least smth
		data.res = tmp[0] || '';
		
		// Determinig wether result was full(complex) or simple
		data.status.full	= tmp.length > 1;

	// ---- Simple result ----

		// If got simple result (either error or success)
		if ( !data.status.full ) {

			// Updating status
			data.status.major = data.status.major ? this.opt.simple : data.status.major;
			data.status.minor = 'simple';
			
			// If simple is threating as error - filling result as status text (expecting server errors)
			if ( !this.opt.simple && !data.status.text )
				data.status.text = data.res;

			// Running callbacks
	
			// We are done anyway, so triggering stop event, passing self as param
			this.stop(data, this);
	
			// Error/success
			if ( data.status.major && this.opt.simple ) 
				this.success(data, this);
			else 
				this.error(data, this);
	
			// Both stop and done are called anyway, difference is calling order: stop, success/error, done
			this.done(data, this);

			return data;
		} // If simple

	// ---- Complex result head and fields ----

		// For full responce status - header will go second (after possible debug)
		var head = JSON.parse(tmp[1]);

		// Updating data status, merging existing response with given one
		// Mergin only if no text supplied already (usually errors have text)
		if ( !data.status.text )
			jQuery.extend(data.status, head);

		// Looping through given fields (if present) and decoding them to response
		var di = 2;
		if ( head.fields ) {
			
			for ( var name in head.fields ) {

				// Decoding non scalar values
				if ( !head.fields[name] ) {
					data[name] = JSON.parse(tmp[di]);
				} else { //IF need to decode
					data[name] = tmp[di];
				} //IF no need to decode (scalar)
				
				// Increasing split counter
				di++;
			} //FOR each field
			
		} //IF was fields posted

		// Running callbacks

		// We are done anyway, so triggering stop event, passing self as param
		this.stop(data, this);

		// Error/success
		if ( data.status.major ) 
			this.success(data, this);
		else 
			this.error(data, this);

		// Both stop and done are called anyway, difference is calling order: stop, success/error, done
		this.done(data, this);

		return data;
	}, //FUNC parseResult

// ==== CALLBAKCS ==============================================================================================================

	/** //** ----= ajaxSuccess	=------------------------------------------------------------------------------\**//** \
	*
	* 	Ajax success event callback. For internal use, can be altered though.
	*
	* 	@see	jQuery.ajax callbacks for parameters.
	* 
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	ajaxSuccess	: function (res, status) {

		this.ajaxProgressStop(100);
		
		status = status || 'success';
		
		// Creating result object
		return this.parseResult({
			responseText	: res,
			status		: 0,
			statusText	: '',
			statusMinor	: status
		}); //parseResult.result
		
	}, //FUNC ajaxSuccess
	
	/** //** ----= ajaxError	=------------------------------------------------------------------------------\**//** \
	*
	* 	Ajax Error event callback. For internal use, can be altered though.
	*
	* 	@see	jQuery.ajax callbacks for parameters.
	* 
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	ajaxError	: function (res, status) {

		this.ajaxProgressStop('error');
		
		// Adding minor status to common result		
		res.statusMinor = status;
		
		return this.parseResult(res);
	}, //FUNC ajaxError

	/** //** ----= ajaxXHR	=--------------------------------------------------------------------------------------\**//** \
	*
	* 	Ajax XHR callback. Used to alter jQuery XHR.
	*
	* 	@see	jQuery.ajax callbacks for parameters.
	* 
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	ajaxXHR	: function () {
		
		var self = this;
		
		var x = jQuery.ajaxSettings.xhr();

		// Adding listener only if really needed. If not - xhr goes back untouched
		if ( this.hasProgress() ) {
			
			// If have progress - good place to reset it
			this.ajaxProgressStart();
			
			// We are sure that .upload exists: previously it was tested in .post()
			x.upload.addEventListener('progress', function (e) {

				if ( e.lengthComputable ) {

					// Calculating procents
					var proc = (e.loaded * 100) / e.total;
					
					self.ajaxProgress( Math.floor(proc) );
					
				} //IF there is progress available
				
			}, false);
			
		} //IF need progress monitoring

		return x;
	}, //FUNC ajaxXHR

// ==== Progress ===============================================================================================================

	/** //** ----= getFormElement	=------------------------------------------------------------------------------\**//** \
	*
	* 	For internal use. Checks given parameter as for element. Mainly used for progress indication elements search.
	*
	*	@param	MIXED		- jQuery selector to search.
	*
	*	@return	MIXED		- jQuery element to use as progress element, or FALSE if not applicable. 
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	getFormElement	: function (el) {
		
		// This does not assumes callback functions. Those should be checked outside this and processed separately.
		
		// If already jQuery - only checking length
		if ( isJQ(el) ) {
			if ( el.length > 0 )
				return el;
				
			return false;
		} //IF jQuery given
		
		// If string selector given - searching it within form 
		// Search on form or FALSE, done this way for optimization 
		// and to avoid multiple for updates with common class selectors
		// If user needs global selector search - he still can pass ready jQuery or use callback
		if ( isStr(el) ) {

			// Not allowing selector search outside of form.			
			if ( !this.sourceElement )
				return false;
				
			var j = this.sourceElement.find(el);
		
			// If smth found - we're good to go
			if ( j.length > 0 )
				return j;
			
			return false;
		} //IF string passsed

		// At this point assuming that element is given as DOM element
		// Then just wrapping it with jQuery
		return jQuery(el);

	}, //FUNC getFormElement

	/** //** ----= progress	=--------------------------------------------------------------------------------------\**//** \
	*
	* 	Progress monitoring event. Triggers on progress update event. Can accept either callbacks or valid jQuery 
	*	selectors (string, jQuery or DOMElement). Callbacks will get current precentage as parameter. In case if 
	*	selector given - for progressBar system will set width, for numeric indicator will set .html(). jQuery selectors 
	*	do not process errors or other status updates, though those will be passed into callbacks.  
	*
	*	@param	MIXED	bar[,num]	- Progress bar and numeric bar callbacks or elements to process.
	*
	*	@param	bool	[force]		- Forcing progress event. If set to FALSE system will try to detect if progress 
	*					  monitoring is necessary.
	*	
	*	@return	SELF 
	* 
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	progress	: function (bar, num, force) {
		
		this.opt.progress	= bar;
		this.opt.progressNum	= num;
		
		this.opt.progressOn	= force || false; 	
		
		return this;
	}, //FUNC progress

	/** //** ----= hasProgress	=------------------------------------------------------------------------------\**//** \
	*
	* 	For internal use. Checks if need to even setup progress indication.
	*
	*	@return	MIXED		- jQuery element to use as progress element, or 
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	hasProgress	: function () {
		
		// Nothing to do if nothing is given as progress
		if ( !this.opt.progress && !this.opt.progressNum )
			return false;
		
		// Progress is always enabled for callbacks
		// ToDo: review this behavior, mb add hasFiles for testing.

		// If not callbacks - checking to be jQuery
		if ( !isFunction(this.opt.progress) )
			this.opt.progress = this.getFormElement(this.opt.progress);

		if ( !isFunction(this.opt.progressNum) )
			this.opt.progressNum = this.getFormElement(this.opt.progressNum);

		// Now they are callback, jQuery or just disabled, so fast to check. Enough one of either.
		if ( this.opt.progress || this.opt.progressNum )
			return true;

		return false;
	}, //FUNC hasProgress

	/** //** ----= ajaxProgressStart	=----------------------------------------------------------------------\**//** \
	*
	* 	Resets progress elements if set.
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	ajaxProgressStart	: function (proc) {

		// If jQuery element set for progress - good to show them

		if ( isJQ(this.opt.progress) )
			this.opt.progress.fadeIn();

		if ( isJQ(this.opt.progressNum) )
			this.opt.progressNum.fadeIn();

		this.ajaxProgress(0);
		this.progressStart(0);
		
	}, //FUNC ajaxProgressStart

	/** //** ----= ajaxProgress	=------------------------------------------------------------------------------\**//** \
	*
	* 	Progress event callback. Used on progress monitoring. For internal use, can be altered though.
	*
	*	@param	int	proc - Current progress precentage.	
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	ajaxProgress	: function (proc) {

		// Nothing to do if nothing is given as progress
		if ( !this.opt.progress && !this.opt.progressNum )
			return;

		// For selectors processing only numeric proc 
		// Errors and other mess will be processed in callbacks if necessary

	// ---- Progress bar ----
		
		if ( this.opt.progress ) {
			
			// Can be callback or jQuery at this poing
			if ( isFunction(this.opt.progress) )
				this.opt.progress(proc);
				
			else if ( isNumeric(proc) )
				this.opt.progress.width(proc + '%');
			
		} //IF progress given
			
	// ---- Numeric indicator ----
		
		if ( this.opt.progressNum ) {
			
			// Can be callback or jQuery at this poing
			if ( isFunction(this.opt.progressNum) )
				this.opt.progressNum(proc);
				
			else if ( isNumeric(proc) )
				this.opt.progressNum.html( proc != 0 ? proc + '%' : '');
			
		} //IF progress given
			
	}, //FUNC ajaxProgress

	/** //** ----= ajaxProgressStop	=------------------------------------------------------------------------------\**//** \
	*
	* 	Forces progress monitoring stop.
	*
	*	@param	int	proc - Current progress precentage.	
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	ajaxProgressStop	: function (proc) {

		if ( this.prgInterval )
			clearInterval(this.prgInterval); 

		if ( this.prgTimeout )
			clearInterval(this.prgTimeout); 

		if ( this.hasProgress() )
			this.ajaxProgress(proc);

		this.progressStop(proc);

	}, //FUNC ajaxProgressStop
	
// ==== Processors =============================================================================================================

	/** //** ----= hasFiles	=--------------------------------------------------------------------------------------\**//** \
	*
	* 	Checks if form or data object contains files inputs.
	*
	*	@param	jQuery	form	- Form element to search within.
	*
	*	@return	SELF 
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	hasFiles	: function ($source) {
		
		// If jQuery for form given - just searching for file inputs
		if ( isJQ($source) ) {
			if ( $source.find('INPUT[type=file]').length > 0 )
				return true;
		} //IF form given
		else {
			
			// Non modern browsers can't have files anyway
			if ( !this.isModern )
				return false;
			
			// Looking for files in dataObject
			for ( var $i in $source ) {
				
				// Doing className check in addition, 
				// because of sometimes weird brwosers passing data between windows
				if ( $source[$i] instanceof File || getClassOf($source[$i]) === 'File' )
					return true;
			} 
		} //IF dataObject

		return false;
	}, //FUNC hasFiles

	/** //** ----= postArray	=------------------------------------------------------------------------------\**//** \
	*
	* 	For internal use. Sends data object using common jQuery ajax. Does not supports progress monitoring 
	*	(no reason for arrays).
	*
	*	@return	SELF 
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	postArray	: function () {

		var self	= this;
		
		this.Method	= 'array';
		
		jQuery.ajax({
			type		: 'POST', 
			dataType	: 'text',
			context		: self,
			url		: self.controller,
			data		: self.sourceData,
			success		: self.ajaxSuccess,
			error		: self.ajaxError
		}); //OBJECT jQuery.ajax.settings

		return this;
	}, //FUNC postArray

	/** //** ----= postData	=--------------------------------------------------------------------------------------\**//** \
	*
	* 	For internal use. Sends data using formData object. Optionally uses xhr for progress monitoring.
	*
	*	@return	SELF 
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	postData	: function () {

		var self	= this;
		var post	= false;
		var $form	= this.sourceForm ? _jq(this.sourceForm) : false; 
		var $files	= false;

		// Marking method as data
		this.Method	= 'data';
		
		// Disabling empty files if happen on form
		// Doing this to fix XHR multipart bug in some Safari versions
		// https://bugs.webkit.org/show_bug.cgi?id=184490
		
		if ( $form ) {
			
			// Looking for non disabled file inputs
			$files	= $form.find('input[type="file"]:not([disabled])');
			$files.each( function () {
			
				// Disabling input
				if ( this.files.length == 0 )
					jQuery(this).prop('disabled', true);
				
			}); //each file
			
		} //IF form provided
		
		// Need to generate FormData object
		// Creating FormData from form, if one given
		// Or using one if one come as sourceData
		// Otherwise generating one from dataObject
		
		if ( this.sourceData instanceof FormData ) {
			post = this.sourceData
		} //IF sourceData is FormData
		else if ( this.sourceForm ) {
			post = new FormData(this.sourceForm);
		} //IF form given
		else {
			post = new FormData();
			for ( var $i in this.sourceData )
				post.append($i, this.sourceData[$i]);
		} //IF dataObject given

		// Restoring disabled file inputs (see bugfix above)
		if ( $files )
			$files.prop('disabled', false);

		// Sending ajax using custom XHR
		jQuery.ajax({
			type		: 'POST', 
			dataType	: 'text',
			context		: self,
			url		: self.controller,
			data		: post,
			success		: self.ajaxSuccess,
			error		: self.ajaxError,
			
			// Disablong jQuery headers and source processing
			contentType	: false, 
			processData	: false,
			
			// Adding progress monitoring, upload listener will be added optionally if necessary
			// With function wrapper to have proper this
			xhr		: function () { return self.ajaxXHR() }
		}); //OBJECT jQuery.ajax.settings
		
		return this;
		
	}, //FUNC postData

	/** //** ----= postFrame	=------------------------------------------------------------------------------\**//** \
	*
	* 	For internal use. Sends data using iframe send trick. Used to simulate ajax upload on classic systems. 
	*	Uses ajaxupload jQuery plugin if available. Uses server side progress monitoring if necessary.
	*
	*	@return	SELF 
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	postFrame	: function () {

		var self = this;

		this.Method = 'frame';
		
		if ( !self.sourceForm )
			throw('Source form is not set.');
			
	// ---- Setting up progress ----
	
		// Saving test result, for later reuse
		var prg = this.opt.progressUrl && this.hasProgress(); 
	
		if ( prg ) {
	
			var sn = 'PRG' + randomString();
			
			// Adding additional inputs for monitoring on server side
			this.sourceElement.append('<input type="hidden" name="UPLOAD_IDENTIFIER" value="' + sn + '" />');
			this.sourceElement.append('<input type="hidden" name="APC_UPLOAD_PROGRESS" value="' + sn + '" />');
			
			// Resetting filler
			this.ajaxProgressStart();
			
		} //IF progress is set
	
	// ---- Posting ----	
		
		// Saving action and target, cuz ajaxUpload breaks them	sometimes	
		var action = this.sourceForm.action;
		var target = this.sourceForm.target;

		jQuery.ajaxUpload ({
			type		: 'POST', 
			dataType	: 'text',
			url		: self.controller,
			secureuri	: false,
			uploadform	: self.sourceForm,
			// Simulating context with wrappers
			success		: function ( res, status ) { self.ajaxSuccess(res, status) },
			error		: function ( res, status ) { self.ajaxError(res, status) }
		}); //AJAX
		
	// ---- Monitoring progress ----	

		if ( prg ) {
			
			// Bar should start progressing with additional delay, to do not overflow on small files
			self.prgTimeout = setTimeout( function () { 
				
				// Adding check timer
				self.prgInterval = setInterval( function() {
					
					jQuery.get(self.opt.progressUrl + sn, {}, function(data) {

						self.ajaxProgress(data, self);

						// If got 100 or error - stopping timer
						if ( data == '100' || !isNumeric(data) ) {
							clearInterval(self.prgInterval);
						} //IF done

					}); //FUNC jQuery.get.callback
					
				}, self.opt.progressInterval); //FUNC setInterval.callback
			}, self.opt.progressDelay);  //FUNC setTimeout.callback
			
			// Cleaning progress inputs
			this.sourceElement.find('INPUT[name="APC_UPLOAD_PROGRESS"], INPUT[name="UPLOAD_IDENTIFIER"]').remove();
		} //IF progress set
		
	// ---- Cleaning form ----
		
		this.sourceForm.action = action;
		this.sourceForm.target = target;
		
		return this;
	}, //FUNC postFrame

	/** //** ----= post	=--------------------------------------------------------------------------------------\**//** \
	*
	* 	Fires request with settings given.
	*
	*	@return	SELF
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	post	: function () {

	// ---- Checking source ----

		var source 		= this.source;		// Just shortcut
		
		// Making sure that there is smth meaningfull
		if ( !source )
			source = {};

		// Restting sources
		this.sourceElement	= false;		// jQuery pointer to form element	
		this.sourceForm		= false;		// DOM form element
		this.sourceData		= source;		// By default assuming data object or formData

		// Converting jQuery selector to jQuery
		if ( typeof this.source == 'string' )
			source = jQuery(this.source);
			
		// Getting DOM form from jQuery
		if ( source instanceof jQuery ) {
			
			if ( source.length < 1 )
				throw('Source form is not found.');
			
			// Saving jQuery
			this.sourceElement = source;
			source = source.get(0);
		} //IF got jQuery

		// At this step source should be either DOM form or data object
		// Checking it and setting sources
		// ToDo: tricky check for DOM form, improove
		if ( source.elements ) {
	
			// Trying to correct url using form action
			if ( !this.controller )
				this.controller = source.action; 
			
			this.sourceForm = source;
			
			// Serializing form as array anyway for callbacks
			this.sourceData = formToArray(source);

			// Adding jQuery if not already there
			if ( !this.sourceElement )
				this.sourceElement = jQuery(source);
			
		} //If got form

	// ---- Testing environment ----

		// If still no controller (even after from action correction) - nothing to do
		if ( !this.controller )
			throw('Destination url is not set.');

	// ---- Selecting method and sending ----
	
		// Triggering start event, passing self as param
		this.start(this);
	
		// In most cases postData will be used
		// Only reason to use tricky frame ajaxUpload is in old browser 
		// and files really present on form
		// Of course if ajaxUpload is available
		// So checking it in complexity order i.e. easyer checks goes first 

		// Checking if custom processor is given
		if ( isFunction(this._processor) ) {
			this._processor(this);
			return this;
		} //IF custom processor

		// Form data is always served with postData
		if ( this.isModern && this.sourceData instanceof FormData )
			return this.postData();

		// If form or files were not given uploading with common jQuery
		// Non modern browser can't have files anyway
		if ( !this.sourceForm && !this.hasFiles(this.sourceData) )
			return this.postArray();

		// If modern - using formData for all other cases
		if ( this.isModern )
			return this.postData();

		// If form is not for files, and modern uploading is not available - uploading as array
		if ( this.sourceForm.enctype != 'multipart/form-data' ) 
			return this.postArray();

		// Now looking for files on form (last chance to not use .postFrame() )
		if ( !this.hasFiles(this.sourceElement) )
			return this.postArray();

		// Finally we tried everything, have to use ajaxUpload
		// Testing if ajaxUpload even exists first
		if ( !isSet(jQuery.ajaxUpload) )
			throw('Can\'t upload files with ajax on this browser.');

		return this.postFrame();
	} //FUNC post

	}); //OBJECT vAjax
	
	// Setting options on startup
	obj.options(options);
	
	return obj;

} //CONSTRUCTOR vAjax

// #### DEPRECATED #############################################################################################################

var ajaxReturn = function (status_place, destination) {
	if (status_place) this.statusPlace = status_place;
	if (destination) this.controller = destination;
} //CONSTRUCTOR ajaxReturn

ajaxReturn.prototype = {
	controller	: '',
	post		: {},
	ModalDialog	: '',
	ModalLoader	: '',
	statusPlace	: '',
	
	onSuccess	: function (data) {},
	onError		: function (data) {},
	onFail		: function (data) {},
	onSimple	: function (data) {},
	onStart		: function () {},
	onStatus	: function (html) {},
	onProgress	: function (proc) {},
	
	parseResult	: function (result) {

		var res		= {};
		res._post	= this.post;

		var data		= result.split('-=-CUT-=-');
		res._message	= data[0];
		if ( !res._message ) res._message = '';
		
		res._fullhead	= data.length != 1;
		
		if (res._fullhead) {
			var head		= JSON.parse(data[1]);
			res._major	= head.major;
			res._minor	= head.minor;
			res._status	= head.minor;
			res._fields	= head.fields;
//			res.data	= [];
			var di = 2;
			if ( res._fields.length != 0 ) {
				for (i = 0; i < res._fields.length; i++) {
					res[res._fields[i]] = data[di];
					di++;
				} //FOR each field
			} //IF was fields posted
		} //IF was full result
		return res;
	},//FUNC parseResult

	/*--------------------------------------------------------------------------------*\
	|	DoStatus
	|----------------------------------------------------------------------------------
	| Updates status.
	| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	|	Params:
	|		message		string		- Status message to display.
	|		callback	funciton	- Funciton to call.
	|		data		MIXED		- Data to pass to callback function.
	|	Return:
	|				bool		- ALways FALSE.
	\*--------------------------------------------------------------= by Mr.V!T =-----*/
	DoStatus	: function (message, callback, data) {
		
		if ( this.statusPlace && message ) jQuery('#'+this.statusPlace).html( status_string(message) );
		
		if ( callback instanceof Function ) callback(data);
		
		this.doModals('finish');
		
		return false;
	}, //FUNC DoStatus

	ajax_success	:  function (res) {
		var data = this.parseResult(res);
		
		if (this.statusPlace) jQuery('#'+this.statusPlace).html(data._message);
		
		var cb = this.onSimple;
		if ( data._fullhead ) 
			cb = ( data._major )? this.onSuccess : this.onError;
		
		this.DoStatus('', cb, data);
		
	}, //FUNC sucess

	ajax_error	: function (message, res) {
		
		this.DoStatus(message, this.onFail, res);
		
	}, //FUNC error

	postForm	: function (form_id) {
		var _ar = this;
		
		if (!_ar.controller) return this.DoStatus('Invalid destination. Aborting.');
		
		if ( !form_id ) return this.postData();
		
		var form = (form_id.elements)? form_id : document.getElementById(form_id);
		if ( !form.elements ) return this.DoStatus('Can\'t find data to POST. Aborting.');
		
		if ( form.enctype != 'multipart/form-data' ) return this.postData( formToArray(form) );

		//if ( _ar.statusPlace ) insert_bar(_ar.statusPlace);
		
		this.doModals('start');
		
		this.onStart();

		var old_action = form.action;

		jQuery.ajaxUpload ({
			type		: 'POST', dataType : 'html',
			url		: _ar.controller,
			secureuri	: false,
			uploadform	: form,
			success		: function (res) {
				_ar.ajax_success(res);
			}, //FUNC success
			error		: function (res, status) {
				_ar.ajax_error(res.statusText, res.responseText);
			} //FUNC error
		}); //AJAX
		
		form.action = old_action;
		form.target = '';
		
		return false;
	}, //FUNC postForm

	postData	: function (post_data) {
		
		if ( !post_data ) post_data = {};
		
	//	post_data = arrayToPost(post_data);
		
		this.post = post_data;
		var _ar = this;

		//if ( _ar.statusPlace ) insert_bar(_ar.statusPlace);
		
		this.doModals('start');
		
		if (!_ar.controller) return this.DoStatus('Invalid destination. Aborting.');

		this.onStart();

		jQuery.ajax({
			type	: 'POST', dataType: 'html',
			url	: _ar.controller,
			data	: post_data,
			success		: function (res) {
				_ar.ajax_success(res);
			}, //FUNC success
			error		: function (res, status) {
				_ar.ajax_error(res.statusText, res.responseText);
			} //FUNC error
		}); //AJAX
		
		return false;
	}, //FUNC postData

	postFormData	: function (post_data) {
		
		this.post	= post_data;
		var _ar		= this;
		var self	= this;

		this.doModals('start');
		
		if (!_ar.controller) return this.DoStatus('Invalid destination. Aborting.');

		this.onStart();

		jQuery.ajax({
			type		: 'POST', dataType: 'html',
			url		: _ar.controller,
			data		: post_data,
			contentType	: false,
			processData	: false,

			success		: function (res) {
				_ar.ajax_success(res);
			}, //FUNC success
			
			error		: function (res,status) {
				_ar.ajax_error(res.statusText, res.responseText);
			}, //FUNC error

			// Attempting to alter xhr to add progress listener			
			xhr		: function() {
				
				var req		= $.ajaxSettings.xhr();
				
				if (req) {
					
					req.upload.addEventListener('progress', function(e) {

						if ( e.lengthComputable ) {
							var proc = (e.loaded * 100) / e.total;
							
							self.onProgress( Math.floor(proc) );
							
						} //IF there is progress available

					}, false); //FUNC XHR.upload.onProgress
				
				} //IF xhr returned
				
				return req;
			} //FUNC xhr
			
		}); //AJAX
		
		return false;
	}, //FUNC postFormData
	
	/*--------------------------------------------------------------------------------*\need
	|	post
	|----------------------------------------------------------------------------------
	| Autoselects best post method and posts source.
	| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	|	Params:
	|		source	MIXED	- Data source.
	|	Return:
	|			bool	- Always FALSE.
	\*--------------------------------------------------------------= by Mr.V!T =-----*/
	post	: function (source) {
		
		if ( typeof source == 'string' ) return this.postForm(source);
		if ( source.elements ) return this.postForm(source);

		if ( source instanceof FormData ) return this.postFormData(source);

		return this.postData(source);
	}, //FUNC post

	/*--------------------------------------------------------------------------------*\
	|	setModals
	|----------------------------------------------------------------------------------
	| Set modal windows parameters.
	| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	|	Params:
	|		dialog	string	- ID of window to use as Dialog.
	|		loader	string	- ID of window to use as loader window.
	|	Return:
	|			SELF
	\*--------------------------------------------------------------= by Mr.V!T =-----*/
	setModals	: function (dialog, loader) {
		
		this.ModalDialog = dialog;
		
		if ( !loader ) return this;
		
		tmp = document.getElementById(loader);
		if ( !tmp ) return this;
		
		this.ModalLoader = loader;
		
		return this;
	}, //FUNC setModals

	/*--------------------------------------------------------------------------------*\
	|	doModals
	|----------------------------------------------------------------------------------
	| Displays or hides modals windows.
	| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	|	Params:
	|		mode	string	- Status mode:
	|				  'start' - Set starting mode.
	|				  *other* - Finished mode.
	|	Return:
	|		NULL
	\*--------------------------------------------------------------= by Mr.V!T =-----*/
	doModals	: function ( mode ) {
		
		if ( mode == 'start' ) {
			if ( this.ModalLoader ) { 
				jQuery('#'+this.ModalDialog).jqm();
				jQuery('#'+this.ModalDialog).jqmHide();
				jqmShowCentered('#'+this.ModalLoader);
			} //IF loader is set
			
			if ( this.ModalDialog && !this.ModalLoader ) jqmShowCentered('#'+this.ModalDialog);
		} else { //IF
			if ( this.ModalLoader ) jQuery('#'+this.ModalLoader).jqmHide();
			if ( this.ModalDialog ) jqmShowCentered('#'+this.ModalDialog);
		} //IF
		
	} //FUNC doModals

} //CLASS ajaxReturn
