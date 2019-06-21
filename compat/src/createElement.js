import { createElement, toChildArray, cloneElement as preactCloneElement, options } from 'preact';

/* istanbul ignore next */
const REACT_ELEMENT_TYPE = (typeof Symbol!=='undefined' && Symbol.for && Symbol.for('react.element')) || 0xeac7;

const CAMEL_PROPS = /^(?:accent|alignment|arabic|baseline|cap|clip|color|fill|flood|font|glyph|horiz|marker|overline|paint|stop|strikethrough|stroke|text|underline|unicode|units|v|vector|vert|word|writing|x)[A-Z]/;

/**
 * Legacy version of createElement.
 * @param {import('./internal').VNode["type"]} type The node name or Component constructor
 */
export function createFactory(type) {
	return createElement.bind(null, type);
}

export { createElement } from 'preact';

/**
 * Wrap `cloneElement` to abort if the passed element is not a valid element and apply
 * all vnode normalizations.
 * @param {import('./internal').VNode} element The vnode to clone
 * @param {object} props Props to add when cloning
 * @param {Array<import('./internal').ComponentChildren>} rest Optional component children
 */
export function cloneElement(element) {
	if (!isValidElement(element)) return element;
	return preactCloneElement.apply(null, arguments);
}

/**
 * Check if the passed element is a valid (p)react node.
 * @param {*} element The element to check
 * @returns {boolean}
 */
export function isValidElement(element) {
	return !!element && element.$$typeof===REACT_ELEMENT_TYPE;
}


const classNameDescriptor = {
	configurable: true,
	get() { return this.class; }
};

export function installVNodeCompat() {
	let oldVNodeHook = options.vnode;
	options.vnode = vnode => {
		vnode.$$typeof = REACT_ELEMENT_TYPE;

		let type = vnode.type, props = vnode.props;
		if (typeof type!='function') {
			// Apply defaultValue to value
			if (props.defaultValue) {
				if (!props.value && props.value!==0) {
					props.value = props.defaultValue;
				}
				delete props.defaultValue;
			}

			// Add support for select.value array
			if (Array.isArray(props.value) && props.multiple && type==='select') {
				toChildArray(props.children).forEach((child) => {
					if (props.value.indexOf(child.props.value)!=-1) {
						child.props.selected = true;
					}
				});
				delete props.value;
			}

			// Normalize DOM vnode properties.
			let shouldSanitize, attrs, i;
			for (i in props) if ((shouldSanitize = CAMEL_PROPS.test(i))) break;
			if (shouldSanitize) {
				attrs = vnode.props = {};
				for (i in props) {
					attrs[CAMEL_PROPS.test(i) ? i.replace(/([A-Z0-9])/, '-$1').toLowerCase() : i] = props[i];
				}
			}
		}

		// Alias `class` prop to `className` if available
		if (props.class || props.className) {
			classNameDescriptor.enumerable = 'className' in props;
			if (props.className) props.class = props.className;
			Object.defineProperty(props, 'className', classNameDescriptor);
		}

		/* istanbul ignore next */
		if (oldVNodeHook) oldVNodeHook(vnode);
	};
}
