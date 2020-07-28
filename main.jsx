import { basic_epts } from './modules/data';
import { Policy, policyHeight, policyWidth, policyTypes, clonePolicy, fromJSON } from './modules/policy';
import { Link } from './modules/link.js';
import { ConnectionPoint, connectionPointTypes, radius } from './modules/connection_point.js';
import { PolicyForm, clearForm } from './modules/policy_form';
import { storage } from './modules/storage.js';
import { CloningForm, addVersion } from './modules/cloning_form.js';
import { generateId } from './modules/base.js';
import { className } from './modules/utils.js';


import React from 'react';
import ReactDOM from 'react-dom';

import { Catalogue } from './components/catalogue/catalogue';
import { Canvas } from './components/canvas/canvas';


function initNewPolicy() {
	window.policy = new Policy(
		{x: 100, y: 100},
		{
			'label': 'New',
			'parameters': {},
			'input_types': ['any'],
			'output_type': 'any'
		},
		policyTypes.new
	);
	document.getElementById('ept-label').innerText = window.policy.data.label;
}



var addingPosition = 0;

// Hides all 
function cleanup(isNew=false) {
	addingPosition = 0;
	positioner = new Positioner();
	Array
		.from(storage.get(Policy.name, []))
		.filter(ept => !ept.isSaved)
		.forEach(ept => {
			ept.onDestruct = () => {};
			ept.destructor();
		});
}

// EPT serialization into json 
// Note, that 'parameters' here will not be regenerated automatically
// upon children parametrization changing
function gatherJSON(editedEpt) {
	let result = {
		nodes: storage.get(Policy.name, [])
			.filter(ept => !ept.isSaved && ept.type !== policyTypes.new && !ept.onlyCreate)
			.map(ept => ept.toJSON()),
		links: storage.get(ConnectionPoint.name, [])
			.filter(point => point.type === connectionPointTypes.out)
			.reduce((result, point) => {
				point.linkedWith
					.filter(connection => connection instanceof Link)
					.map(link => result.push([link.from.belongsTo, link.to.belongsTo]));
				return result;
			}, []),
		parameters: Object.assign({}, editedEpt.data.parameters)	// TODO: Gather own set parameters
	};
	return result;
}

var policyIndex = 0;
function pushPolicy(ept) {
	ept.asJSON = gatherJSON(ept);
	policyIndex++;
}

// function initPolicyForm() {
// 	window.policy.asJSON = gatherJSON(window.policy);
	
// 	if (window.policyForm) delete window.policyForm;
// 	window.policyForm = new PolicyForm(
// 		window.policy,
// 		(data, doSave=false) => {
// 			if (doSave) return save();
// 			window.policy.data = data;
// 			document.getElementById('ept-label').innerText = data.label;
// 			printEpts();
// 		}, 
// 		false
// 	).render();	
// }

// function updatePolicyForm() {
// 	let policyForm = window.policyForm;
// 	if (policyForm) {
// 		window.policy.asJSON = gatherJSON(window.policy);
// 		policyForm.update();
// 	}
// }

function save() {
	let ept = window.policy;
	let [input, output] = [window.inputPoint, window.outputPoint];

	Object.assign(ept.data, {
		'input_types': input.types,
		'output_type': output.types.length && output.types[0] !== 'any' ? output.types[0] : null
	});

	ept.data = clonePolicy(ept.data);
	pushPolicy(ept);

	storage.get(Policy.name, [])
		.filter(ept => !ept.isSaved && ept.type !== policyTypes.reference)
		.forEach(ept => {
			// ept.onDestruct = () => {};
			ept.save();
			ept.hide();
		});

	printEpts();
	view(ept, true);
	updatePolicyForm();
}

var init = () => {
	// Instantiate and render basic policies list from data.js
	(basic_epts || []).forEach(data => {
		let p = new Policy({x: 220, y: 230}, data, policyTypes.basic);
		p.save();
		pushPolicy(p);

		let clone = new Policy({x: 220, y: 230}, data, policyTypes.elementary);
		
		// Simulate relationship creation from elementary to basic
		let nextId = generateId();
		let basicToJson = p.toJSON();
		basicToJson.id = p.ownId;
		basicToJson.ownId = nextId;

		clone.asJSON = {
			nodes: [
				basicToJson
			],
			links: [
				[null, nextId]
			],
			parameters: Object.assign({}, basicToJson.parameters)
		};
		if (data.output_type) {
			// Only create output link if output type is not null
			clone.asJSON.links.push([nextId, null]);
		}
		clone.save();
		policyIndex++;
	});
	// printEpts();
	// initNewPolicy(paper);
	// initPolicyForm();
};

window.onload = () => {
	init();

	ReactDOM.render([
		<Catalogue />,
		<Canvas />
	], document.getElementById('ept'));
}
