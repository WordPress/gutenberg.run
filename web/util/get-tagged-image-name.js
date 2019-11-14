/**
 * Internal dependencies
 */

const getCurrentImageTag = require( './get-current-image-tag' );

/**
 * Returns a promise resolving to Docker image name including tag specifier.
 *
 * @param {string} imageName Base name for image.
 *
 * @return {Promise<string>} Promise resolving to tagged image name.
 */
async function getTaggedImageName( imageName ) {
	return [ imageName, await getCurrentImageTag() ].join( ':' );
}

module.exports = getTaggedImageName;
