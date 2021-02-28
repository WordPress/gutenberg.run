#!/bin/bash

create_cutoff=$(date -d "-$CONTAINER_TTL_SECONDS seconds" +"%Y-%m-%d %H:%M:%S %z %Z")
echo "Running clean, removing any container older than $create_cutoff"

#============================
# Remove expired containers
#============================

# Filter containers by those matching image (of _any tag_) and creation date
# exceeding allowable start cutoff.
expired=$(
	docker ps -a --format='{{.Image}},{{.CreatedAt}},{{.ID}},{{.Names}}' \
		| awk -v create_cutoff="$create_cutoff" -F ',' '$1 ~ /^gutenbergrun-site:/ && $2 < create_cutoff {printf "%s,%s\n", $3, $4}'
)

for pair in $expired
do
	echo "Deleting expired container $pair"
	container_id=${pair%,*}
	container_name=${pair#*,}
	mysql -uroot --password="$MYSQL_ROOT_PASSWORD" -h db -e "DROP DATABASE IF EXISTS container_$container_name;"
	docker rm -f $container_id
done
