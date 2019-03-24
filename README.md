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

Since Gutenberg Run provisions new sites using subdomains, to develop locally you should configure wildcard DNS handling. `dnsmasq` is ideal for this ([see macOS installation instructions](https://www.stevenrombauts.be/2018/01/use-dnsmasq-instead-of-etc-hosts/)).

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
