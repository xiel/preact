import React, { render } from '../../src';
import { setupScratch, teardown } from '../../../test/_util/helpers';

let ce = type => document.createElement(type);
let text = text => document.createTextNode(text);

/** @jsx React.createElement */

describe('compat', () => {
	describe('render', () => {

		/** @type {HTMLDivElement} */
		let scratch;

		beforeEach(() => {
			scratch = setupScratch();
		});

		afterEach(() => {
			teardown(scratch);
		});

		it('should replace isomorphic content', () => {
			let root = ce('div');
			let initialChild = ce('div');
			initialChild.appendChild(text('initial content'));
			root.appendChild(initialChild);

			render(<div>dynamic content</div>, root);
			expect(root)
				.to.have.property('textContent')
				.that.is.a('string')
				.that.equals('dynamic content');
		});

		it('should remove extra elements', () => {
			let root = ce('div');
			let inner = ce('div');

			root.appendChild(inner);

			let c1 = ce('div');
			c1.appendChild(text('isomorphic content'));
			inner.appendChild(c1);

			let c2 = ce('div');
			c2.appendChild(text('extra content'));
			inner.appendChild(c2);

			render(<div>dynamic content</div>, root);
			expect(root)
				.to.have.property('textContent')
				.that.is.a('string')
				.that.equals('dynamic content');
		});

		// Note: Replacing text nodes inside the root itself is currently unsupported.
		// We do replace them everywhere else, though.
		it('should remove text nodes', () => {
			let root = ce('div');

			let div = ce('div');
			root.appendChild(div);
			div.appendChild(text('Text Content'));
			div.appendChild(text('More Text Content'));

			render(<div>dynamic content</div>, root);
			expect(root)
				.to.have.property('textContent')
				.that.is.a('string')
				.that.equals('dynamic content');
		});

		it('should support defaultValue', () => {
			render(<input defaultValue="foo" />, scratch);
			expect(scratch.firstElementChild).to.have.property('value', 'foo');
		});

		it('should ignore defaultValue when value is 0', () => {
			render(<input defaultValue={2} value={0} />, scratch);
			expect(scratch.firstElementChild.value).to.equal('0');
		});

		it('should call the callback', () => {
			let spy = sinon.spy();
			render(<div />, scratch, spy);
			expect(spy).to.be.calledOnce;
			expect(spy).to.be.calledWithExactly();
		});
	});
});
