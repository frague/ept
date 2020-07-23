import { storage } from './storage.js';

var instancesCounter = 0;
export const generateId = () => {
	return `ID${++instancesCounter}`;
}

export class Positioned {
	position;
	isRendered;
	linkedWith;

	_getPaper() {
		return window.paper;
	}

	constructor(position) {
		this.id = null;
		this.ownId = this.generateId();
		this.position = position;
		this.isRendered = false;
		this.linkedWith = [];

		let className = this.constructor.name;

		let instances = storage.get(className, []);
		instances.push(this);
		storage.set(className, instances);
	}

	destructor() {
		let className = this.constructor.name;
		let instances = storage.get(className, []);
		let i = instances.indexOf(this);
		if (i >= 0) {
			instances.splice(i, 1);
			storage.set(className, instances);
			// console.log(`${className} id=${this.id} ownId=${this.ownId} has been removed`, storage.get(className));
		}
	}

	generateId() {
		return generateId();
		// return `${this.constructor.name}-${++instancesCounter}`;
		// return `${this.constructor.name}-${Math.round(9999 * Math.random())}`;
	}

	linkWith(entity) {
		let index = this.linkedWith.indexOf(entity);
		if (index < 0) this.linkedWith.push(entity);
	}

	unlink(entity) {
		let index = this.linkedWith.indexOf(entity);
		if (index >= 0) this.linkedWith.splice(index, 1);
	}

	updatePosition(dx, dy) {
		this.position = {x: this.position.x + dx, y: this.position.y + dy};
	}

	render() {
		this.isRendered = true;
		this.linkedWith.forEach(entity => entity.render());
	}
}