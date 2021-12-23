.PHONY: build
default: template.json
	NODE_ENV=production npx rollup -c

template.json: build/write-template-json.ts src/data/CharacterSourceData.ts src/data/SizeCategory.ts
	./build/write-template-json.ts
