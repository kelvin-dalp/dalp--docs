const fs = require('fs');
const zlib = require('zlib');

const pdfBuf = fs.readFileSync('d:/Users/Kelvin/Downloads/DALP/doc/scratch_test_exec.pdf');
const str = pdfBuf.toString('binary');

// Find all stream contents
const streamRegex = /(\d+)\s+(\d+)\s+obj[\s\S]*?stream\r?\n([\s\S]*?)\r?\nendstream/g;
let match;
while ((match = streamRegex.exec(str)) !== null) {
    const objNum = match[1];
    const streamRaw = match[3];
    const buf = Buffer.from(streamRaw, 'binary');
    try {
        const decomp = zlib.unzipSync(buf).toString('utf8');
        console.log(`=== STREAM OBJ ${objNum} (Length: ${decomp.length}) ===`);
        console.log(decomp.substring(0, 400));
    } catch (e) {
        console.log(`=== STREAM OBJ ${objNum} (Raw/Uncompressed Length: ${buf.length}) ===`);
    }
}
