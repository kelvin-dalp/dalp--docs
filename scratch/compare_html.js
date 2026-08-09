const fs = require('fs');
const path = require('path');

const cliHtml = fs.readFileSync('d:/Users/Kelvin/Downloads/DALP/doc/scratch/temp_test.html', 'utf8');

// Find last temp html in outputs
const outputsDir = 'd:/Users/Kelvin/Downloads/DALP/doc/outputs';
const files = fs.readdirSync(outputsDir).filter(f => f.startsWith('temp_') && f.endsWith('.html'));
files.sort((a, b) => fs.statSync(path.join(outputsDir, b)).mtimeMs - fs.statSync(path.join(outputsDir, a)).mtimeMs);

if (files.length > 0) {
    const serverHtml = fs.readFileSync(path.join(outputsDir, files[0]), 'utf8');
    console.log('CLI HTML Length:', cliHtml.length);
    console.log('Server HTML Length:', serverHtml.length);
    console.log('Are HTML files identical?:', cliHtml === serverHtml);
    if (cliHtml !== serverHtml) {
        console.log('Diff preview:');
        console.log('CLI HTML Head:', cliHtml.substring(0, 300));
        console.log('Server HTML Head:', serverHtml.substring(0, 300));
    }
} else {
    console.log('No temp html files found in outputs');
}
