/**
 * External dependencies
 */

const execa = require( 'execa' );

/**
 * Internal dependencies
 */

const { SITE_IMAGE } = require( '../constants' );

/**
 * Regular expression matching container status route.
 *
 * @type {RegExp}
 */
const REGEXP_ROUTE_PATH = /^\/container\/([a-z0-9]+)/;

/**
 * HTTP response handler for route.
 *
 * @param {http.ClientRequest}  request  Request object.
 * @param {http.ClientResponse} response Response object.
 */
async function respond( request, response ) {
	const containerId = request.url.match( REGEXP_ROUTE_PATH )[ 1 ];

	try {
		const { stdout: image } = await execa( 'docker', [
			'inspect',
			'--format',
			'{{.Config.Image}}',
			containerId,
		] );

		if ( image !== SITE_IMAGE ) {
			throw new Error();
		}

		response.statusCode = 204;
	} catch ( error ) {
		response.statusCode = 404;
	}

	response.end();
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
