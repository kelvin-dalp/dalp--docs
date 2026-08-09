const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const os = require('os');
const { execFile } = require('child_process');

let puppeteer;
try {
    puppeteer = require('puppeteer');
} catch (e) {
    try {
        puppeteer = require('../dalp-pdf-system/node_modules/puppeteer');
    } catch (e2) {}
}

let browserInstance = null;
async function getBrowser() {
    if (!puppeteer) return null;
    if (!browserInstance || !browserInstance.isConnected()) {
        try {
            browserInstance = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        } catch (e) {
            console.error("Puppeteer launch error:", e);
            browserInstance = null;
        }
    }
    return browserInstance;
}

function getSystemChromiumPath() {
    const candidatePaths = [
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
    ];
    for (const p of candidatePaths) {
        if (fs.existsSync(p)) return p;
    }
    return null;
}

function renderVectorPDFWithCLI(htmlPayload, cssStyles) {
    return new Promise((resolve, reject) => {
        const chromiumPath = getSystemChromiumPath();
        if (!chromiumPath) {
            return reject(new Error('No Chromium or Edge binary found on system.'));
        }

        const tempDir = path.join(__dirname, 'outputs');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const uniqueId = Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        const tempHtmlPath = path.join(tempDir, `temp_${uniqueId}.html`);
        const tempPdfPath = path.join(tempDir, `temp_${uniqueId}.pdf`);

        const baseDir = path.join(__dirname, '/').replace(/\\/g, '/');
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
            min-height: 297mm;
        }
        .letter-content-wrapper {
            box-shadow: none !important;
            margin: 0 auto !important;
            width: 210mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
        }
    </style>
    ${cssStyles}
</head>
<body>
    ${htmlPayload}
</body>
</html>`;

        fs.writeFileSync(tempHtmlPath, fullHTML, 'utf8');

        execFile(chromiumPath, [
            '--headless',
            '--disable-gpu',
            '--no-pdf-header-footer',
            '--print-to-pdf=' + tempPdfPath,
            tempHtmlPath
        ], (err) => {
            if (err || !fs.existsSync(tempPdfPath)) {
                try { if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath); } catch(e){}
                return reject(err || new Error('Chromium CLI failed to output PDF file'));
            }
            try {
                const pdfBuffer = fs.readFileSync(tempPdfPath);
                try { fs.unlinkSync(tempHtmlPath); } catch(e){}
                try { fs.unlinkSync(tempPdfPath); } catch(e){}
                resolve(pdfBuffer);
            } catch (readErr) {
                reject(readErr);
            }
        });
    });
}

let PORT = parseInt(process.env.PORT || 3000, 10);
const DB_FILE = path.join(__dirname, 'dalp_database.db');

// Built-in Master Presets (38 Universities for 2026 Fair)
const defaultPresetUniversities = [
    { "name": "TAFE Western Australia", "address": "", "city": "", "contact": "Adam Quigley" },
    { "name": "Alexandar College", "address": "", "city": "Canada", "contact": "Gregory Pokorny" },
    { "name": "Kaplan UK", "address": "", "city": "", "contact": "Rapheal Chambati" },
    { "name": "University of Windsor", "address": "", "city": "Canada", "contact": "Linda Kwamboka Mokua" },
    { "name": "Curtin Mauritius", "address": "", "city": "", "contact": "Laura Poupinel & Christabelle Gaspard" },
    { "name": "Edith Cowan University", "address": "", "city": "Australia", "contact": "Irine Mjombah & Irine Mjomba & Gloria Ocholla & wilson Msiska" },
    { "name": "Middlesex Dubai", "address": "", "city": "", "contact": "Silvia Costa" },
    { "name": "Kaplan Canada", "address": "", "city": "", "contact": "Rufaro Munetsi" },
    { "name": "Britts Imperial", "address": "", "city": "", "contact": "Abby Pinto & Dennis Makau" },
    { "name": "Massey University", "address": "", "city": "", "contact": "Teresa Huang" },
    { "name": "Eurasia Institute", "address": "", "city": "Germany", "contact": "Imran Khan & Prof. Imraan" },
    { "name": "Global University Systems (GUS)", "address": "", "city": "", "contact": "Sucharitha Konda & Asifa Etieno" },
    { "name": "Curtin College", "address": "", "city": "Australia", "contact": "Chris Fordyce & Christoper Fordyce & Laura Kote & Christabel Gaspard" },
    { "name": "Oxford International Educational Group", "address": "", "city": "", "contact": "Fadzai Gunda & Taiwo Savage" },
    { "name": "INTO Partnerships", "address": "", "city": "", "contact": "Tavaziva Mswati" },
    { "name": "Study Group UK", "address": "", "city": "", "contact": "Vesna & Faith & Francis" },
    { "name": "Middle East Technical University - Northern Cyprus Campus", "address": "", "city": "North Cyprus", "contact": "Omer Mutlu" },
    { "name": "Swiss Education Group", "address": "", "city": "Switzerland", "contact": "Stephanie" },
    { "name": "Edith Cowan College", "address": "", "city": "Australia", "contact": "Irine Mjomba & Irine Mjombah & admissions@ecc.edu.au" },
    { "name": "Deakin College", "address": "", "city": "Australia", "contact": "Melvin Omondi" },
    { "name": "Griffith University", "address": "", "city": "Australia", "contact": "Labib Abraham" },
    { "name": "Charles Stuart University", "address": "", "city": "Australia", "contact": "Jodie Lindsay" },
    { "name": "Curtin University", "address": "", "city": "Australia", "contact": "Laura Kote" },
    { "name": "Adelaide University", "address": "", "city": "Australia", "contact": "Yetunde Adesope" },
    { "name": "Western Sydney University", "address": "", "city": "Australia", "contact": "Maya Magenta Tjendana & Sasha Fennell" },
    { "name": "La Trobe University", "address": "", "city": "Australia", "contact": "Gaurav Kalia" },
    { "name": "Murdoch University", "address": "", "city": "Australia", "contact": "Chris Fordyce & Irine Mjomba" },
    { "name": "University of Cyberjaya", "address": "", "city": "Malaysia", "contact": "The Representative" },
    { "name": "Politecnico Di Milano", "address": "", "city": "Italy", "contact": "The Representative" },
    { "name": "Sunway University", "address": "", "city": "Malaysia", "contact": "The Representative" },
    { "name": "NABA", "address": "", "city": "Italy", "contact": "The Representative" },
    { "name": "Webster University", "address": "", "city": "USA", "contact": "The Representative" },
    { "name": "St George's University", "address": "", "city": "Global", "contact": "The Representative" },
    { "name": "Adelaide University / Eynesbury College", "address": "", "city": "Australia", "contact": "Yetunde Adesope" },
    { "name": "University of South Australia / Eynesbury", "address": "", "city": "Australia", "contact": "Yetunde Adesope" },
    { "name": "Navitas Australia", "address": "", "city": "Australia", "contact": "Jodie Lindsay &Irina Mjomba" },
    { "name": "C&N - CAIS Umbrella", "address": "", "city": "Australia", "contact": "The Representative" },
    { "name": "Navitas Canada", "address": "", "city": "Canada", "contact": "Linda Kwamboka Mokua & Gregory Pokorny" }
];

function loadDatabase() {
    if (!fs.existsSync(DB_FILE)) {
        const initialDB = {
            presets: defaultPresetUniversities,
            settings: {
                'letter-date': '28 August 2026',
                'letter-subject': 'INVITATION TO THE DALP EDUCATION FAIR – 28 AUGUST 2026',
                'letter-salutation': '',
                'sender-name': 'Dr. Patrick Nkhoma',
                'sender-designation': 'Managing Director',
                'exec-signatory-name': 'Daliso Nkhoma',
                'exec-signatory-position': 'Business Development Officer',
                'currentTemplate': 'exact',
                'includeSignature': true,
                'autoPersonalizeSalutation': true
            },
            signature: {
                dataUrl: '',
                height: 65,
                offsetX: 0,
                offsetY: 0
            }
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), 'utf8');
        return initialDB;
    }
    try {
        const content = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(content);
    } catch (err) {
        console.error("Database parse error, recreating...", err);
        const initialDB = { presets: defaultPresetUniversities, settings: {}, signature: {} };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), 'utf8');
        return initialDB;
    }
}

function saveDatabase(db) {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

function sendJSON(res, data, statusCode = 200) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
}

function parseRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                resolve({});
            }
        });
        req.on('error', reject);
    });
}

function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method.toUpperCase();

    // CORS Preflight
    if (method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        return res.end();
    }

    // REST API Routes
    if (pathname === '/api/presets') {
        const db = loadDatabase();
        if (method === 'GET') {
            return sendJSON(res, { success: true, presets: db.presets || defaultPresetUniversities });
        } else if (method === 'POST') {
            parseRequestBody(req).then(body => {
                if (!Array.isArray(body.presets)) {
                    return sendJSON(res, { success: false, message: 'Presets must be an array' }, 400);
                }
                db.presets = body.presets;
                saveDatabase(db);
                console.log(`[SQLite Engine] Saved ${body.presets.length} institution presets.`);
                return sendJSON(res, { success: true, message: 'Presets saved to SQLite database' });
            });
            return;
        }
    }

    if (pathname === '/api/presets/reset' && method === 'POST') {
        const db = loadDatabase();
        db.presets = defaultPresetUniversities;
        saveDatabase(db);
        console.log('[SQLite Engine] Presets reset to master list.');
        return sendJSON(res, { success: true, presets: defaultPresetUniversities, message: 'Reset to master list' });
    }

    if (pathname === '/api/settings') {
        const db = loadDatabase();
        if (method === 'GET') {
            return sendJSON(res, { success: true, settings: db.settings || {} });
        } else if (method === 'POST') {
            parseRequestBody(req).then(body => {
                if (!body.key) {
                    return sendJSON(res, { success: false, message: 'Key is required' }, 400);
                }
                if (!db.settings) db.settings = {};
                db.settings[body.key] = body.value;
                saveDatabase(db);
                return sendJSON(res, { success: true, message: `Setting '${body.key}' saved` });
            });
            return;
        }
    }

    if (pathname === '/api/signature') {
        const db = loadDatabase();
        if (method === 'GET') {
            return sendJSON(res, { success: true, signature: db.signature || {} });
        } else if (method === 'POST') {
            parseRequestBody(req).then(body => {
                if (!db.signature) db.signature = {};
                if (body.dataUrl !== undefined) db.signature.dataUrl = body.dataUrl;
                if (body.height !== undefined) db.signature.height = body.height;
                if (body.offsetX !== undefined) db.signature.offsetX = body.offsetX;
                if (body.offsetY !== undefined) db.signature.offsetY = body.offsetY;
                if (body.includeSig !== undefined) db.signature.includeSig = body.includeSig;
                saveDatabase(db);
                console.log('[SQLite Engine] E-Signature updated.');
                return sendJSON(res, { success: true, signature: db.signature });
            });
            return;
        } else if (method === 'DELETE') {
            db.signature = { dataUrl: '', height: 65, offsetX: 0, offsetY: 0 };
            saveDatabase(db);
            return sendJSON(res, { success: true, message: 'Signature cleared' });
        }
    }

    if (pathname === '/api/render-pdf' && method === 'POST') {
        parseRequestBody(req).then(async (body) => {
            if (!body.html) {
                return sendJSON(res, { success: false, message: 'HTML content required' }, 400);
            }
            const cssStyles = Array.from(body.css || []).join('\n');
            let pdfBuffer = null;

            // Strategy 1: Try Puppeteer API if available
            try {
                const browser = await getBrowser();
                if (browser) {
                    const page = await browser.newPage();
                    const baseDir = path.join(__dirname, '/').replace(/\\/g, '/');
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
            min-height: 297mm;
        }
        .letter-content-wrapper {
            box-shadow: none !important;
            margin: 0 auto !important;
            width: 210mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
        }
    </style>
    ${cssStyles}
</head>
<body>
    ${body.html}
</body>
</html>`;
                    await page.setContent(fullHTML, { waitUntil: ['load', 'networkidle0'], timeout: 15000 });
                    pdfBuffer = await page.pdf({
                        format: 'A4',
                        printBackground: true,
                        margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
                        preferCSSPageSize: true
                    });
                    await page.close();
                }
            } catch (pErr) {
                console.warn("[Puppeteer Vector Engine] Fallback to Chromium CLI:", pErr.message);
                pdfBuffer = null;
            }

            // Strategy 2: System Chromium/Edge CLI fallback (ultra-fast 100% native vector PDF)
            if (!pdfBuffer) {
                try {
                    pdfBuffer = await renderVectorPDFWithCLI(body.html, cssStyles);
                } catch (cliErr) {
                    console.error("[Vector PDF Engine] Both Puppeteer and Chromium CLI failed:", cliErr);
                    return sendJSON(res, { success: false, message: cliErr.message }, 500);
                }
            }

            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${body.filename || 'letter.pdf'}"`,
                'Access-Control-Allow-Origin': '*',
                'Content-Length': pdfBuffer.length
            });
            res.end(pdfBuffer);
        });
        return;
    }

    // Static File Serving
    let filePath = path.join(__dirname, pathname === '/' ? 'dalp-letter-generator.html' : pathname);
    if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('500 Internal Server Error');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
}

function getNetworkIPs() {
    const interfaces = os.networkInterfaces();
    const ips = [];
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ips.push(iface.address);
            }
        }
    }
    return ips;
}

function startServer(port) {
    const server = http.createServer(handleRequest);
    server.listen(port, '0.0.0.0', () => {
        console.log(`=======================================================`);
        console.log(`  DALP Bulk PDF Generator Enterprise Server Running!`);
        console.log(`  URL (Local):   http://localhost:${port}`);
        const ips = getNetworkIPs();
        ips.forEach(ip => {
            console.log(`  URL (Network): http://${ip}:${port}`);
        });
        console.log(`  SQLite Database Storage: ${DB_FILE}`);
        console.log(`=======================================================`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            startServer(port + 1);
        } else {
            console.error("Server error:", err);
        }
    });
}

startServer(PORT);
