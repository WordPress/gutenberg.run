# Gutenberg Run

[**gutenberg.run**](http://gutenberg.run) is a service which provides temporary live preview sites for [Gutenberg](https://github.com/WordPress/gutenberg/) pull requests.

<a href="https://cldup.com/KPDmTMFuIb.gif"><img src="https://cldup.com/KPDmTMFuIb.gif" width="640" height="450"></a>

## Installation

[Docker](https://www.docker.com/) is the only requirement to run Gutenberg Run locally.

After cloning the repository, run `docker-compose up` in the cloned directory.

```
git clone https://github.com/aduth/gutenberg.run.git
cd gutenberg.run
docker-compose up
```

By default, Gutenberg Run assumes a development environment.

Since Gutenberg Run provisions new sites using randomized subdomains, you should configure wildcard DNS handling to develop locally.

If you're developing using macOS, `dnsmasq` is ideal for this. With [Homebrew](https://brew.sh/) installed, you can [follow guidance from this article](https://www.stevenrombauts.be/2018/01/use-dnsmasq-instead-of-etc-hosts/), where the steps for this project should look something like:

```sh
brew install dnsmasq # Install dnsmasq
echo "address=/.gutenberg.run.test/127.0.0.1" >> /usr/local/etc/dnsmasq.conf # Configure dnsmasq to redirect gutenberg.run.test subdomains to localhost
sudo brew services start dnsmasq # Start dnsmasq process
sudo mkdir -p /etc/resolver # Create resolvers directory for macOS DNS query overrides
sudo sh -c 'echo "nameserver 127.0.0.1" > /etc/resolver/gutenberg.run.test' # Configure gutenberg.run.test DNS query behavior
```

### Configuration

The following options exist, configured by the presence of environment variables.

- `NODE_ENV`: Application running mode, one of `development` or `production` (default `development`)
- `BASE_HOSTNAME`: The base hostname for containers (default `gutenberg.run.test`)
- `MYSQL_ROOT_PASSWORD`: Password to use as root for the MySQL database (default `password`)
- `CONTAINER_TTL_SECONDS`: Container lifetime, in seconds (default `86400`)
- `SENTRY_DSN`: [Sentry data source name](https://docs.sentry.io/platforms/javascript/?platform=node), when using Sentry for error logging
- `BUILD_TTL_DAYS`: The length in time to keep built archives after last provision, in days (default `30`)

## License

Copyright 2019 Andrew Duthie

Released under the [MIT License](./LICENSE.md).
