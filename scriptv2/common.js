/**********************************************************************************\
 * Set of common java helpers.
 * 
 * The MIT License
 * 
 * Copyright (c) 2008 Victor Denisenkov aka Mr.V!T
 * 
 * Permission  is hereby granted, free of charge, to any person obtaining a copy of
 * this  software  and  associated documentation files (the "Software"), to deal in
 * the  Software  without  restriction,  including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the  Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * 
 * The  above  copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE  SOFTWARE  IS  PROVIDED  "AS  IS",  WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR  A  PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT  HOLDERS  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN  AN  ACTION  OF  CONTRACT,  TORT  OR  OTHERWISE,  ARISING  FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * @package vit-lib
 * @author Victor Denisenkov aka Mr.V!T
 * @version 1.0
\**********************************************************************************/

/** //** ----= escapeHtmlTags	 =----------------------------------------------\**//** \
*
* 	Converts common HTML chars into entities.
*
*	@param	string	str	- HTML code to convert.
*	@return	string		- Escaped HTML.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
var escapeHtmlTags_chars = {
	'&'	: '&amp;',
	'<'	: '&lt;',
	'>'	: '&gt;',
	'"'	: '&quot;',
	"'"	: '&#039;'
} //OBJECT escapeHtmlTags_chars
function escapeHtmlTags(str) {
	
	//If smth wrong given, just returning it back
	if ( typeof(str) !== 'string' ) return str;
	
	return str.replace(/['"&<>]/g, function (c) {
		return escapeHtmlTags_chars[c] || c;
	}); //FUNC string.replace.callback
} //FUNC escapeHtmlTags

function decodeEntities ($str) {
	
	for ( var $i in escapeHtmlTags_chars )
		$str = $str.replace(escapeHtmlTags_chars[$i], $i);
		
	return $str;
} //FUNC decodeEntities

function getUrlHash () {
	return location.hash.replace(/^#/, '');
} //FUNC getUrlHash

/** //** ----= fullURL	=----------------------------------------------------------------------------------------------\**//** \
*
*	Takes any URL and makes it full URL adding host if necesarry.
* 	Uses window.location for host value and autodetected scheme.
*
*	@param		string	$url		- Url to check.
* 	@param		bool	[$https]	- Create https url.
*
*	@return		string			- Full URL
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function fullURL ($url, $https) {

	// Preparing desired shceme
	if ( isUndefined($https) )
		$scheme = window.location.protocol+'//';
	else
		$scheme = ($https) ? 'https://' : 'http://' ;

	// Checking for sceme on string begining
	if ( $url.indexOf($scheme) !== 0 )
		$url = $scheme+window.location.host+'/'+$url.ltrim(' \/');
		
	return $url;
} //FUNC fullURL

/** //** ----= regexMatchAll	=----------------------------------------------------------------------------------------------\**//** \
*
*	Executes regex on string multiple times, untill no further matches found. Returns array of matches.
*	Supports PREG_SET_ORDER and PREG_PATTERN_ORDER similar to php's preg_match_all.
*
*	@param		string	$str		- String to match.
* 	@param		regex	$regex		- Regular expression.
*
*	@return		array			- All matches as array.
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
var PREG_PATTERN_ORDER	= 1;
var PREG_SET_ORDER	= 2;
function regexMatchAll ($regex, $str, $order) {

	// Order by default is PREG_PATTERN_ORDER to mimic php
	$order = $order || PREG_PATTERN_ORDER;

	var $match; 
	var $res = [];
	
	// Looping through results
	// This will create results as for PREG_SET_ORDER flag 
	while ( $match = $regex.exec($str) ) {

		// Removing some trash, to end up with true array
		// It's important to allow [for var in array] code.	
		delete($match['index']);
		delete($match['input']);
		
		$res.push($match);
	} //WHILE matching
	
	// Done if no need to reorder
	if ( $order === PREG_SET_ORDER )
		return $res;

	// Reordering in new array if necessary		
	var $tmp = [];
	for ( var $i in $res )
		for ( var $j in $res[$i] ) 
			// Pushing matches if subset exists, or creating new one if not
			$tmp[$j] ? $tmp[$j].push($res[$i][$j]) : $tmp[$j] = [$res[$i][$j]];
	
	return $tmp;
} //FUNC regexMatchAll

if ( isUndefined( jQuery.fn.disableSelection ) ) {

jQuery.fn.disableSelection = function() {
	// Preparing event name, to allow selectstart or fallback to mousedown
	var $eventName = ( isUndefined(this.selectstart) ? 'mousedown' : 'selectstart' ) + '.vDisableSelection';

	this.on( $eventName, function( $e ) {
		$e.preventDefault();
	}); //FUNC onMouseDown

} //FUNC disableSelection

jQuery.fn.enableSelection = function() {
	this.off('.vDisableSelection');
} //FUNC enableSelection

} //IF no disable seleciton

function isDebug () {
	
	if ( !isEmpty( getCookie('debug') ) )
		return true;

	if ( location.search.indexOf('debug=1') != -1 )
		return true;

	return false;	
} //FUNC isDebug

function isIframe () {
	try {
		return window.self !== window.top;
	} catch (e) {
		return true;
	}
} //FUNC isIframe

function implode(glue, obj) {
	
	// Faster will be call .join if array given

	if ( obj instanceof Array )
		return obj.join(glue);
	
	// Or doing manually for object
	
	var res = '';
	
	for ( var i in obj ) {
		if ( res ) res += glue;
		res += obj[i]; 
	} //FOR each property
	
	return res;
} //FUNC implode

function ucfirst ($str) {
	return $str && $str[0].toUpperCase() + $str.slice(1);
} //FUNC ucfirst

String.prototype.capitalize = function() {
	return ucfirst(this);
} //FUNC capitalize

if ( !String.prototype.startsWith ) {
String.prototype.startsWith = function ($needle) {
	return this.lastIndexOf($needle, 0) === 0;
}} //FUNC startsWith

if ( !String.prototype.endsWith ) {
String.prototype.endsWith = function ($needle) {
	var $lastIndex	= this.lastIndexOf($needle);
	return ( $lastIndex != -1 ) && ( $lastIndex + $needle.length == this.length );
}} //FUNC endsWith

function strRepeat ($str, $multiplier) {
	
	if ( !$multiplier )
		return '';
		
	var $res = '';
	
	for ( var $i = 0; $i < $multiplier; $i++ ) {
		$res += $str;
	} //FOR multiple times
	
	return $res;
} //FUNC strRepeat

function instanceName ($var) {
	
	// Determining instance using basic Object.toString()
	$res = Object.prototype.toString.call($var);

	// Cutting usual [object ...] from it to get clean instance name
	$res = $res.slice(8, -1);
	
	return $res;
} //FUNC instanceName
var getClassOf = instanceName;

function isClass ($var, $class) {
	return getClassOf($var) === $class;
} // FUNC isBool

function isBool ($var) {
	return typeof($var) == 'boolean';
} // FUNC isBool

function isNumber ($var) {
	return typeof($var) == 'number';
} //FUNC isNumber

function isNumeric ($var) {
	return $var !== '' && !isNaN($var) && isFinite($var);
} //FUNC isNumeric

function isInt ($var) {
	return !isNaN($var) && (parseInt($var) == $var);
} //FUNC isInt

function isFloat ($var) {
	return $var !== '' && !isNaN($var) && isFinite($var) && !isInt($var);
} //FUNC isFloat

function isArray ($var) {
	return $var instanceof Array;
} //FUNC isArray

function isObject ($var, $orArray) {
	
	// If not object - then false anyway
	if ( typeof($var) != 'object' )
		return false;
		
	// If arrays allowed - we have result already	
	if ( $orArray )
		return true;

	// Now need to check if it is array
	// Should not be array for strict check
	return ( !isArray($var) );
	
} //FUNC isArray

var isString = isStr;
function isStr ($var) {
	return typeof($var) == 'string';
} //FUNC isStr

function isIn ($var, $values) {
	return $values.indexOf($var) > -1;
} //FUNC isIn

// Global constant for undefined type checks
var UNDEFINED = 'undefined';

function isUndefined($var) {
	return $var === void 0;
} //FUNC isUndefined

function isDefined($var) {
	return !isUndefined($var);
} //FUNC isDefined

function setDefault($var, $default) {
	return isDefined($var)? $var : $default;
} //FUNC isDefined

var isset = isSet;
function isSet ($var) {
	return !isUndefined($var);
} //FUNC isSet

var empty = isEmpty;
function isEmpty ($var) {
	
	// Fastest way to test
	if ( !$var )
		return true;
	
	// '0' means empty too
	if ( $var === '0' )
		return true;

	// Extra test need only for objects, so if it's not object - no need to test more
	if ( typeof($var) !== 'object' )
		return false;
	
	// Testing array first (faster test)
	if ( isArray($var) )
		return $var.length == 0;
		
	// If still here - its object and need to loop through to check properties
	// Any existing property ($i) means it's not empty
	for ( var $i in $var )
		return false;
	
	// If not triggered above - that's empty object	
	return true;
} //FUNC isEmpty

function asBool ($var) {
	
	// Reacting to speciefic strings
	if ( $var === 'false' )
		return false;
		
	if ( $var === 'true' )
		return true;
	
	return !isEmpty($var);
} //FUNC asBool

function isNumber ($var) {
	return typeof($var) == 'number';
} //FUNC isArray

function isFunction ($var) {
	return typeof($var) == 'function';
} //FUNC isArray

function isScalar ($var, $ex) {
	
	// Testing common scalar types
	if ( (/boolean|number|string/).test(typeof($var)) )
		return true;

	// Extra test assumes that NULL and undefined are scalars		
	if ( !$ex )
		return false;
	
	if ( typeof($var) == 'undefined' || $var === null )
		return true;
		
	return false;
} //FUNC isScalar

function isScalarArray ($var, $ex) {

	if ( !isArray($var) )
		return false;

	// If at least one array item is not scalar - that's not scalar array
	for ( var $i = 0; $i < $var.length; $i++ )
		if ( !isScalar($var[$i], $ex) )
			return false;
	
	return true;
} //FUNC isScalar

/** //** ----= arrayPath	=--------------------------------------------------------------------------------------\**//** \
*
*	Traversing array using key paths. Allows to get or set values.
*
*	@param		array	$array		- Array to traverse.
* 	@param		mixed	$path		- Path to navigate. Either string or array. 
* 						 E.g.: 'key1/key2/deepvalue' or ['key1', 'key2', 'deepvalue']
* 	@param		mixed	[$value]	- Value to set for setter mode (if omited, will return value instead)
* 	@param		string	[$divider]	- Path divider (used only if path is given as string).	 
*
*	@return		mixed			- Target value in getter mode, or new value in setter.
*
\**//** ---------------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function arrayPath ($array, $path, $value, $divider) {

	$divider = $divider || '/';

	// Checking for setter mode
	var $isSetter = ( !isUndefined($value) );
	
	// Splitting path to individual keys
	if ( !isArray($path) ) {
		$path = $path.split($divider);
	} //IF not array given

	// Looping down to value in array
	// Using refs for recurcive looping
	// Thus saving parent for last step
	var $var	= $array;
	var $parent	= $array;
	
	for ( var $i in $path ) {
		
		$key = $path[$i];
				
		// In setter mode - need to make sure that var is array
		// In getter mode - if var is already not array - that's null return
		if ( !isObject($var) )
			if ( $isSetter )
				$var = [];
			else
				return;		
		
		// Checking for key presence
		// In getter mode unexisting key results to NULL result
		// In setter mode - path should be created
		// This should be done priror next iteration to avoid source array altering
		if ( isUndefined($var[$key]) )
			if ( $isSetter )
				$var[$key] = {};
			else
				return;

		// Saving ref for next iteration
		$parent	= $var;
		$var	= $var[$key];
	} //FOR each path key

	// At this point ref points to end value
	// Can set and return it
	if ( $isSetter )
		$parent[$key] = $value;
	
	return $var;
} //FUNC arrayPath

if ( !Object.keys ) {
    Object.keys = function (obj) {
        var keys = [],
            k;
            
        for ( k in obj )
            if ( Object.prototype.hasOwnProperty.call(obj, k) )
                keys.push(k);

        return keys;
    }; //FUNC keys
} //IF Object have no keys method 

/** //** ----= objSize	=----------------------------------------------------------------------------------------------\**//** \
*
*	Returns object properties count. Usefull as analog of [].length for data objects.
*
*	@param		object	$obj	- Object to count.
*
*	@return		int		- Object "size".
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function objSize ($obj) {
	
	var $res = 0;
	for ( $i in $obj)	
		if ( $obj.hasOwnProperty($i) )
			$res++;
	
	return $res;
} //FUNC objSize

/** //** ----= objStep	=----------------------------------------------------------------------------------------------\**//** \
*
*	Returns object key in "step" away from given key.
*
*	@param		object	$obj	- Object to search key in
*	@param		$key	$key	- Key to step from	
*	@param		$step	$step	- Step to count from given key (can be negatve to count backwards)	
*
*	@return		string		- Found key, or FALSE if smth failed
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function objStep ($obj, $key, $step) {

	// Using array for indexing keys, and then searching keys in it
	// In case smth goes wrong - FALSE is returned
	
	var $idx = Object.keys($obj);
	
	if ( $idx.length == 0 )
		return false;
	
	var $i = $idx.indexOf($key);
	
	if ( $i < 0 )
		return false;

	// Stepping from key	
	$i += $step;
	
	if ( $i < 0 || $i >= $idx.length )
		return false;

	return $idx[$i];
} //FUNC objStep

/** //** ----= objNext, objPrev	=--------------------------------------------------------------------------------------\**//** \
*
*	Common use cases of objStep for searching next/prev keys in object
*
*	@param		object	$obj	- Object to search key in
*	@param		$key	$key	- Key to step from	
*
*	@return		string		- Found key, or FALSE if smth failed
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function objPrev ($obj, $key) {
	return objStep($obj, $key, -1);
} //FUNC objPrev
function objNext ($obj, $key) {
	return objStep($obj, $key, 1);
} //FUNC objNext

/** //** ----= objFirst, objLast	=------------------------------------------------------------------------------\**//** \
*
*	Returns first/last object key.
*
*	@param		object	$obj	- Object to search key in
*
*	@return		string		- Found key, or FALSE if smth failed
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function objFirst ($obj) {

	var $idx = Object.keys($obj);
	
	if ( $idx.length == 0 )
		return false;
		
	return $idx[0];
} //FUNC objFirst
function objLast ($obj) {
	
	var $idx = Object.keys($obj);
	
	if ( $idx.length == 0 )
		return false;
		
	return $idx[$idx.length-1];
} //FUNC objLast

/** //** ----= isSame	=----------------------------------------------------------------------------------------------\**//** \
*
* 	Compares two objects given. Designed for data objects.
*
*	@param	object	x, y		- Objects to compare.
*	@param	bool	[oneway]	- Set TRUE to test only by x values (i.e y can be bigger, in other words - if X is in Y)
*	@param	bool	[presort]	- Set TRUE to presort incoming arrays. This may 
*					  be necessary if comparing arrys in order 
*					  independent way. Usefull for values lists.
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function isSame (x, y, oneway, presort) {

	// Fast check for nulls / empties
	if ( !x || !y ) {

		if ( !x && y ) return false;
		if ( x && !y ) return false;
		
		return true;
		
	} //IF some is null or empty

	// IF arrays come - first better check lengths
	if ( x instanceof Array && y instanceof Array ) { 

		if ( x.length != y.length )
			return false;
			
		if ( presort ) {
			x.sort();
			y.sort();
		} //IF presort seet
		
	} //IF arrays come
	
	// First checking properties existance.
	// After this check full comparasions will be done in opposite direction

	if ( !oneway ) {
		for ( var p in y ) {
			if ( typeof(x[p]) == 'undefined') 
				return false;
		} //FOR each property in y
	} //IF not one way comparasion

	// Type based checking, in opposite comparasion direction 
	for ( var p in x ) {

		// Checking self properties in oppose object, jsut existance first
		if ( typeof(y[p]) == 'undefined' ) 
			return false;
		
		if ( x[p] ) { // Fast symantec check, everything that is logically FALSE - no need to check by type

			switch( typeof(x[p]) ) {
				
				case 'object' :
				
					// Checking objects recursively
					// This allows multidimensional objects checks, 
					// But can possibly hang browser. Normally will not.
					// ToDo: prevent possible reqursions
					if ( !isSame(x[p], y[p], oneway, presort) ) 
						return false;  
	
					break;

				case 'function' :
				
					// Of course toString is not best way to compare functions. 
					// But normally same named funcitons should have same source code, 
					// and it's anyway better and faster than to full syntax parsing.
					// Fast toString comparation will work in most typical cases.
					// Just don't use this function if U need to compare functions in objects so much!. 
					if ( this[p].toString() != x[p].toString() )
						return false;
						
					break;
				default:
				
					// At last simple check that will usually used :).
					if ( x[p] != y[p] )
						return false;
				
			} //SWITCH type of x

		} else { //IF is value

			// Checking same property on other object
			if ( y[p] )
				return false;
				
		} //If false value
		
	} //FOR each property in x

	return true;
} //FUNC isSame

function isXHR2 () {

	if ( !window.FormData ) 
		return false;

	// Testing for XMLHttpRequest Level 2 
	var xhr = new XMLHttpRequest();
	if ( !xhr.upload )
		return false;		

	return true;
} //FUNC isXHR2

function isFilesAPI () {
	
	if ( !isXHR2() )
		return false;

	if ( !(window.File && window.FileList && window.FileReader) ) 
		return false;

	return true;
} //FUNC isFilesAPI

function isIos () {
	return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;	
} //FUNC isIos

/** //** ----= isTouchScreen	=--------------------------------------------------------------------------------------\**//** \
*
*	Tests if device is touch screen enabled device.
* 
* 	@return bool			- TRUE if device supports touchs screen. (i.e. pointer:coarse from css4 media queries.) 
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function isTouchScreen () {
	
	var $res = 'ontouchstart' in document.documentElement;
	
	return $res;
	
} //FUNC isTouchScreen

/** //** ----= isJQ	=----------------------------------------------------------------------------------------------\**//** \
*
*	Tests if given object is jQuery element
*
*	@param		MIXED	$val	- Value to check.
*
*	@return		bool		- Check result.
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function isJQ ($val) {
	
	// Empty value is not jQuery
	if ( !$val )
		return false;
		
	return ($val instanceof jQuery || $val.jquery);
} //FUNC isJQ

/** //** ----= _jq	=----------------------------------------------------------------------------------------------\**//** \
*
* 	Ensures that given parameter is valid jQuery object. Avoids jQuery object clone.
*
*	@param	MIXED	$element	- jQuery selector, DOM element or jQuery object.
*	@param	MIXED	[$context]	- Valid jQuery context.
*
*	@return	object(jQuery)		- jQuery object.
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function _jq ($element, $context) {

	if ( !isJQ($element) )
		return jQuery($element, $context);

	return $element;
} //FUNC _jq

function formatFileSize (bytes) {

	if ( !bytes ) return bytes;	 
	 
	var labels	= ['b','Kb','Mb','Gb','Tb','Pb','Eb','Zb','Yb'];
	var ex		= Math.floor( Math.log(bytes) / Math.log(1024) );
	
	var res		= bytes / Math.pow(1024, ex);
	
	return res.toFixed(2) + ' ' + labels[ex]; 
} //FUNC formatFileSize

/** //** ----= setObjectOptions	=--------------------------------------------------------------------------------------\**//** \
*
*	Initiates object properties from given data object. Sets properties directly, without test if property really existed.
*	Essentially copies one object properties into another.
* 
* 	@param	object	$object		- Object to apply options to.
* 	@param	array	$options	- Options to set.
* 
* 	@return object			- Returns given object. 
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function setObjectOptions ($object, $options) {
	
	$options = $options || {};
	
	// Looping through each option given and setting it as property
	for ( var $opt in $options )
		$object[$opt] = $options[$opt];
	
	return $object;
} //FUNC setObjectOptions

/** //** ----= borderValue	=--------------------------------------------------------------------------------------\**//** \
*
* 	Ensures that given value is within bounds.
*
*	@param	MIXED	$element	- jQuery selector, DOM element or jQuery object.
*	@param	MIXED	[$context]	- Valid jQuery context.
*
*	@return	object(jQuery)		- jQuery object.
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function borderValue ($value, $min, $max) {

	if ( $value < $min )
		$value = $min;
		
	if ( $value > $max )
		$value = $max;
		
	return $value;
	
} //FUNC borderValue

/** //** ----= touchToMouse	=--------------------------------------------------------------------------------------\**//** \
*
*	Enables translation of touch events into mouse events. 
*	
*	@param	DOMElement	$el	- Element to apply to.
*
*	@return SELF
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
jQuery.fn.touchToMouse = function () {

	if ( !this.length )
		return;

	// Enabling touches for each element in set
	this.each( function () {
		touchToMouse(this);
	}); //each element

} //FUNC touchToMouse

function touchToMouse ($el) {

	// Using solution found in internet with slight tweaks and adding explanation of what is going on
	// Basically - capturing touch events, creating similar mouse event and rethrowing it instead
	
	// Using event wrapper to simplify code
	var $handler = function ($event) {
		
		// Using first element (you can't have multitouch with mouse :) )
		var $touchEvent = $event.changedTouches[0];
		
		// Defining event type from subst table
		var $eventType	= {
			touchstart	: 'mousedown',
			touchmove	: 'mousemove',
			touchend	: 'mouseup',
		}[$event.type]; //$types
		
		// Using only translatable events, otherwise - returning
		if ( !$eventType )
			return;
		
		// Creating new mouse event
		// And initializing with data from captured touch event
		var $mouseEvent = document.createEvent('MouseEvent');
		$mouseEvent.initMouseEvent(
			$eventType, true, true, window, 1,
			$touchEvent.screenX, $touchEvent.screenY,
			$touchEvent.clientX, $touchEvent.clientY, false,
			false, false, false, 0, null
		); //initMouseEvent
		
		// Rethrowing it from same target as original touch
		$touchEvent.target.dispatchEvent($mouseEvent);
		
		// Clearing bubbling
		event.preventDefault();		
		
	} //FUNC hanlder
	
	// Adding custom handler 
	$el.addEventListener('touchstart', $handler, true);
	$el.addEventListener('touchmove', $handler, true);
	$el.addEventListener('touchend', $handler, true);
	$el.addEventListener('touchcancel', $handler, true);	
	
} //FUNC touchToMouse

/** //** ----= vEventObject	=--------------------------------------------------------------------------------------\**//** \
*
* 	Extends given object to accept events callbacks. Allows events registering and chain calling later. Callback will 
*	run within object's context and accept parameters given to event trigger.
*
*	@param	array	types	- List of event types to create.
*
*	@param	object	obj	- Object to extend.
*
*	@return	object		- Modified object.
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function vEventObject (types, obj) {

	obj = obj || {};

	// Creating callbacks storage in parent
	if ( isEmpty(obj['__events']) )
		obj['__events'] = {};
	
// ---- BIND/RUNNER ----	
	
	/** //** ----= _runevent	=------------------------------------------------------------------------------\**//** \
	*
	* 	For Internal Use. Event runner, used to call events, or set new ones (in case if callback function given).
	*
	* 	@param	string	type	- Event type to use.
	* 
	*	@return	MIXED			- Mixed return.
	*		SELF			- If setting event.
	*		bool			- Boolean FALSE in even return - interrupts chain, and also is returned. 
	*					  TRUE is just returned.
	*		VOID			- Other cases.
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	obj._runevent = function ( type, args ) {

		// Setting callback if given as first argument
		if ( args[0] && typeof(args[0]) == 'function' ) {
			this.__events[type].push(args[0]);
			return obj;
		} //IF callback set
		
		var res = false;
		
		// If no callback given (getter mode) - running all calbacks of that type, cb should contain arguments then
		for ( var func in this.__events[type] ) {
			var eres = this.__events[type][func].apply(obj, args);

			// False in result means even chain interruption, returning it to parent also 
			if ( eres === false ) 
				return false;
			
			// True in one of events means smth for caller, we'll return it later
			if ( eres === true ) 
				res = true;
			
		} //FOR each callback

		// If someone return true - we notify parent about, else - undefined return
		if ( res ) 
			return res;

	} //FUNC _runevent

// ---- UNBIND ----

	/** //** ----= unbind	=--------------------------------------------------------------------------------------\**//** \
	*
	* 	Event remover. Unbings given event type, or given callback if specified. If no parameters specified - 
	*	unbinding all events (usefull to get clean object).
	*
	* 	@param	string		[type]	- Event type to unbind.
	*	@param	function	[fn]	- Callback to unbind within type.
	* 
	*	@return	SELF
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	obj.unbind = function (type, fn) {
		
		var $this = this;
		
		// Event clearing helper
		function unbindEvent (e) {
			
			// Deleting only speciefic events, skipping body ones
			for ( var i = 0; i < e.length; i++ ) {
			
				// Skipping body ones
				if ( e[i]._bodyeventfunction ) continue;
				
				// Skipping all non given (if some given)
				if ( fn && e[i] !== fn ) continue;
				
				e.splice(i, 1);
				
			} //FOR each callback
			
		}; //FUNC unbindEvent
	
		// If type specified - cleaning only that type, otherwise - all of them
		if ( type )
			unbindEvent(this.__events[type]);
		else
			for ( var i in this.__events )
				unbindEvent(this.__events[i]);

		return obj;
		
	}; //FUNC obj.unbind

// ---- SHORTCUTS ----	

	// Creating shortcut for each event
	for ( var ev in types ) {

		var type = types[ev];
		
		// For each type we have own array with callbacks
		if ( isEmpty(obj.__events[type]) )
			obj.__events[type] = [];
		
		// Existing event functions became first events
		if ( isFunction(obj[type]) ) {
			
			// Skipping event functions
			if ( obj[type]._runeventfunction )
				continue;
			else {
				// Marking as body function - those can't be unbind
				obj[type]._bodyeventfunction = 1;
				obj._runevent(type, [obj[type]]);
			} //IF own function
			
		} //IF function already exists in body 
		
		// Creating event trigger function in parent for each type
		obj[type] = function (t) { return function () { return this._runevent(t, arguments);};}(type);

		// Marking as event function to recognise later 
		obj[type]._runeventfunction = 1;
		
	} //FOR each type
	
	return obj;
} //FUNC vEventObject

/** //** ----= PromiseEx	=--------------------------------------------------------------------------------------\**//** \
*
* 	Special promise version with outside controllers (custom resolve/reject methods).
*
*	@param	function	$executor	- Promise executor.
*
*	@return	object				- Modified promise.
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
var PromiseEx = function ( $executor ) {
	
	// Saving controls outisde
	var $resolve, $reject;
	
	var $res = new Promise ( function (resolve, reject) {

		// Saving resolve and reject for later reuse
		$resolve = resolve;
		$reject = reject;
	
		// Running executor as normal, it might resolve/reject as necessary
		if ( isFunction($executor) )
			$executor(resolve, reject);
		
		// Done here
		
	}); //Promise
	
	// Saving calls in object itself
	$res.doResolve	= $resolve;
	$res.doReject	= $reject;
	
	return $res;
	
} //promiseEx

/** //** ----= reloadCSS		 =--------------------------------------\**//** \
*
* 	Forces browser to reload CSS sheets dynamically.
*	
*	@param	string	url	- CSS sheet URL.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function reloadCSS (url) {
	
	var salt	= randomString();
	var salt_url	= url + '?reload=' + salt;
	
	var new_sheet = jQuery('<link rel="stylesheet" href="' + salt_url + '" type="text/css" />');
	var old_sheet = jQuery('LINK[href*="' + url + '"]');

	if ( document.createStyleSheet ) {
		document.createStyleSheet(salt_url);
	} else { //IF IE 
		jQuery('HEAD').append( new_sheet );
	} //IF normal browsers	

	// Removing old sheet if present.
	setTimeout( function () { old_sheet.remove(); }, 1000);
	
} //FUNC reloadCSS

/** //** ----= countElements	 =----------------------------------------------\**//** \
*
* 	Returns overal page's elements count. Usefull for optimization.
*
*	@param	jQuery	el	- Count elements within give element. 
*
*	@return int		- Elements count.	
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function countElements (el) {
	
	if ( !el )
		return document.getElementsByTagName('*').length;
		
	return jQuery(el).find('*').length;
} //FUNC countElements

function randomString(type, length) {
	
	if ( !type ) type = 'alnum';
	if ( !length ) length = 8;
	
	var chars = '';
	
	switch ( type.toLowerCase() ) {
		case 'alnum'	: chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
			break;
		case 'alpha'	: chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
			break;
		case 'hex'	: chars = '0123456789ABCDEF';
			break;
		case 'caps'	: chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
			break;
		case 'capnum'	: chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
			break;
		case 'numeric'	: chars = '0123456789';
			break;
		case 'nozero'	: chars = '123456789';
			break;
		case 'keyb'	: chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ :;,.\'"\|/?[]{}()<>~`!@#$%^&*-=_+';
			break;
			
		default		: chars = type;
	} //SWITCH $type

	if ( !chars ) return '';
	
	var str = '';
	
	for (var i = 0; i < length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		str += chars.substring(rnum, rnum + 1);
	}
	
	return str;
} //FUNC randomString

/** //** ----= newSN	 =---------------------------------------------------------------------------------------------\**//** \
*
*	Generates new random SN. SN is usually capnum unique string of 16 chars, starting from give char.
*
*	@param		string	[$prefix]	- Limit SN to start only with this char.
*	@param		string	[$length]	- SN length, 16 by default.
* 
*	@return		string			- Random SN string.
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function newSN ($prefix, $length) {
	
	$prefix = $prefix || '';
	$length	= $length || 16;
	
	return ($prefix + randomString('capnum', $length)).substring(0, $length);
} //FUNC newSN

/** //** ----= fileName		 =----------------------------------------------\**//** \
*
* 	Extracts file name from full path.
* 	
* 	@param	string	path	- Full path and file name.
*	@return	string		- File name.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function fileName (path) {
	if ( !path ) return '';
	return path.replace(/^.*\\/, '');
} //FUNC fileName

/** //** ----= fileExt		 =----------------------------------------------\**//** \
*
* 	Extracts file extension from file name.
* 	
* 	@param	string	file	- Full path and file name.
*	@return	string		- File name.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function fileExt (file) {
	var tmp	= file.lastIndexOf('.');
	
	if ( !tmp ) return false;
	
	return file.substr(tmp+1, file.length); 
} //FUNC fileExt

/*--------------------------------------------------------------------------------*\
|	Humanize
|----------------------------------------------------------------------------------
| Ensures that number will be displayed as normal value (fix for JavaScript numbers)
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		[base]	int	- Base value to round value to.
|	Return:
|			string	- Human looking number rounded to certain base.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
Number.prototype.Humanize = Number.prototype.humanize = function (base) {
	
	base = base || 10;
	
	var tmp = this.toFixed(base) + '';
	return tmp;
	
	var res = tmp.rtrim('0.');
	if ( res == '' ) res = '0';
	
	return res;
} //FUNC Humanize

/*--------------------------------------------------------------------------------*\
|	indexOf
|----------------------------------------------------------------------------------
| Fixes indexOf for IE6.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		obj		MIXED	- Item to search.
|		fromIndex	integer	- Search starting from index.
|	Return:
|				integer	- Item position in array, or -1 if not found.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
/**/
if ( !Array.prototype.indexOf )
Array.prototype.indexOf = function (obj, fromIndex) {
		
	if ( !fromIndex ) fromIndex = 0;
	
	for ( var i in this )
		if ( this[i] === obj ) return i;
		
	return -1;
} //FUNC indexOf
/**/

