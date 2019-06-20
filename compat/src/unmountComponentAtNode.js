import { render } from 'preact';

/**
 * Remove a component tree from the DOM, including state and event handlers.
 * @param {import('./internal').PreactElement} container
 * @returns {boolean}
 */
export function unmountComponentAtNode(container) {
	if (container._children) {
		render(null, container);
		return true;
	}
	return false;
}
