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

    it( "should give the close button a title corresponding to the wndClose attribute",

    function() {

        var
            testClose =
                'Close',

            winman =
                $( '#window_manager' )
                    .windowManager(),

            wndclass = {
                width: 250,
                height: 250,
                wndClose: testClose
            };

        assert.equal(

            $.trim(
                winman
                    .windowManager( 'open_window', wndclass )
                    .find( '.__window__manager__root__ .window .titleBar .close' )
                    .attr( 'title' ) ),

            testClose,

            "new window did not receive the coorect close butteon title" );

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

    it( "should put window in focus when clicked",

    function() {

        var
            winman =
                $( '#window_manager' )
                    .windowManager(),

            wndclass = {
                width: 250,
                height: 250
            },

            windows =
                winman
                    .windowManager( 'open_window', wndclass )
                    .windowManager( 'open_window', wndclass )
                    .windowManager( 'open_window', wndclass )
                    .windowManager( 'open_window', wndclass )
                    .windowManager( 'open_window', wndclass )
                    .find( '.window' );

            $( windows[ 3 ] )
                .trigger( new $.Event( 'click' ) );

            assert.isTrue(

                $( windows[ 3 ] ).hasClass( 'focus' ),

                "clicked window did not receive focus" );

    } );

    it( "should put window on top of z-order when clicked",

    function() {

        var
            winman =
                $( '#window_manager' )
                    .windowManager(),

            wndclass = {
                width: 250,
                height: 250
            },

            windows =
                winman
                    .windowManager( 'open_window', wndclass )
                    .windowManager( 'open_window', wndclass )
                    .windowManager( 'open_window', wndclass )
                    .windowManager( 'open_window', wndclass )
                    .windowManager( 'open_window', wndclass )
                    .find( '.window' );

            $( windows[ 3 ] )
                .trigger( new $.Event( 'click' ) );

            assert.equal(

                $( windows[ 3 ] ).css( 'z-index' ),

                14,

                "clicked window did not have correct z-index" );

        $( '#window_manager *' ).remove();

    } );

    it( "should dispatch notififation event when window closes",

    function( done ) {

        var
            winman =
                $( '#window_manager' )
                    .windowManager(),

            wndclass = {
                width: 250,
                height: 250
            },

            closeBtn =
                winman
                    .windowManager( 'open_window', wndclass )
                    .find( '.window .titleBar a' );

            winman.on( 'notify', function( e ) {

                assert.equal(

                    e.msg,

                    'close_window',

                    "'close_window' event was not fired" );

                done();

            } );

            $( closeBtn )
                .trigger( new $.Event( 'click' ) );

        $( '#window_manager *' ).remove();

    } );

    it( "should have a 'send_message' function",

    function( done ) {

        var
            winman =
                $( '#window_manager' )
                    .windowManager(),

            wndclass = {
                width: 250,
                height: 250
            },

            win =
                winman
                    .windowManager( 'open_window', wndclass )
                    .find( '.window' );

            win.on( 'wm_testmessage', function( e ) {

                assert.equal(

                    e.msg,

                    'wm_testmessage',

                    "test message did not arrive" );
                    
                    done();
            } );

            winman
                .windowManager( 'send_message', { msg: 'wm_testmessage' } );

        $( '#window_manager *' ).remove();

    } );

    it( "should have a 'move_window' function", function( done ) {

        var
            wndclass = {
                width: 250,
                height: 250,
                wndProc:
                    function( winInfo ) {

                        var
                            win =
                                $( '#window_manager' )
                                    .windowManager( 'move_window', winInfo.hWnd, { top: 76, left: 33 } )
                                    .find( '#' + winInfo.hWnd );

                        assert.equal(

                            win.css( 'top' ) +
                            'X' +
                            win.css( 'left' ),

                            '76pxX33px',

                            "wrong window position" );

                        done();
                    }
            };

            $( '#window_manager' )
                .windowManager()
                .windowManager( 'open_window', wndclass );

        } );

    it( "should have a 'reorganize' function", function() {

        var

            wndclass1 = {
                width: 250,
                height: 250,
                wndProc:
                    function( winInfo ) { }
            },

            wndclass2 = {
                width: 100,
                height: 400,
                wndProc:
                    function( winInfo ) { }
            },

            wndclass3 = {
                width: 400,
                height: 250,
                wndProc:
                    function( winInfo ) { }
            },

            wndclass4 = {
                width: 250,
                height: 250,
                wndProc:
                    function( winInfo ) { }
            };

            $( '#window_manager' )
                .windowManager()
                .windowManager( 'open_window', wndclass1 )
                .windowManager( 'open_window', wndclass2 )
                .windowManager( 'open_window', wndclass3 )
                .windowManager( 'open_window', wndclass4 )
                .windowManager( 'reorganize' );

            $( '#window_manager *' ).remove();
        } );

} );