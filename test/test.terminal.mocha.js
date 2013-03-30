
var assert = chai.assert;

describe( "terminal", function() {
    

    it( "should exist as jQuery namespace",

    function() {

        assert.isFunction( $.fn.terminal,

            "no terminal plugin in jQuery object" );
    } );


    it( "should initialize and return as chainable jQuery",

    function() {

        assert.lengthOf( 

            $( '#terminal_test1' ).terminal(),

                1,

            "blank initialization failed somehow" );
    } );


    it( "should insert a root HTML element",

    function() {

        $( '#terminal_test1' ).terminal();

        assert.lengthOf(

            $( '#terminal_test1 .__terminal__root__' ),

                1,

            "didn't insert root HTML element" );
    } );


    it( "should have default options",

    function() {

        $( '#terminal_test1' ).terminal();

        var options = $( '#terminal_test1 .__terminal__root__' ).data( 'options' );

        assert.equal(

            options.cursorBlinkRate, 250,

            "wrong value for cursorBlinkRate" );
    } );


    it( "should let user-defined parameters override default options",

    function() {

        $( '#terminal_test1' ).terminal( { cursorBlinkRate: 500 } );

        var options = $( '#terminal_test1 .__terminal__root__' ).data( 'options' );

        assert.equal(

            options.cursorBlinkRate, 500,

            "value for cursorBlinkRate was not set correctly" );
    } );


    it( "should have different sets of options for different terminal instances",

    function() {

        $( '#terminal_test1' ).terminal( { cursorBlinkRate: 500 } );
        $( '#terminal_test2' ).terminal( { cursorBlinkRate: 600 } );

        var options1 = $( '#terminal_test1' ).terminal( 'get_options' ),
            options2 = $( '#terminal_test2' ).terminal( 'get_options' );

        assert.notEqual(

            options1.cursorBlinkRate,
            options2.cursorBlinkRate,

            "blink rate for terminal 1 should be different from terminal 2" );
    } );


    it( "should assign an ID to terminal instances",

    function() {

        $( '#terminal_test1' ).terminal();

        assert.match(
            
            $( '#terminal_test1 .__terminal__root__' ).attr( 'id' ),

            /^term_[0-9a-f]+/,

            "terminal 1 did not have a correctly formatted ID" );
    } );


    it( "should produce unique terminal IDs for different instances",

    function() {

        $( '#terminal_test1' ).terminal();
        $( '#terminal_test2' ).terminal();

        assert.notEqual(
            
            $( '#terminal_test1 .__terminal__root__' ).attr( 'id' ),

            $( '#terminal_test2 .__terminal__root__' ).attr( 'id' ),

            "terminal 1 and 2 received same ID value" );
    } );


    it( "should write the unique ID to options.id object member",

    function() {

        var termdiv = $( '#terminal_test1' ).terminal(),
            options = termdiv.terminal( 'get_options' );

        assert.equal(
            
            $( '#terminal_test1 .__terminal__root__' ).attr( 'id' ),

            options.id,

            "terminal ID was not present in options.id" );
    } );


    it( "returns options for first terminal when calling 'get_options' on multiple elements with no callback",

    function() {

        $( '.terminals #terminal_test1' ).terminal( { cursorBlinkRate: 300 } );
        $( '.terminals #terminal_test2' ).terminal( { cursorBlinkRate: 500 } );

        var optionsX = $( '.terminals>div' ).terminal( 'get_options' );

        assert.equal(
            
            optionsX.cursorBlinkRate,

            300,

            "didn't return options for terminal 1 as expected" );
    } );


    it( "returns options for all terminals when calling 'get_options' on multiple elements with callback",

    function() {

        var optionsA = [ ];

        $( '.terminals #terminal_test1' ).terminal();
        $( '.terminals #terminal_test2' ).terminal();
        
        $( '.terminals>div' ).terminal( 'get_options', function( index, retVal ) {

            optionsA.push( retVal );

        } );

        assert.notEqual(
            
            optionsA[ 0 ].id,

            optionsA[ 1 ].id,

            "both terminals had same ID value" );
    } );


    it( "should allow for client to change prompt text",

    function() {

        var newPromptText = 'terminalTestPrompt$',
            termdiv = $( '#terminal_test1' ).terminal(),
            region = termdiv.terminal( 'get_current_region' );
        
        termdiv
            .terminal( 'prompt_text', newPromptText )
            .terminal( 'new_line' );

        assert.equal(

            termdiv
                .find( '#' + region.id + ' .line:last .prompt' )
                .text(),

            newPromptText,

            "the new prompt text was not set" );

    } );


    it( "should be chainable in the jQuery fashion",

    function() {

        var jQueryElements = 
            $( '.terminals>div' )
                .terminal()
                .filter( '#terminal_test1' )
                .terminal( 'prompt_text', 'foo' )
                .end()
                .filter( '#terminal_test2' )
                .terminal( 'prompt_text', 'bar' );

        assert.lengthOf(

            jQueryElements, 1,

            "wrong number of items in jQuery object after chaining" );

    } );


    it( "should have regions",

    function() {

        var termdiv = $( '#terminal_test1' ).terminal(),
            options = termdiv.terminal( 'get_options' ),
            regions = options.regions;

        assert.lengthOf(

            termdiv
                .find( '.regions .region#' + regions[ 0 ].id ),

            1,

            "unable to find default region (0) in DOM" );

    } );


    it( "should let users use different regions",

    function() {

        var termdiv =
                $( '#terminal_test1' )
                    .terminal()
                    .terminal( 'use_region', 'testRegionA' ),
        

            options = termdiv.terminal( 'get_options' ),
            regions = options.regions;

        assert.isTrue(

            termdiv
                .find( '.regions .region#' + regions[ 1 ].id )
                .hasClass( 'current' ),

            "new region was not marked as current" );

    } );


    it( "should create new regions on the fly",

    function() {

        var termdiv =
                $( '#terminal_test1' )
                    .terminal()
                    .terminal( 'use_region', 'testRegionA' )
                    .terminal( 'use_region', 'testRegionB' )
                    .terminal( 'use_region', 'testRegionC' )
                    .terminal( 'use_region', 'testRegionD' ),        

            options = termdiv.terminal( 'get_options' ),
            regions = options.regions;

        assert.lengthOf(

            termdiv
                .find( '.regions .region' ),

            5,

            "should have been 4 regions plus the default one" );

    } );


    it( "should be able to remove a region",

    function() {

        var termdiv =
                $( '#terminal_test1' )
                    .terminal()
                    .terminal( 'use_region', 'testRegionA' )
                    .terminal( 'use_region', 'testRegionB' )
                    .terminal( 'use_region', 'testRegionC' )
                    .terminal( 'use_region', 'testRegionD' ),        

            options = termdiv.terminal( 'get_options' ),
            regions = options.regions,
            regionCount = options.regions.length;

        assert.lengthOf(

            termdiv
                .terminal( 'remove_region', 'testRegionC' )
                .find( '.regions .region' ),

            regionCount - 1,

            "should be one region less than before 'remove_region'" );

    } );


    it( "should have a method for retrieving the region currently in use",

    function() {

        var termdiv =
                $( '#terminal_test1' )
                    .terminal()
                    .terminal( 'use_region', 'regionA' )
                    .terminal( 'use_region', 'regionB' )
                    .terminal( 'use_region', 'regionC' )
                    .terminal( 'use_region', 'regionD' )
                    .terminal( 'use_region', 'regionB' ),

            options = termdiv.terminal( 'get_options' ),
            regions = options.regions,
            regionB = options.regions[ 2 ];

        assert.equal(

            termdiv
                .terminal( 'get_current_region' ),

            regionB,

            "should return regionB as current" );

    } );


    it( "should have a method for clearing all regions",

    function() {

        var termdiv =
                $( '#terminal_test1' )
                    .terminal()
                    .terminal( 'use_region', 'regionA' )
                    .terminal( 'use_region', 'regionB' )
                    .terminal( 'use_region', 'regionC' )
                    .terminal( 'use_region', 'regionD' ),

            options = termdiv.terminal( 'get_options' ),
            regions = options.regions;

        assert.equal(

            termdiv
                .terminal( 'clear_all' )
                .find( '.regions .region' )
                .length,

            1,

            "should have only the default region left" );

    } );


    it( "should revert to default region when clearing all regions",

    function() {

        var currentRegion =
                $( '#terminal_test1' )
                    .terminal()

                    .terminal( 'use_region', 'regionA' )
                    .terminal( 'use_region', 'regionB' )
                    .terminal( 'use_region', 'regionC' )
                    .terminal( 'use_region', 'regionD' )

                    .terminal( 'clear_all' )

                    .terminal( 'get_current_region' );

        assert.equal(

            currentRegion.name,

            'default',

            "should have default region currently in use" );

    } );


    it( "should have regions with lines",

    function() {

        var termdiv = $( '#terminal_test1' ),
            currentRegion =
                termdiv
                    .terminal()
                    .terminal( 'get_current_region' );

        termdiv
            .terminal( 'new_line' )
            .terminal( 'new_line' )
            .terminal( 'new_line' )
            .terminal( 'new_line' );

        assert.lengthOf(

            termdiv
                .find( '#' + currentRegion.id + ' .lines .line' ),

            5,

            "should have 5 lines after 4 new_line commands" );

    } );


    it( "should be able to write a line",

    function() {

        var lineText = 'Hello, world! Test if line is writable...',
            
            termdiv = 
                $( '#terminal_test1' )
                    .terminal()
                    .terminal( 'write_line', lineText ),

            currentRegion =
                termdiv
                    .terminal( 'get_current_region' ),
            
            lines =
                termdiv
                    .find( '#' + currentRegion.id + ' .lines .line' );

        assert.equal(

            $( lines[ 0 ] )
                .find( '.content' )
                .text(),

            lineText,

            "the text was not entered into the current line" );

    } );


    it( "should have a cursor that follows newlines",

    function() {

        var 
            termdiv = 
                $( '#terminal_test1' )
                    .terminal()
                    .terminal( 'write_line', 'test line 1' )
                    .terminal( 'write_line', 'test line 2' )
                    .terminal( 'write_line', 'test line 3' )
                    .terminal( 'write_line', 'test line 4' ),

            region = 
                termdiv
                    .terminal( 'get_current_region' ),

            lines =
                termdiv
                    .find( '#' + region.id + ' .lines .line' );

        assert.lengthOf(

            $( lines[ 4 ] )
                .find( '.cursor' ),

            1,

            "the cursor was not moved to line 5 (array subscript 4)" );

    } );


    it( "should be activated on focus",

    function() {

        assert.isTrue(

        $( '#terminal_test1' )
            .terminal()
            .terminal( 'focus' )
            .find( '.__terminal__root__' )
            .hasClass( 'focus' ),

            "terminal did not receive input focus" );

    } );


    it( "should have a blinking cursor with correct blink rate",

    function( done ) {

        var
            termdiv = $( '#terminal_test1' ).
                terminal(),

            options =
                termdiv
                    .terminal( 'get_options' ),

            cursorElement =
                termdiv
                    .terminal( 'focus' )
                    .find( '.cursor' ),

            cursorBlinkState =
                cursorElement
                    .hasClass( 'blink' ),

            timer = 
                setInterval(
                    function() {

                        assert.notEqual(

                            cursorBlinkState,

                            cursorElement.hasClass( 'blink' ),

                            "cursor is not blinking" );

                        clearInterval( timer );
                        done();
                    
                    }, options.cursorBlinkRate );

    } );


    it( "should keep the cursor from blinking when terminal looses focus",

    function( done ) {

        var
            termdiv = $( '#terminal_test1' )
                .terminal(),

            options =
                termdiv
                    .terminal( 'get_options' ),

            cursorElement =
                termdiv
                    .find( '.cursor' );

        termdiv
            .terminal( 'focusout' );

        var
            blinkState =
                cursorElement
                    .hasClass( '.blink' ),
            
            timer =
                setInterval(
                    function() {
                        
                        assert.ok( 

                            blinkState === false &&
                            cursorElement.hasClass( 'blink' ) === false,

                            "cursor is still blinking" );
                        
                        clearInterval( timer );
                        done();

                    }, options.cursorBlinkRate );

    } );


    it( "should respond to keyboard events",

    function() {

        var 
            i,

            termdiv =
                $( '#terminal_test1' )
                    .terminal(),

            region =
                termdiv
                    .terminal( 'focus' )
                    .find( 'textarea' )

                    // Simulate puncing 'espen' on the keyboard
                    .trigger( $.Event( 'keypress', { which: 101, keyCode: 101 } ) )
                    .trigger( $.Event( 'keypress', { which: 115, keyCode: 115 } ) )
                    .trigger( $.Event( 'keypress', { which: 112, keyCode: 112 } ) )
                    .trigger( $.Event( 'keypress', { which: 101, keyCode: 101 } ) )
                    .trigger( $.Event( 'keypress', { which: 110, keyCode: 110 } ) )

                    .end()
                    .terminal( 'get_current_region' );

        assert.equal(

            termdiv
                .find( '#' + region.id + ' .line:last .content' )
                .text(),

            'espen',

            "the string 'espen' was not correctly written to terminal" );

    } );


    it( "should trig a callback for a registered command",

    function( done ) {

        var 
            i,

            termdiv =
                $( '#terminal_test1' )
                    .terminal(),

            commandString = 'test success',

            commandObject = {

                name: 'test',

                main: function( argc, argv, termElement ) {

                    assert.equal(

                        argv[ 1 ],

                        'success',

                    "command not sucessfully entered" );

                    done();
                }

            };


        termdiv
            .terminal( 'register_command', commandObject );

        for( i = 0; i < commandString.length; i++ ) {
            termdiv
                .find( 'textarea' )
                .trigger( $.Event( 'keypress', { 
                    which: commandString.charCodeAt( i ),
                    keyCode: commandString.charCodeAt( i ) } ) );
        }
        
        termdiv
            .find( 'textarea' )
            .trigger(
                $.Event( 'keydown', { 
                    which: 13,
                    keyCode: 13 } ) );

    } );


    it( "should trig a callback for reading input line",

    function( done ) {

        $( '#terminal_test1' )
            .terminal()
            .terminal( 'prompt_visibility', false )
            .terminal( 'input_listen', {
                
                readLine:
                    
                    function( line, termElement ) {

                        assert.equal(

                            line,

                            'y',

                            "wrong content of input line" );

                        done();
                    }
                
                } )
            
            .find( 'textarea' )
            .trigger( $.Event( 'keypress', { which: 'y'.charCodeAt(  0 ), keyCode: 'y'.charCodeAt(  0 ) } ) )
            .trigger( $.Event( 'keydown', { which: 13, keyCode: 13 } ) );

    } );


    it( "should have passive/active mode blocking/allowing keyboard input",

    function() {

        var
            termdiv =
                $( '#terminal_test1' ),

            region =
                termdiv
                    .terminal( 'new_line' )
                    // Passive mode: Ignore keystrokes
                    .terminal( 'set_passive', true )
                    .find( 'textarea' )
                    .trigger(
                        $.Event( 'keypress', { 
                            which: 'x'.charCodeAt( 0 ),
                            keyCode: 'x'.charCodeAt( 0 )
                        } ) )
                    .end()
                    // Active mode: Record keystrokes
                    .terminal( 'set_passive', false )
                    .find( 'textarea' )
                    .trigger(
                        $.Event( 'keypress', { 
                            which: 'y'.charCodeAt( 0 ),
                            keyCode: 'y'.charCodeAt( 0 )
                        } ) )
                    .end()
                    .terminal( 'get_current_region' );

        assert.equal(

            termdiv
                .find( '#' + region.id + ' .line:last .content' )
                .text(),

            'y',

            "wrong keyboard input, only the second keystroke should be recorded" );

    } );


    it( "should mimic a typewriter when 'type_line' is invoked",

    function( done ) {

        var
            text = 'simulation',

            buffer = '',

            region =
                $( '#terminal_test1' )
                    .terminal( 'type_line', text )
                    .terminal( 'new_line' )
                    .terminal( 'get_current_region' ),

            j = 0,

            timer =
                setInterval(
                    
                    function() {
                    
                        j++;
                        buffer = $( '#' + region.id + ' .line:last .content' ).text();
                    
                        if( buffer.length === text.length ) {
                            clearInterval( timer );

                            assert.isTrue(

                                j > 5,

                                "string was written all at once, or too fast" );
                        
                            done();
                        }
                    
                    }, 20 );
    } );


    it( "should not let keyboard input interfere while typewriting",

    function( done ) {

        var
            line = "terminal typewriter text",

            termdiv = $( '#terminal_test1' ),

            region = termdiv.terminal( 'get_current_region' ),

            timer;

        termdiv
            .terminal( 'new_line' )
            .terminal( 'type_line', {
                line: line, 
                done:
                    function() {
                        clearInterval( timer );
                        assert.equal(

                            termdiv
                                .find( '#' + region.id + ' .line:last .content' )
                                .text(),

                            line,

                            "keyboard event interferred with typewriter simulation" );
                        
                        done();
                    }
                } );

        // Inject keystrokes during typewriting
        timer =
            setInterval(
                function() {

                    termdiv
                        .find( 'textarea' )
                        .trigger( $.Event( 'keypress', { which: 'y'.charCodeAt( 0 ), keyCode: 'y'.charCodeAt( 0 ) } ) );

                }, 100 );

    } );


    it( "should have a working 'execute' function",

    function( done ) {

        $( '#terminal_test1' )
            .terminal()
            .terminal( 'new_line' )
            .terminal( 'type_line', {
                line: 'testcommand foo',
                done:
                    function( response ) {
                        $( '#terminal_test1' )
                            .terminal( 'execute', {
                                done:
                                    function( response ) {

                                        assert.equal(

                                            response.text[ 0 ],

                                            'testcommand: Unknown command',

                                            "unexpected response text" );

                                        done();
                                    }
                            } )
                    }
                } );

    } );


    it( "should have commands report themselves as 'done' whenever they are", function( done ) {

        var
            startTime = ( new Date() ).getTime();

        $( '#terminal_test1' )
            .terminal()
            .terminal( 'register_command', {
                name: 'delay_500_ms',
                main:
                    function( argc, argv, termElement, response ) {
                        setTimeout(
                            function() {
                                response.done && response.done();
                            }, 500 );
                    }
                } )
            .terminal( 'execute', {
                command: 'delay_500_ms',
                done:
                    function( response ) {
                        var endTime = ( new Date() ).getTime(),
                            duration = endTime - startTime;

                        assert.isTrue(
                            
                            // Firefox timeouts sometimes returns a bit too early (!),
                            // thus the 10 ms error margin made explicit here:
                            duration >= ( 500 - 10 ),

                            "'done' was called before function was done: time diff was " + duration + "ms" );

                        done();
                    }
                } );
    } );


    it( "should not accept keystrokes while processing a command",

    function( done ) {

        var
            termdiv =
                $( '#terminal_test1' )
                    .terminal(),

            region =
                termdiv
                    .terminal( 'get_current_region' );


        termdiv
            .terminal( 'register_command', {
                name: 'delay_700_ms',
                main:
                    function( argc, argv, termElement, response ) {
                        setTimeout(
                            function() {
                                response.done && response.done();
                            },
                        700 );
                    }
                } )
            .terminal( 'execute', {
                command: 'delay_700_ms',
                done:
                    function( response ) {

                        assert.equal(

                            termdiv
                                .find( '#' + region.id + ' .line:last .content' )
                                .text(),

                            '',

                            "keystrokes went through during command-line processing" );

                        done();
                    }
                } )
            .find( 'textarea' )
            .trigger(
                $.Event( 'keypress', {
                    which: 'y'.charCodeAt( 0 ),
                    keyCode: 'y'.charCodeAt( 0 )
                } ) );

    } );


    it( "should queue up subsequent commands and run them sequentially when using 'execute'", function( done ) {

        var
            termdiv =
                $( '#terminal_test1' )
                    .terminal(),

            region =
                termdiv
                    .terminal( 'get_current_region' ),

            queue1 =
                function( argc, argv, termElement, response ) {
                    setTimeout(
                        function() {
                            termdiv
                                .find( '#' + region.id + ' .line:last .content' )
                                .append( 'x' );
                            response.done && response.done();
                        },
                    90 );
                },

            queue2 =
                function( argc, argv, termElement, response ) {
                    setTimeout(
                        function() {
                            termdiv
                                .find( '#' + region.id + ' .line:last .content' )
                                .append( 'y' );
                            response.done && response.done();
                        },
                    70 );
                },

            queue3 =
                function( argc, argv, termElement, response ) {
                    setTimeout(
                        function() {
                            termdiv
                                .find( '#' + region.id + ' .line:last .content' )
                                .append( 'z' );
                            response.done && response.done();
                        },
                    50 );
                };

        termdiv
            .terminal( 'register_command', {
                name: 'queue1', 
                main: queue1
                } )
            .terminal( 'register_command', {
                name: 'queue2', 
                main: queue2
                } )
            .terminal( 'register_command', {
                name: 'queue3', 
                main: queue3
                } )
            .terminal( 'execute', {
                command: 'queue1',
                done:
                    function( response ) {
                    }
                } )
            .terminal( 'execute', {
                command: 'queue2',
                done:
                    function( response ) {
                    }
                } )
            .terminal( 'execute', {
                command: 'queue3',
                done:
                    function( response ) {
                    }
                } )
            .terminal( 'execute', {
                command: 'queue2',
                done:
                    function( response ) {
                        assert.equal(

                            $( '#' + region.id + ' .line:last .content' )
                                .text(),

                            'xyzy',

                            "input error - wrong sequence of commands" );

                        done();

                    }
                } );
    } );

    it( "should not queue up commands runned with the async flag set to true when using 'execute'", function( done ) {

        var
            termdiv =
                $( '#terminal_test1' )
                    .terminal(),

            region =
                termdiv
                    .terminal( 'get_current_region' ),

            queue1 =
                function( argc, argv, termElement, response ) {
                    setTimeout(
                        function() {
                            termdiv
                                .find( '#' + region.id + ' .line:last .content' )
                                .append( 'x' );
                            response.done && response.done();
                        },
                    40 );
                },

            queue2 =
                function( argc, argv, termElement, response ) {
                    setTimeout(
                        function() {
                            termdiv
                                .find( '#' + region.id + ' .line:last .content' )
                                .append( 'y' );
                            response.done && response.done();
                        },
                    70 );
                };

        termdiv
            .terminal( 'register_command', {
                name: 'queue1', 
                main: queue1
                } )
            .terminal( 'register_command', {
                name: 'queue2', 
                main: queue2
                } )

            .terminal( 'execute', {
                command: 'queue1',
                async: true,
                done:
                    function( response ) {
                    }
                } )
            .terminal( 'execute', {
                command: 'queue2',
                async: true,
                done:
                    function( response ) {
                    }
                } )
            .terminal( 'execute', {
                command: 'queue2',
                async: true,
                done:
                    function( response ) {
                    }
                } )
            .terminal( 'execute', {
                command: 'queue2',
                async: true,
                done:
                    function( response ) {
                        assert.equal(

                            $( '#' + region.id + ' .line:last .content' )
                                .text(),

                            'xyyy',

                            "input error - wrong sequence of commands" );

                        done();

                    }
                } );
    } );

    it( "should be able to execute batch scripts", function( done ) {

        var
            termdiv =
                $( '#terminal_test1' )
                    .terminal()
                    .terminal( 'run_script', {
                            script: 'test_batch_script.bat',
                            done:
                                function( response ) {
                                    
                                    assert.equal(

                                        response.text[ 0 ],

                                        "testnoexisting: Unknown command",

                                        "batch script was not executed" );

                                    done();
                                }
                        } );

        } );

} );