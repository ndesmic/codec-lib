export class BinaryReader {
	constructor(array, byteIndex = 0, bitIndex = 0) {
		this.view = new DataView(array);
		this.byteIndex = byteIndex;
		this.bitIndex = bitIndex;
	}
	readUintN(length){
		let value = 0;
		for (let i = 0; i < length; i++) {
			value = value | (this.readBit() << i);
		}

		return value;
	}
	readIntN(length){
		let value = 0;
		for(let i = 0; i < length; i++){
			value = value | (this.readBit() << i);
		}

		let restMask = 1;
		for(let i = 0; i < length - 2; i++){
			restMask = (restMask << 1) | 1;
		}
		return -(value & (1 << (length - 1))) + (value & restMask);
	}
	read2xUint4(littleEndian) {
		const value = this.readUint8(this.byteIndex);
		if(littleEndian){
			return [value & 0x0F, value >> 4,];
		} 
		return [value >> 4, value & 0x0F];
	}
	readUint8(littleEndian) {
		const value = this.view.getUint8(this.byteIndex, littleEndian);
		this.byteIndex += 1;
		return value;
	}
	readUint8s(length, littleEndian) {
		const values = new Array(length);
		for (let i = 0; i < length; i++) {
			values[i] = this.readUint8(littleEndian);
		}
		return values;
	}
	readUint16(littleEndian){
		const value = this.view.getUint16(this.byteIndex, littleEndian);
		this.byteIndex += 2;
		return value;
	}
	readInt16(littleEndian){
		const value = this.view.getInt16(this.byteIndex, littleEndian);
		this.byteIndex += 2;
		return value;
	}
	readUint16s(length, littleEndian) {
		const values = new Array(length);
		for (let i = 0; i < length; i++) {
			values[i] = this.readUint16(littleEndian);
		}
		return values;
	}
	readUInt32(littleEndian) {
		const value = this.view.getUint32(this.byteIndex, littleEndian);
		this.byteIndex += 4;
		return value;
	}
	readInt32(littleEndian) {
		const value = this.view.getInt32(this.byteIndex, littleEndian);
		this.byteIndex += 4;
		return value;
	}
	validateUint16(value, littleEndian){
		return value === this.readUint16(littleEndian);
	}
	readBit(){
		let byte = this.view.getUint8(this.byteIndex);
		const mask = 1;
		for(let i = 0; i < this.bitIndex; i++){
			byte >>= 1
		}
		this.bitIndex++;
		if(this.bitIndex >= 8){
			this.bitIndex = 0;
			this.byteIndex++
		}
		return byte & mask;
	}
	readBool(){
		return this.readBit() === 1;
	}
	readFlags(names){
		const result = {};
		for(key of names){
			result[key] = this.readBool();
		}
		return result;
	}
	readString(length){
		const buffer = this.view.buffer.slice(this.byteIndex, this.byteIndex + length);
		const value = new TextDecoder().decode(buffer);
		this.byteIndex += length;
		return value;
	}
	readCString() {
		let string = "";
		while (true) {
			const c = this.readUint8();
			if (c === 0) return string;
			string += String.fromCharCode(c);
		}
	}
	readUnixTimestamp(littleEndian) {
		return new Date(this.readUint32(littleEndian) * 1000);
	}
	readHuffmanSymbol(huffmanTableTree){
		let value = huffmanTableTree;
		while(Array.isArray(value)){
			const bit = this.readBit();
			value = value[bit];
		}
		return value;
	}
	rewind(byteCount){
		this.byteIndex -= byteCount;
		if(this.byteIndex < 0){
			this.byteIndex = 0;
		}
	}
	fastForward(byteCount){
		this.byteIndex += byteCount;
	}
	fastForwardBits(bitCount){
		this.byteIndex += Math.floor((this.bitIndex + bitCount) / 8);
		this.bitIndex = (this.bitIndex + bitCount) % 8;
	}
	snapToByte(){
		if(this.bitIndex > 0){
			const skipped = 8 - this.bitIndex;
			this.bitIndex = 0;
			this.byteIndex += 1;
			return skipped;
		}
		return 0;
	}
}