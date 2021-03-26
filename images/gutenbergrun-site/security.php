<?php

// Prevent abuse. See also `wp-config.php` (created by `01-create-container.js`).

add_filter( 'pre_wp_mail', '__return_false' );
add_filter( 'xmlrpc_enabled', '__return_false' );
