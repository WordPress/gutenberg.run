<?php

function gutenbergrun_set_cookie() {
	if ( ! empty( $_POST['pull'] ) && is_numeric( $_POST['pull'] ) ) {
		setcookie( 'pull', $_POST['pull'], time() + 31536000, '/' );
	}
}
add_action( 'wp_login', 'gutenbergrun_set_cookie' );
