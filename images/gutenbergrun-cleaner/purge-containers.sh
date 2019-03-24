#!/bin/bash

create_cutoff=$(date -d "-$CONTAINER_TTL_SECONDS seconds" +"%Y-%m-%d %H:%M:%S %z %Z" )
echo "Running clean, removing any container older than $create_cutoff"

#============================
# Remove expired containers
#============================

expired=$(
	docker ps -a --filter "ancestor=gutenbergrun-site" --format='{{.ID}},{{.Names}},{{.CreatedAt}}' \
		| awk -v create_cutoff="$create_cutoff" -F ',' '$3 < create_cutoff {printf "%s,%s\n", $1, $2}'
)

for pair in $expired
do
	echo "Deleting expired container $pair"
	container_id=${pair%,*}
	container_name=${pair#*,}
	mysql -uroot --password="$MYSQL_ROOT_PASSWORD" -h db -e "DROP DATABASE IF EXISTS container_$container_name;"
	docker rm -f $container_id
done

#============================
# Remove builds files last modified two weeks ago.
#============================

find /src/build -type f -mtime +$BUILD_TTL_DAYS -maxdepth 1 -delete
