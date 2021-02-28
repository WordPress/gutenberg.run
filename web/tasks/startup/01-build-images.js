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
} = require( '../../constants' );
const getTaggedImageName = require( '../../util/get-tagged-image-name' );

/**
 * Builds required application images.
 *
 * @return {Promise} Promise resolving once task completes.
 */
async function run() {
	await Promise.all( [
		SITE_IMAGE,
	].map( async ( image ) => {
		return execa( 'docker', [
			'build',
			'-t',
			await getTaggedImageName( image ),
			'.',
		], { cwd: join( IMAGES_ROOT, image ) } );
	} ) );
}

module.exports = {
	label: 'Building required images',
	run,
};
