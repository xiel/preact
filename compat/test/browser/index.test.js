import React, {
	render,
	unmountComponentAtNode,
	unstable_batchedUpdates
} from '../../src';
import { setupScratch, teardown } from '../../../test/_util/helpers';

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
});
