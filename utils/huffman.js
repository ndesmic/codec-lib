export function buildHuffmanTable(elements, lengthCounts){
	const table = {}
	let index = "0";
	let elementIndex = 0;
	for(const count of lengthCounts){
		for(let i = 0; i < count; i++){
			table[index] = elements[elementIndex++];
			index = (parseInt(index, 2) + 1).toString(2).padStart(index.length, 0);
		}
		index = index + "0";
	}
	return table;
}

// export function buildTree(elements, lengthCounts) {
// 	const root = [];
// 	let currentNode = root;
// 	let levelRoot = root;
// 	let elementIndex = 0;

// 	for (const count of lengthCounts) {
// 		for (let i = 0; i < count; i++) {
// 			if(currentNode.length < 2){
// 				currentNode.push(elements[elementIndex++]);
// 			} else {
// 				const newNode = [];
// 				levelRoot.push(newNode);
// 				currentNode = newNode;
// 			}
// 		}
// 		const newLevelNode = [];
// 		levelRoot.push(newLevelNode);
// 		levelRoot = newLevelNode;
// 		const newNode = [];
// 		levelRoot.push(newNode);
// 		currentNode = newNode;
// 	}
// 	return root[0];
// }

export function huffmanTableToTree(table){
	const root = []
	for(const [key, val] of Object.entries(table).toSorted((a, b) => parseInt(a[0], 2) - parseInt(b[0], 2))){
		let currentNode = root;
		for(let i = 0; i < key.length; i++){
			const step = parseInt(key[i], 2);
			if(currentNode[step]){
				currentNode = currentNode[step];
			} else if(i == key.length - 1) {
				currentNode[step] = val;
			} else {
				currentNode[step] = [];
				currentNode = currentNode[step]
			}
		}
	}
	return root;
}
