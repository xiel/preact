import { render as preactRender } from 'preact';

/**
 * Proxy render() since React returns a Component reference.
 * @param {import('./internal').VNode} vnode VNode tree to render
 * @param {import('./internal').PreactElement} parent DOM node to render vnode tree into
 * @param {() => void} [callback] Optional callback that will be called after rendering
 * @returns {import('./internal').Component | null} The root component reference or null
 */
export function render(vnode, parent, callback) {
	preactRender(vnode, parent);
	if (typeof callback==='function') callback();

	return vnode ? vnode._component : null;
}
