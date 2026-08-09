const fs = require('fs');
const zlib = require('zlib');

const pdfBuf = fs.readFileSync('d:/Users/Kelvin/Downloads/DALP/doc/scratch_test_exec.pdf');

// Find stream object 17
const str = pdfBuf.toString('binary');
const obj17Idx = str.indexOf('17 0 obj');
if (obj17Idx !== -1) {
    const streamStart = str.indexOf('stream', obj17Idx) + 6;
    // Skip \r\n
    let startPos = streamStart;
    if (pdfBuf[startPos] === 13 && pdfBuf[startPos+1] === 10) startPos += 2;
    else if (pdfBuf[startPos] === 10) startPos += 1;

    const streamEnd = str.indexOf('endstream', startPos);
    const compressedData = pdfBuf.slice(startPos, streamEnd - 1);

    try {
        const decompressed = zlib.unzipSync(compressedData);
        console.log('Decompressed Page 2 Content Stream:');
        console.log(decompressed.toString('utf8'));
    } catch (e) {
        console.error('Unzip error:', e);
    }
} else {
    console.log('17 0 obj not found');
}
