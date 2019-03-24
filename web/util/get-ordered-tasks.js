/**
 * External dependencies
 */

const { readdir } = require( 'fs' ).promises;
const { extname, basename, join } = require( 'path' );

/**
 * Task object descriptor.
 *
 * @property {string}   name  Unique name of task.
 * @property {string}   label Human-readable task description.
 * @property {Function} run   Task (asynchronous) function callback.
 *
 * @typedef {gutenberg.Task}
 */

/**
 * Returns a promise resolving to an array of task objects.
 *
 * @param {string} path Path to directory containing task files.
 *
 * @return {Array<gutenberg.Task>} Array of task objects.
 */
async function getOrderedTasks( path ) {
	const files = await readdir( path );

	return files
		.filter( ( file ) => extname( file ) === '.js' )
		.sort()
		.map( ( file ) => ( {
			name: basename( file, '.js' ),
			...require( join( path, file ) ),
		} ) );
}

module.exports = getOrderedTasks;
