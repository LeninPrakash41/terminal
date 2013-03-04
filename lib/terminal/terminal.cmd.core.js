( function( $ ) {

	var root;

	// Clear current screen
	function clear( argc, argv, e ) {
		if( argc == 1 ) {
			e.terminal( 'clear' );
		}
		else if( argv[ 1 ] === 'all' ) {
			e.terminal( 'clear_all' );
		}
	}

	// Current date and time
	function date( argc, argv, e ) {
		
	var now = new Date();
		
		e
			.terminal( 'prompt', false )
			.terminal( 'new_line' )
			.terminal( 'write_line', now )
			.terminal( 'prompt', true )
			.terminal( 'new_line' );
	}

	// Navigate away
	function gotoUrl( argc, argv, e ) {
		if( argc > 1 ) {
			if( /^http:\/\//.test( argv[ 1 ] ) ) {
				window.location = argv[ 1 ];
			}
			else {
				window.location = 'http://' + argv[ 1 ];
			}
		}
		e.terminal( 'new_line' );
	}

	// Show registered commands
	function help( argc, argv, e ) {
		var o = e.terminal( 'get_options' ),
			c = o.commands,
			m = '';
		e
			.terminal( 'prompt', false )
			.terminal( 'new_line' )
			.terminal( 'new_line' )
			.terminal( 'write_line', 'Available commands:' );
		for( var k in c ) {
			m += ( ( m === '' ? '' : ', ' ) + k );
		}
		e
			.terminal( 'write_line', m )
			.terminal( 'prompt', true )
			.terminal( 'new_line' );
	}

	// Display or change current region
	function region( argc, argv, e ) {
		
		if( argc == 1 ) {
			var r = e.terminal( 'get_current_region' );
			e
				.terminal( 'prompt', false )
				.terminal( 'new_line' )
				.terminal( 'write_line', 'Current region: "' + r.name + '"' )
				.terminal( 'prompt', true )
				.terminal( 'new_line' );
		}
		else {
			e
				.terminal( 'new_line' )
				.terminal( 'use_region', argv[ 1 ] )
		}		
	}

	// List options
	function opts( argc, argv, e ) {
		var o = e.find( '.focus' ).data( 'options' );
		e
			.terminal( 'prompt', false )
			.terminal( 'new_line' );
		for( var k in o ) {
			e
				.terminal( 'write_line', k + ": " + o[ k ] )
		}
		e
			.terminal( 'prompt', true )
			.terminal( 'new_line' );
	}	

	$( document ).ready( function() {
		root = $( '#terminal' );
		root
			.terminal( {
				cursorBlinkRate: 500,
				prompt: 'espen$'
			} )
			
			// Core commands
			.terminal( 'register_command', { name: 'clear',  main: clear  } )
			.terminal( 'register_command', { name: 'cls',    main: clear  } )
			.terminal( 'register_command', { name: 'date',   main: date  } )
			.terminal( 'register_command', { name: 'goto',   main: gotoUrl  } )
			.terminal( 'register_command', { name: 'help',   main: help  } )
			.terminal( 'register_command', { name: 'opts',   main: opts  } )
			.terminal( 'register_command', { name: 'region', main: region } )
			
			.terminal( 'activate' );
	} );

} )( jQuery );