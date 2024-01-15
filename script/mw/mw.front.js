/** //** ----= updateLandingCookie	=--------------------------------------------------------------------------------------\**//** \
*
*	Basic landing cookie manager. 
*
*	@param		string	[$page]	- Source page to redirect from. By default current page is used.
*	@param		MIXED	$url	- Target url. If link element specified - will use href attribute. 
*					  If set to FALSE redirect will be deleted.
*
\**//** ---------------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function updateLandingCookie ($page, $url) {

	// Preparing target
	$page	= !isEmpty($page) ? $page : location.pathname;

	// Reading url
	$url	= $url.pathname ? $url.pathname : $url;

	// Reading current cookie, to update/add new redirect
	var $c = getCookie('mwLandingUrls', {});
	
	if ( !isObject($c) )
		$c = JSON.parse($c);

	// Adding/updating/removing redirect
	if ( $url )
		$c[$page] = $url;
	else
		delete($c[$page]);

	// Saving cookie
	$c = JSON.stringify($c);
	setCookie('mwLandingUrls', $c);

} //FUNC updateLandingCookie

/** //** ----= setLandingUrl	=--------------------------------------------------------------------------------------\**//** \
*
*	Stores landing cookie for specified page.
*
*	@param		MIXED	$url	- Target url. If link element specified - will use href attribute.
*	@param		string	[$page]	- Source page to redirect from. By default current page is used.
*
\**//** ---------------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function setLandingUrl ($url, $page) {
	updateLandingCookie($page, $url);	
} //FUNC setLandingUrl

/** //** ----= clearLandingUrl	=--------------------------------------------------------------------------------------\**//** \
*
*	Clears landing cookie for specified page.
*
*	@param		string	$page	- Source page to clear redirect for. If link element specified - will use href attribute.
*
\**//** ---------------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function clearLandingUrl ($page) {

	// Reading target
	$page =  $page.pathname ? $page.pathname : $page;
	
	if ( !$page )
		return;
	
	updateLandingCookie($page, false);		
	
} //FUNC clearLandingUrl