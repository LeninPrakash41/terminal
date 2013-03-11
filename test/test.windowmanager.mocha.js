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

    it( "should save persistent data with root window",

    function() {

        var
            winman =
                $( '#window_manager' )
                    .windowManager(),

            wndclass = { name: "testwindow" };

        assert.isObject(

            $( '#window_manager .__window__manager__root__' )
                .data( 'persistent' ),

            "no persistent data in root window" );

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

    it( "should give the window a classname provided in the wndClass attribute",

    function() {

        var
            winman =
                $( '#window_manager' )
                    .windowManager(),

            wndclass = {
                width: 250,
                height: 250,
                wndClass: 'testwin'
            };

        assert.isTrue(

            winman
                .windowManager( 'open_window', wndclass )
                .find( '.__window__manager__root__' )
                .children( '.window' )
                .hasClass( 'testwin' ),

            "new window did not receive window class name" );

    } );

    it( "should give the window a title string provided in the wndTitle attribute",

    function() {

        var
            testTitle =
                'This is a test window...',

            winman =
                $( '#window_manager' )
                    .windowManager(),

            wndclass = {
                width: 250,
                height: 250,
                wndTitle: testTitle
            };

        assert.equal(

            $.trim(
                winman
                    .windowManager( 'open_window', wndclass )
                    .find( '.__window__manager__root__ .window .titleBar' )
                    .clone()
                    .children()
                    .remove()
                    .end()
                    .text() ),

            testTitle,

            "new window did not receive the coorect title" );

    } );

    it( "should report window attributes through callback after creation",

    function( done ) {

        var
            winman =
                $( '#window_manager' )
                    .windowManager(),

            wndclass = {
                width: 250,
                height: 250,
                wndProc:
                    function( winInfo ) {

                        assert.match(

                            winInfo.hWnd,

                            /^win_[0-9a-f]{8}/,

                            "winInfo did not return hWnd" );

                        done();
                    }
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