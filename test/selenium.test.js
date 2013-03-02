var webdriver = require( 'selenium-webdriver' );

var driver = new webdriver
        .Builder()
        .usingServer( 'http://localhost:9515' )
        .withCapabilities( { 'browserName': 'chrome' } )
        .build();

driver
    .get( 'http://giverlandet.sandcastle.local' );

driver
    .findElement( webdriver.By.xpath( '//ol/li[ 3 ]/div/h2/a' ) )
    .click();

driver
    .findElement( webdriver.By.xpath( '//ol/li[ 4 ]/div/h2/a' ) )
    .click();

driver
    .findElement( webdriver.By.xpath( '//ol/li[ 5 ]/div/h2/a' ) )
    .click();
    
driver.wait( function() {
    return driver.getTitle().then( function( title ) {
        console.log( "Page title is: " + title );
        return true;
    } );
} );

driver.quit();