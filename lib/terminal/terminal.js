/**
 * Terminal core script
 * jQuery plugin for ascii terminal window, exposing basic api
 * for custom commands.
 * Espen Andersen, Norwegian Broadcast Corporation
 * espen.andersen@nrk.no
 * (c) 2013 - NRK Investigative unit
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 */
( function( $ ) {

	var
		IS_IPAD = navigator.userAgent.match( /iPad/i ) != null,

		// Terminal root element selector (class name)
		ROOT_SELECTOR = '.__terminal__root__',

		// Regional reference to the currently selected element
		that,

		// Terminal root element
		root,

		// Default options, may be overridden
		defaultOptions = {
			busyFlag: false,
			caseSensitive: false,
			commands: { },
			cursorBlinkRate: 250,
			cursorColor: null,
			executionQueue: [ ],
			layout: {
				consolePaddingBottom: 10
			},
			passiveMode: false,
			promptText: 'terminal$',
			promptVisibility: true
		},

		// Main options object
		options = { },

		// Public functions that may be called through jQuery
		public_members = {
			'activate': activate,
			'clear': clear,
			'clear_all': clearAll,
			'execute': execute,
			'focus': focus,
			'focusout': focusout,
			'get_options': getOptions,
			'get_current_region': getCurrentRegion,
			'input_listen': inputListen,
			'new_line': newLine,
			'prompt_text': promptText,
			'prompt_visibility': promptVisibility,
			'remove_region': removeRegion,
			'register_command': registerCommand,
			'run_script': runScript,
			'set_passive': setPassive,
			'type_line': typeLine,
			'use_region': useRegion,
			'write_line': writeLine
		},

		// Points to current region within options.regions
		regionIndex = 0;

	// Set input focus to current terminal
	function activate() {
		/*
		root
			.find( '.overlay' )
			.focus();
		*/
	}

	// Clear current region
	function clear() {
		var r = getCurrentRegion();
		root
			.find( '#' + r.id + ' .line' )
			.remove();
		newLine();
		if( IS_IPAD ) {
			overlayReposition();
		}
	}

	// Remove all regions except for the default one
	function clearAll() {
		$.grep( options.regions, function( r, i ) {
			if( r.name !== 'default' ) {
				removeRegion( r.name );
			}
		} );
		clear();
	}

	// Enter key pressed
	function commandInterpret( argc, argv, termElem, response ) {
		
		if( argc > 0 && options.commands[ argv[ 0 ] ] ) {
			( options.commands[ argv[ 0 ] ] ) ( argc, argv, termElem, response );
		}
		else if( argc == 0 ) {
			newLine();
		}
		else {
			
			var response_text = [ argv[ 0 ] + ': Unknown command' ]
			if( response ) {
				$.extend( response, { text: response_text } );
				response.done && response.done( response );
			}

			promptVisibility( false );
			newLine();
			writeLine( response_text[ 0 ] );
			promptVisibility( true );
			newLine();
		}
	}

	// Enter key pressed
	function commandTranslate( cmd, termElem, response ) {
		// Normalize and trim spaces
		// In IE8, nbsp is not catched by \s, hence the \xA0
		cmd = cmd.replace( /[\s\xA0]/g, ' ' );
		cmd = cmd.replace( /^[\s\xA0]*/g, '' );
		cmd = cmd.replace( /[\s\xA0]*$/g, '' );
		while( cmd.indexOf( '  ' ) !== -1 ) cmd = cmd.replace( '  ', ' ' );

		if( options.caseSensitive === false ) {
			cmd = cmd.toLowerCase();
		}

		var i,
			n = cmd.length,
			q = false,
			s = '',
			d = getUniqueId( '' );
		
		for( i = 0; i < n; i++ ) {
			var c = cmd.charAt( i );
			switch( c ) {
				case ' ':
					s += ( q ? ' ' : d );
					break;
				case '"':
					q = !q;
					break;
				default:
					s += c;
			}
		}

		var argv, argc;
		if( s == '' ) {
			argc = 0;
			argv = [ ];
		}
		else {
			argv = s.split( d ),
			argc = argv.length;
		}

		if( options.promptVisibility ) {
			commandInterpret( argc, argv, termElem, response );
		}
		else if( options.inputListeners && typeof options.inputListeners.readLine === 'function' ) {
			options.inputListeners.readLine( argv.join( ' ' ), termElem );
		}
	}

	// Insert new terminal region
	function createRegion( name ) {
		var region = {
			name: name,
			id: getUniqueId( 'reg_' ),
			index: options.regions.length };
		options.regions.push( region );
		root
			.find( '.regions' )
			.append( 
				'<li class="region" id="' + region.id + '">' +
					'<ul class="lines">' +
					'</ul>' +
				'</li>' );
		newLine( region );
		return region.index;
	}

	// Start cursor blinker
	function cursorBlinkStart() {
		if( options.blinkerId === undefined ) {
			options.blinkerId = setInterval( ( function( _root ) {
				return function() {
					_root
						.find( '.cursor' )
						.toggleClass( 'blink' );
				}
			} )( root ), options.cursorBlinkRate );
		}
	}

	// Stop cursor blinker
	function cursorBlinkStop() {
		if( options.blinkerId !== undefined ) {
			clearInterval( options.blinkerId );
			root
				.find( '.cursor' )
				.removeClass( 'blink' );
			delete options.blinkerId;
		}		
	}

	// Put command in queue - etiher the command
	// given in the param, or the command written
	// to current terminal line
	function execute( param ) {
 		if( param.async && param.async === true ) {
			options.busyFlag = true;
 			executeRundown( param );
 		}
 		else {
	 		options.executionQueue.push( param );
	 		if( options.rundownTimer === undefined ) {
		 		options.rundownTimer = setInterval( function() {
			 		if( options.busyFlag === false ) {
				 		if( options.executionQueue.length > 0 ) {
							options.busyFlag = true;
				 			executeRundown( options.executionQueue.shift() );
				 		}
				 		else {
				 			clearInterval( options.rundownTimer );
				 			delete options.rundownTimer;
				 		}
			 		}
		 		}, 10 );
	 		}
 		}
 	}

 	// Execute command
	function executeRundown( param ) {
		var r = getCurrentRegion(),
			regEle = $( '#' + r.id ),
			cmd  = param.command || regEle.find( '.line:last .content' ).text(),
			response = { };
		response.done = function() {
			param.done && param.done( response );
			options.busyFlag = false;
		}
		commandTranslate( cmd, root.parent(), response );
	}

	// Set focus on current terminal
	function focus() {
		root
			.filter( '#' + options.id )
			.addClass( 'focus' )
			.find( '.cursor' )
			.css( { backgroundColor: options.cursorColor } );
		cursorBlinkStart();
	}

	// Leave focus on current terminal
	function focusout() {
		root
			.filter( '#' + options.id )
			.removeClass( 'focus' )
			.find( '.cursor' )
			.css( { backgroundColor: 'transparent' } );
		cursorBlinkStop();
	}

	// Retrieve currently active region
	function getCurrentRegion() {
		return options.regions[ regionIndex > -1 ? regionIndex : 0 ];
	}

	// Retrieve options object
	function getOptions() {
		return options;
	}

	// Produce a random, unique hexadecimal ID string
	function getUniqueId( prefix ) {
		return prefix + Math.floor( 0xFFFFFFFF * Math.random() ).toString( 16 );
	}

	// Terminal initialization
	function init( _options ) {

		options = $.extend( { }, defaultOptions, _options );
		options.id = getUniqueId( 'term_' );
		options.regions = [ ];

		if( options.cursorColor === null ) {
			options.cursorColor = that.css( 'color' );
		}

		$( '.windowManager' )
			.click( function( e ) {
				if( $( e.target ).hasClass( 'windowManager' ) ) {
					root
						.find( '.overlay>textarea' ).focus().select();
				}
			} );

		root = that
			.empty()
			.html(
				'<div class="' + ROOT_SELECTOR.substring( 1 ) + '" id="' + options.id + '">' +
					'<ul class="regions">' +
					'</ul>' +
					'<div class="overlay"><textarea class="alpha0" autocorrect="off" autocapitalize="off" /></div>' +
				'</div>' )
			.find( ROOT_SELECTOR )
			.find( '.overlay>textarea' )
			.focus( function( e ) {
				// Activate terminal in focus
				
					var rp = 
						$( this )
							.closest( ROOT_SELECTOR )
							.parent();

					if( $( document.activeElement ).is( 'textarea' ) ) {
						if( IS_IPAD ) {
							if( $( window ).scrollTop() == 0 ) {
								// No keyboard - discard focus
								overlayReposition( true );
								focusout();
							}
							else {
								overlayReposition();
								$( 'html, body' ).animate( { scrollTop: $( '.cursor' ).scrollTop() + 50 } );
								focus();
							}
						}
						else {
							focus();
						}
					}
					else {
						focus();
					}
							
			} )
			.focusout( function() {
				// Deactivate terminal in focus
				$( this )
					.closest( ROOT_SELECTOR )
					.parent()
					.terminal( 'focusout' );
				} )
			/*
			.keypress( function( e ) {
				if( !inputBlocked() ) {
					onKey( e );
				}
			} )
			.keydown( function( e ) {
				if( !inputBlocked() ) {
					var cursor = root.find( '.cursor' );
					switch( e.keyCode ) {
						case 8: // Backspace
							put( '\b' );
							break;
						case 13: 	// return
							commandTranslate( cursor.parent().find( '.content' ).text(), root.parent() );
							root.trigger( 'console_put', [ { line: e.keyCode, done: true } ] );
							return false;
					}
				}
			} )
			*/
			.end();
		
		$( window )
			.keypress( function( e ) {
				if( !inputBlocked() ) {
					onKey( e );
				}
			} )
			.keydown( function( e ) {
				//focus();
				if( !inputBlocked() ) {
					var cursor = root.find( '.cursor' );
					switch( e.keyCode ) {
						case 8: // Backspace
							put( '\b' );
							break;
						case 13: 	// return
							commandTranslate( cursor.parent().find( '.content' ).text(), root.parent() );
							root.trigger( 'console_put', [ { line: e.keyCode, done: true } ] );
							return false;
					}
				}
			} );
		//$( window ).on( 'resize', recalcLayout );

		useRegion( 'default' );
	}

	// Checks if terminal may accept input
	function inputBlocked( busyFlag ) {
		return options.busyFlag 
			|| options.passiveMode
			|| ( options.rundownTimer !== undefined );
	}

	// Register input listeners
	function inputListen( stdin ) {
		options.inputListeners = $.extend( { }, stdin );
	}

	// Insert new line
	function newLine( region ) {

		var r = region || getCurrentRegion(),
			lines = root.find( '#' + r.id + ' .lines' ),
			line = lines.find( '.line' ),
			i = line.length + 1,
			p = options.promptVisibility ? options.promptText : '';

		lines
			.append(
				'<li class="line n' + i + '">' +
					'<span class="prompt">' + p + '</span>' +
					'<span class="content"></span>' +
				'</li>' );

		updateCursor();
		recalcLayout();

		$( '.overlay>textarea' )
			.val( '' );

		if( IS_IPAD ) {
			overlayReposition();
		}
		
		root.trigger( 'console_newline', [ { line: line, done: false } ] );
	}

	// Key pressed
	function onKey( e ) {
		switch( e.which ) {
			case 32: // Space
				put( '&nbsp;' );
				break;
			case 13: // Enter
				; // NoOp
				break;
			default:
				put( String.fromCharCode( e.which ) );
		}
	};

	// iPad fix: Moves textarea into view whan keyboard appears
	function overlayReposition( reset ) {
		
		var
			yOffset = 0;
		
		if( reset !== true ) {
			var
				cursor = $( '.cursor' );
			yOffset = cursor.offset().top - 50;
		}
		
		$( '.overlay' )
			.css( { top: yOffset } );
	};

	// Alter prompt text
	function promptText( promptText ) {
		options.promptText = promptText;
	};

	// Turn prompt on/off
	function promptVisibility( promptVisibility ) {
		options.promptVisibility = promptVisibility;
	};

	// Write to cursor pos
	function put( s ) {
		var r = getCurrentRegion(),
			c = root.find( '#' + r.id + ' .line:last .content' ),
			t = c.text();
		if( s == '\b' ) {
			t = t.substring( 0, t.length - 1 );
		}
		else {
			t += s;
		}
		c.html( t );
		root.trigger( 'console_put', [ { line: s, done: false } ] );
		recalcLayout();
	}

	// Position and size
	function recalcLayout() {
		var r = getCurrentRegion(),
			lines = root.find( '#' + r.id + ' .lines' ),
			y0 = lines.height() + options.layout.consolePaddingBottom,
			y1 = root.height();
		if( y0 > y1 ) {
			lines.css( { top: - ( y0 - y1 ) } );
		}
		else {
			lines.css( { top: 0 } );
		}
	}

	// Register new command
	function registerCommand( command ) {

		var name = command.name,
			main = command.main;

		if( options.caseSensitive === false ) {
			name = name.toLowerCase();
		}

		if(  name && typeof main == 'function' ) {
			var c = { };
			c[ name ] = main;
			options.commands = $.extend( { }, options.commands, c );
		}
	}

	// Deletes region if it exists
	function removeRegion( name ) {
		// Cannot delete default region
		if( name === 'default' ) return;
		options.regions = $.grep( options.regions, function( r, i ) {
			if( r.name === name ) {
				if( r.index === regionIndex ) {
					// Current region about to be removed, revert to default region
					useRegion( 'default' );
				}
				root
					.find( '#' + r.id )
					.remove();
				return false;
			}
			return true;
		} );
	}

	// Execute "batch script"
	function runScript( param ) {
		$.ajax( param.script, {
			dataType: 'text',
			success: function( data, status, jqXHR ) {

				var
					commands = data.split( "\n" ),
					n = commands.length,
					i;

				for( i = 0; i < n; i++ ) {
					var
						command = {
							async: false,
							command: commands[ i ]
						};

					if( i == ( n - 1 ) ) {
						command.done =
							function( response ) {
								//param && param.done && param.done( response );
							};
					}

					execute( command );
				}

			},
			error: function( jqXHR, status, errorThrown ) {
				param && param.done && param.done( { lines: [ errorThrown ] } );
			}
		} );
	}

	// Save options to root element
	function saveOptions() {
		root.data( 'options', options );
	}
	
	// Enables/disables passive mode
	function setPassive( flag ) {
		options.passiveMode = flag;
	}

	// Type text like on a keyboard
	function typeLine( param ) {
		var line,
			done;

		options.busyFlag = true;

		if( typeof param === 'object' ) {
			line = param.line;
			done = param.done;
		}
		else {
			line = param;
		}

		root.trigger( 'type_line', [ { line: line, done: false } ] );

		var r = getCurrentRegion(),
			n = Math.round( 10 * Math.random() ),
			i = 0;

		if( options.typeWriterTimer !== undefined ) {
			clearInterval( options.typeWriterTimer );
			delete options.typeWriterTimer;
		}

		options.typeWriterTimer = setInterval( function() {
			if( i === line.length ) {
				clearInterval( options.typeWriterTimer );
				options.busyFlag = false;
				delete options.typeWriterTimer;
				root.trigger( 'type_line', [ { line: line, done: true } ] );
				done && done();
			}
			else if( n == 0 ) {
				put( line.charAt( i++ ) );
				n = Math.round( 20 * ( Math.random() / 20 ) );
			}
			else {
				n--;
			}
		}, 20 );
	}

	// Reposition cursor to the last line in current region
	function updateCursor() {
		var r = getCurrentRegion(),
			cursorBackgroundColor = root.hasClass( 'focus' )
								  ? options.cursorColor
								  : 'transparent';
		root
			.find( '.cursor' )
			.remove();
		root
			.find( '#' + r.id + ' .line:last' )
		.append( '<span class="cursor"/>' )
		.find( '.cursor' )
		.css( {
			borderColor: options.cursorColor,
			backgroundColor: cursorBackgroundColor
			} );
	}

	// Switch region, create new if it does not exist
	function useRegion( name ) {

		var i,
			r = options.regions,
			n = r.length;

		regionIndex = -1;
		
		for( i = 0; i < n; i++ ) {
			if( r[ i ].name === name ) {
				regionIndex = i;
				break;
			}
		}
		
		if( regionIndex === -1 ) {
			regionIndex = createRegion( name );
		}

		root
			.find( '.region' )
			.removeClass( 'current' )
			.find( '.cursor' )
			.remove()
			.end()
			.filter( '#' + r[ regionIndex ].id )
			.addClass( 'current' )
			.find( '.line:last' )
			.append( '<span class="cursor"/>' );
	}

	// Write one line to the console
	function writeLine( line ) {
		var r = getCurrentRegion();
		root
			.find( '#' + r.id + ' .line:last .content' )
			.text( line );
		newLine();
	}

	// Expose interface
	$.fn.terminal = function( param ) {

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
				$.error( 'Method not found in terminal' );
			}
			index++;
		} );
		// Maintain chainability unless returning something
		return retVal || this;
	}

} )( jQuery );