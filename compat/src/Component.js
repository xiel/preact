import { Component } from 'preact';

export function installComponentCompat() {
	// Some libraries like `react-virtualized` explicitely check for this.
	Component.prototype.isReactComponent = {};

	// Patch in `UNSAFE_*` lifecycle hooks
	function setUnsafeDescriptor(obj, key) {
		Object.defineProperty(obj.prototype, 'UNSAFE_' + key, {
			configurable: true,
			get() { return this[key]; },
			set(v) { this[key] = v; }
		});
	}

	setUnsafeDescriptor(Component, 'componentWillMount');
	setUnsafeDescriptor(Component, 'componentWillReceiveProps');
	setUnsafeDescriptor(Component, 'componentWillUpdate');
}
