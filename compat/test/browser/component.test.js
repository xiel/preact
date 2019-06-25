import { setupScratch, teardown } from '../../../test/_util/helpers';
import React from '../../src';

describe('components', () => {

	/** @type {HTMLDivElement} */
	let scratch;

	beforeEach(() => {
		scratch = setupScratch();
	});

	afterEach(() => {
		teardown(scratch);
	});

	it('should have "isReactComponent" property', () => {
		let Comp = new React.Component();
		expect(Comp.isReactComponent).to.deep.equal({});
	});

	it('should be sane', () => {
		let props;

		class Demo extends React.Component {
			render() {
				props = this.props;
				return <div id="demo">{this.props.children}</div>;
			}
		}

		React.render(
			<Demo a="b" c="d">inner</Demo>,
			scratch
		);

		expect(props).to.exist.and.deep.equal({
			a: 'b',
			c: 'd',
			children: 'inner'
		});

		expect(scratch.innerHTML).to.equal('<div id="demo">inner</div>');
	});

	it('should single out children before componentWillReceiveProps', () => {
		let props;

		class Child extends React.Component {
			componentWillReceiveProps(newProps) {
				props = newProps;
			}
			render() {
				return this.props.children;
			}
		}

		class Parent extends React.Component {
			render() {
				return <Child>second</Child>;
			}
		}

		let a = React.render(<Parent />, scratch);
		a.forceUpdate();

		expect(props).to.exist.and.deep.equal({
			children: 'second'
		});
	});

	describe('UNSAFE_* lifecycle methods', () => {
		it('should support UNSAFE_componentWillMount', () => {
			let spy = sinon.spy();

			class Foo extends React.Component {
				// eslint-disable-next-line camelcase
				UNSAFE_componentWillMount() {
					spy();
				}

				render() {
					return <h1>foo</h1>;
				}
			}

			React.render(<Foo />, scratch);

			expect(spy).to.be.calledOnce;
		});

		it('should support UNSAFE_componentWillReceiveProps', () => {
			let spy = sinon.spy();

			class Foo extends React.Component {
				// eslint-disable-next-line camelcase
				UNSAFE_componentWillReceiveProps() {
					spy();
				}

				render() {
					return <h1>foo</h1>;
				}
			}

			React.render(<Foo />, scratch);
			// Trigger an update
			React.render(<Foo />, scratch);
			expect(spy).to.be.calledOnce;
		});

		it('should support UNSAFE_componentWillUpdate', () => {
			let spy = sinon.spy();

			class Foo extends React.Component {
				// eslint-disable-next-line camelcase
				UNSAFE_componentWillUpdate() {
					spy();
				}

				render() {
					return <h1>foo</h1>;
				}
			}

			React.render(<Foo />, scratch);
			// Trigger an update
			React.render(<Foo />, scratch);
			expect(spy).to.be.calledOnce;
		});

		it('should alias UNSAFE_* method to non-prefixed variant', () => {
			let inst;
			class Foo extends React.Component {
				// eslint-disable-next-line camelcase
				UNSAFE_componentWillMount() {}
				// eslint-disable-next-line camelcase
				UNSAFE_componentWillReceiveProps() {}
				// eslint-disable-next-line camelcase
				UNSAFE_componentWillUpdate() {}
				render() {
					inst = this;
					return <div>foo</div>;
				}
			}

			React.render(<Foo />, scratch);

			expect(inst.UNSAFE_componentWillMount).to.equal(inst.componentWillMount);
			expect(inst.UNSAFE_componentWillReceiveProps).to.equal(inst.UNSAFE_componentWillReceiveProps);
			expect(inst.UNSAFE_componentWillUpdate).to.equal(inst.UNSAFE_componentWillUpdate);
		});
	});
});
