import { cloneElement as preactCloneElement, createRef, h, Component, options, toChildArray, createContext, Fragment } from 'preact';
import * as hooks from 'preact/hooks';
import { Suspense as _Suspense, lazy as _lazy, enableSuspense } from './suspense';
import { assign } from '../../src/util';

import { createPortal } from './createPortal';
import { render } from './render';
import { unmountComponentAtNode } from './unmountComponentAtNode';
import { Children } from './children';
import { forwardRef, enableForwardRef } from './forwardRef';
import { memo } from './memo';
import { PureComponent } from './PureComponent';
import { findDOMNode } from './findDOMNode';
import { patchComponent } from './Component';
import { applyEventNormalization } from './events';

const version = '16.8.0'; // trick libraries to think we are react

/* istanbul ignore next */
const REACT_ELEMENT_TYPE = (typeof Symbol!=='undefined' && Symbol.for && Symbol.for('react.element')) || 0xeac7;

const CAMEL_PROPS = /^(?:accent|alignment|arabic|baseline|cap|clip|color|fill|flood|font|glyph|horiz|marker|overline|paint|stop|strikethrough|stroke|text|underline|unicode|units|v|vector|vert|word|writing|x)[A-Z]/;

/**
 * Legacy version of createElement.
 * @param {import('./internal').VNode["type"]} type The node name or Component constructor
 */
function createFactory(type) {
	return createElement.bind(null, type);
}

/**
 * Normalize DOM vnode properties.
 * @param {import('./internal').VNode} vnode The vnode to normalize props of
 * @param {object | null | undefined} props props to normalize
 */
function handleElementVNode(vnode, props) {
	let shouldSanitize, attrs, i;
	for (i in props) if ((shouldSanitize = CAMEL_PROPS.test(i))) break;
	if (shouldSanitize) {
		attrs = vnode.props = {};
		for (i in props) {
			attrs[CAMEL_PROPS.test(i) ? i.replace(/([A-Z0-9])/, '-$1').toLowerCase() : i] = props[i];
		}
	}
}

/**
 * Wrap `createElement` to apply various vnode normalizations.
 * @param {import('./internal').VNode["type"]} type The node name or Component constructor
 * @param {object | null | undefined} [props] The vnode's properties
 * @param {Array<import('./internal').ComponentChildren>} [children] The vnode's children
 * @returns {import('./internal').VNode}
 */
function createElement(...args) {
	let vnode = h(...args);

	let type = vnode.type, props = vnode.props;
	if (typeof type!='function') {
		if (props.defaultValue) {
			if (!props.value && props.value!==0) {
				props.value = props.defaultValue;
			}
			delete props.defaultValue;
		}

		if (Array.isArray(props.value) && props.multiple && type==='select') {
			toChildArray(props.children).forEach((child) => {
				if (props.value.indexOf(child.props.value)!=-1) {
					child.props.selected = true;
				}
			});
			delete props.value;
		}
		handleElementVNode(vnode, props);
	}

	vnode.preactCompatNormalized = false;
	return normalizeVNode(vnode);
}

/**
 * Normalize a vnode
 * @param {import('./internal').VNode} vnode
 */
function normalizeVNode(vnode) {
	vnode.preactCompatNormalized = true;
	applyClassName(vnode);
	return vnode;
}

/**
 * Wrap `cloneElement` to abort if the passed element is not a valid element and apply
 * all vnode normalizations.
 * @param {import('./internal').VNode} element The vnode to clone
 * @param {object} props Props to add when cloning
 * @param {Array<import('./internal').ComponentChildren} rest Optional component children
 */
function cloneElement(element) {
	if (!isValidElement(element)) return element;
	let vnode = normalizeVNode(preactCloneElement.apply(null, arguments));
	vnode.$$typeof = REACT_ELEMENT_TYPE;
	return vnode;
}

/**
 * Check if the passed element is a valid (p)react node.
 * @param {*} element The element to check
 * @returns {boolean}
 */
function isValidElement(element) {
	return !!element && element.$$typeof===REACT_ELEMENT_TYPE;
}

/**
 * Alias `class` prop to `className` if available
 * @param {import('./internal').VNode} vnode
 */
function applyClassName(vnode) {
	let a = vnode.props;
	if (a.class || a.className) {
		classNameDescriptor.enumerable = 'className' in a;
		if (a.className) a.class = a.className;
		Object.defineProperty(a, 'className', classNameDescriptor);
	}
}

let classNameDescriptor = {
	configurable: true,
	get() { return this.class; }
};

let oldVNodeHook = options.vnode;
options.vnode = vnode => {
	vnode.$$typeof = REACT_ELEMENT_TYPE;


	/* istanbul ignore next */
	if (oldVNodeHook) oldVNodeHook(vnode);
};

/**
 * Deprecated way to control batched rendering inside the reconciler, but we
 * already schedule in batches inside our rendering code
 * @param {(arg: any) => void} callback function that triggers the updatd
 * @param {*} [arg] Optional argument that can be passed to the callback
 */
// eslint-disable-next-line camelcase
const unstable_batchedUpdates = (callback, arg) => callback(arg);

enableForwardRef();
applyEventNormalization();
patchComponent(Component);
enableSuspense();

export * from 'preact/hooks';
export {
	version,
	Children,
	render,
	render as hydrate,
	unmountComponentAtNode,
	createPortal,
	createElement,
	createContext,
	createFactory,
	cloneElement,
	createRef,
	Fragment,
	isValidElement,
	findDOMNode,
	Component,
	PureComponent,
	memo,
	forwardRef,
	// eslint-disable-next-line camelcase
	unstable_batchedUpdates
};

export const Suspense = _Suspense;
export const lazy = _lazy;

// React copies the named exports to the default one.
export default assign({
	version,
	Children,
	render,
	hydrate: render,
	unmountComponentAtNode,
	createPortal,
	createElement,
	createContext,
	createFactory,
	cloneElement,
	createRef,
	Fragment,
	isValidElement,
	findDOMNode,
	Component,
	PureComponent,
	memo,
	forwardRef,
	unstable_batchedUpdates
}, hooks);
