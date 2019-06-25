import { createRef, Component, createContext, Fragment } from 'preact';
import * as hooks from 'preact/hooks';
import { Suspense, lazy, installSuspense } from './suspense';
import { assign } from '../../src/util';

import { createPortal } from './createPortal';
import { render } from './render';
import { unmountComponentAtNode } from './unmountComponentAtNode';
import { Children } from './children';
import { forwardRef, installForwardRef } from './forwardRef';
import { memo } from './memo';
import { PureComponent } from './PureComponent';
import { findDOMNode } from './findDOMNode';
import { installComponentCompat } from './Component';
import { installEventNormalization } from './events';
import { cloneElement, createElement, createFactory, installVNodeCompat, isValidElement } from './createElement';

const version = '16.8.0'; // trick libraries to think we are react

/**
 * Deprecated way to control batched rendering inside the reconciler, but we
 * already schedule in batches inside our rendering code
 * @param {(arg: any) => void} callback function that triggers the updatd
 * @param {*} [arg] Optional argument that can be passed to the callback
 */
// eslint-disable-next-line camelcase
const unstable_batchedUpdates = (callback, arg) => callback(arg);

installVNodeCompat();
installComponentCompat();
installEventNormalization();
installForwardRef();
installSuspense();

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
	unstable_batchedUpdates,
	Suspense,
	lazy
};

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
	unstable_batchedUpdates,
	Suspense,
	lazy
}, hooks);
