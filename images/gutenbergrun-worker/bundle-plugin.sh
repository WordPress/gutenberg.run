#!/bin/bash

# TEMPORARY: Remove postinstall script forcibly.
sed -i '/"postinstall"/d' package.json

# Download all vendor scripts
vendor_scripts=""
# Using `command | while read...` is more typical, but the inside of the `while`
# loop will run under a separate process this way, meaning that it cannot
# modify $vendor_scripts. See: https://stackoverflow.com/a/16855194
exec 3< <(
	# Get minified versions of vendor scripts.
	php bin/get-vendor-scripts.php
	# Get non-minified versions of vendor scripts (for SCRIPT_DEBUG).
	php bin/get-vendor-scripts.php debug
)
while IFS='|' read -u 3 url filename; do
	echo "$url"
	echo -n " > vendor/$filename ... "
	http_status=$( curl \
		--location \
		--silent \
		"$url" \
		--output "vendor/_download.tmp.js" \
		--write-out "%{http_code}"
	)
	if [ "$http_status" != 200 ]; then
		error "HTTP $http_status"
		exit 1
	fi
	mv -f "vendor/_download.tmp.js" "vendor/$filename"
	vendor_scripts="$vendor_scripts vendor/$filename"
done

npm ci
npm run build

# Temporarily modify `gutenberg.php` with production constants defined. Use a
# temp file because `bin/generate-gutenberg-php.php` reads from `gutenberg.php`
# so we need to avoid writing to that file at the same time.
php bin/generate-gutenberg-php.php > gutenberg.tmp.php
mv gutenberg.tmp.php gutenberg.php

build_files=$(ls build/*/*.{js,css})

# Generate the plugin zip file.
zip -r gutenberg.zip \
	gutenberg.php \
	lib/*.php \
	packages/block-library/src/*/*.php \
	packages/block-serialization-default-parser/*.php \
	post-content.php \
	$vendor_scripts \
	$build_files \
	README.md
