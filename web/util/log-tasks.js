/**
 * External dependencies
 */

const ora = require( 'ora' );

/**
 * Internal dependencies
 */

const runTasks = require( './run-tasks' );

/**
 * Given a task grouping key, runs all tasks, logging completion progress.
 *
 * @param {string} group Group key.
 * @param {...*}   args  Arguments to pass to task handlers.
 */
async function logTasks( group, ...args ) {
	const tasks = runTasks( group, ...args );
	const spinners = {};

	for await ( const message of tasks ) {
		const { type, task } = message;

		switch ( type ) {
			case 'START_TASK':
				spinners[ task.label ] = ora( task.label ).start();
				break;

			case 'FINISH_TASK':
				spinners[ task.label ].succeed();
				break;
		}
	}
}

module.exports = logTasks;
