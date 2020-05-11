var state = {},
	search,
	number,
	branch,
	task;

var elements = [
	'status',
	'progressFill',
	'create',
	'number',
].reduce( function( result, id ) {
	result[ id ] = document.getElementById( id );
	return result;
}, {} );

/**
 * Redirects to the created site after build completes.
 */
function redirect() {
	var payload, key, form, input;

	if ( ! state.url || ! state.user ) {
		return;
	}

	payload = {
		log: state.user.user,
		pwd: state.user.pass,
		remember: 1,
		pull: number,
		redirect_to: state.url + '/wp-admin/post-new.php',
	};

	form = document.createElement( 'form' );
	form.method = 'POST';
	form.action = state.url + '/wp-login.php';
	form.style.display = 'none';

	for ( key in payload ) {
		input = document.createElement( 'input' );
		input.type = 'hidden';
		input.name = key;
		input.value = payload[ key ];
		form.appendChild( input );
	}

	document.body.appendChild( form );
	form.submit();
}

/**
 * Updates the status text to the given message.
 *
 * @param {string} text Status message to display.
 */
function setStatus( text ) {
	elements.status.textContent = text;
}

/**
 * Updates the progress bar to the given percentage value.
 *
 * @param {number} percent Percent value of progress.
 */
function setProgress( percent ) {
	elements.progressFill.style.width = ( percent + '%' );
}

/**
 * Sets the active display mode.
 *
 * @param {string} mode Display mode.
 */
function show( mode ) {
	document.body.setAttribute( 'data-active', mode );
}

/**
 * Updates the current state given the action object message.
 *
 * @param {Object} action Action object by which to update state.
 */
function dispatch( action ) {
	switch ( action.type ) {
		case 'RECEIVE_SITE_DETAILS':
			state.url = action.url;
			break;

		case 'RECEIVE_USER_CREDENTIALS':
			state.user = action.user;
			break;

		case 'STATUS':
			setStatus( action.status + '…' );
			if ( action.progress ) {
				setProgress( action.progress );
			}
			break;

		case 'ERROR':
			setStatus( 'Error!' );
			setProgress( 0 );
			break;

		case 'DONE':
			setProgress( 100 );
			setStatus( 'Redirecting…' );
			break;
	}
}

/**
 * Given a container ID, creates an EventSource listener from which to dispatch
 * actions as progress events are received.
 *
 * @param {string} id Container ID.
 *
 * @return {Promise} Promise resolving once build completes.
 */
function listen( id ) {
	var source = new window.EventSource( '/status/' + id ),
		isNavigating = false,
		resolve, reject;

	// Assign navigating value to avoid unsetting persisted container progress
	// when reload incurs an EventSource error.
	window.addEventListener( 'beforeunload', function() {
		isNavigating = true;
	} );

	source.onmessage = function( event ) {
		var action;
		try {
			action = JSON.parse( event.data );
		} catch ( error ) {}

		if ( ! action || ! action.type ) {
			return;
		}

		dispatch( action );

		if ( action.type === 'DONE' || action.type === 'ERROR' ) {
			source.close();
			resolve();
		}
	};

	source.onerror = function() {
		source.close();

		// Consider build corrupted and don't attempt to restore on future
		// visits. Exclude navigations, which trigger source error.
		if ( ! isNavigating ) {
			reject();
		}
	};

	return new Promise( function( _resolve, _reject ) {
		resolve = _resolve;
		reject = _reject;
	} );
}

/**
 * Creates a new container from a commit hash.
 *
 * @param {string} sha Commit hash.
 *
 * @return {Promise} Promise resolving once container created.
 */
function create( sha ) {
	var url = '/create/' + sha;
	return window.fetch( url, { method: 'POST' } )
		.then( function( response ) {
			return response.text();
		} )
		.then( function( id ) {
			window.localStorage.setItem( number, id );
			return listen( id );
		} );
}

/**
 * Creates a new container from a pull request number.
 *
 * @param {number} pullNumber Pull request number.
 *
 * @return {Promise} Promise resolving once container created.
 */
function createFromPull( pullNumber ) {
	return window.fetch( 'https://api.github.com/repos/WordPress/gutenberg/pulls/' + pullNumber )
		.then( function( response ) {
			return response.status === 404 ? Promise.reject() : response.json();
		} )
		.then( function( body ) {
			return body.merge_commit_sha;
		} )
		.then( create );
}

/**
 * Creates a new container from a branch name.
 *
 * @param {string} branchName Branch name.
 *
 * @return {Promise} Promise resolving once container created.
 */
function createFromBranch( branchName ) {
	return window.fetch( 'https://api.github.com/repos/WordPress/gutenberg/branches/' + branchName )
		.then( function( response ) {
			return response.status === 404 ? Promise.reject() : response.json();
		} )
		.then( function( body ) {
			return body.commit.sha;
		} )
		.then( create );
}

// Determine pull request from which to create container, or listen to progress
// if build is ongoing, if exists.
number = window.location.pathname.slice( 1 );
search = window.location.search.slice( 1 );
if ( search && search.indexOf( 'branch=' ) === 0 ) {
	branch = search.slice( 7 );
}

// Assign form handler for home route to navigate to build route.
elements.create.addEventListener( 'submit', function( event ) {
	event.preventDefault();
	number = Number( elements.number.value );
	window.location = '/' + number;
} );

if ( number || branch ) {
	if ( window.localStorage[ number || branch ] ) {
		task = listen( window.localStorage[ number || branch ] );
	} else if ( number ) {
		task = createFromPull( number );
	} else if ( branch ) {
		task = createFromBranch( branch );
	}

	task.then( function() {
		window.localStorage.removeItem( number || branch );
		redirect();
	} ).catch( function() {
		var errorRedirect;

		window.localStorage.removeItem( number || branch );

		errorRedirect = '/';
		if ( number ) {
			errorRedirect += '?pull=' + number;
		}
		window.location = errorRedirect;
	} );

	show( 'run' );
} else {
	if ( search && search.indexOf( 'pull=' ) === 0 ) {
		number = Number( search.slice( 5 ) );
	}

	if ( number ) {
		elements.number.value = number;
	}

	show( 'create' );
}
