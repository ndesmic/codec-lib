function decompress(binaryReader){ //assume the binary reader is at the starting index
	let isLast;
	const data = [];

	do {
		isLast = binaryReader.readBool();
		const blockType = binaryReader.readUintN(2);

		switch(blockType){
			case 0: {
				const value = decompressUncompressed(binaryReader);
				data.concat(value);
				break;
			}
			case 1: {
				const value = decompressFixed(binaryReader);
				data.concat(value);
				break;
			}
			case 2: {
				const value = decompressDynamic(binaryReader);
				data.concat(value);
				break;
			}
			default: {
				throw new Error("DEFLATE: Reserved block type");
			}
		}
	} while(!isLast)

	return data;
}

function getUnalignedBytes(binaryReader, length){
	const bytes = new Array(length);
	for(let i = 0; i < length; i++){
		bytes[i] = binaryReader.getUintN(8);
	}
	return bytes;
}

function decompressUncompressed(binaryReader){
	this.snapToByte();
	const length = this.getUintN(16);
	const lengthCompliment = this.getUintN(16);
	return getUnalignedBytes(binaryReader, length);
}

function decompressFixed(binaryReader){

}

function decompressDynamic(binaryReader){

}
