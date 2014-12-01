# homebrew-cms

A very basic CMS, just because.

Nothing to do with [homebrew the package manager](http://brew.sh/).

## getting started

### global dependencies

- `gulp` (`npm install -g gulp`)
- `mongodb` (`brew install mongodb`)
- `sass` (`brew install sass`)

### build

install dependencies (`npm install`) and build front-end assets (`gulp`)

### start

1. start the db: `mongod`
2. set environment variable `$SECRET` for express cookie secret
3. start server: `npm start`

starting in development mode, with `supervisor` (required) and `gulp watch`: `npm run-script start-dev` (still need to start `mongod` before)
