import React, {
	render,
	cloneElement,
	unmountComponentAtNode,
	unstable_batchedUpdates
} from '../../src';
import { createElement as preactH } from 'preact';
import { setupScratch, teardown, createEvent } from '../../../test/_util/helpers';

describe('preact-compat', () => {

	/** @type {HTMLDivElement} */
	let scratch;

	beforeEach(() => {
		scratch = setupScratch();
	});

	afterEach(() => {
		teardown(scratch);
	});

	describe('unmountComponentAtNode', () => {
		it('should unmount a root node', () => {
			const App = () => <div>foo</div>;
			render(<App />, scratch);

			expect(unmountComponentAtNode(scratch)).to.equal(true);
			expect(scratch.innerHTML).to.equal('');
		});

		it('should do nothing if root is not mounted', () => {
			expect(unmountComponentAtNode(scratch)).to.equal(false);
			expect(scratch.innerHTML).to.equal('');
		});
	});

	describe('unstable_batchedUpdates', () => {
		it('should call the callback', () => {
			const spy = sinon.spy();
			unstable_batchedUpdates(spy);
			expect(spy).to.be.calledOnce;
		});

		it('should call callback with only one arg', () => {
			const spy = sinon.spy();
			unstable_batchedUpdates(spy, 'foo', 'bar');
			expect(spy).to.be.calledWithExactly('foo');
		});
	});

	it('should patch events', () => {
		let spy = sinon.spy();
		render(<div onClick={spy} />, scratch);
		scratch.firstChild.click();

		expect(spy).to.be.calledOnce;
		expect(spy.args[0][0]).to.haveOwnProperty('persist');
		expect(spy.args[0][0]).to.haveOwnProperty('nativeEvent');
	});

	it('should normalize ondoubleclick event', () => {
		let vnode = <div onDoubleClick={() => null} />;
		expect(vnode.props).to.haveOwnProperty('ondblclick');
	});

	it('should normalize onChange for textarea', () => {
		let vnode = <textarea onChange={() => null} />;
		expect(vnode.props).to.haveOwnProperty('oninput');
		expect(vnode.props).to.not.haveOwnProperty('onchange');

		vnode = <textarea oninput={() => null} onChange={() => null} />;
		expect(vnode.props).to.haveOwnProperty('oninput');
		expect(vnode.props).to.not.haveOwnProperty('onchange');
	});

	it('should normalize class+className even on components', () => {
		function Foo(props) {
			return <div class={props.class} className={props.className}>foo</div>;
		}
		render(<Foo class="foo" />, scratch);
		expect(scratch.firstChild.className).to.equal('foo');
		render(null, scratch);

		render(<Foo className="foo" />, scratch);
		expect(scratch.firstChild.className).to.equal('foo');
	});
});
