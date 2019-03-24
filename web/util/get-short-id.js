/**
 * External dependencies
 */

const generate = require( 'nanoid/generate' );

/**
 * Internal dependencies
 */

const { SHORTID_LENGTH } = require( '../constants' );

/**
 * Set of characters from which to generate identifiers.
 *
 * @type {string}
 */
const ALPHABET = '123456789abcdefghijkmnopqrstuvwxyz';

/**
 * Returns a short semi-unique identifier.
 *
 * @return {string} Generated identifier.
 */
function getShortId() {
	return generate( ALPHABET, SHORTID_LENGTH );
}

module.exports = getShortId;
