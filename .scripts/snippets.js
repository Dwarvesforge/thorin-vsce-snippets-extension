const glob = require('glob-all')
const fs = require('fs')
const docblockParser = require('coffeekraken-docblock-parser')
const docblockParserInstance = docblockParser({
	language: 'php'
})

const res = {};

const files = glob.sync([
	'../thorin/src/functions/**/*.php'
])

files.forEach((file) => {
	const content = fs.readFileSync(file, 'utf8')
	const json = docblockParserInstance.parse(content)
	json.forEach((docblock) => {

		const args = [];
		if (docblock.params) {
			docblock.params.forEach((param, idx) => {
				let p = `\${${idx+1}:${param.types.map((p) => p.toLowerCase()).join('|')} ${param.name.replace('$','\\$')}`
				if (param.default) {
					p += ` = ${param.default}`
				}
				p += '}'
				args.push(p)
			})
		}

		let body = `Thorin::${docblock.name}(${args.join(', ')})`;
		let description = docblock.body

		res[`Thorin::${docblock.name}`] = {
			prefix: `Thorin::${docblock.name}`,
			body,
			description
		}
	})
})

fs.writeFileSync('snippets/snippets.json', JSON.stringify(res, null, 2));
