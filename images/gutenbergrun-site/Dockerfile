FROM alpine

ENV PORT 9000
EXPOSE 9000

RUN apk add curl sudo mariadb-client php7-json php7-phar php7-common \
	php7-iconv php7-json php7-gd php7-curl php7-xml php7-imap php7-cgi fcgi \
	php7-pdo php7-pdo_mysql php7-mysqli php7-mysqlnd php7-xmlrpc php7-posix \
	php7-mcrypt php7-gettext php7-ldap php7-ctype php7-dom

# Install WP-CLI

ENV WP_CLI_CACHE_DIR=/home/www-data/.wp-cli/cache/
ENV PAGER="more"
RUN adduser www-data -D
RUN curl -o /bin/wp-cli.phar https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
RUN echo "sudo -E -u www-data /bin/wp-cli.phar \"\$@\"" > /bin/wp
RUN chmod +x /bin/wp-cli.phar /bin/wp

# Download WordPress

WORKDIR /usr/www/
RUN chown -R www-data .
RUN wp core download

# Install dependant plugins

RUN mkdir -p wp-content/mu-plugins
RUN curl https://raw.githubusercontent.com/aduth/wp-time-remaining/master/index.php > wp-content/mu-plugins/time-remaining.php
RUN curl https://raw.githubusercontent.com/aduth/wp-disable-nux/master/index.php > wp-content/mu-plugins/disable-nux.php
COPY ./set-cookie.php wp-content/mu-plugins/set-cookie.php

ENTRYPOINT [ "php", "-S", "0.0.0.0:9000" ]
