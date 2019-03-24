/**
 * External dependencies
 */

const { join } = require( 'path' );

/**
 * Internal dependencies
 */

const getOrderedTasks = require( './get-ordered-tasks' );
const toAsyncIterable = require( './to-async-iterable' );
const { captureException } = require( '../error' );

/**
 * Runs tasks, yielding task progress and delegated task yield messages as
 * action objects.
 *
 * @param {string} group Group key.
 * @param {...*}   args  Arguments to pass to task handlers.
 *
 * @yield {Object} Task progress or delegated task messages.
 */
async function* runTasks( group, ...args ) {
	const path = join( __dirname, '..', 'tasks', group );
	const tasks = await getOrderedTasks( path );

	for ( const task of tasks ) {
		yield { type: 'START_TASK', task };

		try {
			const runner = toAsyncIterable( task.run( task, ...args ) );
			for await ( const message of runner ) {
				if ( message ) {
					yield message;
				}
			}
		} catch ( error ) {
			const eventId = captureException( error );
			yield { type: 'ERROR', eventId };

			// Prevent further tasks from running.
			break;
		}

		yield { type: 'FINISH_TASK', task };
	}
}

module.exports = runTasks;
