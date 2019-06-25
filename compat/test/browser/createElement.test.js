import React, { render, createFactory, isValidElement, cloneElement } from '../../src';
import { h as preactH } from 'preact';
import { setupScratch, teardown } from '../../../test/_util/helpers';

describe('compat', () => {

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

	describe('createFactory', () => {
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
});
