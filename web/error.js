/**
 * External dependencies
 */

const Sentry = require( '@sentry/node' );

/**
 * Internal dependencies
 */

const { SENTRY_DSN } = require( './constants' );

Sentry.init( { dsn: SENTRY_DSN } );

/**
 * Logs an error, using Sentry if configured, otherwise falling back to console
 * logging.
 *
 * @param {Error} error Error to log.
 */
function captureException( error ) {
	if ( SENTRY_DSN ) {
		Sentry.captureException( error );
	} else {
		console.error( error );
	}
}

module.exports = {
	captureException,
};
