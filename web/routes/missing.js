/**
 * HTTP response handler for route.
 *
 * @param {http.ClientRequest}  request  Request object.
 * @param {http.ClientResponse} response Response object.
 */
function respond( request, response ) {
	response.writeHead( 404, {
		'Content-Type': 'text/plain',
	} );

	response.end( 'Page not found' );
}

/**
 * Returns true if the given request is to be handled by the route.
 *
 * @param {http.ClientRequest} request Request object.
 *
 * @return {boolean} Whether route can handle request.
 */
function isHandled() {
	return true;
}

module.exports = {
	respond,
	isHandled,
};
