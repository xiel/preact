import { options } from 'preact';

export function enableForwardRef() {
	let oldVNodeHook = options.vnode;
	options.vnode = vnode => {
		let type = vnode.type;
		if (type && type._forwarded && vnode.ref) {
			vnode.props.ref = vnode.ref;
			vnode.ref = null;
		}
		/* istanbul ignore next */
		if (oldVNodeHook) oldVNodeHook(vnode);
	};
}


/**
 * Pass ref down to a child. This is mainly used in libraries with HOCs that
 * wrap components. Using `forwardRef` there is an easy way to get a reference
 * of the wrapped component instead of one of the wrapper itself.
 * @param {import('./internal').ForwardFn} fn
 * @returns {import('./internal').FunctionalComponent}
 */
export function forwardRef(fn) {
	function Forwarded(props) {
		let ref = props.ref;
		delete props.ref;
		return fn(props, ref);
	}
	Forwarded._forwarded = /** @type {true} */(true);
	Forwarded.displayName = 'ForwardRef(' + (fn.displayName || fn.name) + ')';
	return Forwarded;
}
