import React, { render, createFactory } from '../../src';
import { setupScratch, teardown } from '../../../test/_util/helpers';

describe('compat createFactory', () => {

	/** @type {HTMLDivElement} */
	let scratch;

	beforeEach(() => {
		scratch = setupScratch();
	});

	afterEach(() => {
		teardown(scratch);
	});

	it('should create a DOM element', () => {
		render(createFactory('span')(), scratch);
		expect(scratch.firstChild.nodeName).to.equal('SPAN');
	});

	it('should create a component', () => {
		const Foo = () => <div>foo</div>;
		render(createFactory(Foo)(), scratch);
		expect(scratch.textContent).to.equal('foo');
	});
});
