/**
 * External dependencies
 */

const { join } = require( 'path' );

module.exports.BASE_HOSTNAME = process.env.BASE_HOSTNAME;
module.exports.MYSQL_ROOT_PASSWORD = process.env.MYSQL_ROOT_PASSWORD;
module.exports.HOST_ROOT = process.env.HOST_ROOT;
module.exports.HOST_HOME = process.env.HOST_HOME;
module.exports.SENTRY_DSN = process.env.SENTRY_DSN;
module.exports.CONTAINER_TTL_SECONDS = Number( process.env.CONTAINER_TTL_SECONDS );
module.exports.PUBLIC_NETWORK_NAME = 'gutenbergrun_public';
module.exports.SITE_IMAGE = 'gutenbergrun-site';
module.exports.SHORTID_LENGTH = 8;
module.exports.APP_ROOT = __dirname;
module.exports.ROOT = join( module.exports.APP_ROOT, '..' );
module.exports.IMAGES_ROOT = join( module.exports.ROOT, 'images' );
module.exports.ARTIFACT_DOWNLOAD_URL = 'https://gutenberg-artifact.aduth.workers.dev/';