/*--------------------------------------------------------------------------------*\
|	arrayJoin
|----------------------------------------------------------------------------------
| Extended join for arrays.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		array		array	- Array to process.
|		separator	string	- String to use as separator.
|		include_keys	bool	- Set TRUE to encode keys in result string.
|	Return:
|				string	- Array as string.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function arrayJoin (array, separator, include_keys) {
	
	if ( !separator ) separator = ',';
	
	var res = '';
	
	var j = 0;
	
	for ( var i in array ) {
		
		if ( typeof(array[i]) == 'function' ) continue;
		
		if ( res ) res += separator;
		
		if ( include_keys ) {
			
			if ( i != j ) 
				res += i + ' = ';
			
		} //IF need to include keys
		
		res += array[i];
		j++;	
		
	} //FOR each item
		
	return res;
} //FUNC arrayJoin

/*--------------------------------------------------------------------------------*\
|	arraySplit
|----------------------------------------------------------------------------------
| Splits array. Extended version with keys support.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		string		string	- String to process.
|		separator	string	- String to use as separator.
|		auto_tirm	string	- Allow to trim values on split.
|	Return:
|				array	- Array with values.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function arraySplit (string, separator, auto_tirm) {
	
	var res	= [];
	var tmp = string.split(separator);
	
	for ( var i in tmp ) {
		
		var pos = tmp[i].indexOf('=');

		if ( pos != -1 ) {
			
			var key = tmp[i].substr(0, pos);
			if ( auto_tirm ) key = key.trim();
			
			var val = tmp[i].substr(pos+1);
			if ( auto_tirm ) val = val.trim();
			
			res[key] = val;
			
		} else { //IF eq symbol found
		
			if ( auto_tirm ) tmp[i] = tmp[i].trim();
			res.push(tmp[i]);
			
		} //IF single value
		
	} //FOR each value
	
	return res;
} //FUNC arraySplit

String.prototype.limit = function(l, append) {

	if ( this.length <= l ) 
		return this.toString();
	
	append = append || '&hellip;';
	al = append.substr(0, 1) == '&' ? 1 : append.length;
	
	return this.substr(0, l - al) + append;
} //FUNC limit

String.prototype.ucfirst = function() {

	// Nothing to do with empty string	
	if ( !this.length ) return this;
	
	return this.charAt(0).toUpperCase() + this.substr(1);
} //FUNC ucfirst

/*--------------------------------------------------------------------------------*\
|	escape
|----------------------------------------------------------------------------------
| Escapes string for using in REGex.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		NONE
|	Return:
|		NULL
\*--------------------------------------------------------------= by Mr.V!T =-----*/
String.prototype.escape = function() {
	return this.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!<>\|\:])/g, '\\$1');
} //FUNC escape

