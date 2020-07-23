import React, { useEffect } from 'react';
import Raphael from 'raphael/raphael';

import { ConnectionPoint, connectionPointTypes, radius } from '../modules/connection_point';
import { Link } from '../modules/link';

function initCanvas(paper) {
	// Initialize the canvas
	let canvasWidth = paper.canvas.clientWidth;
	let canvasHeight = paper.canvas.clientHeight;

	window.policyForm = null;

	// New EPT input and output connection points
	let middle = canvasWidth / 2;
	let input = new ConnectionPoint({x: middle, y: 20}, connectionPointTypes.out, false, true, ['any']);
	input.onLinkChange = () => updateConnectionTypes(input);
	input.render();
	window.inputPoint = input;
	paper.text(middle + radius + 5, 18, 'Input').attr('text-anchor', 'start');

	let output = new ConnectionPoint({x: middle, y: canvasHeight - 20}, connectionPointTypes.in, false, true, ['any']);
	output.onLinkChange = () => updateConnectionTypes(output);
	output.render();
	window.outputPoint = output;
	paper.text(middle + radius + 5, canvasHeight - 20, 'Output').attr('text-anchor', 'start');

	// Wipe out button
	paper.image('./images/refresh.png', 10, 0, 15, 15)
		.attr('cursor', 'hand')
		.click(() => {
			cleanup();
			initNewPolicy(paper);
			clearForm();
			initPolicyForm();
			printEpts();
		});
}

// Handler for connection type change
function updateConnectionTypes(cp) {
	let max = 0;
	let counted = cp.linkedWith.reduce((result, entity) => {
		if (entity instanceof Link) {
			((entity.from === cp ? entity.to : entity.from).types || []).forEach(type => {
				let count = result[type] + 1 || 1;
				result[type] = count;
				if (count > max) max = count;
			});
		}
		return result;
	}, {});
	cp.types = Object.keys(counted).filter(type => type !== 'any' && counted[type] === max);
	if (!cp.types.length) cp.types = ['any'];
	cp.render();
}

export const Canvas = () => {
	useEffect(() => {
  		window.paper = Raphael('graph', '600px', '600px');
  		initCanvas(window.paper);
  		console.log('Raphael is initialized');
	}, [false]);

	return <section id='graph'>
        <h1 id='ept-label'></h1>
    </section>;
}