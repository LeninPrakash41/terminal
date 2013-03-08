describe( "windowManager", function() {

    it( "should exist as jQuery namespace",

    function() {

        assert.isFunction(

        	$.fn.windowManager,

        	"no windowManager plugin in jQuery object" );

    } );

    it( "should have a method for appointing an element as mainframe parent",

    function() {

    	assert.lengthOf(

    		$( '#window_manager' )
    			.windowManager(),

    		1,

    		"no method for initializing the windowManager" );

    } );

    it( "should insert a root HTML element",

    function() {

        assert.lengthOf(

        	$( '#window_manager' )
        		.windowManager()
        		.find( '.__window__manager__root__' ),

        	1,

        	"no root element found" );

    } );

    it( "should display a new window when 'open_window' is called",

    function() {

    	var
    		winman =
    			$( '#window_manager' )
    				.windowManager();

    	assert.lengthOf(

    		winman
    			.windowManager( 'open_window' )
    			.find( '.__window__manager__root__' )
    			.children(),

    		1,

    		"expected windowManager to have one child window" );

    } );

    it( "should give new window an unique ID",

    function() {

    	var
    		winman =
    			$( '#window_manager' )
    				.windowManager()
    				.windowManager( 'open_window' );

        assert.match(

            winman
            	.find( '.window' )
            	.attr( 'id' ),

            /^win_[0-9a-f]+/,

            "new window did not have a correctly formatted ID" );

    } );

    it( "should size the new window according to the settings",

    function() {

    	var
    		winman =
    			$( '#window_manager' )
    				.windowManager(),

    		wndclass = {
    			width: 250,
    			height: 250
    		};

    	assert.equal(

    		winman
    			.windowManager( 'open_window', wndclass )
    			.find( '.__window__manager__root__' )
    			.children( '.window' )
    			.width(),

    		250,

    		"wrong width of new window" );

    } );

} );