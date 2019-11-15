/**
 * External dependencies
 */

const execa = require( 'execa' );
const { join } = require( 'path' );
const { access } = require( 'fs' ).promises;
const { default: PQueue } = require( 'p-queue' );

/**
 * Internal dependencies
 */

const { SOURCE_ROOT, TREES_ROOT, BUILD_ROOT } = require( '../../constants' );
const getLock = require( '../../util/get-lock' );

/**
 * To avoid conflicting concurrent fetches, assure at most a single fetch in the
 * bare repository at a time.
 */
const cloneQueue = new PQueue( { concurrency: 1 } );

/**
 * Clones branch.
 *
 * @param {gutenbergrun.Task} task Task descriptor.
 * @param {Object}            meta Task meta.
 *
 * @return {Promise} Promise resolving once task completes.
 */
async function* run( task, meta ) {
	const { sha } = meta;

	const lock = meta.lock = getLock( sha );

	// Check if built copy is already available.
	yield { type: 'STATUS', status: 'Checking built availability', sha, progress: 5 };
	const built = join( BUILD_ROOT, sha + '.zip' );
	try {
		await access( built );

		// Skip if it's already available.
		yield { type: 'STATUS', status: 'Skipping due to available build' };
		return;
	} catch ( error ) {}

	if ( ! lock.isOwner ) {
		return;
	}

	// Fetch latest source from remote.
	yield { type: 'STATUS', status: 'Fetching latest remote', progress: 10 };
	await cloneQueue.add( () => execa( 'git', [ 'fetch', 'origin', sha ], { cwd: SOURCE_ROOT } ) );

	// Create clone from bare repository.
	yield { type: 'STATUS', status: 'Cloning repository', progress: 20 };
	const tree = join( TREES_ROOT, sha );
	try {
		await access( tree );
		yield { type: 'STATUS', status: 'Clone already exists, skipping' };
	} catch ( error ) {
		await execa( 'git', [ 'clone', SOURCE_ROOT, sha ], { cwd: TREES_ROOT } );
	}

	// Checkout from SHA commit.
	yield { type: 'STATUS', status: 'Switching branches', sha, progress: 30 };
	await execa( 'git', [ 'fetch', 'origin', sha ], { cwd: tree } );
	await execa( 'git', [ 'checkout', 'FETCH_HEAD' ], { cwd: tree } );
}

module.exports = {
	label: 'Clone branch',
	run,
};