/*--------------------------------------------------------------------------------*\
|	_trim
|----------------------------------------------------------------------------------
| Base function for trimming strings.
| ***TNX*** Ideas taken from phpjs.org
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		[charlist]	string	- Optional characteres to trim.
|		[left]		bool	- Trim left.
|		[right]		bool	- Trim right.
|	Return:
|				string	- Trimmed string.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
String.prototype._trim = function(charlist, left, right) {

	var str = this;
	
	if ( !str )
		return this;
	
	charlist = (charlist) ? charlist.escape() : ' \\n\\t\\s\u00A0';
	
	if ( left ) str	= str.replace(new RegExp('^[' + charlist + ']+', 'gm'), '');
	if ( right ) str = str.replace(new RegExp('[' + charlist + ']+$', 'gm'), '');
	
	return str;
} //FUNC _trim

/*--------------------------------------------------------------------------------*\
|	ltrim
|----------------------------------------------------------------------------------
| Strips whitespace from the beginning of a string.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		[charlist]	string	- Optional characteres to trim.
|	Return:
|				string	- Trimmed string.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
String.prototype.ltrim = function(charlist) {
	return this._trim(charlist, 1, 0);
} //FUNC ltrim

/*--------------------------------------------------------------------------------*\
|	rtrim
|----------------------------------------------------------------------------------
| Removes trailing whitespace.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		[charlist]	string	- Optional characteres to trim.
|	Return:
|				string	- Trimmed string.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
String.prototype.rtrim = function(charlist) {
	return this._trim(charlist, 0, 1);
} //FUNC rtrim

/*--------------------------------------------------------------------------------*\
|	trim
|----------------------------------------------------------------------------------
| Removes whitespaces from both sides.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		[charlist]	string	- Optional characteres to trim.
|	Return:
|				string	- Trimmed string.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
String.prototype.trim = function(charlist) {
	return this._trim(charlist, 1, 1);
} //FUNC trim

/*--------------------------------------------------------------------------------*\
|	xtrim
|----------------------------------------------------------------------------------
| Very fast function for trimming strings.
| ***TNX*** Big thanx for Steve at steves_list (at) hotmail.com. 
| ***TNX*** http://blog.stevenlevithan.com/
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		NONE
|	Return:
|		NULL
\*--------------------------------------------------------------= by Mr.V!T =-----*/
String.prototype.xtrim = function() {
	var str = this;
	str = str.replace(/^\s+/, '');
	for (var i = str.length - 1; i >= 0; i--) {
		if (/\S/.test(str.charAt(i))) {
			str = str.substring(0, i + 1);
			break;
		}
	}
	return str;
} //FUNC xtrim

