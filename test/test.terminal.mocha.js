
var assert = chai.assert,
    expect = chai.expect,
    options,
    region,
    id1,
    id2,
    ln,
    s,
    t,
    e,
    f,
    i,
    j;

describe( "terminal", function() {

    it( "should exist", function() {

        assert.isFunction( $, "hey!? where's jQuery?" );
        assert.isFunction( $.fn.terminal, "no terminal plugin in jQuery object" );

    } );

    it( "should load and initialize options", function() {

        assert.lengthOf( $( '#terminal_test1' ).terminal(), 1, "blank initialization failed somehow" );
        assert.lengthOf( $( '#terminal_test1 .__terminal__root__' ), 1, "didn't insert root HTML element" );
        assert.isObject( options = $( '#terminal_test1 .__terminal__root__' ).data( 'options' ), "no option data related to current root element" );
        assert.equal( options.cursorBlinkRate, 250, "wrong value for cursorBlinkRate" );
        assert.lengthOf( $( '#terminal_test2' ).terminal( { cursorBlinkRate: 500 } ), 1, "initialization with options failed somehow" );
        assert.isObject( options = $( '#terminal_test2 .__terminal__root__' ).data( 'options' ), "no option data related to current root element" );
        assert.equal( options.cursorBlinkRate, 500, "wrong value for cursorBlinkRate" );
        assert.isObject( options = $( '#terminal_test1' ).terminal( 'get_options' ), "unable to retrieve options object 1" );
        assert.equal( options.cursorBlinkRate, 250, "options object 1 should have 'cursorBlinkRate' equal 250" );
        assert.isObject( options = $( '#terminal_test2' ).terminal( 'get_options' ), "unable to retrieve options object 2" );
        assert.equal( options.cursorBlinkRate, 500, "options object 1 should have 'cursorBlinkRate' equal 500" );
        assert.lengthOf( $( '.outer_container' ).terminal( { cursorBlinkRate: 500 } ), 2, "initialization of both test elements failed" );
        assert.match( id1 = $( '#terminal_test1 .__terminal__root__' ).attr( 'id' ), /^term_[0-9a-f]+/, "no unique ID assigned to 'terminal_test1'" );
        assert.match( id2 = $( '#terminal_test2 .__terminal__root__' ).attr( 'id' ), /^term_[0-9a-f]+/, "no unique ID assigned to 'terminal_test2'" );
        assert.notEqual( id1, id2, "terminal unique IDs not unique" );
        assert.isObject( options = $( '#terminal_test1' ).terminal( 'get_options' ), "unable to retrieve options object 1" );
        assert.equal( id1, options.id, "unique ID not stored in options object 1" );
        assert.isObject( options = $( '#terminal_test2' ).terminal( 'get_options' ), "unable to retrieve options object 2" );
        assert.equal( id2, options.id, "unique ID not stored in options object 2" );
        assert.isObject( options = $( '#terminal_test1' ).terminal( 'get_options' ), "should retrieve options object for first element" );
        assert.notEqual( id2, options.id, "should have been options object for element 1" );
        assert.equal( id1, options.id, "this is not the options object for element 1" );
        assert.isArray( options = [ ], "strange error declaring empty array" );
        assert.lengthOf( $( '.outer_container' ).terminal( 'get_options', function( i, o ) { options.push( o ); } ), 2, "error fetching options by callback" );
        assert.equal( id1, options[ 0 ].id, "unique ID for element 1 not stored in options array" );
        assert.equal( id2, options[ 1 ].id, "unique ID for element 2 not stored in options array" );

    } );

    it( "should let client change prompt", function() {

        assert.lengthOf( $( '#terminal_test1' ).terminal( 'set_prompt', 'terminal_test1$' ), 1, "unable to change prompt text for terminal 1" );
        assert.lengthOf( $( '#terminal_test1' ).terminal( 'new_line' ), 1, "error inserting newline on terminal 1" );
        assert.lengthOf( $( '#terminal_test2' ).terminal( 'set_prompt', 'terminal_test2$' ), 1, "unable to change prompt text for terminal 2" );
        assert.lengthOf( $( '#terminal_test2' ).terminal( 'new_line' ), 1, "error inserting newline on terminal 2" );
        assert.isObject( region = $( '#terminal_test1' ).terminal( 'get_current_region' ), "unable to retrieve current region for terminal 1" );
        assert.equal( $( '#' + region.id + ' .lines .line:last .prompt' ).text(), 'terminal_test1$', "prompt text not correctly set on terminal 1" );
        assert.isObject( region = $( '#terminal_test2' ).terminal( 'get_current_region' ), "unable to retrieve current region for terminal 2" );
        assert.equal( $( '#' + region.id + ' .lines .line:last .prompt' ).text(), 'terminal_test2$', "prompt text not correctly set on terminal 2" );

    } );

    it( "should be chainable", function() {

        assert.lengthOf( $( '.outer_container' ).terminal().filter( '#terminal_test2' ), 1, 'error filtering out test element 2' );
        assert.lengthOf( $( '.outer_container' ).terminal( 'get_options', function( i, o ) { } ).filter( '#terminal_test2' ), 1, 'error filtering out test element 2 after get_options' );

    } );

    it( "should have regions", function() {

        assert.isObject( options = $( '#terminal_test1' ).terminal( 'get_options' ), "unable to retrieve options object 1" );
        assert.isArray( options.regions, "no region array" );
        assert.isObject( options.regions[ 0 ], "no default region" );
        assert.lengthOf( $( '#terminal_test1 .__terminal__root__ .regions' ), 1, "no regions element found" );
        assert.lengthOf( $( '#terminal_test1 .__terminal__root__ .regions .region' ), 1, "no default region element found" );
        assert.lengthOf( $( '#terminal_test1 .__terminal__root__ .regions #' + options.regions[ 0 ].id ), 1, "wrong or missing ID for default region" );
        assert.lengthOf( $( '#terminal_test1' ).terminal( 'use_region', 'region A' ), 1, "unable to create and use new region" );
        assert.isObject( options = $( '#terminal_test1' ).terminal( 'get_options' ), "unable to retrieve options object 1" );
        assert.isObject( options.regions[ 1 ], "the new region was not created" );
        assert.isObject( region = $( '#terminal_test1' ).terminal( 'get_current_region' ), "no current region" );
        assert.equal( region.name, 'region A', "wrong current region" );
        assert.equal( region.index, 1, "region A should have array index 1" );
        assert.ok( $( '#' + region.id ).hasClass( 'current' ), "current region does not have class 'current'" );
        assert.isFalse( $( '#terminal_test1 .region:not(#' + region.id + ')' ).hasClass( 'current' ), "unselected regions also have class 'current'" );
        assert.lengthOf( $( '#terminal_test1' ).terminal( 'use_region', 'default' ), 1, "unable to return to default region" );
        assert.isObject( region = $( '#terminal_test1' ).terminal( 'get_current_region' ), "no current region" );
        assert.equal( region.name, 'default', "wrong current region" );
        assert.equal( region.index, 0, "default region should have array index 0" );
        assert.lengthOf( $( '#terminal_test1 .region.current' ), 1, "there chould only be one current region" );
        assert.lengthOf( $( '#terminal_test1' ).terminal( 'remove_region', 'region A' ), 1, "unable to remove region A" );
        assert.lengthOf( $( '#terminal_test1 .regions .region' ), 1, "there should only be one region left in DOM" );
        assert.isObject( options = $( '#terminal_test1' ).terminal( 'get_options' ), "unable to retrieve options object 1" );
        assert.lengthOf( options.regions, 1, "there should only be one region left in regions array" );
        assert.lengthOf( $( '#terminal_test1' ).terminal( 'remove_region', 'default' ), 1, "'remove_region' not found" );
        assert.isObject( options = $( '#terminal_test1' ).terminal( 'get_options' ), "unable to retrieve options object 1" );
        assert.lengthOf( options.regions, 1, "there should still be one region left in regions array" );
        assert.lengthOf( $( '#terminal_test1 .regions .region' ), 1, "there should still be one region in DOM" );
        assert.equal( options.regions[ 0 ].name, 'default', "default region not having index 0" );
        assert.lengthOf( $( '#terminal_test1' ).terminal( 'use_region', 'region A' ).find( '.region' ), 2, "failed adding 'region A'" );
        assert.lengthOf( $( '#terminal_test1' ).terminal( 'use_region', 'region B' ).find( '.region' ), 3, "failed adding 'region B'" );
        assert.lengthOf( $( '#terminal_test1' ).terminal( 'use_region', 'region C' ).find( '.region' ), 4, "failed adding 'region C'" );
        assert.lengthOf( $( '#terminal_test1' ).terminal( 'use_region', 'region D' ).find( '.region' ), 5, "failed adding 'region D'" );
        assert.lengthOf( $( '#terminal_test1' ).terminal( 'use_region', 'region E' ).find( '.region' ), 6, "failed adding 'region E'" );
        assert.lengthOf( $( '#terminal_test1' ).terminal( 'use_region', 'region B' ).find( '.region' ), 6, "selecting existing region altered region count" );
        assert.isObject( region = $( '#terminal_test1' ).terminal( 'get_current_region' ), "unable to retrieve region object for 'region B" );
        assert.lengthOf( $( '#terminal_test1 .region .lines .line .cursor' ), 1, "expected one cursor element" );
        assert.lengthOf( $( '#' + region.id + ' .cursor' ), 1, "current region is missing a cursor" );
        assert.equal( region.index, 2, "region B should have index 2" );
        assert.lengthOf( $( '#terminal_test1' ).terminal( 'clear_all' ).find( '.region' ), 1, "clearing all should reduce number of regions to 1" );
        assert.isObject( region = $( '#terminal_test1' ).terminal( 'get_current_region' ), "unable to retrieve current region object" );
        assert.equal( region.name, 'default', "should have reverted to default region" );

    } );

    it( "should have regions with lines", function() {

        assert.lengthOf( $( '#terminal_test1 .region.current ul.lines' ), 1, "expected a list of lines" );
        assert.lengthOf( $( '#terminal_test1 .region.current ul.lines .line.n1' ), 1, "expected to find line 1" );
        assert.lengthOf( ln = $( '#terminal_test1 .region.current ul.lines .line' ), 1, "wrong line count before call to 'write_line'" );
        assert.isObject( $( '#terminal_test1' ).terminal( 'write_line', 'hello, world!' ), "error writing line" );
        assert.equal( $( ln[ 0 ] ).find( '.content' ).text(), 'hello, world!', "line was not written" );
        assert.lengthOf( $( '#terminal_test1 .region.current .line' ), 2, "wrong line count after call to 'write_line'" );
        assert.lengthOf( $( '#terminal_test1 .region.current .line:last .cursor' ), 1, "the cursor should have moved to the last line" );

    } );

    it( "should be activated on focus", function() {

        assert.isFalse( $( '#terminal_test1 .__terminal__root__' ).hasClass( 'focus' ), "terminal should not have focus at this point" );
        assert.lengthOf( $( '#terminal_test1 .__terminal__root__ textarea' ).focus(), 1, "didn't find textarea overlay" );
        assert.lengthOf( $( '#terminal_test1' ).terminal( 'focus' ), 1, "failed in calling 'focus' directly (Firefox workaround)" );
        assert.isTrue( $( '#terminal_test1 .__terminal__root__' ).hasClass( 'focus' ), "terminal should have focus at this point" );

    } );

    it( "should have a blinking cursor with correct blink rate", function( done ) {

        assert.isObject( options = $( '#terminal_test1' ).terminal( 'get_options' ), "unable to retrieve options object 1" );
        assert.isObject( e = $( '#terminal_test1 .cursor' ) );
        assert.isNumber( j = options.cursorBlinkRate, "error retrieving cursorBlinkRate from options object" );
        assert.isBoolean( f = e.hasClass( 'blink' ), "error returning blink state" );
        assert.isNumber( i = setInterval( function(){ assert.isFalse( f === e.hasClass( 'blink' ) ); clearInterval( i ); done(); }, j ), "cursor doesn't blink" );

    } );

    it( "shold keep the cursor from blinking when terminal looses focus", function( done ) {

        assert.isObject( options = $( '#terminal_test1' ).terminal( 'get_options' ), "unable to retrieve options object 1" );
        assert.isObject( e = $( '#terminal_test1 .cursor' ) );
        assert.isNumber( j = options.cursorBlinkRate );
        assert.lengthOf( $( '#terminal_test1' ).terminal( 'focusout' ), 1, "failed in calling 'focusout' directly" );
        assert.isFalse( e.hasClass( 'blink' ), "should not blink" );
        assert.isNumber( i = setInterval( function(){ assert.isFalse( e.hasClass( 'blink' ) ); clearInterval( i ); done(); }, j ), "should not blink" );

    } );

    it( "should respond properly to keyboard events", function() {

        assert.lengthOf( $( '#terminal_test1 .__terminal__root__ textarea' ).focus(), 1, "didn't find textarea overlay" );
        assert.lengthOf( $( '#terminal_test1' ).terminal( 'focus' ), 1, "failed in calling 'focus' directly (Firefox workaround)" );
        assert.lengthOf( $( '#terminal_test1 textarea' ).trigger( $.Event( 'keypress', { which: 101, keyCode: 101 } ) ), 1, "unable to trig 'keypress' e" );
        assert.lengthOf( $( '#terminal_test1 textarea' ).trigger( $.Event( 'keypress', { which: 115, keyCode: 115 } ) ), 1, "unable to trig 'keypress' s" );
        assert.lengthOf( $( '#terminal_test1 textarea' ).trigger( $.Event( 'keypress', { which: 112, keyCode: 112 } ) ), 1, "unable to trig 'keypress' p" );
        assert.lengthOf( $( '#terminal_test1 textarea' ).trigger( $.Event( 'keypress', { which: 101, keyCode: 101 } ) ), 1, "unable to trig 'keypress' e" );
        assert.lengthOf( $( '#terminal_test1 textarea' ).trigger( $.Event( 'keypress', { which: 110, keyCode: 110 } ) ), 1, "unable to trig 'keypress' n" );
        assert.isObject( region = $( '#terminal_test1' ).terminal( 'get_current_region' ), "no current region" );
        assert.equal( $( '#terminal_test1 #' + region.id + ' .line:last .content' ).text(), 'espen', "the string 'espen' was not correctly written to terminal" );
        assert.lengthOf( $( '#terminal_test1 textarea' ).trigger( $.Event( 'keydown', { which: 13, keyCode: 13 } ) ), 1, "unable to trig 'keypress'" );
        assert.equal( $( '#terminal_test1 #' + region.id + ' .line:last .content' ).text(), '', "didn't create new line upon return" );

    } );

    it( "should trig a callback for a registered command", function() {

        assert.lengthOf( $( '#terminal_test1' ).terminal( 'register_command', {name:'test',main:function(c,v){assert.equal(v[1],'success');$( '#terminal_test1' ).terminal('new_line');}}), 1, "failed in registering test command" );
        assert.isString( t = 'test success', "unable to create command string" );
        assert.lengthOf( $( '#terminal_test1 textarea' ).trigger( $.Event( 'keypress', { which: t.charCodeAt(  0 ), keyCode: t.charCodeAt(  0 ) } ) ), 1, "unable to trig 'keypress' 't'" );
        assert.lengthOf( $( '#terminal_test1 textarea' ).trigger( $.Event( 'keypress', { which: t.charCodeAt(  1 ), keyCode: t.charCodeAt(  1 ) } ) ), 1, "unable to trig 'keypress' 'e'" );
        assert.lengthOf( $( '#terminal_test1 textarea' ).trigger( $.Event( 'keypress', { which: t.charCodeAt(  2 ), keyCode: t.charCodeAt(  2 ) } ) ), 1, "unable to trig 'keypress' 's'" );
        assert.lengthOf( $( '#terminal_test1 textarea' ).trigger( $.Event( 'keypress', { which: t.charCodeAt(  3 ), keyCode: t.charCodeAt(  3 ) } ) ), 1, "unable to trig 'keypress' 't'" );
        assert.lengthOf( $( '#terminal_test1 textarea' ).trigger( $.Event( 'keypress', { which: t.charCodeAt(  4 ), keyCode: t.charCodeAt(  4 ) } ) ), 1, "unable to trig 'keypress' ' '" );
        assert.lengthOf( $( '#terminal_test1 textarea' ).trigger( $.Event( 'keypress', { which: t.charCodeAt(  5 ), keyCode: t.charCodeAt(  5 ) } ) ), 1, "unable to trig 'keypress' 's'" );
        assert.lengthOf( $( '#terminal_test1 textarea' ).trigger( $.Event( 'keypress', { which: t.charCodeAt(  6 ), keyCode: t.charCodeAt(  6 ) } ) ), 1, "unable to trig 'keypress' 'u'" );
        assert.lengthOf( $( '#terminal_test1 textarea' ).trigger( $.Event( 'keypress', { which: t.charCodeAt(  7 ), keyCode: t.charCodeAt(  7 ) } ) ), 1, "unable to trig 'keypress' 'c'" );
        assert.lengthOf( $( '#terminal_test1 textarea' ).trigger( $.Event( 'keypress', { which: t.charCodeAt(  8 ), keyCode: t.charCodeAt(  8 ) } ) ), 1, "unable to trig 'keypress' 'c'" );
        assert.lengthOf( $( '#terminal_test1 textarea' ).trigger( $.Event( 'keypress', { which: t.charCodeAt(  9 ), keyCode: t.charCodeAt(  9 ) } ) ), 1, "unable to trig 'keypress' 'e'" );
        assert.lengthOf( $( '#terminal_test1 textarea' ).trigger( $.Event( 'keypress', { which: t.charCodeAt( 10 ), keyCode: t.charCodeAt( 10 ) } ) ), 1, "unable to trig 'keypress' 's'" );
        assert.lengthOf( $( '#terminal_test1 textarea' ).trigger( $.Event( 'keypress', { which: t.charCodeAt( 11 ), keyCode: t.charCodeAt( 11 ) } ) ), 1, "unable to trig 'keypress' 's'" );
        assert.lengthOf( $( '#terminal_test1 textarea' ).trigger( $.Event( 'keydown', { which: 13, keyCode: 13 } ) ), 1, "unable to trig 'keydown' ENTER" );

    } );

    it( "should trig a callback for reading input", function() {

        assert.isObject( options = $( '#terminal_test1' ).terminal( 'get_options' ), "unable to retrieve options for terminal 1" );
        assert.isTrue( options.usePrompt, "usePrompt should have been true" );
        assert.lengthOf( $( '#terminal_test1' ).terminal( 'prompt', false ), 1, "error turning off prompt" );
        assert.isFalse( options.usePrompt, "usePrompt should have been false (turned off)" );
        assert.lengthOf( $( '#terminal_test1' ).terminal( 'input_listen', { readLine: function( line, e ) { assert.equal( line, 'y', "wrong content of input line" ); } } ), 1, "error registering input functions" );
        assert.lengthOf( $( '#terminal_test1 textarea' ).trigger( $.Event( 'keypress', { which: 'y'.charCodeAt(  0 ), keyCode: 'y'.charCodeAt(  0 ) } ) ), 1, "unable to trig 'keypress' 'y'" );
        assert.lengthOf( $( '#terminal_test1 textarea' ).trigger( $.Event( 'keydown', { which: 13, keyCode: 13 } ) ), 1, "unable to trig 'keydown' ENTER" );
        assert.lengthOf( $( '#terminal_test1' ).terminal( 'input_listen', { readLine: function( line, e ) { assert.isTrue( false, "should never be called" ); } } ), 1, "error registering input functions" );
        assert.lengthOf( $( '#terminal_test1' ).terminal( 'prompt', true ), 1, "error turning on prompt" );
        assert.lengthOf( $( '#terminal_test1 textarea' ).trigger( $.Event( 'keypress', { which: 'y'.charCodeAt(  0 ), keyCode: 'x'.charCodeAt(  0 ) } ) ), 1, "unable to trig 'keypress' 'x'" );
        assert.lengthOf( $( '#terminal_test1 textarea' ).trigger( $.Event( 'keydown', { which: 13, keyCode: 13 } ) ), 1, "unable to trig 'keydown' ENTER" );

    } );

    it( "should have passive/active mode", function() {

        assert.isObject( options = $( '#terminal_test1' ).terminal( 'get_options' ), "unable to retrieve options for terminal 1" );
        assert.isBoolean( options.passiveMode, "no passive mode flag" );
        assert.isFalse( options.passiveMode, "should initially have been active (passiveMode = false)" );
        assert.isObject( region = $( '#terminal_test1' ).terminal( 'get_current_region' ), "unable to retrieve current region from terminal 1" );
        assert.lengthOf( $( '#terminal_test1 textarea' ).trigger( $.Event( 'keypress', { which: 'x'.charCodeAt(  0 ), keyCode: 'x'.charCodeAt(  0 ) } ) ), 1, "unable to trig 'keypress' 'x'" );
        assert.equal( $( '#terminal_test1 #' + region.id + ' .line:last .content' ).text(), 'x', "current line should be 'x'" );
        assert.lengthOf( $( '#terminal_test1' ).terminal( 'set_passive', true ), 1, "error entering passive mode" );
        assert.lengthOf( $( '#terminal_test1 textarea' ).trigger( $.Event( 'keypress', { which: 'y'.charCodeAt(  0 ), keyCode: 'y'.charCodeAt(  0 ) } ) ), 1, "unable to trig 'keypress' 'y'" );
        assert.equal( $( '#terminal_test1 #' + region.id + ' .line:last .content' ).text(), 'x', "current line should still be 'x' after keystrokes" );
    
    } );

    it( "should have a typewriter function", function( done ) {

        assert.isString( s = '', "strange error declaring empty string" );
        assert.isString( t = 'terminal keyboard simulation', "error initializing typewriter text" );
        assert.isObject( $( '#terminal_test1' ).terminal( 'type_line', t ), 1, "typewriter function failed" );
        assert.isObject( region = $( '#terminal_test1' ).terminal( 'get_current_region' ), "error retrieving current region" );
        assert.isNumber( j = 0, "error initializing j as integer" );
        assert.isObject( $( '#terminal_test1' ).terminal( 'new_line' ), 1, "error entering newline" );
        assert.isNumber( i = setInterval(function(){j++;s=$('#'+region.id+' .line:last .content').text();if(t.length==s.length){clearInterval(i);assert.isTrue(j>1,"string was written all at once, or too fast");done();}},100), "error creating timer for testing typewriter function" );
    
    } );

    it( "should not let keyboard input interfere while typewriting", function( done ) {

        assert.isString( t = 'terminal keyboard simulation', "error initializing typewriter text" );
        assert.isObject( $( '#terminal_test1' ).terminal( 'new_line' ), 1, "error adding newline" );
        assert.equal( $( '#terminal_test1 #' + region.id + ' .line:last .content' ).text(), '', "new line was not empty" );
        assert.isObject( $( '#terminal_test1' ).terminal( 'type_line', { line: t, done: function() { s = $( '#terminal_test1 #' + region.id + ' .line:last .content' ).text(); clearInterval( i ); clearInterval( j ); assert.equal( s, t, 'wrong result string' ); done(); } } ), 1, "typewriter function failed" );
        assert.isNumber( j = setInterval( function() { $( '#terminal_test1 textarea' ).trigger( $.Event( 'keypress', { which: 'y'.charCodeAt(  0 ), keyCode: 'y'.charCodeAt(  0 ) } ) ); }, 200 ), "unable to trig 'keypress' 'y'" );

    } );

} );