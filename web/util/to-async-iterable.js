/**
 * Internal dependencies
 */

const isAsyncIterable = require( './is-async-iterable' );

/**
 * Normalizes the given object argument to an async iterable, asynchronously
 * yielding on a singular or array of generator yields or promise resolution.
 *
 * @param {*} object Object to normalize.
 *
 * @return {AsyncGenerator} Async iterable actions.
 */
function toAsyncIterable( object ) {
	if ( isAsyncIterable( object ) ) {
		return object;
	}

	return ( async function* () {
		yield await object;
	}() );
}

module.exports = toAsyncIterable;
