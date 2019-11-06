const { expect } = require('chai');
const babel = require('@babel/core');
const renamePropsPlugin = require('./plugin-rename-properties');

/**
 * @param {string} src
 */
function transform(src, config) {
	const out = babel.transformSync(src, {
		root: __dirname,
		plugins: [[renamePropsPlugin, config]]
	});

	return out.code;
}

function cleanup(str) {
	return str.trim().replace(/\t/g, '');
}

describe('plugin-rename-properties', () => {
	it('does nothing if given an empty config', () => {
		const src = cleanup(`
			o.prop1 = 0;
			o["prop2"] = 0;
			console.log(o.prop1);
			console.log(o["prop2"]);
		`);

		expect(transform(src, {})).to.equal(src);
	});

	it('does nothing if no transforms are specified', () => {
		const src = cleanup(`
			o.prop1 = 0;
			o["prop2"] = 0;
			console.log(o.prop1);
			console.log(o["prop2"]);
		`);

		expect(transform(src, { transform: {} })).to.equal(src);
	});

	it('renames properties when read from', () => {
		const config = {
			transform: {
				_prop1: '__p1',
				_prop2: '__p2'
			}
		};

		const input = cleanup(`
			console.log(o._prop1);
			console.log(o["_prop2"]);
		`);

		const output = cleanup(`
			console.log(o.__p1);
			console.log(o["__p2"]);
		`);

		expect(transform(input, config)).to.equal(output);
	});

	it('renames properties when assigned to', () => {
		const config = {
			transform: {
				_prop1: '__p1',
				_prop2: '__p2'
			}
		};

		const input = cleanup(`
			o._prop1 = 1;
			o["_prop2"] = 2;
		`);

		const output = cleanup(`
			o.__p1 = 1;
			o["__p2"] = 2;
		`);

		expect(transform(input, config)).to.equal(output);
	});

	it('only replaces configured properties', () => {
		const config = {
			transform: {
				_prop1: '__p1',
				_prop2: '__p2'
			}
		};

		const input = cleanup(`
			o._prop1 = 1;
			o._propA = 'a';
			o["_prop2"] = 2;
			o["_propB"] = 'b';
			console.log(o._prop1);
			console.log(o._propA);
			console.log(o["_prop2"]);
			console.log(o["_propB"]);
		`);

		const output = cleanup(`
			o.__p1 = 1;
			o._propA = 'a';
			o["__p2"] = 2;
			o["_propB"] = 'b';
			console.log(o.__p1);
			console.log(o._propA);
			console.log(o["__p2"]);
			console.log(o["_propB"]);
		`);

		expect(transform(input, config)).to.equal(output);
	});

	it('should pass through numeric and dynamic properties', () => {
		const config = {
			transform: {
				_prop1: '__p1',
				_prop2: '__p2'
			}
		};

		const src = cleanup(`
			o[f()];
			o[0];
			o[a || b];
			o[1 << 1];
		`);

		expect(transform(src, config)).to.equal(src);
	});
});
