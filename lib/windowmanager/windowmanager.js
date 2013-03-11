( function( $ ) {

	var
		ROOT_SELECTOR = '.__window__manager__root__',

		that,
		root,
		persistent = { windows: { } },

		public_members = {
			'open_window': openWindow
		};

	// Produce a random, unique hexadecimal ID string
	function getUniqueId( prefix ) {
		return 	prefix + 
					 String( '00000000' +
							 Math.floor( 0xFFFFFFFF * Math.random() )
							.toString( 16 ) )
					.slice( -8 );
	}

	function closeWindow( hWnd ) {
		
		if( persistent.windows[ hWnd ] ) {

			var

				win =
					root
						.find( '#' + hWnd ),

				winInfo =
					win.data( 'wininfo' );

			delete winInfo.hWnd;

			win
				.remove();
			
			delete persistent.windows[ hWnd ]
		}
	}

	function createWindow( param ) {

		var
			winInfo = { hWnd: getUniqueId( 'win_' ) },
			styles = { display: 'none' },
			wndClass = ( param && param.wndClass ) || 'default',
			wndTitle = ( param && param.wndTitle ) || '';

			if( param ) {
				if( param.width ) styles.width = param.width;
				if( param.height ) styles.height = param.height;
			}
			else {
				param = { };
			}

			if( styles.left === undefined ) {
				
			}

			if( styles.top === undefined ) {

			}

		var newWin = { };
		newWin[ winInfo.hWnd ] =

			root
				.prepend( '<div class="window" id="' + winInfo.hWnd + '"><h2 class="titleBar">' + wndTitle + ' <a href="#close_' + winInfo.hWnd + '" class="close" title="Close Window">X</a></h2><div class="clientRect"></div></div>' )
				.find( '#' + winInfo.hWnd )
				.addClass( wndClass )
				.data( 'wininfo', winInfo )
				.css( styles )
				.draggable( { handle: 'h2' } )
				.find( '.titleBar .close' )
				.click( function( e ) {
					var
						hWnd =
							$( e.target )
								.closest( '.window' )
								.attr( 'id' );
					
					closeWindow( hWnd );
					e.preventDefault();
				} )
				.end();

		persistent.windows = $.extend( { }, persistent.windows, newWin );

		param && param.wndProc && param.wndProc( winInfo );

		return winInfo;
	}

	function defaultWndProc( winInfo ) {
		showWindow( winInfo.hWnd );
	}

	function init( _options ) {
		root =
			$( that )
				.html( '<div class="' + ROOT_SELECTOR.substring( 1 ) + '"></div>' )
				.find( ROOT_SELECTOR );
	}

	function openWindow( param ) {
		
		var winInfo;
		
		if( param === undefined ||
			param.hWnd === undefined ||
			persistent.windows[ param.hWnd ] === undefined ) {
			
			winInfo = createWindow( param );
		}
		else {
			winInfo = param;
		}
		
		showWindow( winInfo.hWnd );
	}

	function savePersistent() {
		$( root )
			.data( 'persistent', persistent );
	}

	function showWindow( hWnd ) {
		
		var
			wnd = persistent.windows[ hWnd ];
		
		if( wnd !== undefined ) {
			$( wnd )
				.hide()
				.fadeIn( 250 );
		}
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
				savePersistent();
			}
			else if( public_members[ param ] !== undefined ) {
				// Call to public member				
				root = that.find( ROOT_SELECTOR );
				persistent = $( root ).data( 'persistent' );
				retVal = public_members[ param ].apply( this, Array.prototype.slice.call( argv, 1 ) );
				// Callback func should be the last argument
				if( argc > 0 && typeof argv[ argc - 1 ] === 'function' ) {
					// Pass return value for each element to callback function
					( argv[ argc - 1 ] )( index, retVal );
					savePersistent();
					retVal = null;
				}
				else {
					savePersistent();
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