/* 
	This JS makes liveEd responsive, still having paddings/borders on blocks.
	New liveEd will have responsive nature, which will make most of this object obsolete
	
	liveEd uses "Rows" conception, when several blocks with float:left form row. Several rows are broken with cler:both
	liveEd have own responsive math, which is kinda duped here. Again - this is obsolete.
 */
 
    mwResponsive = {
	
        pageArea		: 'DIV.mwPageArea',	// Page area selector
        pageBlock		: 'DIV.mwPageBlock',	// Page widget element selector
        classFloat		: 'Float',		// Class applied to floating blocks
        classHost		: 'rowHost',		// Class applied to first col in a row
        classPlaceholder	: 'Placeholder',	// Class applied to placeholder blocks
    
        blocks			: false,		// All found page blocks
        rows			: [],			// Filtered rows
    
        /** //** ----= init	=--------------------------------------------------------------------------------------\**//** \
        *
        * 	Initiates responsive math on page.
        * 
        \**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
        init		: function () {
            var $this = this;
    
            $this.updateRowsData();
    
            // Hiding liveEd for small windows
            jQuery(window).resize( function ($e) {
                for ( var $i = 0; $i < $this.rows.length; $i++ ) {
                    $this.setRowHeight($this.rows[$i]);
                } //FOR each row
            }); //FUNC jQuery.resize
    
            jQuery(window).resize();
            
        }, //FUNC init
    
        /** //** ----= updateRowsData	=------------------------------------------------------------------------------\**//** \
        *
        * 	Searches for blocks on page and updates rows map.
        * 
        \**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
        updateRowsData		: function () {
            
            var $this = this;
            
            $this.blocks	= jQuery($this.pageBlock);
            $this.rows	= $this.getRows($this.blocks); 
    
            // Updating found rows widths and heights
            for ( var $i = 0; $i < $this.rows.length; $i++ ) {
                $this.setRowWidth($this.rows[$i]);
                $this.setRowHeight($this.rows[$i]);
            } //FOR each row
                    
        }, //FUNC updateRowsData
        
        /** //** ----= isFloat	=--------------------------------------------------------------------------------------\**//** \
        *
        * 	Checks if given element is floating block. This counts any element which behaves like floating block, 
        *	either block or placeholder (which inherits initial float property from block)
        * 
        * 	@param	jQuery	$el		- Element to check. 
        * 
        * 	@return	bool			- Check result.
        * 
        \**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
        isFloat		: function ($el) {
            return $el.hasClass(this.classFloat);
        }, //FUNC isFloat
    
        /** //** ----= isHost	=--------------------------------------------------------------------------------------\**//** \
        *
        * 	Checks if given floating block starts new row.
        * 
        * 	@param	jQuery	$el		- Element to check. 
        * 
        * 	@return	bool			- Check result.
        * 
        \**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
        isHost		: function ($el) {
            return $el.hasClass(this.classHost);
        }, //FUNC isHost
    
        /** //** ----= isPlaceholder	=------------------------------------------------------------------------------\**//** \
        *
        * 	Checks if given element is sorting placeholder.
        * 
        * 	@param	jQuery	$el		- Element to check. 
        * 
        * 	@return	bool			- Check result.
        * 
        \**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
        isPlaceholder	: function ($el) {
            return $el.hasClass(this.classPlaceholder);
        }, //FUNC isPlaceholder
        
        /** //** ----= getAreas	=--------------------------------------------------------------------------------------\**//** \
        *
        * 	Searches areas within context or on page body if omited. If area is given as context - 
        *	it will be included in results. Returns jQuery object containing found areas.
        *
        *	@param	jQuery	[$context]	- Context to search within. 
        *
        *	@return	jQuery			- jQuery object containing found areas.
        *
        \**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
        getAreas	: function ($context) {
    
            $context = $context || jQuery('BODY');
    
            // Looking up for areas within context
            var $areas	= $context.find(this.pageArea);
            
            // If area given as context, it shold be included too
            if ( $context.is(this.pageArea) )
                $areas = $areas.add($context); 
                
            return $areas;
        }, //FUNC getAreas
    
        /** //** ----= getRow	=--------------------------------------------------------------------------------------\**//** \
        *
        * 	Returns row which current block belongs as array of jQuery blocks. If it's not part of a row, returns FALSE.
        *
        *	@param	jQuery	$block	- Block to return row for. 
        *
        *	@return	MIXED		- Array with siblings or FALSE if not part of row.
        *
        \**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
        getRow	: function ($block) {
            
            // If not floating - not part of row 
            // Exception is placeholder - it can happen between floats, and I will need to know which row it is
            if ( !this.isFloat($block) && !this.isPlaceholder($block) )
                return false;
            
            var $res = [];
            
            // Searching all blocks before block
            // If host already, no need to search previous blocks 
            if ( !$block.is('.rowHost') ) 
                $block.prevUntil(':not(.' + this.classFloat + '), .rowHost').each( function () {
                    
                    var $el = jQuery(this);
                    
                    $res.push( $el );
                    
                    // Should include host, if happen
                    var $prev = $el.prev(); 
        
                    if ( $prev.is('.rowHost') )
                        $res.push( $prev );
                    
                }); //jQuery.each(not floating).callback
    
            // jQuery prev searches from current to top, which gives reversed order
            $res.reverse();
    
            // Adding self
            $res.push($block);
    
            // Searching all blocks after block
            $block.nextUntil(':not(.' + this.classFloat + '), .rowHost').each( function () {
                $res.push( jQuery(this) );
            }); //jQuery.each(not floating).callback
            
            return $res;
        }, //FUNC getRow
    
        /** //** ----= getRows	=--------------------------------------------------------------------------------------\**//** \
        *
        * 	Returns rows map from given set of elements.
        *
        *	@param	jQuery	$context	- Elements context to arrange.
        *
        *	@return	array			- Array with found rows map.
        *
        \**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
        getRows	: function ($context) {
    
            var $this	= this;
            
            var $rows	= [];		// Will store all rows, with one there already
        
            // Filtering contect to hosts
            // Then getting row of each host
            var $hosts	= $context.filter( '.'+this.classHost );
            
            $hosts.each( function () {
                
                // Doing all in one line
                $rows.push( $this.getRow( jQuery(this) ) );
                    
            }); // each host
    
            return $rows;
            
        /*/	
            var $row	= [];		// Will store current row
            var $rows	= [$row];	// Will store all rows, with one there already
            
            // Storing length for referrence
            var $l		= $context.length;		
    
            // First calculating rows and storing them in array for fast access later
            for ( var $i = 0; $i < $l; $i++ ) {
    
                // Shortcut to block
                var $block = $context.eq($i);
    
                // Skipping invisible blocks, if they will become visible - they will be recalculated
                if ( !$block.is(':visible') )
                    continue;
                
                if ( this.isFloat($block) ) {
    
                    // Row hosts are starting new row anyway
                    if ( this.isHost($block) ) {
                        $row = [];
                        $rows.push($row);
                    } //IF new row
    
                    // Floating blocks are added into current row
                    $row.push($block);
                    
                }  //IF float
                else if ( $row.length ) {
                
                    // Others are starting new row if needed
                    $row = [];
                    $rows.push($row);
                    
                } //IF new row
                
            } //FOR each block
            
            return $rows;
        /**/	
        }, //FUNC getRows	
        
        /** //** ----= setRowWidth	=------------------------------------------------------------------------------\**//** \
        *
        * 	Updates given row with % dimensions instead of static px. Initially page is rendered with px, resizing 
        *	also does px.
        *
        *	@param	array	$row		- Array with blocks in a row.
        *	@param	MIXED	[$width]	- Numeric width to set. If omited will be calculated from parent area.
        *					  Can be given as jQuery area.
        *	@param	bool	[$px]		- Set TRUE to correct widhts into absolute px instead of %.
        *
        *	@return	SELF
        *
        \**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
        setRowWidth	: function ($row, $width, $px) {
    
            $width	= $width || 0;
            $px	= $px || false;
    
            if ( !$row || !$row.length )
                return this;
    
            if ( $width instanceof jQuery ) {
                
                // Got parent area to use as source
                $width = $width.width();
                
            } else if ( !$width ) {	
            
                // Nothing given - using parent area of first block (it exists - checked above)
                $width = $row[0].parent().width();
            
            } //IF nothing given
    
            var $row_width	= 0;		// Summary row width
            var $l		= $row.length;	// Saving row array length for fast access
            
        // ---- WIDTHS ----
            
            // Calculating summary row width
            for ( var $i = 0; $i < $l; $i++ ) {
                
                var $block		= $row[$i];
                
                // Getting width and padding
                var $block_width	= $block.width();
                var $block_pad		= $block.outerWidth() - $block_width;
                
                // Adding padding back to width
                $block_width	+= $block_pad;
                
                // Correcting block width - can't be more than area width
                if ( $block_width > $width ) {
                    $block_width = $width;
                    $block.width($width - $block_pad);
                } //IF block is too big
                
                // Adding total
                $row_width += $block_width;
                
                // Saving width into block object to do not regain later,
                // should not interferee with internal properties
                $block.tmp_width	= $block_width;
                $block.tmp_pad		= $block_pad;
            } //FOR each block in row
            
            // Nothing to do for empty row (possibly everything was invisible)
            if ( !$row_width )
                return this;
    
            var $precision	= 100;
            var $total	= 100;
            var $totalPx	= $row_width;
    
            // Converting width for each block
            for ( var $i = 0; $i < $l; $i++ ) {
                
                var $block	= $row[$i];
                
                var $pw		= $block.tmp_width;
                var $w		= Math.round($block.tmp_width / ($row_width / 100) * $precision) / $precision;
                
                // Correcting to total, adding delta to last block
                $totalPx	-= $pw;
                $total		-= $w;
    
                // Correcting last column if total is not 0 
                if ( $i == $l-1 ) {
                    $pw	= $pw + $totalPx;
                    $w	= Math.round(($w + $total) * $precision) / $precision;
                } //IF last element 
                
                if ( $px )
                    // Setting css in px. Nothing tricky here
                    $block.width($pw);
                else
                    // Setting width css in %. Using calc() in case padding happen, or classic % width if not
                    $block.css('width', $block.tmp_pad ? 'calc(' + $w + '% - ' + $block.tmp_pad + 'px)' : $w + '%' );
                
            } //FOR each block in row
            
            return this;		
        }, //FUNC setRowWidth
    
        /** //** ----= setRowHeight	=------------------------------------------------------------------------------\**//** \
        *
        * 	Sets row height, updating all blocks in it with min-height property.
        *
        *	@param	array	$row		- Array with blocks in a row.
        *	@param	int	$height		- Height to set.
        *
        *	@return	SELF
        *
        \**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
        setRowHeight	: function ($row, $height) {
            
            $height	= $height || 0;
            
            var $l	= $row.length;	// Saving row length for fast access
                
            // Recalculating height if none given
            if ( !$height ) {	
    
                for ( var $i = 0; $i < $l; $i++ ) {
                    
                    // Ressetting block height to recalculate
                    $row[$i].css('min-height', '');
                    
                    // Getting resulting height					
                    var $tmp_height		= $row[$i].height();
                    var $tmp_pad		= $row[$i].outerHeight() - $tmp_height;
                    
                    $tmp_height		+= $tmp_pad;
                    
                    if ( $tmp_height > $height )
                        $height = $tmp_height; 
                    
                    // Saving block pad to count on resize
                    $row[$i].tmp_hieght_pad = $tmp_pad;
                    
                } //FOR each block in row
            } //IF no height
            
            // Now updating heights
            for ( var $i = 0; $i < $l; $i++ ) {
                $row[$i].css('min-height', $height - $row[$i].tmp_hieght_pad);
            } //FOR each block in row
            
            return this;		
        }, //FUNC setRowHeight	
        
    } //OBJECT mwResponsive
    
    jQuery( function () {
        // Initiating right away
    //	mwResponsive.init();
    }); //jQuery.onLoad
    