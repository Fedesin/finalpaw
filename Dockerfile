FROM funxtionatics/php8-fpm-nginx-alpine

USER root

COPY . /var/www/
RUN chown -R nobody:nobody /var/www
RUN mkdir -p /vaw/www/logs
RUN echo "" > /vaw/www/logs/app.log

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

# Allow composer to run as root
ENV COMPOSER_ALLOW_SUPERUSER 1

RUN composer update

#CMD ["/start.sh"]

USER nobody
