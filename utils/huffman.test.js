import { buildHuffmanTable, huffmanTableToTree } from "./huffman.js";
import { assertEquals } from "https://deno.land/std/assert/mod.ts";

Deno.test("Huffman: buildTable", () => {
	const lengths = [0, 2, 2, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	const elements = [5, 6, 3, 4, 2, 7, 8, 1, 0, 9];

	const expected = {
		"00": 5,
		"01": 6,
		"100": 3,
		"101": 4,
		"1100" : 2,
		"1101" : 7,
		"1110" : 8,
		"11110" : 1,
		"111110" : 0,
		"1111110" : 9
	};

	const result = buildHuffmanTable(elements, lengths);
	assertEquals(result, expected);
});
Deno.test("Huffman: getTree", () => {
	const lengthCounts = [0, 2, 2, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	const elements = [5, 6, 3, 4, 2, 7, 8, 1, 0, 9];

	const expected = [
		[
			5,
			6,
		],
		[
			[
				3,
				4
			],
			[
				[
					2,
					7
				],
				[
					8,
					[
						1,
						[
							0,
							[
								9
							]
						]
					]
				]
			]
		]
	];

	const result = huffmanTableToTree(buildHuffmanTable(elements, lengthCounts));
	assertEquals(result, expected);
});

// Deno.test("Huffman: buildTree", () => {
// 	const lengthCounts = [0, 2, 2, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
// 	const elements = [5, 6, 3, 4, 2, 7, 8, 1, 0, 9];

// 	const expected = [
// 		[
// 			5,
// 			6,
// 		],
// 		[
// 			[
// 				3,
// 				4
// 			],
// 			[
// 				[
// 					2,
// 					7
// 				],
// 				[
// 					8,
// 					[
// 						1,
// 						[
// 							0,
// 							[
// 								9
// 							]
// 						]
// 					]
// 				]
// 			]
// 		]
// 	];

// 	const result = buildTree(elements, lengthCounts);
// 	assertEquals(result, expected);
// });