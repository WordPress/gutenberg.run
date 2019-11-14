/**
 * Internal dependencies
 */

const builds = require( '../builds' );

/**
 * Regular expression matching build status route.
 *
 * @type {RegExp}
 */
const REGEXP_ROUTE_PATH = /^\/status\/([a-z0-9]+)/;

/**
 * HTTP response handler for route.
 *
 * @param {http.ClientRequest}  request  Request object.
 * @param {http.ClientResponse} response Response object.
 */
async function respond( request, response ) {
	const id = request.parsed.pathname.match( REGEXP_ROUTE_PATH )[ 1 ];

	if ( ! builds.has( id ) ) {
		response.statusCode = 404;
		response.end();
		return;
	}

	response.writeHead( 200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		Connection: 'keep-alive',
	} );

	request.connection.setTimeout( 1.2e+6 );

	for await ( const message of builds.listen( id ) ) {
		response.write( 'data:' + JSON.stringify( message ) + '\n\n' );

		if ( message.type === 'ERROR' ) {
			break;
		}
	}

	response.write( 'data:{"type":"DONE"}\n\n' );
}

/**
 * Returns true if the given request is to be handled by the route.
 *
 * @param {http.ClientRequest} request Request object.
 *
 * @return {boolean} Whether route can handle request.
 */
function isHandled( request ) {
	const { method, parsed } = request;

	return (
		method === 'GET' &&
		REGEXP_ROUTE_PATH.test( parsed.pathname )
	);
}

module.exports = {
	isHandled,
	respond,
};
