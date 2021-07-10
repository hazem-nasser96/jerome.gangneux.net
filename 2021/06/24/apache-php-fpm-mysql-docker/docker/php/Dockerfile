FROM php:7.4-fpm

# PHP and related
RUN apt-get update && apt-get install -y --no-install-recommends \
        locales \
        apt-utils \
        git \
        g++ \
        libicu-dev \
        libpng-dev \
        libxml2-dev \
        libzip-dev \
        libonig-dev \
        libxslt-dev \
        unzip \
        libfreetype6-dev \
        libjpeg62-turbo-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-configure intl \
    && docker-php-ext-install \
        pdo \
        pdo_mysql \
        opcache \
        intl \
        zip \
        calendar \
        dom \
        mbstring \
        gd \
        xsl \
    && pecl install apcu \
    && docker-php-ext-enable apcu \
\
    &&  curl -sS https://getcomposer.org/installer | php -- \
    &&  mv composer.phar /usr/local/bin/composer

RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Node 14 and related
RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && npm install pm2@5.0 -g \
    && pm2 install pm2-logrotate \
    && pm2 set pm2-logrotate:compress true
