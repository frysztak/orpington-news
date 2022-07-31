#!/bin/bash

set -e

mkdir -p reports
mkdir -p .nyc_output

cp packages/frontend/jest-coverage/coverage-final.json reports/frontend-jest.json 
cp packages/backend/jest-coverage/coverage-final.json reports/backend-jest.json 
cp packages/shared/jest-coverage/coverage-final.json reports/shared-jest.json 
cp cypress-coverage/coverage-final.json reports/cypress.json 

./node_modules/nyc/bin/nyc.js merge reports .nyc_output/out.json
./node_modules/nyc/bin/nyc.js report --reporter lcov --reporter text --report-dir full-coverage