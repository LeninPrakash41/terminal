/**
 * Terminal core script
 * jQuery plugin for ascii terminal window
 * Espen Andersen, Norwegian Broadcast Corporation
 * espen.andersen@nrk.no
 * (c) 2013 - NRK Investigative unit
 */
( function( $ ) {

	var
		// Terminal root element selector (class name)
		ROOT_SELECTOR = '.__terminal__root__',

		// Regional reference to the currently selected element
		that,

		// Terminal root element
		root,

		// Default options, may be overridden
		defaultOptions = {
			caseSensitive: false,
			commands: { },
			cursorBlinkRate: 250,
			cursorColor: null,
			layout: {
				consolePaddingBottom: 10
			},
			prompt: 'terminal$',
			usePrompt: true
		},

		// Main options object
		options = { },

		// Public functions that may be called through jQuery
		public_members = {
			'activate': activate,
			'clear': clear,
			'clear_all': clearAll,
			'focus': focus,
			'focusout': focusout,
			'get_options': getOptions,
			'get_current_region': getCurrentRegion,
			'new_line': newLine,
			'prompt': prompt,
			'remove_region': removeRegion,
			'register_command': registerCommand,
			'use_region': useRegion,
			'write_line': writeLine
		},

		// Points to current region within options.regions
		regionIndex = 0;

	// Set input focus to current terminal
	function activate() {
		root
			.find( '.overlay' )
			.focus();
	}

	// Clear current region
	function clear() {
		var r = getCurrentRegion();
		root
			.find( '#' + r.id + ' .line' )
			.remove();
		newLine();
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
	function commandInterpret( argc, argv, termElem ) {
		if( argc > 0 && options.commands[ argv[ 0 ] ] ) {
			( options.commands[ argv[ 0 ] ] ) ( argc, argv, termElem );
		}
		else if( argc == 0 ) {
			newLine();
		}
		else {
			prompt( false );
			newLine();
			writeLine( argv[ 0 ] + ': Unknown command' );
			prompt( true );
			newLine();
		}
	}

	// Enter key pressed
	function commandTranslate( cmd, termElem ) {

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
		commandInterpret( argc, argv, termElem );
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
		root = that
			.empty()
			.html(
				'<div class="' + ROOT_SELECTOR.substring( 1 ) + '" id="' + options.id + '">' +
					'<ul class="regions">' +
					'</ul>' +
					'<textarea class="overlay alpha0" />' +
				'</div>' )
			.find( ROOT_SELECTOR )
			.find( 'textarea.overlay' )
			.focus( function() {
				// Activate terminal in focus
				$( this )
					.closest( ROOT_SELECTOR )
					.parent()
					.terminal( 'focus' );
				} )
			.focusout( function() {
				// Deactivate terminal in focus
				$( this )
					.closest( ROOT_SELECTOR )
					.parent()
					.terminal( 'focusout' );
				} )
			.keypress( function( e ) {
				onKey( e );
			} )
			.keydown( function( e ) {
				var cursor = root.find( '.cursor' );
				switch( e.keyCode ) {
					case 8: // Backspace
						put( '\b' );
						break;
					case 13: 	// return
						commandTranslate( cursor.parent().find( '.content' ).text(), root.parent() );
						return false;
				}
			} )
			.end();
		//$( window ).on( 'resize', recalcLayout );

		useRegion( 'default' );
	}

	// Insert new line
	function newLine( region ) {
		var r = region || getCurrentRegion(),
			lines = root.find( '#' + r.id + ' .lines' ),
			line = lines.find( '.line' ),
			i = line.length + 1,
			p = options.usePrompt ? options.prompt : '';
		lines
			.append(
				'<li class="line n' + i + '">' +
					'<span class="prompt">' + p + '</span>' +
					'<span class="content"></span>' +
				'</li>' );
		updateCursor();
		recalcLayout();
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
	}

	// Turn prompt on/off
	function prompt( flag ) {
		options.usePrompt = flag;
	}

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

	// Save options to root element
	function saveOptions() {
		root.data( 'options', options );
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
					// No callback:
					// Break loop and return if return value is present
					if( retVal !== undefined )
						return false;
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