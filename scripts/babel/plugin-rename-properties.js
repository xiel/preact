const { declare } = require('@babel/helper-plugin-utils');
const { types: t } = require('@babel/core');

const builder = declare((api, options) => {
	api.assertVersion(7);

	function shouldRename(name) {
		return Object.prototype.hasOwnProperty.call(options.transform, name);
	}

	return {
		name: 'rename-properties',

		visitor: {
			MemberExpression: {
				/**
				 * @typedef {import('@babel/core').types.MemberExpression} MemberExpression
				 * @param {import('@babel/core').NodePath<MemberExpression>} path
				 */
				exit({ node }) {
					if (!options || !options.transform) {
						return;
					}

					const prop = node.property;

					/** @type {string} */
					let propName;
					if (t.isIdentifier(prop)) {
						propName = prop.name;
					} else if (t.isStringLiteral(prop)) {
						propName = prop.value;
					} else {
						return;
					}

					if (shouldRename(propName)) {
						if (node.computed && t.isStringLiteral(prop)) {
							node.property = t.stringLiteral(options.transform[propName]);
						} else if (t.isIdentifier(prop)) {
							const newIdentifier = t.cloneNode(prop);
							newIdentifier.name = options.transform[propName];
							node.property = newIdentifier;
						} else {
							return;
						}
					}
				}
			}
		}
	};
});

module.exports = builder;
