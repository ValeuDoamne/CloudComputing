#!/bin/bash

set -x

cotainer_id=$(docker ps | grep database | cut -f1 -d' ')

docker exec -t -u root $cotainer_id rm -rf /var/lib/postgresql/data
