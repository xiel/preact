import { h } from 'preact';
import { assign } from '../../src/util';

/**
 * Check if two objects have a different shape
 * @param {object} a
 * @param {object} b
 * @returns {boolean}
 */
export function shallowDiffers(a, b) {
	for (let i in a) if (!(i in b)) return true;
	for (let i in b) if (a[i]!==b[i]) return true;
	return false;
}

/**
 * Memoize a component, so that it only updates when the props actually have
 * changed. This was previously known as `React.pure`.
 * @param {import('./internal').FunctionalComponent} c functional component
 * @param {(prev: object, next: object) => boolean} [comparer] Custom equality function
 * @returns {import('./internal').FunctionalComponent}
 */
export function memo(c, comparer) {
	function shouldUpdate(nextProps) {
		let ref = this.props.ref;
		let updateRef = ref==nextProps.ref;
		if (!updateRef) {
			ref.call ? ref(null) : (ref.current = null);
		}
		return (!comparer
			? shallowDiffers(this.props, nextProps)
			: !comparer(this.props, nextProps)) || !updateRef;
	}

	/**
	 * @param {any} props
	 * @returns {import('./internal').VNode}
	 */
	function Memoed(props) {
		this.shouldComponentUpdate = shouldUpdate;
		return h(c, assign({}, props));
	}
	Memoed.displayName = 'Memo(' + (c.displayName || c.name) + ')';
	Memoed._forwarded = /** @type {true} */(true);
	return Memoed;
}
