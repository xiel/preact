import React from '../../src';
import { setupScratch, teardown } from '../../../test/_util/helpers';
import { setupRerender } from 'preact/test-utils';

describe('PureComponent', () => {

	/** @type {HTMLDivElement} */
	let scratch;

	/** @type {() => void} */
	let rerender;

	beforeEach(() => {
		scratch = setupScratch();
		rerender = setupRerender();
	});

	afterEach(() => {
		teardown(scratch);
	});

	it('should have "isPureReactComponent" property', () => {
		let Pure = new React.PureComponent();
		expect(Pure.isReactComponent).to.deep.equal({});
		expect(Pure.isPureReactComponent).to.be.true;
	});

	it('should be a class', () => {
		expect(React).to.have.property('PureComponent').that.is.a('function');
	});

	it('should pass props in constructor', () => {
		let spy = sinon.spy();
		class Foo extends React.PureComponent {
			constructor(props) {
				super(props);
				spy(this.props, props);
			}
		}

		React.render(<Foo foo="bar" />, scratch);

		let expected = { foo: 'bar' };
		expect(spy).to.be.calledWithMatch(expected, expected);
	});

	it('should only re-render when props or state change', () => {
		class C extends React.PureComponent {
			render() {
				return <div />;
			}
		}
		let spy = sinon.spy(C.prototype, 'render');

		let inst = React.render(<C />, scratch);
		expect(spy).to.have.been.calledOnce;
		spy.resetHistory();

		inst = React.render(<C />, scratch);
		expect(spy).not.to.have.been.called;

		let b = { foo: 'bar' };
		inst = React.render(<C a="a" b={b} />, scratch);
		expect(spy).to.have.been.calledOnce;
		spy.resetHistory();

		inst = React.render(<C a="a" b={b} />, scratch);
		expect(spy).not.to.have.been.called;

		inst.setState({ });
		rerender();
		expect(spy).not.to.have.been.called;

		inst.setState({ a: 'a', b });
		rerender();
		expect(spy).to.have.been.calledOnce;
		spy.resetHistory();

		inst.setState({ a: 'a', b });
		rerender();
		expect(spy).not.to.have.been.called;
	});

	it('should update when props are removed', () => {
		let spy = sinon.spy();
		class App extends React.PureComponent {
			render() {
				spy();
				return <div>foo</div>;
			}
		}

		React.render(<App a="foo" />, scratch);
		React.render(<App />, scratch);
		expect(spy).to.be.calledTwice;
	});
});
