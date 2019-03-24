/**
 * External dependencies
 */

const { access } = require( 'fs' ).promises;
const { join } = require( 'path' );
const execa = require( 'execa' );

/**
 * Internal dependencies
 */

const { SOURCE_ROOT } = require( '../../constants' );

/**
 * Returns a promise yielding to a boolean representing whether the bare source
 * Git clone already exists.
 *
 * @return {Promise<boolean>} Promise resolving to whether Git clone exists.
 */
async function hasClone() {
	try {
		await access( join( SOURCE_ROOT, 'HEAD' ) );
		return true;
	} catch ( error ) {
		return false;
	}
}

/**
 * Fetches bare git repository.
 *
 * @return {Promise} Promise resolving once task completes.
 */
async function run() {
	if ( await hasClone() ) {
		return;
	}

	const options = { cwd: SOURCE_ROOT };
	await execa( 'git', [ 'init', '--bare' ], options );
	await execa( 'git', [ 'fetch', 'origin' ], options );
}

module.exports = {
	label: 'Fetching bare git repository',
	run,
};
