const fs = require('fs');

const pdfBuf = fs.readFileSync('d:/Users/Kelvin/Downloads/DALP/doc/scratch_test_exec.pdf');
const pdfText = pdfBuf.toString('binary');

// Split by /Type /Page
const pageObjects = pdfText.split(/\/Type\s*\/Page\b/);
console.log('Total page splits:', pageObjects.length - 1);

pageObjects.forEach((p, idx) => {
    if (idx === 0) return;
    console.log(`--- PAGE ${idx} SUMMARY ---`);
    console.log(p.substring(0, 500));
});
