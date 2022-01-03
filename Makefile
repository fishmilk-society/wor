.PHONY: build
default: template.json
	NODE_ENV=production npx rollup -c

template.json: build/write-template-json.ts src/data/*
	./build/write-template-json.ts
