const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');

// Load HTML file and check DOM logic in Node or headless Chromium CLI
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const tempScriptPath = path.join(__dirname, 'evaluate_dom.js');
const domScript = `
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('d:/Users/Kelvin/Downloads/DALP/doc/dalp-letter-generator.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });

dom.window.addEventListener('DOMContentLoaded', () => {
    const document = dom.window.document;
    const select = document.getElementById('letter-font-size-select');
    const input = document.getElementById('letter-font-size-input');
    
    console.log('Initial input:', input.value);
    console.log('Initial select:', select.value);

    // Simulate user selecting 14.5px
    select.value = '14.5px';
    select.dispatchEvent(new dom.window.Event('change'));

    console.log('After selecting 14.5px:');
    console.log('Input:', input.value);
    console.log('Select:', select.value);
    console.log('Auto-Fit toggle:', document.getElementById('auto-fit-page-toggle').checked);
    console.log('Badge text:', document.getElementById('autofit-badge').innerText);
});
`;

// Let's directly test using JSDOM or vanilla DOM script
const htmlContent = fs.readFileSync('d:/Users/Kelvin/Downloads/DALP/doc/dalp-letter-generator.html', 'utf8');

// Check options in htmlContent
const has14_5Opt = htmlContent.includes('<option value="14.5px">14.5 pt (X-Large)</option>');
console.log('Has 14.5px option in HTML:', has14_5Opt);
