/**
 * Internal dependencies
 */

const getShortId = require( '../util/get-short-id' );
const builds = require( '../builds' );

/**
 * Regular expression matching container create route.
 *
 * @type {RegExp}
 */
const REGEXP_ROUTE_PATH = /^\/create\/([a-z0-9]+)/;

/**
 * HTTP response handler for route.
 *
 * @param {http.ClientRequest}  request  Request object.
 * @param {http.ClientResponse} response Response object.
 */
async function respond( request, response ) {
	const sha = request.parsed.pathname.match( REGEXP_ROUTE_PATH )[ 1 ];

	const id = getShortId();

	builds.create( id, 'run', { sha, id } );

	response.writeHead( 200, {
		'Content-Type': 'text/plain',
	} );

	response.end( id );
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
		method === 'POST' &&
		REGEXP_ROUTE_PATH.test( parsed.pathname )
	);
}

module.exports = {
	isHandled,
	respond,
};
