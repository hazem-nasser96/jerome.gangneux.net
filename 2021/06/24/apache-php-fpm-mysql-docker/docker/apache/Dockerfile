FROM debian:buster-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    apache2 \
    && a2enmod proxy_fcgi \
    && a2enmod rewrite

CMD /usr/sbin/apache2ctl -D FOREGROUND
