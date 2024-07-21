import { BinaryReader } from "./binary-reader.js";
import { assertEquals } from "https://deno.land/std@0.208.0/assert/assert_equals.ts";


Deno.test("binaryReader: readIntN (3-bit)", () => {
	const buffer = new Uint8Array([0b0000_0101]);
	const binaryReader = new BinaryReader(buffer.buffer);

	assertEquals(binaryReader.readIntN(3), -3);
	assertEquals(binaryReader.byteIndex, 0);
	assertEquals(binaryReader.bitIndex, 3);
});
Deno.test("binaryReader: readIntN (4-bit)", () => {
	const buffer = new Uint8Array([0b0000_0101]);
	const binaryReader = new BinaryReader(buffer.buffer);

	assertEquals(binaryReader.readIntN(4), 5);
	assertEquals(binaryReader.byteIndex, 0);
	assertEquals(binaryReader.bitIndex, 4);
});
Deno.test("binaryReader: readIntN (5-bit)", () => {
	const buffer = new Uint8Array([0b0001_1101]);
	const binaryReader = new BinaryReader(buffer.buffer);

	assertEquals(binaryReader.readIntN(5), -3);
	assertEquals(binaryReader.byteIndex, 0);
	assertEquals(binaryReader.bitIndex, 5);
});
Deno.test("binaryReader: readIntN (6-bit)", () => {
	const buffer = new Uint8Array([0b0001_1101]);
	const binaryReader = new BinaryReader(buffer.buffer);

	assertEquals(binaryReader.readIntN(6), 29);
	assertEquals(binaryReader.byteIndex, 0);
	assertEquals(binaryReader.bitIndex, 6);
});

Deno.test("binaryReader: read2xUint4 (LE)", () => {
	const buffer = new Uint8Array([0b0011_0100]);
	const binaryReader = new BinaryReader(buffer.buffer);

	assertEquals(binaryReader.read2xUint4(true), [4, 3]);
	assertEquals(binaryReader.byteIndex, 1);
});
Deno.test("binaryReader: read2xUint4 (BE)", () => {
	const buffer = new Uint8Array([0b0011_0100]);
	const binaryReader = new BinaryReader(buffer.buffer);

	assertEquals(binaryReader.read2xUint4(false), [3, 4]);
	assertEquals(binaryReader.byteIndex, 1);
});

Deno.test("binaryReader: readUint8", () => {
	const buffer = new Uint8Array([14, 15]);
	const binaryReader = new BinaryReader(buffer.buffer);
	
	assertEquals(binaryReader.readUint8(true), 14);
	assertEquals(binaryReader.byteIndex, 1);

	assertEquals(binaryReader.readUint8(true), 15);
	assertEquals(binaryReader.byteIndex, 2);
});

Deno.test("binaryReader: readUint8s", () => {
	const buffer = new Uint8Array([14, 15]);
	const binaryReader = new BinaryReader(buffer.buffer);

	assertEquals(binaryReader.readUint8s(2, true), [14,15]);
	assertEquals(binaryReader.byteIndex, 2);
});

Deno.test("binaryReader: readUint16", () => {
	const buffer = new Uint16Array([14, 15]);
	const binaryReader = new BinaryReader(buffer.buffer);

	assertEquals(binaryReader.readUint16(true), 14);
	assertEquals(binaryReader.byteIndex, 2);

	assertEquals(binaryReader.readUint16(true), 15);
	assertEquals(binaryReader.byteIndex, 4);
});

Deno.test("binaryReader: readUint16s", () => {
	const buffer = new Uint16Array([14, 15]);
	const binaryReader = new BinaryReader(buffer.buffer);

	assertEquals(binaryReader.readUint16s(2, true), [14, 15]);
	assertEquals(binaryReader.byteIndex, 4);
});

Deno.test("binaryReader: readBit", () => {
	const buffer = new Uint8Array([0b0101_0101, 0b0000_0000]);
	const binaryReader = new BinaryReader(buffer.buffer);
	let bit = binaryReader.readBit();
	assertEquals(bit, 1);
	bit = binaryReader.readBit();
	assertEquals(bit, 0);
	bit = binaryReader.readBit();
	assertEquals(bit, 1);
	bit = binaryReader.readBit();
	assertEquals(bit, 0);
	bit = binaryReader.readBit();
	assertEquals(bit, 1);
	bit = binaryReader.readBit();
	assertEquals(bit, 0);
	bit = binaryReader.readBit();
	assertEquals(bit, 1);
	bit = binaryReader.readBit();
	assertEquals(bit, 0);
	bit = binaryReader.readBit();
	assertEquals(bit, 0);
	assertEquals(binaryReader.byteIndex, 1);
});

