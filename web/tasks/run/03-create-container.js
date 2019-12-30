/**
 * External dependencies
 */

const execa = require( 'execa' );
const touch = require( 'touch' );
const { join } = require( 'path' );

/**
 * Internal dependencies
 */

const getShortId = require( '../../util/get-short-id' );
const {
	MYSQL_ROOT_PASSWORD,
	BASE_HOSTNAME,
	HOST_BUILD_ROOT,
	BUILD_ROOT,
	SITE_IMAGE,
	CONTAINER_TTL_SECONDS,
	PUBLIC_NETWORK_NAME,
} = require( '../../constants' );
const getTaggedImageName = require( '../../util/get-tagged-image-name' );

/**
 * Provisions site.
 *
 * @param {gutenbergrun.Task} task Task descriptor.
 * @param {Object}            meta Task meta.
 *
 * @return {Promise} Promise resolving once task completes.
 */
async function* run( task, meta ) {
	const { id, sha } = meta;

	// At this point, the build file is guaranteed. This task is run for every
	// container. Touch the build file to reset its expiration, where build
	// files are removed on the basis of last-modified.
	touch( join( BUILD_ROOT, sha + '.zip' ) );

	const endTime = Math.round( Date.now() / 1000 ) + CONTAINER_TTL_SECONDS;

	const db = {
		name: 'container_' + id,
		user: getShortId(),
		pass: getShortId(),
	};

	// Create database.
	yield { type: 'STATUS', status: 'Creating database', progress: 65 };
	await execa( 'mysql', [
		'-uroot',
		'--password=' + MYSQL_ROOT_PASSWORD,
		'-h',
		'db',
		'-e',
		`CREATE DATABASE IF NOT EXISTS ${ db.name };`,
	] );

	// Create database user.
	yield { type: 'STATUS', status: 'Creating database user', progress: 70 };
	await execa( 'mysql', [
		'-uroot',
		'--password=' + MYSQL_ROOT_PASSWORD,
		'-h',
		'db',
		db.name,
		'-e',
		`GRANT ALL PRIVILEGES ON *.* TO '${ db.user }'@'%' IDENTIFIED BY '${ db.pass }';`,
	] );

	// Create container.
	yield { type: 'STATUS', status: 'Creating container', progress: 75 };
	const { stdout: containerId } = await execa( 'docker', [
		'run',
		'-d',
		'--net',
		PUBLIC_NETWORK_NAME,
		'--name',
		id,
		'-e',
		`VIRTUAL_HOST=${ id }.${ BASE_HOSTNAME }`,
		'-e',
		`TIME_REMAINING_END=${ endTime }`,
		'-v',
		HOST_BUILD_ROOT + ':/build',
		await getTaggedImageName( SITE_IMAGE ),
	] );
	yield { type: 'RECEIVE_CONTAINER_ID', containerId: id };

	// Create site configuration.
	yield { type: 'STATUS', status: 'Creating site configuration', progress: 80 };
	await execa( 'docker', [
		'exec',
		containerId,
		'/bin/sh',
		'-c',
		`wp config create --dbname=${ db.name } --dbuser=${ db.user } --dbpass=${ db.pass } --dbhost=db`,
	] );

	// Install site.
	yield { type: 'STATUS', status: 'Installing site', progress: 85 };
	const url = meta.url = `http://${ id }.${ BASE_HOSTNAME }`;
	const user = meta.user = {
		user: 'demo',
		pass: getShortId(),
	};
	await execa( 'docker', [
		'exec',
		containerId,
		'/bin/sh',
		'-c',
		`wp core install --url=${ url } --title="Gutenberg Run" --admin_user=${ user.user } --admin_password=${ user.pass } --admin_email=${ id }@example.com`,
	] );
	yield { type: 'RECEIVE_SITE_DETAILS', url };
	yield { type: 'RECEIVE_USER_CREDENTIALS', user };

	// Give the user a nicer name.
	yield { type: 'STATUS', status: 'Configuring user account', progress: 90 };
	await execa( 'docker', [
		'exec',
		containerId,
		'/bin/sh',
		'-c',
		`wp user update ${ user.user } --display_name="Demo User"`,
	] );

	// Install Gutenberg plugin.
	yield { type: 'STATUS', status: 'Installing plugin', progress: 95 };
	await execa( 'docker', [
		'exec',
		containerId,
		'/bin/sh',
		'-c',
		`wp plugin install /build/${ sha }.zip --activate`,
	] );
}

module.exports = {
	label: 'Provisioning site',
	run,
};
