/**
 * Terminal/WindowManager core script
 * jQuery plugin for opening windows from the terminal
 * Espen Andersen, Norwegian Broadcast Corporation
 * espen.andersen@nrk.no
 * (c) 2013 - NRK Investigative unit
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 */
( function( $ ) {

	var
		ROOT_SELECTOR = '.__window__manager__root__',

		that,
		root,
		persistent = { windows: { } },

		public_members = {
			'close_window': closeWindow,
			'flash_window': flashWindow,
			'move_window': moveWindow,
			'open_window': openWindow,
			'send_message': sendMessage,
			'set_focus': setFocus
		};

	// Produce a random, unique hexadecimal ID string
	function getUniqueId( prefix ) {
		return 	prefix + 
					 String( '00000000' +
							 Math.floor( 0xFFFFFFFF * Math.random() )
							.toString( 16 ) )
					.slice( -8 );
	}

	// brings specified window to the front, normalizing but preserving
	// the z-order index for the other windows
	function bringToFront( hWnd ) {

		var
			i,

			hierarchy =
				root
					.find( '.window' )
					.toArray();

		persistent.windows[ hWnd ].css( 'z-index', 9999 );
		hierarchy.sort( function( a, b ) {
			return ( Number( a.style.zIndex ) - Number( b.style.zIndex ) );
		} );

		for( i = 0; i < hierarchy.length; i++ ) {
			$( hierarchy[ i ] ).css( 'z-index', 10 + i );
		}
	};

	// Close window, param must be either the window handle,
	// or an object with the handle stored in a hWnd property.
	function closeWindow( param ) {
		
		var
			hWnd = typeof param === 'object' ? param.hWnd : param;

		if( persistent.windows[ hWnd ] ) {

			var

				win =
					root
						.find( '#' + hWnd ),

				winInfo =
					win.data( 'wininfo' );

			sendMessage( { msg: 'wm_before_close' }, winInfo.hWnd );

			win
				.removeData( 'wininfo' );
			
			delete winInfo.hWnd;

			$( '.overlay textarea' )
				.attr( 'disabled', 'disabled' );

			$( 'a' ).focus();

			win
				.remove();

			delete persistent.windows[ hWnd ];

			var e = new $.Event( 'notify' );
			e.msg = 'close_window';
			e.winInfo = winInfo;
			that.trigger( e );
			
			$( '.overlay textarea' )
				.removeAttr( 'disabled' );
		}
	};

	// Flash window title bar, param must be either the window handle,
	// or an object with the handle stored in a hWnd property.
	function flashWindow( param ) {
		
		var
			hWnd = typeof param === 'object' ? param.hWnd : param,
			win = $( '#' + hWnd ),
			counter = 0,
			timer;

		if( persistent.windows[ hWnd ] ) {
			if( timer ) {
				clearInterval( timer );
				timer = 0;
				counter = 0;
			}
			timer =
				setInterval( function( e ) {
					if( ++counter >= 8 ) {
						clearInterval( timer );
						timer = 0;
						win.removeClass( 'flash' );
						counter = 0;
					}
					else {
						win.toggleClass( 'flash' );
					}
				}, 50 );
		}
	};

	// Create new window
	function createWindow( param ) {

		var

			styles = { display: 'none' },

			winCount = root.find( '.window' ).length,

			winInfo = {
				eventDispatcher: that,
				windowManager: root,
				hWnd: getUniqueId( 'win_' ),
				wndTitle: ( param && param.wndTitle ) || '',
				wndClass: ( param && param.wndClass ) || 'default',
				wndClose: ( param && param.wndClose ) || '',
				statusBar: param.statusBar === true,
				resizeHandle: param.resizeHandle === true
			};

			if( param ) {
				if( param.width ) styles.width = param.width;
				if( param.height ) styles.height = param.height;
			}
			else {
				param = { };
			}

			// Default positioning:
			if( styles.left === undefined ) {
				//styles.left = ( 1 + winCount ) * 30;
			}
			if( styles.top === undefined ) {
				//styles.top = ( 1 + winCount ) * 30;
			}

		var newWin = { };
		newWin[ winInfo.hWnd ] =

			root
				.prepend( 	'<div class="window" id="' + winInfo.hWnd + '">' +
						   		'<h2 class="titleBar">' +
									'<span class="title">' + winInfo.wndTitle + '</span>' +
									'<a href="#close_' + winInfo.hWnd + '" class="close" title="' + winInfo.wndClose + '">X</a>' +
								'</h2>' +
								'<div class="clientRect">' +
								'</div>' +
							'</div>' )

				.find( '#' + winInfo.hWnd )
				.addClass( winInfo.wndClass )
				.data( 'wininfo', winInfo )
				.css( styles )
				.draggable( {
					handle: 'h2',
					start:
						function( e ) {
							bringToFront( $( e.target ).closest( '.window' ).attr( 'id' ) );
						}
				} )
				.find( '.titleBar .close' )
				.click( function( e ) {
					var
						hWnd =
							$( e.target )
								.closest( '.window' )
								.attr( 'id' );
					
					closeWindow( hWnd );
					e.preventDefault();
					e.stopPropagation();
				} )
				.end()
				.find( '.clientRect' )
				.on( 'mousewheel', function( scr, d ) {
					var w = $( this );
					if( d > 0 && w.scrollTop() === 0 ) {
						scr.preventDefault();
					}
					else if( d < 0 && ( w.scrollTop() >= ( w.get( 0 ).scrollHeight - w.innerHeight() - 1 ) ) ) {
						scr.preventDefault();
					}
				} )
				.end();

		if( winInfo.statusBar || winInfo.resizeHandle ) {
			root
				.find( '#' + winInfo.hWnd )
				.addClass( 'withStatusBar' )
				.append( '<div class="statusBar"><ul><li class="status">Ready</li></ul></div>' );
		}

		if( winInfo.resizeHandle ) {
			root
				.find( '#' + winInfo.hWnd )
				.find( '.statusBar' )
				.append( '<div class="ui-resizable-handle ui-resizable-se"></div>' );
			
			root.find( '#' + winInfo.hWnd ).resizable( { handles: "se" } );
		}

		persistent.windows = $.extend( { }, persistent.windows, newWin );

		param && param.wndProc && param.wndProc( winInfo );

		return winInfo;
	}

	// Default window proc displays en empty window
	function defaultWndProc( winInfo ) {
		showWindow( winInfo.hWnd );
	}

	// Initialize WindowManager
	function init( _options ) {
		
		root =
			$( that )
				.html( '<div class="' + ROOT_SELECTOR.substring( 1 ) + '"></div>' )
				.find( ROOT_SELECTOR );
		root
			.on( 'click', '.window', function( e ) {
				$( e.target )
					.closest( '.window' )
					.each( function( index, win ) {
						var
							hWnd = $( win ).attr( 'id' );
						bringToFront( hWnd );
					} )
					.siblings( '.focus' )
					.removeClass( 'focus' )
					.end()
					.addClass( 'focus' );
			} )
			.on( 'drag', '.window', function( e ) {

				var
					hWnd = $( e.target ).attr( 'id' );

				if( persistent.windows[ hWnd ] ) {
					persistent.windows[ hWnd ].userPositioned = true;
				}

			} );
	};

	function isTopmost( hWnd ) {
		return $( '#' + hWnd ).css( 'z-index' ) == getTopmostIndex();
	};

	function getTopmostIndex() {
		var
			zOrder = [ ],
			windows = $( '.windowManager .window' );
		
		windows
			.each( function( i, e ) {
				zOrder[ i ] = $( e ).css( 'z-index' );
			} );
		
		var
			iTopMost =
				( zOrder
					.sort(
						function( a, b ) {
							return a - b;
						} )
					.reverse() ) [ 0 ]
		return iTopMost;
	};

	// Move a window
	function moveWindow( hWnd, pos ) {
		root
			.find( '#' + hWnd )
			.css( {
				top: pos.top,
				left: pos.left } );
	}

	// Open a window, create new if no handle to existing window is provided
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

		var e = new $.Event( 'notify' );
		e.msg = 'open_window';
		e.winInfo = winInfo;
		that.trigger( e );
	};

	// WindowManager data store
	function savePersistent() {
		root
			.data( 'persistent', persistent );
	};

	// Send message to one or all windows. If no handle is provided
	// (i.e. undefined), the message is broadcasted to all windows
	function sendMessage( param, hWnd ) {
		if( param && param.msg ) {
			var
				e = new $.Event( param.msg ),
				selector = hWnd !== undefined ? '#' + hWnd : '.window';
			e.msg = param.msg;
			e.param = param;
			root
				.find( selector )
				.trigger( e );
		}
	};

	// Bring window to front and activate it
	function setFocus( param ) {
		if( param && param.hWnd ) {
			bringToFront( param.hWnd );
		}
	};

	// Make window visible
	function showWindow( hWnd ) {
		
		var
			wnd = $( persistent.windows[ hWnd ] );
		
		bringToFront( hWnd );

		if( wnd.length === 1 ) {
			
			var
				x = parseInt( wnd.css( 'left' ) ),
				y = parseInt( wnd.css( 'top' ) );

			wnd
				.css( { display: 'block', left: 0, top: 0, opacity: 0.0 } )
				.animate( { left: x, top: y, opacity: 1.0 }, 500 );
		}
	};

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