/*--------------------------------------------------------------------------------*\
|	multiClean
|----------------------------------------------------------------------------------
| Cleans double repeated characters. E.g. doublespaces.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		[character]	string	- Optional character to clean. 
|	Return:
|				string	- Result string.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
String.prototype.multiClean = function(character) {
	
	character = character || ' '; 
	
	return this.replace(new RegExp('[' + character.escape() + ']{2,}', 'g'), character);	
} //FUNC multiClean

/*--------------------------------------------------------------------------------*\
|	toSafe
|----------------------------------------------------------------------------------
| Generates safe value from give string. I.E. safe to use as variable names.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		[separator]	string	- Optional characteres to use as word 
|					separator.
|	Return:
|				string	- Result string.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
String.prototype.toSafe = function(separator) {

	if ( !separator )
		separator = '_'; 
	
	var res = this;
	res = res.replace(/[^a-zA-Z0-9_]/g, separator);
	res = res.multiClean(separator);
	res = res.trim(separator);
	
	return res;
} //FUNC toSafe

/*--------------------------------------------------------------------------------*\
|	compilePath
|----------------------------------------------------------------------------------
| Compile path from several pieces using '/' as glue.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		*	string	- One or several path pieces.
|	Return:
|			string	- Valid path.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function compilePath () {
	
	var len = arguments.length;
	if ( len == 1 ) return arguments[0];
	
	var res = (arguments[0]+'').rtrim('/');
	
	for (var i = 1; i < len; i++ ) {
		res += '/' + (arguments[i]+'').ltrim('/');
	} //FOR each argument
	
	return res;
} //FUNC compilePath
var compileUrl = compilePath;

/** //** ----= arraySelectKey	 =----------------------------------------------\**//** \
*
*	Chooses existing key from list given in associated array.
*
*	@param	array	array	- Source array.
* 
* 	@param	MIXED	keys	
* 		array		- Array with possible keys. 
* 		string		- Single key for case insensitive search or regEx 
* 				  mask for possible keys (slower).
*
*	@param	bool	[regex]	- Search mode for string key.
*
*	@return	MIXED			
* 		string		- Existing key.
* 		bool		- FALSE if none exists.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function arraySelectKey (array, keys, regex) {

	if ( typeof(keys) == 'object' ) {

		for ( var i = 0; i < keys.length; i++ ) {

			if ( array[keys[i]] != undefined ) return keys[i];

		} //FOR each key

	} else { //IF searching by array

		var reg	= keys;
		if ( !regex )
			reg = new RegExp('^' + keys.escape() + '$', 'i');

		for ( var key in array ) {
			
		//	__(key);
			
			if ( reg.test(key) ) return key;
		} //FOR each

	} //IF searshing by regex

	return undefined;
} //FUNC arraySelectKey

/** //** ----= arraySelectValue	 =----------------------------------------------\**//** \
*
*	Chooses value by one of existing keys given.
*
*	@param	array	array		- Source array.
*	@param	array	keys		- Array with possible keys.
*	@param	MIXED	[default]	- Default value to use if nothing found.
*
*	@return	MIXED			- Found value or default if none found.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function arraySelectValue (array, keys, def) {

	var key = arraySelectKey(array, keys);

	if ( !key || !array[key] == undefined ) return def;

	return array[key];
} //FUNC arraySelectValue

/*--------------------------------------------------------------------------------*\
|	arrayToPost
|----------------------------------------------------------------------------------
| Prepares multidimentional array to post in native PHP format.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		array	object	- Common JavaScript array object.
|	Return:
|			array	- Array in POST format.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function arrayToPost (array, prefix) {
	
	var res = {};
	
	for ( i in array ) {
		
		var key = ( prefix )? prefix + '[' + i + ']' : i;
		
		if ( typeof(array[i]) == 'object' ) {

			var sub = arrayToPost(array[i], key);
			
			for ( j in sub ) res[j] = sub[j];
			
		} else { //IF sub array
			res[key] = array[i];
		} //IF other type
		
	} //FOR each array
	
	return res;
} //FUNC arrayToPost

/** //** ----= submitUrl	=--------------------------------------------------------------------------------------\**//** \
*
*	Submits given data as POST/GET to given url. Literally simulates form submit.
*
*	@param		string	$url		- Url to submit to.
*	@param		object	$data		- Data to submit.
*	@param		string	[$blank]	- Set TRUE to open in new tab.
*
*	@return		bool			- Always FALSE.
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function submitUrl($url, $data, $blank) {
	
	$method	= 'post';	// No real need to have method optional
	$data	= $data || {};
	$target	= '';
	 
	if ( $blank )
		$target = ' target="_blank"';
	
	// Generating form html as string and appending it to body
	// Each data will be hidden input in form
	var $f = '<form method="' + $method + '" action="' + $url + '"' + $target + ' style="display:none">';
	
	for ( $i in $data ) {
		
		$f += '<input type="hidden" name="' + $i + '" value="' + $data[$i] + '" />';
		
	} //FOR each data
	
	$f += '</form>';
	
	// Appending form, getting it's element, and submiting
	var $el = jQuery($f).appendTo('BODY').submit();

	return false;	
} //FUNC submitUrl

/** //** ----= parseVariables	=--------------------------------------------------------------------------------------\**//** \
*
*	Parses {varables} in a template. Supporting complex vairables like {var-sub} and {var.sub}
*
*	@param		string	$str		- Template to parse.
*	@param		object	$vars		- Data object with variable to parse.
*	@param		bool	[$clean]	- Set TRUE to cleanup unused variables from template (default behavior).
*	@param		string	[$wrap]		- Brackets pair to use on vairables. '{}' by default. Use '[]' for bb codes. 
*
*	@return		string			- Parsed template.
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function parseVariables ($str, $vars, $clean, $wrap) {
	
	// Using {vars} by default
	$wrap = $wrap || '{}';
	
	// Nothing to do if string is empty
	if ( !$str )
		return $str;
		
	if ( isUndefined($clean) ) 
		$clean = true;
	
	// Preparing wrap pairs
	// Assuming 2 char pair like '{}' or '[]'
	if ( $wrap.length != 2 )
		throw('Invalid var wrapper');
	
	// Preparing 2 wrap variants: normal and escaped one
	// Oftenly strings end up as url escaped strings, escaped by parsers
	// Thus just searching this too
	var $l  = $wrap.charAt(0);
	var $r  = $wrap.charAt(1);
	var $xl = '%' + $wrap.charCodeAt(0).toString(16).toUpperCase();
	var $xr = '%' + $wrap.charCodeAt(1).toString(16).toUpperCase();
	
	// Looping though all vars and replacing given variables	
	for ( var $i in $vars ) {

		// Skipping anything that can't be placed on template
		if ( !isStr($vars[$i]) && !isNumber($vars[$i]) )
			continue;
		
		// Searching both vars variants
		$str = $str.replace( new RegExp( ($l + $i + $r).escape(), 'ig'), $vars[$i]);
		$str = $str.replace( new RegExp( ($xl + $i + $xr).escape(), 'ig'), $vars[$i]);
		
	} //FOR each var

	if ( $clean ) {

		// Now cleaning unused, both normal and escaped
		$str = $str.replace( new RegExp( $l.escape() + '[\\w\\.-]+' + $r.escape(), 'ig'), '');
		$str = $str.replace( new RegExp( $xl.escape() + '[\\w\\.-]+' + $xr.escape(), 'ig'), '');

	} //IF autoClean
	
	return $str;	
} //FUNC parseVariables

/** //** ----= arrayToTemplate	=--------------------------------------------------------------------------------------\**//** \
*
*	Parses {varables} in a template. PHP counterpart alias to parseVariables.
*
*	@param		object	$vars		- Data object with variable to parse.
*	@param		string	$str		- Template to parse.
*	@param		bool	[$clean]	- Set TRUE to cleanup unused variables from template (default behavior).
*	@param		string	[$wrap]		- Brackets pair to use on vairables. '{}' by default. Use '[]' for bb codes. 
*
*	@return		string			- Parsed template.
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function arrayToTemplate ($vars, $str, $clean, $wrap) { return parseVariables($str, $vars, $clean, $wrap); }


/*--------------------------------------------------------------------------------*\
|	isNumeric
|----------------------------------------------------------------------------------
| Simple function for checking if given string numnber.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		value	string	- Value to check.
|	Return:
|			bool	- Check status.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function isNumeric (value) {
	
	// Numerics are numeric o_O
	if ( typeof(value) == 'number' )
		return true;
	
	return (value - 0) == value && value.length > 0;
} //FUNC isNumeric

/*--------------------------------------------------------------------------------*\
|	isEmail
|----------------------------------------------------------------------------------
| Simple function for checking if given string is correct mail.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		value	string	- Value to check.
|	Return:
|			bool	- Check status.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function isEmail (value) {
	var filter = /^([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9_\-]+\.)+[a-z]{2,6}$/i;
	return filter.test(value);
} //FUNC isEmail

jQuery.fn.findExclude = function($selector, $exclude, $res){
	
	$res = $res || new jQuery(); 

	// Looping through children, saving matching ones,
	// and recursively traversing deeper in each
	// Skipping ones that match exclusions ofc
	this.children().each( function() {
		
		var $el = jQuery(this);
		
		// Checking self to be saved in result
		if ( $el.is($selector) ) 
			$res.push(this);
		
		// Traversing deeper if allowed
		if( !$el.is($exclude) )
			$el.findExclude($selector, $exclude, $res);
	}); //jQuery each children
	
	return $res;
} //FUNC findExclude

/** //** ----= jQuery.align	 =-----------------------------------------\**//** \
*
* 	Aligns selected element with another element or browser window.
*
*	@param	string	align	- Align type.
*	@param	object	target	- Element to align with.
*	@param	bool	fit	- Set TRUE to fit inside element (forced if no target)
*
*	@return	jQuery		- Aligned element.
*
\*--------------------------------------------------------------= by Mr.V!T =-----*/
jQuery.fn.align = function (align, target, fit, fixed) {

// ---- Preparing environment

	// Default align is center
	if ( align == 'center' ) align = false;
	align = align || 'center-center';
	
	align = align.split('-');
	
	if ( fit === undefined ) fit = false;
		
	if ( !target ) fit = true;

	// If no target - we will use screen dimensions
	if ( !target ) 
		var screen = screenSize();
		
	// Target element dimensions
	var tDim = {
		width		: ( target )? target.outerWidth() : screen.width,
		height		: ( target )? target.outerHeight() : screen.height
	}; //OBJECT elDim

// ---- Little complicated logic goes next, no comments there - hard to explain :)

	var bases = {
		'left'		: 0,
		'top'		: 0,
		'center'	: 0.5,
		'right'		: 1,
		'bottom'	: 1
	} //OBJ bases

	var ly = false;

	if ( align[0] == 'center' )
		align = align.reverse();

	if ( ['left', 'right'].indexOf(align[1]) !== -1 ) {
		ly = true;
		align = align.reverse();
	} //IF 
	
	if ( ['top', 'bottom'].indexOf(align[0]) !== -1 ) {
		ly = true;
		align = align.reverse();
	} //IF
	
	// Sub function to process aligment separately for each dimension
	// Using sub func to avoid copy/paste
	function _alignDim (t, l, s, e) {
		
		if ( fit ) l = false;

		var d = ds = bases[t];
		
		if ( l && ds != 0.5 )
			ds = ( ds )? 0 : 1;

		return e * d - s * ds;			 
		
	} //FUNC _alignDim

// ---- Result CSS ----

	// preCompiling css 	
	var css = {
		'left'	: _alignDim( align[0], !ly, this.outerWidth(true), tDim.width ),
		'top'	: _alignDim( align[1], ly, this.outerHeight(true), tDim.height ) 
	} //OBJECT css

	// Correcting position, relating to target
	if ( target ) {
		var pos = (fixed) ? target.offset() : target.position();
	
		css.left += pos.left;
		css.top += pos.top;
	} //IF target set
	
	this.css(css);

	return this;
} //FUNC align

