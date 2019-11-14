/**
 * External dependencies
 */

const execa = require( 'execa' );

/**
 * Evaluated tag, cached for lifetime of process.
 *
 * @type {string=}
 */
let tag;

/**
 * Returns a promise resolving to the value to use as tag for built Docker
 * images.
 *
 * @return {Promise<string>} Promise resolving to tag.
 */
async function getCurrentImageTag() {
	if ( tag === undefined ) {
		try {
			tag = ( await execa( 'git', [ 'rev-parse', 'HEAD' ] ) ).stdout;
		} catch ( error ) {
			tag = 'latest';
		}
	}

	return tag;
}

module.exports = getCurrentImageTag;
