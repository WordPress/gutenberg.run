#!/bin/bash

# Wait for MariaDB availability
until nc -z -v -w30 db 3306
do
  echo "Waiting on MariaDB availability..."
  sleep 2
done

/bin/sh -e /purge-trees.sh
/bin/sh -e /purge-containers.sh

# Run Cron in foreground to keep container alive.
crond -f -L /var/log/cron.log