/*--------------------------------------------------------------------------------*\
|	centerWindow
|----------------------------------------------------------------------------------
| Adds function to jQuery for centering windows
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		NONE
|	Return:
|		SELF
\*--------------------------------------------------------------= by Mr.V!T =-----*/
jQuery.fn.centerWindow = function () {

	var wnd_width	= this.width();
	var wnd_height	= this.height();
	
	var screen	= screenSize();

	var wnd_left	= ( screen.width - wnd_width ) / 2;
	var wnd_top	= ( screen.height - wnd_height ) / 2;

	var css		= {'top' : wnd_top, 'left' : wnd_left};
	
	this.css(css);
	
	return this;
} //FUNC centerWindow

jQuery.fn.maxWidth = function ($outer, $margins) {
	var $max = 0;
	this.each( function() {
		$max = Math.max($max, $outer ? jQuery(this).outerWidth($margins) : jQuery(this).width() );
	}); //FUNC each in result    
	return $max;  	
} //FUNC maxWidth

jQuery.fn.maxHeight = function ($outer, $margins) {
	var $max = 0;
	this.each( function() {
		$max = Math.max($max, $outer ? jQuery(this).outerHeight($margins) : jQuery(this).height() );
	}); //FUNC each in result    
	return $max;  	
} //FUNC maxHeight

jQuery.fn.screenOffset = function () {
	
	var $pos = this.offset();
	
//	var $top = jQuery('html, body').scrollTop();
	var $top = jQuery(window).scrollTop();
	
	$pos.top -= $top;
	
	return $pos;   
} //FUNC screenOffset

