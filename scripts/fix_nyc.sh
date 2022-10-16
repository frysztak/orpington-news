#!/bin/bash

set -e

cd .nyc_output
jq 'map_values(if has("inputSourceMap") then (.inputSourceMap?.sources[0] = .path) else . end)' out.json > processed.json
mv processed.json out.json
