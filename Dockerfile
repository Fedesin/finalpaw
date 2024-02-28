FROM funxtionatics/php8-fpm-nginx-alpine

WORKDIR /var/www/
COPY --chown=nobody:nobody . .

# Image config
ENV SKIP_COMPOSER 1
ENV WEBROOT /var/www/html/public
ENV PHP_ERRORS_STDERR 1
ENV RUN_SCRIPTS 1
ENV REAL_IP_HEADER 1

# Laravel config
ENV APP_ENV testing
ENV APP_DEBUG false
ENV LOG_CHANNEL stderr

ENV LOG_PATH=logs/app.log
ENV LOG_LEVEL=DEBUG

ENV DB_ADAPTER=pgsql
ENV DB_HOSTNAME=localhost
ENV DB_DBNAME=paw
ENV DB_USERNAME=postgres
ENV DB_PASSWORD=
ENV DB_PORT=5432

# Allow composer to run as root
ENV COMPOSER_ALLOW_SUPERUSER 1

RUN composer update

RUN ./vendor/bin/phinx migrate