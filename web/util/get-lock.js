/**
 * External dependencies
 */

const { noop } = require( 'lodash' );

/**
 * A lock descriptor.
 *
 * @property {boolean}  isOwner  Whether the lock instance is first claimant
 *                               for the key, responsible for releasing.
 * @property {Function} release  Function to call once the lock should be
 *                               released.
 * @property {Promise}  released Promise resolving once lock is released, for
 *                               use by non-owners to await completion.
 *
 * @typedef {gutenbergrun.Lock}
 */

/**
 * Map of locks tracked by the application.
 *
 * @type {Map}
 */
const locks = new Map;

/**
 * Returns a lock descriptor. Creates a new lock if there are no locks tracked
 * in the application by the given key. Until a lock is released, subsequent
 * calls using the same key will receive a lock descriptor as non-owner to
 * await release of the lock.
 *
 * @param {string} key Unique key of lock to generate or return.
 *
 * @return {gutenbergrun.Lock} Lock descriptor.
 */
function getLock( key ) {
	// Lock already claimed.
	if ( locks.has( key ) ) {
		return {
			isOwner: false,
			release: noop,
			released: locks.get( key ),
		};
	}

	let release;
	const released = new Promise( ( resolve ) => {
		release = () => {
			locks.delete( key );
			resolve();
		};
	} );

	locks.set( key, released );

	return {
		isOwner: true,
		release,
		released,
	};
}

module.exports = getLock;
