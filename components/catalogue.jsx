import React from 'react';
import { storage } from '../modules/storage';
import { className } from '../modules/utils';
import { Policy, policyTypes } from '../modules/policy';
import { addVersion } from '../modules/cloning_form.js';
import { Positioner } from '../modules/positioner.js';

function cleanup() {}

function view(ept, keepPolicyForm=false) {
	cleanup();
	document.getElementById('ept-label').innerText = ept.data.label;
	if (window.policy.type === policyTypes.new) {
		window.policy.destructor();
	}
	window.policy = ept;
	// printEpts();

	let availablePolicies = storage.get(Policy.name, []).reduce((result, ept) => {
		result[ept.ownId] = ept;
		return result;
	}, {});

	// Recreate nodes
	let nodes = (ept.asJSON.nodes || []).reduce((result, data) => {
		let p = fromJSON(data, availablePolicies);
		p.onDestruct = () => updatePolicyForm();
		p.render();
		result[p.ownId] = p;
		return result;
	}, {});

	// Recreate links between them
	(ept.asJSON.links || []).forEach(([from, to]) => {
		try {
			new Link(
				from ? nodes[from].output : window.inputPoint,
				to ? nodes[to].input : window.outputPoint,
			).render();
		} catch (e) {
			console.log(e);
		}
	});
	if (!keepPolicyForm) initPolicyForm();
};

function clone(ept) {
	if (ept.type === policyTypes.elementary || !ept.asJSON.nodes.length) {
		// Just a single EPT (no children) cloning - no confirmation needed
		let cloned = ept.clone(null, true);
		cloned.id = null;
		cloned.isCloned = true;
		cloned.onlyCreate = true;
		cloned.data.label = addVersion(cloned.data.label);

		let reference = cloned.clone(policyTypes.reference);
		reference.onDestruct = () => updatePolicyForm();
		randomizePosition(reference);
		// updatePolicyForm();	
	} else {
		let cloningForm = new CloningForm(ept, ept => {
			if (ept) {
				let reference = randomizePosition(ept);
				reference.onDestruct = () => updatePolicyForm();
			}
			updatePolicyForm();
		});
		cloningForm.render();
	}
};

function reference() {

}

function randomizePosition(ept) {
	var positioner = new Positioner();
	return positioner.position(ept);
}

// Creates action links for the EPT (view, reference, clone)
function createEptLink(title, ept, handler, isEnabled) {
	return <li 
		className={ className({disabled: !isEnabled}) }
		onClick={ isEnabled ? () => handler(ept) : null }
	>{ title }</li>;
}

// Print list of EPTs stored in catalog
function printEpts() {
	let activeOwnId = (window.policy && window.policy.ownId) || null;
	let epts = storage.get(Policy.name, []);

	return epts
		.filter(p => ![policyTypes.new, policyTypes.basic, policyTypes.reference].includes(p.type))
		.map((p, index) => {
			let id = p.id;
			if (p.type === policyTypes.basic) return null;

			let isActive = activeOwnId === p.ownId;

			return <li key={ index } className={ className({
				[p.type]: true,
				'error': p.hasErrors,
				'clone': p.isCloned,
				'active': isActive
			}) }>
				{ p.data.label }
				<ul>
					{ createEptLink('Clone', p, clone, !isActive) }
					{ createEptLink('Reference', p, reference, !isActive) }
					{ createEptLink('View', p, view, !isActive) }
				</ul>
			</li>;
		});
}


export const Catalogue = () => {
	return <section id="epts">
        <h1>Catalog</h1>
        <ul id="ept-list">{ printEpts() }</ul>
	</section>;
};