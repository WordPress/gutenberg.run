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
module.exports.WORKER_IMAGE = 'gutenbergrun-worker';
module.exports.SHORTID_LENGTH = 8;
module.exports.APP_ROOT = __dirname;
module.exports.ROOT = join( module.exports.APP_ROOT, '..' );
module.exports.SOURCE_ROOT = join( module.exports.ROOT, 'source' );
module.exports.BUILD_ROOT = join( module.exports.ROOT, 'build' );
module.exports.HOST_BUILD_ROOT = join( module.exports.HOST_ROOT, 'build' );
module.exports.TREES_ROOT = join( module.exports.ROOT, 'trees' );
module.exports.HOST_TREES_ROOT = join( module.exports.HOST_ROOT, 'trees' );
module.exports.IMAGES_ROOT = join( module.exports.ROOT, 'images' );
module.exports.STATIC_ROOT = join( module.exports.APP_ROOT, 'static' );
