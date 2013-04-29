# Terminal jQuery plugin
Turns any div element into a customizable, bash-style terminal window with the option to open windows with user-provided content. Any custom-made command may be added through the jQuery interface.

## Hello World!
```html
<html>
<head>
	<title>terminal</title>	
	<script type="text/javascript" src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
	<script type="text/javascript" src="lib/terminal/terminal.js"></script>
	<link rel="stylesheet" type="text/css" href="lib/terminal/terminal.css"/>
	<style>
		body {
			font-family: "Consolas", "Courier New", monospace;
			font-size: 14px;
			color: #0f0;
			background-color: #000;
		}
		.terminal {
			height: 400px;
			width: 500px;
		}
	</style>
</head>
<body>
	<div id="terminal"></div>
	<script>
		$( document ).ready( function() {
			$( '#terminal' )
				.terminal()
				.terminal( 'register_command', {
					name: 'hello',
					main: function() {
						$( '#terminal' )
							.terminal( 'new_line' )
							.terminal( 'write_line', 'hello, world!' );
					}
				} )
				.terminal( 'write_line', 'say hello' )
				.terminal( 'activate' );
		} );
	</script>
</body>
</html>
```
## License
This jQuery plugin is released under the (MIT license)[http://opensource.org/licenses/MIT]. Feel free to redistribute and/or modify it any way you like. I would be happy to know of any successful implementations out there.
