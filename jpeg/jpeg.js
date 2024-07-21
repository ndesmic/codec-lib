import { huffmanTableToTree, buildHuffmanTable } from "../utils/huffman.js";
import { BinaryReader } from "../utils/binary-reader.js";


export class JpegDecoder extends BinaryReader {
	#height;
	#width;
	#dcHuffmanTables = {};
	#acHuffmanTables = {};

	decode() {
		if (this.validateUint16(0xffd8, true)) {
			throw new Error("Incorrect file identifier");
		}

		while (true) {
			const marker = this.readUint16();

			if (marker === 0xffd9) { //end
				console.log("naturally completed");
				break;
			}

			const length = this.readUint16(false) - 2; //length includes itself

			switch (marker) {
				case 0xffe0: {
					this.decodeApplicationHeader();
					break;
				}
				case 0xffc4: {
					this.decodeHuffmanTable();
					break;
				}
				case 0xffdb: {
					this.decodeQuantizationTable();
					break;
				}
				case 0xffc0: {
					this.decodeStartOfFrame();
					break;
				}
				case 0xffda: {
					this.decodeStartOfScan();
					this.fastForward(length);
					break;
				}
				default: {
					return `dunno ${marker.toString(16)}`; //dunno
				}
			}
		}
		return "ok";
	}
	decodeApplicationHeader() {
		const identifier = this.readCString();
		const [majorVersion, minorVersion] = this.readUint8s(2, true);
		const units = this.readUint8();
		const density = this.readUint16s(2, true);
		const thumbnail = this.readUint8s(2, true);

		console.log({
			majorVersion,
			minorVersion,
			units,
			density,
			thumbnail
		});
	}
	decodeHuffmanTable() {
		const header = this.readUint8();
		const tableId = header & 0b00001111;
		const type = (header & 0b00010000) >> 4; // 0 = DC, 1 = AC

		const lengthCounts = this.readUint8s(16);

		const elements = [];
		for (let i = 0; i < lengthCounts.length; i++) {
			elements.push(...this.readUint8s(lengthCounts[i]));
		}
		const table = huffmanTableToTree(buildHuffmanTable(elements, lengthCounts))

		if(type === 0){
			this.#dcHuffmanTables[tableId] = table;
		} else {
			this.#acHuffmanTables[tableId] = table;
		}

		console.log({
			tableId,
			type,
			elementCount: elements.length
		});
	}
	decodeQuantizationTable() {
		const [numOfTables, precision] = this.read2xUint4();
		const precision8bit = precision === 0;
		const bytes = this.readUint8s(64);
		console.log({
			numOfTables,
			precision,
			bytes
		});
	}
	decodeStartOfFrame() {
		const precision = this.readUint8(); //usually 8
		const height = this.readUint16();
		const width = this.readUint16();
		const componentCount = this.readUint8(); //usually 1 (grayscale) or 3 (color)

		const components = new Array(componentCount);
		for (let i = 0; i < componentCount; i++) {
			components[i] = {
				id: this.readUint8(),
				samplingFactors: this.read2xUint4(),
				quantizationTableNumber: this.readUint8()
			};
		}

		this.#height = height;
		this.#width = width;

		//Not sure how this is used yet...
		console.log({
			precision,
			components
		});
	}
	decodeMcu(dcCoefficent, huffmanTableId){
		const matrix = new Array(64).fill(0);
		const dcBitSize = this.readHuffmanSymbol(this.#dcHuffmanTables[huffmanTableId]);
		const dcValue = this.readIntN(dcBitSize);
		matrix[0] = dcCoefficent + dcValue; //undo delta compression

		for (let i = 1; i < 64; i++) { //get AC coefficents
			const code = this.readHuffmanSymbol(this.#acHuffmanTables[huffmanTableId]);
			if (code === 0) {
				console.log(`Early Exit ${i}`)
				break;
			}

			const acBitSize = code & 0x0F;
			const runLength = code >> 4;

			i += runLength; //skip the zeros
			const acValue = this.readIntN(acBitSize);
			matrix[i] = acValue;
		}
		return matrix;
	}
	decodeStartOfScan() {
		//remove 0x00 that precedes 0xFF
		// const componentCount = binaryReader.readUint8();
		// const component = new Array(componentCount);
		// for(let i = 0; i < componentCount; i++){
		// 	component[i] = {
		// 		id: binaryReader.readUint8(),
		// 		huffmanTable: binaryReader.readUint8()
		// 	}
		// }
		// const skipBytes = binaryReader.getUint24()

		const MCUCount = Math.floor((this.#height * this.#width) / 64);
		const MCUs = new Array(MCUCount);
		let yDcCoefficent = 0;
		let crDcCoefficent = 0;
		let cbDcCoefficent = 0;
		
		for(let mcuIndex = 0; mcuIndex < MCUCount; mcuIndex++){
			const yMatrix = this.decodeMcu(yDcCoefficent, 0);
			yDcCoefficent = yMatrix[0];
			console.log("Y matrix",yMatrix);

			const crMatrix = this.decodeMcu(crDcCoefficent, 0);
			crDcCoefficent = crMatrix[0]
			console.log("Cr matrix", crMatrix);

			const cbMatrix = this.decodeMcu(cbDcCoefficent, 0);
			cbDcCoefficent = cbMatrix[0];
			console.log("Cb matrix", cbMatrix);

			MCUs[mcuIndex] = {
				y: yMatrix,
				cr: crMatrix,
				cb: cbMatrix
			};
		}
	}
} 

const file = Deno.readFileSync("./jpeg/profile.jpg");
const decoder = new JpegDecoder(file.buffer);
console.log(decoder.decode());