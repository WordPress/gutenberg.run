/**
 * External dependencies
 */

const execa = require( 'execa' );

/**
 * Internal dependencies
 */

const getShortId = require( '../../util/get-short-id' );
const {
	MYSQL_ROOT_PASSWORD,
	BASE_HOSTNAME,
	SITE_IMAGE,
	CONTAINER_TTL_SECONDS,
	PUBLIC_NETWORK_NAME,
	ARTIFACT_DOWNLOAD_URL,
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
	const { id, pr } = meta;

	const endTime = Math.round( Date.now() / 1000 ) + CONTAINER_TTL_SECONDS;

	const db = {
		name: 'container_' + id,
		user: getShortId(),
		pass: getShortId(),
	};

	// Create database.
	yield { type: 'STATUS', status: 'Creating database', progress: 10 };
	await execa( 'mysql', [
		'-uroot',
		'--password=' + MYSQL_ROOT_PASSWORD,
		'-h',
		'db',
		'-e',
		`CREATE DATABASE IF NOT EXISTS ${ db.name };`,
	] );

	// Create database user.
	yield { type: 'STATUS', status: 'Creating database user', progress: 20 };
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
	yield { type: 'STATUS', status: 'Creating container', progress: 30 };
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
		await getTaggedImageName( SITE_IMAGE ),
	] );
	yield { type: 'RECEIVE_CONTAINER_ID', containerId: id };

	// Create site configuration.
	yield { type: 'STATUS', status: 'Creating site configuration', progress: 40 };
	await execa( 'docker', [
		'exec',
		containerId,
		'/bin/sh',
		'-c',
		`wp config create --dbname=${ db.name } --dbuser=${ db.user } --dbpass=${ db.pass } --dbhost=db --extra-php <<PHP
define( 'WP_SITEURL', 'http://${ id }.${ BASE_HOSTNAME }' );
define( 'WP_HOME', 'http://${ id }.${ BASE_HOSTNAME }' );
define( 'DISALLOW_FILE_MODS', true );
define( 'WP_HTTP_BLOCK_EXTERNAL', true );
define( 'WP_ACCESSIBLE_HOSTS', '*.wordpress.org,*.w.org' );
PHP`,
	] );

	// Install site.
	yield { type: 'STATUS', status: 'Installing site', progress: 50 };
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

	// Give the user a nicer name.
	yield { type: 'STATUS', status: 'Configuring user account', progress: 60 };
	await execa( 'docker', [
		'exec',
		containerId,
		'/bin/sh',
		'-c',
		`wp user update ${ user.user } --display_name="Demo User"`,
	] );

	// Install Gutenberg plugin.
	yield { type: 'STATUS', status: 'Installing plugin', progress: 70 };
	try {
		await execa( 'docker', [
			'exec',
			containerId,
			'/bin/sh',
			'-c',
			`curl ${ new URL( pr, ARTIFACT_DOWNLOAD_URL ) } -o artifact.zip; unzip artifact.zip || exit 48; wp plugin install gutenberg.zip --activate`,
		] );

		yield { type: 'RECEIVE_SITE_DETAILS', url };
		yield { type: 'RECEIVE_USER_CREDENTIALS', user };
	} catch ( error ) {
		if ( error.exitCode === 48 ) {
			yield { type: 'INVALID' };
		} else {
			throw error;
		}
	}
}

module.exports = {
	label: 'Provisioning site',
	run,
};
