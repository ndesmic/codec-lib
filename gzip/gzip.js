import { BinaryReader } from "../utils/binary-reader.js";
import { bufferToStream, streamToBlob } from "../utils/utils.js";

export class GZip extends BinaryReader {
	#dataView;
	#index = 0;
	#crc16;

	header;
	fileName;
	comment;

	read() {
		this.header = {
			signature: this.readString(2), //should be xf8b
			compressionMethod: this.readUint8(), //should be 0x08
			flags: this.readFlags(["ftext", "fhcrc", "fextra", "fname", "fcomment", "reserved1", "reserved2", "reserved3"]), //need to figure out if we read extra data in stream
			modificationTime: this.readUnixTimestamp(),
			extraFlags: this.readUint8(), //not important but is either 2 (best compression) or 4 (fast)
			os: this.readUint8(), //not useful but usually 0 on windows, 3 Unix, 7 mac
		};

		if (this.header.flags.fextra) {
			const extraLength = this.readUint16(true);
			this.extra = this.readUint8s(extraLength);
		} else {
			this.extra = [];
		}

		if (this.header.flags.fname) {
			this.fileName = this.readCString();
		} else {
			this.fileName = "";
		}

		if (this.header.flags.fcomment) {
			this.comment = this.readCString();
		} else {
			this.comment = "";
		}

		if (this.header.flags.fhcrc) {
			this.#crc16 = this.readUint16(true);
			this.#index += 2;
		} else {
			this.#crc16 = null;
		}

		//footer
		this.footer = {
			crc: this.view.getUint32(this.view.byteLength - 8, true),
			uncompressedSize: this.view.getUint32(this.view.byteLength - 4, true),
		}
	}
	extract() {
		//If you don't care about the file data just do this:
		//return streamToBlob(bufferToStream(this.#dataView.buffer).pipeThrough(new DecompressionStream("gzip")));
		//Otherwise slice where the data starts to the last 8 bytes
		return streamToBlob(bufferToStream(this.#dataView.buffer.slice(this.#index, this.#dataView.byteLength - 8)).pipeThrough(new DecompressionStream("deflate-raw")));
	}
}