jQuery.fn.wrapAround = function ($target) {

	// Wrapping assumes border and padding to be same around, so checking only top ones	
	var $border	= parseInt( this.css('border-top-width') );
	var $padding	= parseInt( this.css('padding-top') );

	// Supporting direct coordinates input as 4 items array: [left, top, width, height]
	if ( isArray($target) ) {

		// In array mode coords are given directly
		var $css = {
			'left'	: $target[0] - $border - $padding,	
			'top'	: $target[1] - $border - $padding,
			'width'	: $target[2],
			'height': $target[3]
		}; //OBJECT $css
		
	} else { //If dimensions given

		if ( !$target.length )
			return this;

		// Initial values, huge top/left and small width/height	
		var $x = 10000;
		var $y = 10000;
		
		var $toX = 0;
		var $toY = 0;
		
		// Looking through all elmements and searching for ourter max dimensions
		$target.each( function () {
			
			var $el = jQuery(this);
			
			// Not counting invisible elements
			if ( !$el.is(':visible') )
				return;
			
			// Getting offset and calculating tox/toy for element
			// Then comparing this to found ones already
			var $o	= $el.screenOffset();
	
			var $tx = $o.left	+ $el.outerWidth();
			var $ty = $o.top	+ $el.outerHeight();
			
			if ( $o.left < $x ) $x = $o.left;
			if ( $o.top < $y ) $y = $o.top;
			if ( $toX < $tx ) $toX = $tx;
			if ( $toY < $ty ) $toY = $ty;
			
		}); //FUNC jQuery.each

		// Now we can build helper box
		var $css = {
			'left'	: $x - $border - $padding,	
			'top'	: $y - $border - $padding,
			'width'	: $toX - $x,
			'height': $toY - $y
		}; //OBJECT $css

	} //IF jQuery
	
	// And apply it to self
	this.css($css);
	
	// Continuing chain
	return this;
} //FUNC wrapAround

jQuery.fn.hoverClass = function ($class, $allSet) {
	
	var $this = this;
	
	// Binding with namespaces, using class as namespace
	var $ns		= $class.replace(/\W+/g, '');
	var $enter	= 'mouseenter.hoverClass.' + $ns;
	var $leave	= 'mouseleave.hoverClass.' + $ns;

	this.off($enter);
	this.off($leave);

	// Adding class on enter to whole set, or only one hoverred
	this.on($enter, function ($e) {
		if ( $allSet )
			$this.addClass($class);
		else
			jQuery(this).addClass($class);
	}); //FUNC onMouseenter
	
	this.on($leave, function ($e) {
		if ( $allSet )
			$this.removeClass($class);
		else
			jQuery(this).removeClass($class);
	}); //FUNC onMouseenter

	return this;
} //FUNC hoverClass

jQuery.fn.groupBy = function ($attribute) {
	
	// Defaulting to data-group attribute.
	$attribute = $attribute || 'data-group'; 
	
	var $res = {}; // Will store groups here
	
	// Looping through each element, and storing as groups
	this.each( function () {
		
		var $el = jQuery(this);
		
		// Getting groups attribute
		var $attr = $el.attr($attribute);
		
		// Nothing to do if no attribute set (ungrouped element)
		if ( !$attr )
			return;
		
		// Parsing into groups, allowing common delimiters
		var $groups = strToArray($attr, ',.|');

		// Assigning element into each group, adding into existing, or creating new ones
		for ( var $i in $groups ) {
			var $group = $groups[$i];
			
			if ( !$res[$group] )
				$res[$group] = $el;
			else
				$res[$group] = $res[$group].add($el); 
			
		} //FOR each group
		
	}); //FUNC each.result
	
	// Returning results
	return $res;
} //FUNC groupBy

function centerWindow (el) {
	jQuery(el).centerWindow();
} //FUNC centerWindow

/*--------------------------------------------------------------------------------*\
|	jqmShowCSS
|----------------------------------------------------------------------------------
| Apllies given css to jQM window and shows it.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		selector	string	- Window to show.
|		css		string	- Object with css to apply.
|		effect		string	- Effect to use on displaying.
|	Return:
|				bool	- Alwyas false.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function jqmShowCSS (selector, css, effect) {
	
	jQuery(selector).css(css);

	if ( jqmVisible(selector) ) return false;

	if ( !isJQM(selector) ) {
		
		var opt = {};
		
		if ( effect == 'fade' )
			opt = {
				onShow: function(h) { 
					h.w.fadeIn(300);
				},
				onHide: function(h) { 
					h.w.fadeOut(300);
					h.o.remove();
				}
			}; //Object o
		
		jQuery(selector).jqm(opt);
		if ( jQuery().jqDrag ) jQuery(selector).jqDrag('.jqmHeader');
		if ( jQuery().jqResize ) jQuery(selector).jqResize('.jqmResize');
	} //IF element is not jqm window already
	
	jQuery(selector).jqmShow();

	return false;
	
} //FUNC jqmShowCSS

/*--------------------------------------------------------------------------------*\
|	jqmShowCentered
|----------------------------------------------------------------------------------
| Fixes coordinates of jQM window to match center.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		selector	string	- Window to show.
|		effect		string	- Effect to use on displaying.
|	Return:
|				bool	- Alwyas false.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function jqmShowCentered (selector, effect) {
/**/	
	var wnd_width	= jQuery(selector).width();
	var wnd_height	= jQuery(selector).height();
	
	var parent_window = screenSize();

	var wnd_left = ( parent_window.width - wnd_width ) / 2;
	var wnd_top = ( parent_window.height - wnd_height ) / 2;

	var new_css = {'top':wnd_top,'left':wnd_left};
/*/
	var new_css = {'top':0,'left':0, 'margin': 'auto auto'};
	
/**/	
	return jqmShowCSS(selector, new_css, effect);
} //FUNC jqmShowCentered

