import React, { render } from '../../src'; // eslint-disable-line
import { setupScratch, teardown, createEvent } from '../../../test/_util/helpers';

describe('imported compat in preact', () => {

	let scratch;

	beforeEach(() => {
		scratch = setupScratch();
	});

	afterEach(() => {
		teardown(scratch);
	});

	it('should patch events', () => {
		let spy = sinon.spy();
		render(<div onClick={spy} />, scratch);
		scratch.firstChild.click();

		expect(spy).to.be.calledOnce;
		expect(spy.args[0][0]).to.haveOwnProperty('persist');
		expect(typeof spy.args[0][0].persist).to.equal('function');
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
