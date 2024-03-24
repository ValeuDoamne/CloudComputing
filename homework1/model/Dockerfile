FROM postgres:latest

# COPY init.sql /docker-entrypoint-initdb.d/
# RUN chown postgres:postgres /docker-entrypoint-initdb.d/init.sql
# RUN chmod 755 /docker-entrypoint-initdb.d/init.sql

COPY ./create-multiple-database.sh /docker-entrypoint-initdb.d/
RUN chown postgres:postgres /docker-entrypoint-initdb.d/create-multiple-database.sh
RUN chmod 755 /docker-entrypoint-initdb.d/create-multiple-database.sh

RUN mkdir /scripts
COPY ./asteroid_mining.sql /scripts
COPY ./users.sql /scripts


CMD ["postgres"]
