const path = require('path');
const fs = require('fs');

let puppeteer;
try {
    puppeteer = require('puppeteer');
} catch (e) {
    puppeteer = require(path.join(__dirname, '../../dalp-pdf-system/node_modules/puppeteer'));
}

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    const htmlFile = fs.readFileSync('d:/Users/Kelvin/Downloads/DALP/doc/dalp-letter-generator.html', 'utf8');
    const styleMatches = htmlFile.match(/<style[\s\S]*?<\/style>/gi) || [];

    const testHtml = `
    <div class="letter-content-wrapper" style="--letter-font-family: 'Tinos', 'Times New Roman', serif; --letter-font-size: 11.5px;">
        <div class="letter-watermark"><img src="dalp-logo-transparent.png" alt=""></div>
        <div class="exact-top-bar"><div class="exact-top-navy"></div></div>
        <div class="exact-header">
            <div class="exact-header-row">
                <div class="exact-brand">
                    <img class="exact-logo" src="dalp-logo.jpg" alt="DALP Logo">
                    <div class="exact-brand-text">
                        <h1>DALP CONSULTANCY</h1>
                        <div style="font-size: 8px; font-weight: 600; color: #0093FB; letter-spacing: 2.5px;">EDUCATION BEYOND BORDERS</div>
                    </div>
                </div>
                <div class="exact-contact">
                    <div class="exact-contact-text">
                        <p><strong>EDU-HUB, 2nd Floor</strong></p>
                        <p>Omelo Mumba Road, Rhodes Park</p>
                        <p>Lusaka, Zambia</p>
                        <p>+260 764 168 592 / +260 966 735 623</p>
                        <p>info@dalpzambia.com</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="exec-body" style="padding: 18mm;">
            <div class="letter-recipient"><p><strong>The Managing Director</strong><br>ZCCM Investments Holdings Plc<br>Lusaka, Zambia</p></div>
            <div class="letter-date"><strong>Date:</strong> 28 August 2026</div>
            <div class="letter-subject"><strong>STRATEGIC PARTNERSHIP INVITATION FOR EXECUTIVE HUMAN CAPITAL DEVELOPMENT</strong></div>
            <div class="letter-body-text">
                <p>Dear Sir/Madam,</p>
                <p>We recognize ZCCM Investments Holdings Plc as a premier investment holding company with major investments in Zambia's mining and strategic sectors. As part of our mandate to expand access to world-class education, DALP Consultancy Services Limited invites ZCCM-IH to collaborate with us for the upcoming 2026 DALP Education Fair.</p>
                <p>Through this partnership, employees, dependents, and sponsored scholars of ZCCM-IH will gain direct access to over 38 top-ranked international universities across Australia, Canada, the United Kingdom, Switzerland, Germany, and Malaysia. Programs range from undergraduate pathways to specialized postgraduate executive training in Mining Engineering, Sustainable Energy Management, Financial Leadership, and ESG Compliance.</p>
                <p>We would welcome an opportunity to meet with your Human Capital team to outline specific scholarship allocation and executive development opportunities tailored for ZCCM-IH staff and partners.</p>
                <p>We look forward to your positive response.</p>
            </div>
            <div class="exec-sign-off-container" style="border-top: 1px solid #CBD5E1; padding-top: 10px; margin-top: 14px;">
                <div class="exec-authority-text" style="font-style: italic; color: #64748B; font-size: 11px; margin-bottom: 2px;">Issued with authority of:</div>
                <div class="exec-salutation-close" style="font-weight: 700; color: #0C2340; font-size: 12px; margin-bottom: 6px;">Yours faithfully,</div>
                <div class="exec-signatory-flex" style="display: flex; justify-content: space-between; align-items: flex-end;">
                    <div class="exec-signatory-details">
                        <div class="exec-signature-space" style="height: 48px; margin: 4px 0;"></div>
                        <div class="exec-signatory-name" style="font-weight: 700; color: #0C2340; font-size: 13px;">Daliso Nkhoma</div>
                        <div class="exec-signatory-position" style="color: #475569; font-size: 11.5px;">Business Development Officer</div>
                        <div class="exec-company-name" style="font-weight: 800; color: #0093FB; font-size: 11px; margin-top: 2px;">DALP CONSULTANCY SERVICES LIMITED</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    const baseDir = 'd:/Users/Kelvin/Downloads/DALP/doc/'.replace(/\\/g, '/');
    const fullHTML = `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <base href="file:///${baseDir}">
        <title>DALP Letter PDF</title>
        <style>
            @page { size: A4 portrait; margin: 0; }
            *, *::before, *::after {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
            html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
                width: 210mm;
            }
            .letter-sheet, .letter-content-wrapper, .standalone-page, .print-page {
                box-shadow: none !important;
                margin: 0 auto !important;
                width: 210mm !important;
                min-height: 296.5mm !important;
                box-sizing: border-box !important;
                page-break-after: auto !important;
                break-after: auto !important;
            }
            body > :last-child,
            .letter-sheet:last-child,
            .letter-content-wrapper:last-child,
            .standalone-page:last-child,
            .print-page:last-child {
                page-break-after: avoid !important;
                break-after: avoid !important;
            }
        </style>
        ${styleMatches.join('\n')}
    </head>
    <body>
        ${testHtml}
    </body>
    </html>`;

    await page.setContent(fullHTML, { waitUntil: 'networkidle0' });
    
    const dimensions = await page.evaluate(() => {
        const body = document.body;
        const wrapper = document.querySelector('.letter-content-wrapper');
        return {
            bodyScrollHeight: body.scrollHeight,
            bodyOffsetHeight: body.offsetHeight,
            wrapperScrollHeight: wrapper ? wrapper.scrollHeight : null,
            wrapperOffsetHeight: wrapper ? wrapper.offsetHeight : null,
            wrapperRect: wrapper ? wrapper.getBoundingClientRect() : null,
            childrenHeights: Array.from(wrapper ? wrapper.children : []).map(c => ({ tag: c.tagName, class: c.className, h: c.offsetHeight, scrollH: c.scrollHeight }))
        };
    });
    console.log('DOM Dimensions:', JSON.stringify(dimensions, null, 2));

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
        preferCSSPageSize: true
    });
    
    fs.writeFileSync('d:/Users/Kelvin/Downloads/DALP/doc/scratch_perfect_1page.pdf', pdfBuffer);

    // Count pages
    const matches = pdfBuffer.toString('binary').match(/\/Type\s*\/Page\b/g);
    console.log('Generated PDF Page Count:', matches ? matches.length : 'unknown');

    await browser.close();
})();
