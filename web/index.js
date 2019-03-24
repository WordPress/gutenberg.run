/**
 * External dependencies
 */

const { createServer } = require( 'http' );
const { parse } = require( 'url' );

/**
 * Internal dependencies
 */

const logTasks = require( './util/log-tasks' );
const routes = require( './routes' );
const { captureException } = require( './error' );

/**
 * HTTP server response handler, parsing request and delegating handling to the
 * first matching route handler.
 *
 * @param {http.ClientRequest}  request  Request object.
 * @param {http.ClientResponse} response Response object.
 */
async function listener( request, response ) {
	request.parsed = parse( request.url );

	for ( const route of routes ) {
		const { isHandled, respond } = route;
		if ( ! isHandled( request ) ) {
			continue;
		}

		try {
			await respond( request, response );
		} catch ( error ) {
			captureException( error );
			response.statusCode = 500;
			response.end();
		}

		// Done once handled.
		break;
	}
}

( async () => {
	await logTasks( 'startup' );

	const port = process.env.PORT || 3810;
	const server = createServer( listener );
	server.listen( port );
	console.log( `Listening on port ${ port }!` );
} )();
