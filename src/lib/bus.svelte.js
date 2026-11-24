// Bridge between the DOM UI and things that live inside the 3D canvas.
export const actions = {
	pluck: () => {},
	strum: () => {},
	screenshot: async () => null
};

export const interaction = $state({ dragging: false, hoverString: -1, hoverArm: false });