/** //** ----= CLASS mwUrl	=--------------------------------------------------------------------------------------\**//** \
*
* 	Morweb urls compilation helper.
*
* 	@package	Morweb
* 	@subpackage	Core
* 	@category	helper
*
\**//** ---------------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function mwUrl ($section) {
    return {
        
        section		: $section || false,	// Sectional url. Set TRUE for sectional core resoureces (applicable only for resources).
        _full		: false,		// Set TRUE to generate full url (inluding protocol and domain). Usefull for emails and standalone pages.
        _ssl		: null,			// HTTPS use for full urls, set TRUE to force, FALSE to force non SSL, NULL (default) for autodetect.
        _salt		: false,		// Set TRUE or give random string value to prevent browser caching, adding salt to url. 
    
    /* ==== SETUP =============================================================================================================== */ 	
        
        /** //** ----= full	=--------------------------------------------------------------------------------------\**//** \
        *
        *	Full mode switcher.	
        *
        * 	@param	bool	[$value]	- Value to set.
        * 	@param	bool	[$ssl]		- Force ssl usage.
        * 
        *	@return	SELF
        *
        \**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
        full		: function ($value, $ssl) {
            
            $value		= setDefault($value, true);
                
            this._full	= $value;
            this._ssl	= $ssl;
            
            return this;
        }, //FUNC full
        
        /** //** ----= salt	=--------------------------------------------------------------------------------------\**//** \
        *
        *	Initiates url salting. Use with precaution - this dastically slows down site loading speed.	
        *
        * 	@param	MIXED	[$value]	- Set TRUE to randomize salt, or random string value to preset hash value.
        * 
        *	@return	SELF
        *
        \**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
        salt		: function ($value) {
    
            $value		= setDefault($value, true);
    
            this._salt	= ($value === true) ? randomString() : $value;
            
            return this;
        }, //FUNC salt
    
    /* ==== RESOURCES =========================================================================================================== */ 	
    
        /** //** ----= res	=--------------------------------------------------------------------------------------\**//** \
        *
        *	Miscellaneous system resource load. Always uses direct load.	
        *
        * 	@param	string	- Path segments to compile.
        * 
        *	@return	SELF
        *
        \**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
        res		: function () {
            var $arr = Array.prototype.slice.call(arguments);
            return this.compile( [CMS_ALIAS, CMS_RES].concat($arr) );
        }, //FUNC res
        
        /** //** ----= js	=--------------------------------------------------------------------------------------\**//** \
        *
        *	JS resource url. For system resource uses direct load by default.	
        *
        * 	@param	string	- Path segments to compile.
        * 
        *	@return	SELF
        *
        \**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
        js		: function () {
            return this.compile( this.resSegments(CMS_JS, arguments) );
        }, //FUNC js
        
        /** //** ----= css	=--------------------------------------------------------------------------------------\**//** \
        *
        *	CSS resource url. For system resource uses direct load by default.	
        *
        * 	@param	string	- Path segments to compile.
        * 
        *	@return	SELF
        *
        \**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
        css		: function () {
            return this.compile( this.resSegments(CMS_CSS, arguments) );
        }, //FUNC css
        
        /** //** ----= images	=--------------------------------------------------------------------------------------\**//** \
        *
        *	Images resource url. For system resource uses direct load by default.	
        *
        * 	@param	string	$path	- Path parts to compile.
        * 
        *	@return	SELF
        *
        \**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
        images		: function () {
            return this.compile( this.resSegments(CMS_IMAGES, arguments) );
        }, //FUNC images
        
        /** //** ----= image	=--------------------------------------------------------------------------------------\**//** \
        *
        *	Image resizer url.	
        *
        * 	@param	string	$path	- Image path.
        * 
        *	@return	SELF
        *
        \**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
        image		: function ($path, $arguments) {
            
            $arguments = $arguments || [];
            
            // Hardcoded resizer path, which always present
            var $url = this.compile('get/files/image', $path);
            
            // Nothing else to do, if no arguments given
            if ( isEmpty($arguments) )
                return $url;
            
            // If arguments provided - compiling GET and appending to url
            $url += '?'+implode('&', $arguments);
            
            return $url;		
        }, //FUNC image
    
    /* ==== CONTROLLERS ========================================================================================================= */ 	
    
        // ToDo: ajax/call funcitons for sectional controllers calls.
    
    /* ==== HELPERS ============================================================================================================= */ 	
    
        /** //** ----= resSegments	=------------------------------------------------------------------------------\**//** \
        *
        *	Prepares resource segments, based on current settings. 
        *	Concatenates resources segments with provided path segments.
        *
        * 	@param	string	$resource	- Resource type path.
        * 	@param	array	[$segments]	- Additional segments to concat with.
        * 
        *	@return	SELF
        *
        \**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
        resSegments	: function  ($resource, $segments) {
    
            $resource = $resource || '';
    
            // Converting segments into array, in case of arguments object given		
            $segments = Array.prototype.slice.call($segments);
            
            // Adding section segments
            var $res = [];
            
            // Direct resources are using alias
            if ( isEmpty(this.section) )
                $res.push(CMS_ALIAS);
    
            // Pointing to resource			
            $res.push(CMS_RES);
            
            // Adding section if specified
            if ( isString(this.section) )
                $res.push(this.section);
            
            // Finishing with resource segment
            $res.push($resource);
            
            // Concatenating with segments
            $res = $res.concat($segments);
            
            return $res;
        }, //FUNC resSegments
    
        /** //** ----= compile	=--------------------------------------------------------------------------------------\**//** \
        *
        *	Compiles url from given URI segments. Parts can be passed as array, or as multiple funciton arguments.
        *
        * 	@param	string	$segments	- URI segments to compile.
        * 
        *	@return	SELF
        *
        \**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
        compile		: function  ($segments) {
        
            var $seg = isArray($segments) ? $segments : arguments;
            
            // Concatenating each non empty segment, trimming slashes and spaces
            var $res = '';
            for ( var $i in $seg ) {
                $s = $seg[$i];
                
                // Making sure strings come
                if ( !isString($s) )
                    continue;
                
                // Timming garbage
                $s = $s.trim(' /\\');
                
                // Skipping empties
                if ( isEmpty($s) )
                    continue;
                
                // Concatenating with leading '/', which always present
                $res += '/'+$s;
                
            } //FOR each segment
    
            // Adding domain if specified
            if ( this._full )
                $res = fullURL($res, this._ssl);
    
            // Adding salt if specified
            if ( this._salt )
                $res += '?'+this._salt;
                
            // Done.
            return $res;
        }, //FUNC compile
        
    }} //CLASS mwUrl
    