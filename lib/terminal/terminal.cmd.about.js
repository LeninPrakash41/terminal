( function( $ ) {

	var root;

	// Show registered commands
	function about( argc, argv, e ) {
		e
			.terminal( 'prompt', false )
			.terminal( 'new_line' )
			.terminal( 'new_line' )
			.terminal( 'write_line', 'Espen Andersens home terminal' )
			.terminal( 'write_line', 'post@espenandersen.no' )
			.terminal( 'new_line' )
			.terminal( 'write_line', 'Journalist and programmer at' )
			.terminal( 'write_line', 'Norwegian Broadcast Corporation (NRK)' )
		if( argc > 1 ) {
			switch( argv[ 1 ] ) {
				case 'projects':
					about_projects( e );
					break;
				default:
					e
						.terminal( 'new_line' )
						.terminal( 'write_line', 'Unknown subject: ' + argv[ 1 ] );
			}
		}
		else {
			e
				.terminal( 'new_line' )
				.terminal( 'write_line', 'Usage: about [subject],' )
				.terminal( 'write_line', 'where [subject] is one of:' )
				.terminal( 'new_line' )
				.terminal( 'write_line', 'projects' );
		}
		e
			.terminal( 'prompt', true )
			.terminal( 'new_line' );
	}

	function about_projects( e ) {
			e
				.terminal( 'new_line' )
				.terminal( 'write_line', '***** My recent projects *****' )
				.terminal( 'new_line' );
	}

	$( document ).ready( function() {
		$( '#terminal' )
			.terminal( 'register_command', { name: 'about',  main: about  } );
	} );

} )( jQuery );