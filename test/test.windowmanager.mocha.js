describe( "windowManager", function() {

    it( "should exist as jQuery namespace", function() {

        assert.isFunction( $, "hey!? where's jQuery?" );
        assert.isFunction( $.fn.windowManager, "no windowManager plugin in jQuery object" );

    } );

    it( "should have a method for appointing an element as mainframe parent", function() {

    	assert.lengthOf( $( '#window_manager' ).windowManager(), 1, "no method for initializing the windowManager" );

    } );

} );