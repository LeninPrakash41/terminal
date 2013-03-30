( function( $ ) {

	var root;

	// Display about text
	function about( argc, argv, e ) {
		e
			.terminal( 'prompt', false )
			.terminal( 'new_line' )
			.terminal( 'new_line' )
			.terminal( 'write_line', 'Terminal script by Espen Andersen' )
			.terminal( 'write_line', 'post@espenandersen.no' )
			.terminal( 'new_line' )
			.terminal( 'write_line', 'Journalist and programmer at' )
			.terminal( 'write_line', 'Norwegian Broadcast Corporation (NRK)' )
			.terminal( 'new_line' )
			.terminal( 'prompt', true )
			.terminal( 'new_line' );
	}

	$( document ).ready( function() {
		$( '#terminal' )
			.terminal( 'register_command', { name: 'about',  main: about  } );
	} );

} )( jQuery );