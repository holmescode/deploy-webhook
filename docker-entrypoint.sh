#!/bin/bash
set -e

if [ "$1" = 'deploy-webhook' ]; then
    exec node /var/service/index.js "$@"
fi

exec "$@"
