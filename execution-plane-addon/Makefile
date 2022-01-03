#!/bin/bash

# Libraries
TSC := node node_modules/.bin/tsc

deps:
	npm install

build:
	npm install
	npm run build

clean:
	rm -rf dist && $(TSC)
	rm -rf node_modules && rm -f package-lock.json
