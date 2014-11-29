# homebrew-cms 

A very basic CMS, just because.

Nothing to do with [homebrew the package manager](http://brew.sh/).

## getting started

### global dependencies

- `grunt` (`npm install -g grunt-cli`)
- `mongodb` (`brew install mongodb`)
- `sass` (`brew install sass`)

### build

install dependencies (`npm install`) and build front-end assets (`grunt`)

### start

1. start the db: `mongod`
2. set environment variable `$SECRET` for express cookie secret
3. start server: `npm start`

starting in development mode, with `supervisor` (required) and `grunt watch`: `npm run-script start-dev` (still need to start `mongod` before)
