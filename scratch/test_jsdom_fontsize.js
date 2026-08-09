const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('d:/Users/Kelvin/Downloads/DALP/doc/dalp-letter-generator.html', 'utf8');

const dom = new JSDOM(html, {
    url: 'file:///d:/Users/Kelvin/Downloads/DALP/doc/dalp-letter-generator.html',
    runScripts: 'dangerously',
    resources: 'usable'
});

const window = dom.window;
const document = window.document;

// Wait for DOM scripts to execute
setTimeout(() => {
    try {
        const select = document.getElementById('letter-font-size-select');
        const input = document.getElementById('letter-font-size-input');
        const toggle = document.getElementById('auto-fit-page-toggle');
        const badge = document.getElementById('autofit-badge');

        console.log('--- BEFORE SELECTION ---');
        console.log('Input:', input ? input.value : 'null');
        console.log('Select:', select ? select.value : 'null');
        console.log('Toggle checked:', toggle ? toggle.checked : 'null');

        // Trigger manual selection of 14.5px
        if (select) {
            select.value = '14.5px';
            select.dispatchEvent(new window.Event('change'));
        }

        console.log('--- AFTER SELECTING 14.5px ---');
        console.log('Input:', input ? input.value : 'null');
        console.log('Select:', select ? select.value : 'null');
        console.log('Toggle checked:', toggle ? toggle.checked : 'null');
        console.log('Badge text:', badge ? badge.innerText : 'null');

        if (input && input.value === '14.5' && select && select.value === '14.5px' && toggle && !toggle.checked) {
            console.log('\nTEST PASSED: 14.5pt was successfully set and Auto-Fit was paused!');
        } else {
            console.log('\nTEST FAILED!');
        }
    } catch (err) {
        console.error('Error during test:', err);
    }
}, 500);
