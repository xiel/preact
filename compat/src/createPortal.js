import { h, hydrate, render } from 'preact';

/**
 * Portal component
 * @param {object | null | undefined} props
 */
function Portal(props) {
	let wrap = h(ContextProvider, { context: this.context }, props.vnode);
	let container = props.container;

	if (props.container !== this.container) {
		hydrate('', container);
		this.container = container;
	}

	render(wrap, container);
	this.componentWillUnmount = () => {
		render(null, container);
	};
	return null;
}

/**
 * Create a `Portal` to continue rendering the vnode tree at a different DOM node
 * @param {import('./internal').VNode} vnode The vnode to render
 * @param {import('./internal').PreactElement} container The DOM node to continue rendering in to.
 */
export function createPortal(vnode, container) {
	return h(Portal, { vnode, container });
}

class ContextProvider {
	getChildContext() {
		return this.props.context;
	}
	render(props) {
		return props.children;
	}
}