/*--------------------------------------------------------------------------------*\
|	jqmShowDocked
|----------------------------------------------------------------------------------
| Fixes coordinates of jQM window to dock to given element.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		selector	string	- Window to show.
|		dock_to		string	- Selector of element to dock to.
|		effect		string	- Effect to use on displaying.
|	Return:
|				bool	- Alwyas false.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function jqmShowDocked (selector, dock_to, effect) {
	
	var offset	= jQuery(dock_to).offset();
	if ( !offset.top ) return false;
	
	var outer	= jQuery(dock_to).outerHeight();
	
	var new_css = {
		'top'		: offset.top + outer + 3,
		'left'		: offset.left
	}; //New CSS
	
	return jqmShowCSS(selector, new_css, effect);
} //FUNC jqmShowDocked

/*--------------------------------------------------------------------------------*\
|	jqmHide
|----------------------------------------------------------------------------------
| Hides JQM window.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		selector	string	- Window to hide.
|		effect		string	- Effect to use on hiding.
|	Return:
|				bool	- Alwyas false.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function jqmHide (selector, effect) {
	jQuery(selector).jqmHide();
	return false;
} //FUNC jqmHide

/*--------------------------------------------------------------------------------*\
|	isJQM
|----------------------------------------------------------------------------------
| Check if element is already jqModal window.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		selector	string	- Element to check.
|	Return:
|		NULL
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function isJQM (selector) {
	
	var tmp = jQuery(selector).attr('class');
	if ( tmp.indexOf('jqmID') < 0 ) return false;
	
	return true;
	
} //FUNC isJQM

/*--------------------------------------------------------------------------------*\
|	jqmVisible
|----------------------------------------------------------------------------------
| Checks if jqm window is visible.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		selector	string	- Element to check.
|	Return:
|		NULL
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function jqmVisible (element) {

	if ( !(element instanceof jQuery) )
		element = jQuery(element);
	
	var disp = element.css('display');
	
	return (disp != 'none');
} //FUNC jqmVisible

function centerWindow (win) {
	var wnd_width	= jQuery('#'+win).width();
	var wnd_height	= jQuery('#'+win).height();
	
	var parent_window = screenSize();

	var wnd_left = ( parent_window.width - wnd_width ) / 2;
	var wnd_top = ( parent_window.height - wnd_height ) / 2;

	var new_css = {'top':wnd_top,'left':wnd_left};
	jQuery('#'+win).css(new_css);
} //FUNC

function getOuterHTML (el) {
	
	if ( el.outerHTML ) return el.outerHTML;
	
	var tmp = document.createElement(el.parentNode.tagName);
	tmp.appendChild(el.cloneNode(true));
	
	return tmp.innerHTML;
} //FUNC getOuterHTML

function strToElement (html) {
	var tmp = document.createElement('div');
	tmp.innerHTML = html;
	
	return tmp.firstChild;
} //FUNC strToElement

function setOuterHTML (el, html) {
	
	if ( el.outerHTML ) return el.outerHTML = html;

	var n = strToElement(html);
	
	el.parentNode.replaceChild(n, el);
} //FUNC setOuterHTML

/** //** ----= formToArray	=--------------------------------------------------------------------------------------\**//** \
*
*	Collects input values as data object. Result is exactly same as one you get with $_POST. 
*	Supports nested arrays and sets in naming. E.g.: name="lvl1[lvl2][lvl3][]"
*
*	@param		object(HTMLFormElement)	
*					$form	- Source form.
*
*	@return		object			- Data collected from form.
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function formToArray ($form, $options) {

	// Storing results in object
	var $data = {};
	
	// Defaulting options
	$options = $options || {};

// ---- 3rd parties ----
	
	// If there is tiny - forcing it to save editors
	if ( typeof(tinyMCE) != 'undefined' ) 
		tinyMCE.triggerSave();
	
	// Optionally supporting jQuery elements, though shold point exactly to form
	if ( isJQ($form) ) {
		
		// Not proceesing if not form though
		if ( !$form.is('form') )
			return $data;
		
		// Getting DOM from jQuery
		$form = $form.get(0);
	} //IF jQuery given

// ---- Form ----

	// Counting inputs with same name for sets resolving
	var $index = {};

	// Looping through elements and getting values for each
	for ( var $i = 0; $i < $form.elements.length; $i++ ) {

	// ---- Element ----
			
		// Getting element to work with
		var $el		= $form.elements.item($i);

		// Collecting value, and then storing it in data object
		var $val;

		// Skipping it if it does not have name
		if ( !$el.name )
			continue;

	// ---- Input ----
		
		switch ( $el.type ) {
			case 'file' :
				// In HTML files are not included in post
				continue;
				
			case 'radio' :
			case 'checkbox'	:

				$val = $el.value;
			
				if ( $val == 'on' ) {

					// Using slightly alternate behavior 
					// where checkboxes without values (val == on) return 1/0 instead of 1/unset
					$val = ( $el.checked )? 1 : 0;

				} //IF no value 
				else if ( !$el.checked ) {

					if ( $options['emptyChecks'] ) {
	
						$val = '';
						
					} //IF empty checkboxes should present
					
					else {

						// For valued checkboxes - regular behavior
						continue;
						
					} //IF standard behavior

				} //IF value is set

				break;
				
			case 'select-one' :
				
				// Using dedicated tool
				$val = getValue_Select($el);
				
				break;

			case 'select-multiple' :
			
				// Using dedicated tool
				$val = getValue_MutliSelect($el);
				
				break;
				
			default	:

				// Regular inputs have just value
				$val = $el.value;
		} //SWITCH

		// Nothing to do with null
		if ( isUndefined($val) )
			continue;
			
	// ---- Data ----

		var $name	= $el.name;	// That will be working name
		
		// Expecting array to happen, so parsing as path right away
		var $path	= regexMatchAll(/[\w\-]+/g, $name);
		
		// Problematic paths are skipped too
		if ( !$path[0] )
			continue;
			
		// Full match is all we need
		$path = $path[0];	

		// Indexing now, as it looks like valid name
		$index[$name]	= isSet($index[$name]) ? ++$index[$name] : 0;
		
		// Special case for sets
		// Those should be stored as simple array
		// Exception for multiarrays: those always have [] to work properly 
		// (except rare cases when multiple same named selects used... which is never... currently only one will be allowed)
		
		if ( ($el.type != 'select-multiple') && $name.endsWith('[]') ) {

			// Need to merge with existing array if one is present
			var $set = arrayPath($data, $path);
			
			// Merging value into set, which will be set into data

			if ( isObject($set, true) )
			
				// Adding into objectx using index
				$set[$index[$name]] = $val;
				
			else if ( isArray($set) )

				// Pushing if array
				$set.push($val)

			else
				// Non arrays are overwritten
				$set = [$val];

			// Preparing to be set back to data				
			$val = $set;
			
		} //IF set given
		
		// Now we have both value and path
		// Just setting it
		arrayPath($data, $path, $val);
		
	} //FOR each element
	
	return $data;
} //FUNC formToArray

/** //** ----= formFromArray	=--------------------------------------------------------------------------------------\**//** \
*
*	Sets form inputs values from given data object.
*	Supports arrays and sets in elements names and tinyMCE Editor if applied to textarea.
*
*	@param		object(HTMLFormElement)	
*					$form	- Form to setup.
*
*	@param		object		$source	- Values to set.		
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function formFromArray ($form, $source) {
	
	// Resaving to do not break source 
	var $data	= jQuery.extend({}, $source);
	
	// Counting inputs with same name for sets resolving
	var $index = {};

// ---- Form ----
	
	for ( var $i = 0; $i < $form.elements.length; $i++ ) {

	// ---- Element ----
	
		// Getting form element, it's name and value that should be applied
		var $el		= $form.elements.item($i);

		// Skipping it if it does not have name
		if ( !$el.name )
			continue;

		// Getting element name
		var $name	= $el.name;
		
		// Expecting array to happen, so parsing as path right away
		var $path	= regexMatchAll(/[\w\-]+/g, $name);
		
		// Problematic paths are skipped too
		if ( !$path[0] )
			continue;
			
		// Full match is all we need
		$path = $path[0];	

		// Indexing now, as it looks like valid name
		$index[$name]	= isSet($index[$name]) ? ++$index[$name] : 0;
	
	// ---- Value ----
	
		var $val = arrayPath($data, $path);

		// Resolving set
		var $set = $val;
		if ( $set && $name.endsWith('[]') ) { 
			
			// Getting value by index
			$val = $set[$index[$name]];
			
		} //IF set given
		
		// Making sure value is valid after all
		$val = ( isUndefined($val) || $val === false || $val === null ) ? '' : $val;
		
		// Special case for date inputs
		if ( $val == '0000-00-00' || $val == '0000-00-00 00:00:00' )
			$val = '';

	// ---- Inputs ----

		switch ($el.type) {
			
			case 'checkbox'	: 
			case 'radio'	: 

				// For simple checkboxes - comparing against found value
				// Value will be either set directly or indexed in set 
				if ( $el.value == 'on' ) {

					$el.checked = ( !isEmpty($val) );
					break;

				} //IF simple checkbox
			
				// If not part of set - just checking values to match
				// Casting incoming value to string manually to ensure that match is correct for numbers
				// Input value is always string anyway
				if ( !isObject($set, true) ) {
					
					$el.checked = ( $val.toString() === $el.value );
					break;
					
				} //IF not a set

				// Custom behavior if part of set - checking by value presense
				// Looping through and checking if value is there
				// Doing manually instead of array's indexOf cuz assoc array or object could happen
				var $tmp = false;
				for ( var $t in $set )
					if ( $t in $set && $set[$t].toString() === $el.value )
						$tmp = true;
						
				$el.checked = $tmp;
			
				break;
				
			case 'select-one'	:
			case 'select-multiple'	:
				
				// Using entire set
				setValue_Select($el, $set);

				break;
				
			case 'file' :
			
				// File just resetting to default.

				// Getting input HTML, then creating new element from it, 
				// because simple clone will not help
				
				// Skipping styled forms
				// ToDo: capture events instead

				if ( $el.className.indexOf('mw') !== -1 )
					break;

				var $html = getOuterHTML($el);
				setOuterHTML($el, $html);

				break;
				
			case 'textarea'	:
				
				// Checking if textarea can be tinyMCE
				if ( $el.style.display == 'none' && ( typeof tinyMCE != 'undefined' ) ) {
					
					// Checking if tiny really applied to it
					var $tiny = tinyMCE.get($el.id);
					
					// If it's tiny - setting values into it too.
					if ( $tiny )
						$tiny.setContent($val);
					
				}; //IF hidden and tinyMCE exists

				$el.value = $val;
				
				break;
				
			case 'button' :
			case 'submit' :
			
				break;
				
			default	:
				$el.value = $val;
		} //SWITCH

		// Triggering onChange in case if some set.
		if ( isSet(jQuery) ) 
			jQuery($el).change();

	} //FOR each element

} //FUNC formFromArray

/** //** ----= jQuery.asArray	=--------------------------------------------------------------------------------------\**//** \
*
* 	Simple jQuery wrapper for formToArray() function.
*	
*	@return	array	- Form elements valus as array.
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
jQuery.fn.asArray = function ($options) {
	
	if ( !this.is('FORM') ) return {};

	return formToArray(this.get(0), $options);
} //FUNC asArray

/** //** ----= jQuery.fromArray	=--------------------------------------------------------------------------------------\**//** \
*
* 	Simple jQuery wrapper for formFromArray() function.
*
*	@param	object	data	- Array with values to set to elements.
*	@return	jQuery		- jQuery object for chain calls.
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
jQuery.fn.fromArray = function (data) {
	
	if ( !this.is('FORM') ) return this;

	formFromArray( this.get(0), data );
	
	return this;
} //FUNC fromArray

/*--------------------------------------------------------------------------------*\
|	getValue_Select
|----------------------------------------------------------------------------------
| Returns correct value of <select> based in setted or not value attribute. IE FIX.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		element	object	- DOM elemnt to get value.
|	Return:
|			MIXED
|			bool	- FALSE in case of error.
|			string	- Element value.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function getValue_Select (element) {
	
	if ( element.options.selectedIndex < 0 ) return false;
	
	var option	= element.options[element.options.selectedIndex];
	var value	= getValue_Option(option);
	//(option.attributes.value && option.attributes.value.specified)? option.value : option.text
	
	return value;
} //FUNC getValue_Select

/*--------------------------------------------------------------------------------*\
|	getValue_MutliSelect
|----------------------------------------------------------------------------------
| Returns values of <select> with multiple selection enabled as an array.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		element	object	- DOM elemnt to get value.
|	Return:
|			array	- Array with values. Can be emty.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function getValue_MutliSelect (element) {

	var res = [] ;
	
	if ( !element.options || element.options.length <= 0 ) return res;

	for ( var i = 0; i < element.options.length; i++ ) {
		
		if ( !element.options[i].selected ) continue;
		
		res.push(getValue_Option(element.options[i]));
	} //FOR all managers

	return res;
} //FUNC getValue_MutliSelect

/*--------------------------------------------------------------------------------*\
|	setValue_Select
|----------------------------------------------------------------------------------
| Correctly sets value to selector. Works in old IE.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		element	object	- DOM elemnt to set value.
|		values	MIXED	- Single string value or array with selected values.
|	Return:
|			VOID
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function setValue_Select (element, values) {

	if ( element.options.length <= 0 ) return;

	if ( !values )
		values = [];

	if ( typeof(values) != 'object' ) {
	
		// Converting values depending on multiple attribute
	 	// If multiple - most likely it's simple array string.
		if ( element.multiple || element.size )
			values = strToArray(values);
		else 
			// Stringifying value, cuz if integer come - indexOf will ignore it
			values = [values+''];
	
	} //IF not array come

	for ( var i = 0; i < element.options.length; i++ ) {
		
		var val = getValue_Option(element.options[i]);
		
		element.options[i].selected = (values.indexOf(val) != -1);
		
	} //FOR all elements

} //FUNC setValue_Select

/*--------------------------------------------------------------------------------*\
|	getValue_Option
|----------------------------------------------------------------------------------
| Returns correct value of <option> based in setted or not value attribute. IE FIX.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		element	object	- DOM elemnt to get value.
|	Return:
|			string	- Element value.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function getValue_Option (element) {
	var value	= (element.attributes.value && element.attributes.value.specified)? element.value : element.text;
	return value;
} //FUNC getValue_Option

/*--------------------------------------------------------------------------------*\
|	getSelectorOptions
|----------------------------------------------------------------------------------
| Returns array with selector values.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		element	object	- DOM elemnt to get value.
|	Return:
|			array	- Selector values.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function getSelectorOptions (element) {
	
	var res = [] ;
	
	if ( !element.options || element.options.length <= 0 ) return res;

	for ( var i = 0; i < element.options.length; i++ ) {

		var option = element.options[i];

		if ( option.attributes.value && option.attributes.value.specified ) {
			res[option.value] = option.text;
		} else { //IF value set
			res.push(option.text);
		} //IF value not set
		
	} //FOR each option

	return res;
} //FUNC getSelectorOptions

/** //** ----= strToArray		 =--------------------------------------\**//** \
*
* 	Splits string into array with given delimeters, trimming resulting items.
*
* 	@param	string	str	- String to split.
*	@return	array		- Resulting array.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function strToArray(str, delim) {
	
	// No need to split if already array
	if ( isArray(str) )
		return str;
	
	delim = delim || ',|';
	
	var tmp = str.split( new RegExp('\\s*[' + delim + ']\\s*') );
	
	var res = [];
	
	// Skipping empties
	for ( var i in tmp )
		if ( tmp[i] ) res.push(tmp[i]);
	
	return res; 	
} //FUNC strToArray

/** //** ----= strToObj		 =----------------------------------------------\**//** \
*
* 	Splits string into object array with given delimeters
*
* 	@param	string	str	- String to split.
*	@return	array		- Resulting array.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function strToObj (str, delim, auto_tirm) {
	
	var res	= {};
	
	if ( !str )
		return res;
	
	var tmp = str.split(delim);
	
	var j = 0;
	
	for ( var i in tmp ) {
		
		var pos = tmp[i].indexOf('=');

		if ( pos != -1 ) {
			var key = tmp[i].substr(0, pos);
			var val = tmp[i].substr(pos+1);
		} else { //IF eq symbol found
			var key = j+'';
			var val = tmp[i];
		} //IF single value

		key = key.trim();

		if ( auto_tirm )
			val = val.trim();
			
		res[key] = val;
			
		j++;
		
	} //FOR each value

	return res;
} //FUNC strToObj

/** //** ----= cb			 =--------------------------------------\**//** \
*
* 	Callback runner helper. Used to simplify code. Checks if funciton given.
*
* 	@param	function	func	- Function to run.
*	@param	MIXED		*	- All next parameters will be passed to function.
*
*	@return	MIXED			- Funciton restult.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function cb(func, args) {

	// ToDo: apply is not applicable here, so think better way;
	
} //FUNC cb

/** //** ----= checkAll			 =--------------------------------------\**//** \
*
* 	Sets value to all checkboxes in an element.
*
* 	@param	bool	value	- Checkbox state.
* 	@param	string	element	- jQuery selector.
*	@return	bool		- Initial value.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function checkAll (value, element) {
	
	jQuery(element).find('INPUT[type=checkbox]').attr('checked', value);

	return false;	
} //FUNC checkAll

function ToggleDisplay(elementID, state) {
	element = document.getElementById(elementID);
	
	if ( !element ) return;
	
	if (state == undefined) {
		state = ( element.style.display == 'none' );
	} //IF no state specified
	
	element.style.display = state ? 'inline' : 'none';
} //FUNC ToggleDisplay

function screenSize() {
    var w, h;
    w = (window.innerWidth ? window.innerWidth : (document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body.offsetWidth));
    h = (window.innerHeight ? window.innerHeight : (document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.offsetHeight));
    return {width:w, height:h};
}

function selectRow(row, state) {
	var row_class =	jQuery('#'+row).attr('class');
	row_class = row_class.replace('_selected','');
	row_class += ( state )? '_selected' : '';
	jQuery('#'+row).attr('class', row_class);
} //FUNC selectRow

/*/
function insert_bar (bar_place) {
	jQuery('#'+bar_place).html('<IMG src="/images/processing/bar.gif" alt="Loading...">');
} //FUNC insert_bar

