import { options } from 'preact';

export function installEventNormalization() {
	const oldEventHook = options.event;
	const oldVNodeHook = options.vnode;

	options.event = e => {
		/* istanbul ignore next */
		if (oldEventHook) e = oldEventHook(e);
		e.persist = () => {};
		return e.nativeEvent = e;
	};

	/**
	 * Normalize event handlers like react does. Most famously it uses `onChange` for any input element.
	 * @param {import('./internal').VNode} vnode The vnode to normalize events on
	 */
	options.vnode = vnode => {
		/* istanbul ignore next */
		if (oldVNodeHook) oldVNodeHook(vnode);

		const { type, props } = vnode;

		if (!props || typeof type!='string') return;

		let newProps = {};
		for (let i in props) {
			newProps[i.toLowerCase()] = i;
		}
		if (newProps.ondoubleclick) {
			props.ondblclick = props[newProps.ondoubleclick];
			delete props[newProps.ondoubleclick];
		}
		if (newProps.onbeforeinput) {
			props.onbeforeinput = props[newProps.onbeforeinput];
			delete props[newProps.onbeforeinput];
		}
		// for *textual inputs* (incl textarea), normalize `onChange` -> `onInput`:
		if (newProps.onchange && (type==='textarea' || (type.toLowerCase()==='input' && !/^fil|che|rad/i.test(props.type)))) {
			let normalized = newProps.oninput || 'oninput';
			if (!props[normalized]) {
				props[normalized] = props[newProps.onchange];
				delete props[newProps.onchange];
			}
		}
	};
}
