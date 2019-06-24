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

	describe('createElement()', () => {
		it('should normalize vnodes', () => {
			let vnode = <div a="b"><a>t</a></div>;
			let $$typeof = 0xeac7;
			try {
				// eslint-disable-next-line
				if (Function.prototype.toString.call(eval('Sym'+'bol.for')).match(/\[native code\]/)) {
					// eslint-disable-next-line
					$$typeof = eval('Sym'+'bol.for("react.element")');
				}
			}
			catch (e) {}
			expect(vnode).to.have.property('$$typeof', $$typeof);
			expect(vnode).to.have.property('type', 'div');
			expect(vnode).to.have.property('props').that.is.an('object');
			expect(vnode.props).to.have.property('children');
			expect(vnode.props.children).to.have.property('$$typeof', $$typeof);
			expect(vnode.props.children).to.have.property('type', 'a');
			expect(vnode.props.children).to.have.property('props').that.is.an('object');
			expect(vnode.props.children.props).to.eql({ children: 't' });
		});

		it('should normalize onChange', () => {
			let props = { onChange(){} };

			function expectToBeNormalized(vnode, desc) {
				expect(vnode, desc)
					.to.have.property('props')
					.with.all.keys(['oninput'].concat(vnode.props.type ? 'type' : []))
					.and.property('oninput').that.is.a('function');
			}

			function expectToBeUnmodified(vnode, desc) {
				expect(vnode, desc).to.have.property('props').eql({
					...props,
					...(vnode.props.type ? { type: vnode.props.type } : {})
				});
			}

			expectToBeUnmodified(<div {...props} />, '<div>');
			expectToBeUnmodified(<input {...props} type="radio" />, '<input type="radio">');
			expectToBeUnmodified(<input {...props} type="checkbox" />, '<input type="checkbox">');
			expectToBeUnmodified(<input {...props} type="file" />, '<input type="file">');

			expectToBeNormalized(<textarea {...props} />, '<textarea>');
			expectToBeNormalized(<input {...props} />, '<input>');
			expectToBeNormalized(<input {...props} type="text" />, '<input type="text">');

		});

		it('should normalize beforeinput event listener', () => {
			let spy = sinon.spy();
			render(<input onBeforeInput={spy} />, scratch);
			scratch.firstChild.dispatchEvent(createEvent('beforeinput'));
			expect(spy).to.be.calledOnce;
		});
	});

	describe('cloneElement', () => {
		it('should clone elements', () => {
			let element = <foo a="b" c="d">a<span>b</span></foo>;
			expect(cloneElement(element)).to.eql(element);
		});

		it('should support props.children', () => {
			let element = <foo children={<span>b</span>} />;
			let clone = cloneElement(element);
			expect(clone).to.eql(element);
			expect(cloneElement(clone).props.children).to.eql(element.props.children);
		});

		it('children take precedence over props.children', () => {
			let element = <foo children={<span>c</span>}><div>b</div></foo>;
			let clone = cloneElement(element);
			expect(clone).to.eql(element);
			expect(clone.props.children.type).to.eql('div');
		});

		it('should support children in prop argument', () => {
			let element = <foo />;
			let children = [<span>b</span>];
			let clone = cloneElement(element, { children });
			expect(clone.props.children).to.eql(children);
		});

		it('children argument takes precedence over props.children', () => {
			let element = <foo />;
			let childrenA = [<span>b</span>];
			let childrenB = [<div>c</div>];
			let clone = cloneElement(element, { children: childrenA }, ...childrenB);
			expect(clone.props.children).to.eql(childrenB);
		});

		it('children argument takes precedence over props.children even if falsey', () => {
			let element = <foo />;
			let childrenA = [<span>b</span>];
			let clone = cloneElement(element, { children: childrenA }, undefined);
			expect(clone.children).to.eql(undefined);
		});

		it('should skip cloning on invalid element', () => {
			let element = { foo: 42 };
			let clone = cloneElement(element);
			expect(clone).to.eql(element);
		});

		it('should work with jsx constructor from core', () => {
			function Foo(props) {
				return <div>{props.value}</div>;
			}

			let clone = cloneElement(preactH(Foo), { value: 'foo' });
			render(clone, scratch);
			expect(scratch.textContent).to.equal('foo');
		});
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
