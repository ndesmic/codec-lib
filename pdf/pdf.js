import { BinaryReader } from "../utils/binary-reader.js";


export class PdfDecoder extends BinaryReader {
	decode(){
		const pdf = {};
		pdf.header = this.readStringUntilChar("\n");
		if(!pdf.header.startsWith("%PDF-")){
			throw new Error("Invalid Header");
		}

		//Body (sequence of objects)

		//Cross-Reference Table

		//Trailer

		return pdf;
	}
}

const file = Deno.readFileSync("./pdf/sample/sample.pdf");
const decoder = new PdfDecoder(file.buffer);
console.log(decoder.decode());