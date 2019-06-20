import React, { isValidElement } from '../../src';
import { h as preactH } from 'preact';

describe('isValidElement', () => {
	it('should check return false for invalid arguments', () => {
		expect(isValidElement(null)).to.equal(false);
		expect(isValidElement(false)).to.equal(false);
		expect(isValidElement(true)).to.equal(false);
		expect(isValidElement('foo')).to.equal(false);
		expect(isValidElement(123)).to.equal(false);
	});

	it('should detect a preact vnode', () => {
		expect(isValidElement(preactH('div'))).to.equal(true);
	});

	it('should detect a compat vnode', () => {
		expect(isValidElement(React.createElement('div'))).to.equal(true);
	});
});
