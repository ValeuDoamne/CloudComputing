FROM postgres:latest

COPY init.sql /docker-entrypoint-initdb.d/
RUN chown postgres:postgres /docker-entrypoint-initdb.d/init.sql
RUN chmod 755 /docker-entrypoint-initdb.d/init.sql

CMD ["postgres"]
