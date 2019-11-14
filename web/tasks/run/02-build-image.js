/**
 * External dependencies
 */

const { join, posix } = require( 'path' );
const { access, rename } = require( 'fs' ).promises;
const execa = require( 'execa' );
const del = require( 'del' );

/**
 * Internal dependencies
 */

const {
	TREES_ROOT,
	BUILD_ROOT,
	HOST_HOME,
	HOST_TREES_ROOT,
	WORKER_IMAGE,
} = require( '../../constants' );

/**
 * Builds container image.
 *
 * @param {gutenbergrun.Task} task Task descriptor.
 * @param {Object}            meta Task meta.
 *
 * @return {Promise} Promise resolving once task completes.
 */
async function* run( task, meta ) {
	const { sha, lock } = meta;

	// Check if built copy is already available.
	const tree = posix.join( TREES_ROOT, sha );
	yield { type: 'STATUS', status: 'Checking tree checkout', sha };
	try {
		await access( tree );
	} catch ( error ) {
		// Skip if it's not available, indicating that a clone was not created.
		yield { type: 'STATUS', status: 'Skipping due to missing build tree' };
		if ( lock.isOwner ) {
			lock.release();
		}

		return;
	}

	if ( ! lock.isOwner ) {
		yield { type: 'STATUS', status: 'Waiting for build', progress: 40 };
		return lock.released;
	}

	// Run build task.
	yield { type: 'STATUS', status: 'Starting build', progress: 40 };
	await execa( 'docker', [
		'run',
		'--rm',
		'-v',
		join( HOST_HOME, '.npm' ) + ':/root/.npm',
		'-v',
		join( HOST_TREES_ROOT, sha ) + ':/src',
		'-w',
		'/src',
		WORKER_IMAGE,
	], { cwd: tree } );

	// Move build distributable.
	yield { type: 'STATUS', status: 'Moving build distributable', progress: 60 };
	await rename(
		join( TREES_ROOT, sha, 'gutenberg.zip' ),
		join( BUILD_ROOT, sha + '.zip' )
	);

	lock.release();

	// Cleanup.
	del( tree, { force: true } );
}

module.exports = {
	label: 'Building container image',
	run,
};