Deno.test("binaryReader: readHuffmanSymbol", () => {
	const buffer = new Uint8Array([0b0101_0101, 0b0000_0000]);
	const binaryReader = new BinaryReader(buffer.buffer);
	const huffmanTree = [
		[5,6,],
		[
			[3,4],
			[
				[2,7],
				[
					8,
					[
						1,
						[
							0,
							[9]
						]
					]
				]
			]
		]
	];

	let value = binaryReader.readHuffmanSymbol(huffmanTree);
	assertEquals(value, 4);
	assertEquals(binaryReader.byteIndex, 0);
	assertEquals(binaryReader.bitIndex, 3);

	value = binaryReader.readHuffmanSymbol(huffmanTree);
	assertEquals(value, 6);
	assertEquals(binaryReader.byteIndex, 0);
	assertEquals(binaryReader.bitIndex, 5);

	value = binaryReader.readHuffmanSymbol(huffmanTree);
	assertEquals(value, 6);
	assertEquals(binaryReader.byteIndex, 0);
	assertEquals(binaryReader.bitIndex, 7);
});

Deno.test("binaryReader: readString", () => {
	const buffer = new Uint8Array([...new TextEncoder().encode("hello world"), 0x00, 0xFF, 0x0E]);
	const binaryReader = new BinaryReader(buffer.buffer);
	const string = binaryReader.readString(11);
	assertEquals(string, "hello world");
	assertEquals(binaryReader.byteIndex, 11);
});

Deno.test("binaryReader: readCString", () => {
	const buffer = new Uint8Array([...new TextEncoder().encode("hello world"), 0x00, 0xFF, 0x0E]);
	const binaryReader = new BinaryReader(buffer.buffer);
	const string = binaryReader.readCString();
	assertEquals(string, "hello world");
	assertEquals(binaryReader.byteIndex, 12);
});

Deno.test("binaryReader: readStringUntilCode", () => {
	const buffer = new Uint8Array([...new TextEncoder().encode("hello world"), 0x00, 0xFF, 0x0E]);
	const binaryReader = new BinaryReader(buffer.buffer);
	const string = binaryReader.readStringUntilCode(32);
	assertEquals(string, "hello");
	assertEquals(binaryReader.byteIndex, 6);
});

Deno.test("binaryReader: readStringUntilChar", () => {
	const buffer = new Uint8Array([...new TextEncoder().encode("hello world"), 0x00, 0xFF, 0x0E]);
	const binaryReader = new BinaryReader(buffer.buffer);
	const string = binaryReader.readStringUntilChar("o");
	assertEquals(string, "hell");
	assertEquals(binaryReader.byteIndex, 5);
});

Deno.test("binaryReader: fastForwardBits", () => {
	const buffer = new Uint8Array([0b0000_0101, 0b11110010]);
	const binaryReader = new BinaryReader(buffer.buffer);
	binaryReader.fastForwardBits(2);
	assertEquals(binaryReader.byteIndex, 0);
	assertEquals(binaryReader.bitIndex, 2);

	binaryReader.fastForwardBits(3);
	assertEquals(binaryReader.byteIndex, 0);
	assertEquals(binaryReader.bitIndex, 5);

	binaryReader.fastForwardBits(5);
	assertEquals(binaryReader.byteIndex, 1);
	assertEquals(binaryReader.bitIndex, 2)
	
	binaryReader.fastForwardBits(2);
	assertEquals(binaryReader.byteIndex, 1);
	assertEquals(binaryReader.bitIndex, 4);;
});

Deno.test("binaryReader: snapToByte (unaligned)", () => {
	const buffer = new Uint8Array([0b0000_0101, 0b11110010]);
	const binaryReader = new BinaryReader(buffer.buffer);
	binaryReader.bitIndex = 2;
	const result = binaryReader.snapToByte();
	assertEquals(result, 6);
	assertEquals(binaryReader.byteIndex, 1);
	assertEquals(binaryReader.bitIndex, 0);
});

Deno.test("binaryReader: snapToByte (aligned)", () => {
	const buffer = new Uint8Array([0b0000_0101, 0b11110010]);
	const binaryReader = new BinaryReader(buffer.buffer);
	binaryReader.byteIndex = 1;
	const result = binaryReader.snapToByte();
	assertEquals(result, 0);
	assertEquals(binaryReader.byteIndex, 1);
	assertEquals(binaryReader.bitIndex, 0);
});