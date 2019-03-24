/**
 * External dependencies
 */

const { join } = require( 'path' );
const execa = require( 'execa' );

/**
 * Internal dependencies
 */

const {
	IMAGES_ROOT,
	SITE_IMAGE,
	WORKER_IMAGE,
} = require( '../../constants' );

/**
 * Builds required application images.
 *
 * @return {Promise} Promise resolving once task completes.
 */
async function run() {
	// Derive tag from current Git HEAD.
	let tag;
	try {
		( { stdout: tag } = await execa( 'git', [ 'rev-parse', 'HEAD' ] ) );
	} catch ( error ) {}

	// If Git is unavailable, fall back to date timestamp value.
	if ( ! tag ) {
		tag = 'latest';
	}

	await Promise.all( [
		SITE_IMAGE,
		WORKER_IMAGE,
	].map( ( image ) => {
		return execa( 'docker', [
			'build',
			'-t',
			[ image, tag ].join( ':' ),
			'.',
		], { cwd: join( IMAGES_ROOT, image ) } );
	} ) );
}

module.exports = {
	label: 'Building required images',
	run,
};
