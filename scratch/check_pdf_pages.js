const fs = require('fs');
const pdfBuf = fs.readFileSync('d:/Users/Kelvin/Downloads/DALP/doc/scratch_test_exec.pdf');
const pdfText = pdfBuf.toString('binary');
// Count occurrences of /Type /Page (excluding /Pages)
const matches = pdfText.match(/\/Type\s*\/Page\b/g);
console.log('PDF Page Count:', matches ? matches.length : 'unknown');
