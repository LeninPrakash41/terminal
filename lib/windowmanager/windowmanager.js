( function( $ ) {

	var
		ROOT_SELECTOR = '.__window__manager__root__',

		that,
		root,
		options,

		windows = { },

		public_members = {
			'open_window': openWindow
		};

	// Produce a random, unique hexadecimal ID string
	function getUniqueId( prefix ) {
		return prefix + Math.floor( 0xFFFFFFFF * Math.random() ).toString( 16 );
	}

	function init( _options ) {
		root =
			$( that )
				.html( '<div class="' + ROOT_SELECTOR.substring( 1 ) + '"></div>' )
				.find( ROOT_SELECTOR );
	}

	function openWindow( param ) {

		var
			hwnd = getUniqueId( 'win_' );

		windows[ hwnd ] =
			root
				.prepend( '<div class="window" id="' + hwnd + '"><div class="clientRect"></div></div>' )
				.find( '#' + hwnd )
				.css( {
					width: ( param && param.width ) || 0,
					height: ( param && param.height ) || 0
					} );
	}

	function saveOptions() {

	}

	// Expose interface
	$.fn.windowManager = function( param ) {

		var retVal,
			index = 0,
			argv = arguments,
			argc = argv.length;

		this.each( function() {
			that = $( this );
			if( param === undefined || typeof param === 'object' ) {
				// Initialization
				init.apply( this, [ param ] );
				saveOptions();
			}
			else if( public_members[ param ] !== undefined ) {
				// Call to public member				
				root = that.find( ROOT_SELECTOR );
				options = $( root ).data( 'options' );
				retVal = public_members[ param ].apply( this, Array.prototype.slice.call( argv, 1 ) );
				// Callback func should be the last argument
				if( argc > 0 && typeof argv[ argc - 1 ] === 'function' ) {
					// Pass return value for each element to callback function
					( argv[ argc - 1 ] )( index, retVal );
					saveOptions();
					retVal = null;
				}
				else {
					saveOptions();
					// No callback; break loop if return value was present
					if( retVal ) return false;
				}
			}
			else {
				$.error( 'Method not found in windowManager' );
			}
			index++;
		} );
		// Maintain chainability unless returning something
		return retVal || this;
	}

} )( jQuery );