function insert_green_bar (bar_place) {
	jQuery('#'+bar_place).html('<IMG src="/images/processing/bar_green.gif" alt="Loading...">');
} //FUNC insert_bar
//*/

/** //** ----= getCookie		 =--------------------------------------\**//** \
*
* 	Returns cookie with given name.
*
* 	@param	string	name	- Cookie name to search.
*	@param	string	[def]	- Default value to return if cookie not found.
*
*	@return	string		- Cookie value.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function getCookie (name, def) {

	if ( def == undefined ) def = '';

	var cookieValue	= def;
	var cookieName	= name + '=';
	
	if ( document.cookie.length > 0 ) { 
	
		offset = document.cookie.lastIndexOf(cookieName);
		if ( offset != -1 ) { 
		
			offset	+= cookieName.length;
			
			end	= document.cookie.indexOf(';', offset);
			if (end == -1) end = document.cookie.length;
			
			cookieValue = unescape(document.cookie.substring(offset, end))
		
		} //IF found smth
	
	} //IF there are cookies
	
	return cookieValue;
} //FUNC getCookie

/** //** ----= setCookie	 =----------------------------------------------\**//** \
*
*	Sets cookie with given name.
*
*	@param	string	name	- Cookie name to set.
*	@param	string	value	- Value of cookie.
*	@param	string	[hours]	- Expiration date in hours.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function setCookie (name, value, hours) {
	
	var expire	= "";
	
	if ( hours ) {
		expire = new Date((new Date()).getTime() + hours * 3600000);
		expire = "; expires=" + expire.toGMTString();
	} //IF there is set expiration
	
	document.cookie = name + "=" + escape(value) + expire + ';path=/;';
	
} //FUNC setCookie

function get_controller_views(views) {
		insert_bars(views);
		insert_views(views,0);
} //FUNC get_controller_views

function mark_checkboxes(container_form,val) {
	for (var i = 0; i < container_form.elements.length; i++) {
		el = container_form.elements[i];
		if (el.type=='checkbox')
			el.checked=val;
	}
} //FUNC mark_checkboxes

function status_string(message,style_class,padding) {
	if (message == '') return '';
	if (!style_class) style_class = 'status_error';
	if (!padding) padding = 0;
	return '<div class="'+style_class+'" style="padding:'+padding+'px">'+message+'</div>';
} //FUNC error_string

function ajax_pack_data(controller_url,place_to_put, data, ajax_options) {
	var res = [];
	res['controller']	= controller_url;
	res['place']		= place_to_put;
	if (!data) data	= {};
	res['data']		= data;
	if (!ajax_options) ajax_options	= {};
	res['options']		= ajax_options;
	return res;
} //FUNC pack_view

function ajax_insert_bars(views) {
	for (i=0; i < views.length; i++) {
		insert_bar(views[i]['place']);
	} //FOR each views
} //FUNC insert_bars

function ajax_insert_views(views,num) {
	if (num >= views.length) return false;

	var tdata = views[num]['data'];
	
	if (views[num]['options'].onLoad) {views[num]['options'].onLoad(tdata)};
	jQuery.ajax({
		type	: 'POST', dataType: 'html',
		url	: views[num]['controller'],
		data	: views[num]['data'],
		success	: function(obj){
				jQuery('#'+views[num]['place']).html(obj);
				ajax_insert_views(views,num+1);
				if (views[num]['options'].onSuccess) {views[num]['options'].onSuccess(tdata)};
			},//FUNC success
		error : function (XMLHttpRequest, textStatus, errorThrown) {
				jQuery('#'+views[num]['place']).html(status_string('This section is not avaible now (Possibly under construction). Try again later.'));
				ajax_insert_views(views,num+1);
			} //FUNC error
	}); //ajax
}//FUNC insert_views

function ajax_get_views(views) {
		ajax_insert_bars(views);
		ajax_insert_views(views,0);
} //FUNC get_controller_views

function ajax_get_view(controller_url,place_to_put,data, ajax_options) {
	ajax_get_views([ajax_pack_data(controller_url,place_to_put,data, ajax_options)]);
} //FUNC get_controller_view

function ajax_post (post_form,controller,status_place,settings) {
	insert_bar(status_place);
	var tt = document.getElementById(post_form);
	if (!tt) alert('no form');
//*/
	jQuery.ajaxUpload ({
		type		: 'POST', dataType : 'html',
	        url		: controller,
	        secureuri	: false,
	        uploadform	: document.getElementById(post_form),
	        success		: function (res, status) {
					data = res.split('<!-- CUT -->');
					jQuery('#'+status_place).html(data[0]);

					if ((data.length != 1) && (data[1] == 'success') ) {
						if (settings.success) settings.success(data);
					} else {
						if (settings.error) settings.error(data);
					} //IF returned status

				}, //FUNC sucess
		error		: function (res, status) {
					alert('error');
					jQuery('#'+status_place).html(status_string('Error: '+status));
					if (settings.error) settings.error();
				} //FUNC error

	}); //AJAX
//*/	
} //FUNC ajax_post

/** //** ----= getDimensions	=--------------------------------------------------------------------------------------\**//** \
*
*	Parses strings like '100x200' into [x,y] dimensions pair (with Y being optional). 
* 	Returns FALSE if string does not contain valid dimensions string.
*
*	@param		string	$dimensions	- Dimensions string.
* 	@param		bool	[$strict]	- Strict validation. Will require Y to present
*
*	@return		MIXED			- Array with named dimensons or FALSE if failed.
*
\**//** ---------------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function getDimensions ($dimensions, $strict) {
	
	// Nothing to do if notihng fiven
	if ( !$dimensions )
		return false;
	
	// Simple check for compatability with parsed dimensions, allowing mixed params in callee funcions.
	if ( isArray($dimensions) || isObject($dimensions) ) {
		
		// Fast validation for X to be present: it's minimal requirement for valid dimensions array
		if ( !isSet($dimensions['x']) )
			return false;
			
		// Fast validation for strict mode
		if ( $strict && !isSet($dimensions['y']) )
			return false;
		
		return $dimensions;
	} //IF array given
	
	// Parsing for dimensions, using regex. It also allows to validate dimensions stirng.
	// X and Y will be named in matches, which makes it easyer to return. 

	// Strict option really changes counter for second (x200) match
	$strict = $strict ? '+' : '?';

	// Capturing groups and then checking once that good
	var $reg	= '^([0-9]+)(x([0-9]+))' + $strict + '$';
	var $match	= $dimensions.match( new RegExp($reg, 'i') );
	
	// Checking existing  params
	if ( !$match )
		return false;
	
	// Grabbing only named matches into result (to keep result clear)
	var $res = {};
	
	// X always present at this step (othewise we'd returned already)
	$res['x']	= $match[1];	
	
	// Y is optional	
	if ( isSet($match[3]) )
		$res['y'] = $match[3];
	
	// Can return now
	return $res;
} //FUNC getDimensions

/* #### MATH ################################################################################################################ */ 

/** //** ----= asDeg	=----------------------------------------------------------------------------------------------\**//** \
*
*	Converts radians to degrees.
*
*	@param		float	$angle	- Angle in radians.
*
*	@return		flaot		- Angle in degrees.
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function asDeg ($angle) {
	return $angle * (180 / Math.PI);
} //FUNC asDeg

/** //** ----= asRad	=----------------------------------------------------------------------------------------------\**//** \
*
*	Converts degrees to radians.
*
*	@param		float	$angle	- Angle in degrees.
*
*	@return		flaot		- Angle in radians.
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function asRad ($angle) {
	return $angle * (Math.PI / 180);
} //FUNC asRad
