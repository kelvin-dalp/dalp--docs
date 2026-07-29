const fs = require('fs');
const path = require('path');
const puppeteer = require('../dalp-pdf-system/node_modules/puppeteer');

(async () => {
    try {
        console.log('🚀 Launching Puppeteer...');
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        // Define exact colors
        const NAVY = '#0C2340';
        const BLUE = '#0093FB'; // sampled logo blue

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    background: transparent;
                }
                #header-bar {
                    width: 2400px;
                    height: 120px;
                    background-color: ${BLUE};
                    display: flex;
                    overflow: hidden;
                }
                #header-navy {
                    width: 55%;
                    height: 100%;
                    background-color: ${NAVY};
                    border-bottom-right-radius: 80px;
                }
                #footer-bar {
                    width: 2400px;
                    height: 120px;
                    background-color: ${BLUE};
                    display: flex;
                    overflow: hidden;
                }
                #footer-navy {
                    width: 65%;
                    height: 100%;
                    background-color: ${NAVY};
                    margin-left: auto;
                    border-top-left-radius: 80px;
                }
                .icon {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .icon svg {
                    width: 36px;
                    height: 36px;
                    fill: ${NAVY};
                }

                /* Minimalist Assets */
                #top-line-minimal {
                    width: 2400px;
                    height: 12px;
                    display: flex;
                }
                #top-line-navy {
                    width: 35%;
                    height: 100%;
                    background-color: ${NAVY};
                }
                #top-line-blue {
                    width: 65%;
                    height: 100%;
                    background-color: ${BLUE};
                }

                #bottom-decor-minimal {
                    width: 240px;
                    height: 9px;
                    display: flex;
                    gap: 12px;
                }
                #decor-navy {
                    width: 76px;
                    height: 100%;
                    background-color: ${NAVY};
                    border-radius: 6px;
                }
                #decor-blue {
                    width: 152px;
                    height: 100%;
                    background-color: ${BLUE};
                    border-radius: 6px;
                }
            </style>
        </head>
        <body>
            <!-- Exact Design Bars -->
            <div id="header-bar">
                <div id="header-navy"></div>
            </div>
            <div style="height: 20px;"></div>
            <div id="footer-bar">
                <div id="footer-navy"></div>
            </div>

            <!-- Exact Design Icons -->
            <div id="pin-icon" class="icon">
                <svg viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
            </div>
            <div id="phone-icon" class="icon">
                <svg viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.2 14.28c-1.68-.84-3-2.16-3.84-3.84l1.2-1.2c.12-.12.17-.29.13-.45-.33-1.07-.51-2.21-.51-3.39 0-.44-.36-.8-.8-.8H6.5c-.44 0-.8.36-.8.8 0 8.01 6.5 14.5 14.5 14.5.44 0 .8-.36.8-.8v-2.9c0-.44-.36-.8-.8-.8-1.18 0-2.32-.18-3.39-.51-.16-.05-.33 0-.45.13l-1.2 1.2z"/>
                </svg>
            </div>
            <div id="envelope-icon" class="icon">
                <svg viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
            </div>

            <!-- Minimal Design Assets -->
            <div id="top-line-minimal">
                <div id="top-line-navy"></div>
                <div id="top-line-blue"></div>
            </div>
            <div style="height: 20px;"></div>
            <div id="bottom-decor-minimal">
                <div id="decor-navy"></div>
                <div id="decor-blue"></div>
            </div>
        </body>
        </html>
        `;

        await page.setContent(htmlContent);
        
        const outputsDir = path.join(__dirname, 'outputs');
        if (!fs.existsSync(outputsDir)) {
            fs.mkdirSync(outputsDir, { recursive: true });
        }

        // Exact Letterhead Assets
        console.log('📸 Taking screenshot of header-bar...');
        const headerElement = await page.$('#header-bar');
        const headerPath = path.join(outputsDir, 'header-bar-exact.png');
        await headerElement.screenshot({ path: headerPath });
        console.log(`✅ Saved header bar to: ${headerPath}`);

        console.log('📸 Taking screenshot of footer-bar...');
        const footerElement = await page.$('#footer-bar');
        const footerPath = path.join(outputsDir, 'footer-bar-exact.png');
        await footerElement.screenshot({ path: footerPath });
        console.log(`✅ Saved footer bar to: ${footerPath}`);

        console.log('📸 Taking screenshots of icons...');
        
        const pinElement = await page.$('#pin-icon');
        const pinPath = path.join(outputsDir, 'pin.png');
        await pinElement.screenshot({ path: pinPath, omitBackground: true });
        
        const phoneElement = await page.$('#phone-icon');
        const phonePath = path.join(outputsDir, 'phone.png');
        await phoneElement.screenshot({ path: phonePath, omitBackground: true });
        
        const envelopeElement = await page.$('#envelope-icon');
        const envelopePath = path.join(outputsDir, 'envelope.png');
        await envelopeElement.screenshot({ path: envelopePath, omitBackground: true });
        
        console.log('✅ Saved all icons.');

        // Minimalist Letterhead Assets
        console.log('📸 Taking screenshot of top-line-minimal...');
        const topLineElement = await page.$('#top-line-minimal');
        const topLinePath = path.join(outputsDir, 'top-line-minimal.png');
        await topLineElement.screenshot({ path: topLinePath });
        console.log(`✅ Saved minimal top line to: ${topLinePath}`);

        console.log('📸 Taking screenshot of bottom-decor-minimal...');
        const bottomDecorElement = await page.$('#bottom-decor-minimal');
        const bottomDecorPath = path.join(outputsDir, 'bottom-decor-minimal.png');
        await bottomDecorElement.screenshot({ path: bottomDecorPath, omitBackground: true });
        console.log(`✅ Saved minimal bottom decor to: ${bottomDecorPath}`);

        await browser.close();
        console.log('🎉 Done generating all assets!');
    } catch (err) {
        console.error('❌ Error generating assets:', err);
        process.exit(1);
    }
})();
