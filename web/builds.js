/**
 * External dependencies
 */

const { Readable, PassThrough } = require( 'stream' );
const StreamCache = require( 'stream-cache' );

/**
 * Internal dependencies
 */

const runTasks = require( './util/run-tasks' );

/**
 * Map of builds in progress, keyed by unique identifier, value a Stream
 * emitting upon progress and ending upon completion of the build.
 *
 * @type {Map<string,Stream>}
 */
const builds = new Map;

/**
 * Attaches a listener to an in-progress build, yielding progress from the
 * build.
 *
 * @param {string} id Unique identifier of build.
 *
 * @yield {Object} Build progress action objects.
 */
async function* listen( id ) {
	const build = builds.get( id );

	// Create a new stream to avoid reusing the same iterator state.
	const listener = new PassThrough( { objectMode: true } );
	build.pipe( listener );

	yield* listener;
}

/**
 * Creates a new build.
 *
 * @param {string} id    Unique identifier of build.
 * @param {string} group Task group to run.
 * @param {...*}   args  Arguments to pass to task.
 */
async function create( id, group, ...args ) {
	const runner = runTasks( group, ...args );
	const stream = new Readable( { objectMode: true, read() {} } );

	// Listeners read from the cache to ensure replay of prior buffer they may
	// have missed.
	const cache = new StreamCache();
	stream.pipe( cache );

	builds.set( id, cache );

	for await ( const message of runner ) {
		stream.push( message );
	}

	stream.push( null );
	builds.delete( id );
}

module.exports = {
	listen,
	create,
	has: builds.has.bind( builds ),
};
