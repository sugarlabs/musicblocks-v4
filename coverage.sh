#! /bin/bash

set -e

npx lerna run coverage

rm -rf coverage
mkdir coverage

rm -rf coverage-temp
mkdir coverage-temp

cp modules/singer/coverage/coverage-final.json coverage-temp/coverage-module-singer.json

npx nyc merge coverage-temp coverage-temp/merged-coverage.json
npx nyc report -t coverage-temp --report-dir coverage --reporter=html --reporter=cobertura --reporter=text

rm -rf coverage-temp
