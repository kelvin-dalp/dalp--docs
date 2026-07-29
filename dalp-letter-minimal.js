const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType,
    VerticalAlign, ExternalHyperlink, TabStopType, HeightRule, ImageRun
} = require('docx');
const fs = require('fs');
const path = require('path');

// ── Colours ──────────────────────────────────────────────────────────────────
const DARK_NAVY = "0C2340";   // primary dark brand color
const LOGO_BLUE = "0093FB";   // secondary blue brand color
const GRAY_LINE = "E2E8F0";   // separator line color
const TEXT_MUTED = "718096";  // muted gray for body contact details
const WHITE = "FFFFFF";

// ── Borders ───────────────────────────────────────────────────────────────────
const NO_BDR = { style: BorderStyle.NONE, size: 0, color: WHITE };
const NO_BDRS = { top: NO_BDR, bottom: NO_BDR, left: NO_BDR, right: NO_BDR };
const ALL_NO = { ...NO_BDRS, insideH: NO_BDR, insideV: NO_BDR };

// ── Page / layout dims (A4 with generous margins) ─────────────────────────────
const PAGE_W = 11906;
const L_MARGIN = 1150;
const R_MARGIN = 1150;
const BODY_W = PAGE_W - L_MARGIN - R_MARGIN;   // 9606

// Header table column widths – must sum to BODY_W (9606)
const C_LOGO = 1350;      // 90px wide logo (90 * 15 = 1350 dxa)
const C_BRAND = 4056;     // "EDUCATION BEYOND BORDERS" text
const C_CONTACT = 4200;   // contact details

// ── Helper: Edge-to-edge Top Accent Line ──────────────────────────────────────
function topAccentLine() {
    return new Paragraph({
        indent: { left: -1150, right: -1150 },
        spacing: { before: 0, after: 0 },
        children: [
            new ImageRun({
                data: fs.readFileSync(path.join(__dirname, 'outputs', 'top-line-minimal.png')),
                transformation: {
                    width: 794,  // A4 page width in px at 96 DPI
                    height: 4,   // height in px (minimalist line)
                },
            }),
        ],
    });
}

// ── Helper: Centered Bottom Decor Line ────────────────────────────────────────
function bottomDecorLine() {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 0 },
        children: [
            new ImageRun({
                data: fs.readFileSync(path.join(__dirname, 'outputs', 'bottom-decor-minimal.png')),
                transformation: {
                    width: 80,   // centered bar width in px
                    height: 3,   // height in px
                },
            }),
        ],
    });
}

// ── Helper: thin divider ──────────────────────────────────────────────────────
function divider() {
    return new Table({
        width: { size: BODY_W, type: WidthType.DXA },
        columnWidths: [BODY_W],
        borders: ALL_NO,
        rows: [
            new TableRow({
                height: { value: 15, rule: HeightRule.EXACT }, // 0.75pt height
                children: [
                    new TableCell({
                        width: { size: BODY_W, type: WidthType.DXA },
                        shading: { fill: GRAY_LINE, type: ShadingType.CLEAR },
                        children: [new Paragraph({ spacing: { before: 0, after: 0 } })],
                        margins: { top: 0, bottom: 0, left: 0, right: 0 },
                    }),
                ],
            }),
        ],
    });
}

// ── Logo cell (dalp-logo.jpg resized) ─────────────────────────────────────────
function logoCell() {
    return new TableCell({
        width: { size: C_LOGO, type: WidthType.DXA },
        borders: NO_BDRS,
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        verticalAlign: VerticalAlign.CENTER,
        children: [
            new Paragraph({
                spacing: { before: 0, after: 0 },
                children: [
                    new ImageRun({
                        data: fs.readFileSync(path.join(__dirname, 'dalp-logo.jpg')),
                        transformation: {
                            width: 90,  // 90px = 1350 dxa
                            height: 68, // keeping 4:3 aspect ratio
                        },
                    }),
                ],
            }),
        ],
    });
}

// ── Brand cell (with vertical divider line) ───────────────────────────────────
function brandCell() {
    return new TableCell({
        width: { size: C_BRAND, type: WidthType.DXA },
        borders: {
            top: NO_BDR,
            bottom: NO_BDR,
            right: NO_BDR,
            left: { style: BorderStyle.SINGLE, size: 8, color: GRAY_LINE },
        },
        margins: { top: 0, bottom: 0, left: 240, right: 0 },
        verticalAlign: VerticalAlign.CENTER,
        children: [
            new Paragraph({
                spacing: { before: 0, after: 0 },
                children: [new TextRun({ text: "EDUCATION BEYOND BORDERS", bold: true, size: 20, font: "Arial", color: DARK_NAVY })],
            }),
            new Paragraph({
                spacing: { before: 40, after: 0 },
                children: [new TextRun({ text: "CORPORATE LETTERHEAD TEMPLATE", size: 13, font: "Arial", color: LOGO_BLUE, bold: true })],
            }),
        ],
    });
}

// ── Contact cell (right-aligned, elegant) ─────────────────────────────────────
function contactCell() {
    return new TableCell({
        width: { size: C_CONTACT, type: WidthType.DXA },
        borders: NO_BDRS,
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        verticalAlign: VerticalAlign.CENTER,
        children: [
            new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 0, after: 20 },
                children: [
                    new TextRun({ text: "T: ", bold: true, size: 16, font: "Arial", color: DARK_NAVY }),
                    new TextRun({ text: "+260 76 416 8592", size: 16, font: "Arial", color: TEXT_MUTED }),
                ],
            }),
            new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 0, after: 20 },
                children: [
                    new TextRun({ text: "W: ", bold: true, size: 16, font: "Arial", color: DARK_NAVY }),
                    new ExternalHyperlink({
                        link: "http://www.dalpzambia.com",
                        children: [new TextRun({ text: "www.dalpzambia.com", size: 16, font: "Arial", style: "Hyperlink" })],
                    }),
                ],
            }),
            new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 0, after: 0 },
                children: [
                    new TextRun({ text: "A: ", bold: true, size: 16, font: "Arial", color: DARK_NAVY }),
                    new TextRun({ text: "EDU-HUB, 2nd Floor, Omelo Mumba Road, Lusaka", size: 16, font: "Arial", color: TEXT_MUTED }),
                ],
            }),
        ],
    });
}

// ── Header Table ──────────────────────────────────────────────────────────────
function headerTable() {
    return new Table({
        width: { size: BODY_W, type: WidthType.DXA },
        columnWidths: [C_LOGO, C_BRAND, C_CONTACT],
        borders: ALL_NO,
        rows: [
            new TableRow({ children: [logoCell(), brandCell(), contactCell()] }),
        ],
    });
}

// ── Footer content (centered, bullet-separated list) ──────────────────────────
function footerContent() {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 0 },
        children: [
            new TextRun({
                text: "EDU-HUB, 2nd Floor, Omelo Mumba Road, Rhodespark, Lusaka, Zambia",
                size: 15, font: "Arial", color: TEXT_MUTED
            }),
            new TextRun({ text: "   •   ", size: 16, bold: true, color: LOGO_BLUE }),
            new TextRun({
                text: "+260764168592",
                size: 15, font: "Arial", color: TEXT_MUTED
            }),
            new TextRun({ text: "   •   ", size: 16, bold: true, color: LOGO_BLUE }),
            new ExternalHyperlink({
                link: "mailto:info@dalpzambia.com",
                children: [
                    new TextRun({
                        text: "info@dalpzambia.com",
                        size: 15, font: "Arial", style: "Hyperlink"
                    }),
                ],
            }),
        ],
    });
}

// ── Document ──────────────────────────────────────────────────────────────────
const doc = new Document({
    sections: [{
        properties: {
            page: {
                size: { width: PAGE_W, height: 16838 },
                margin: {
                    top: 2100,   // generous breathing room
                    bottom: 1440,
                    left: L_MARGIN,
                    right: R_MARGIN,
                    header: 280,
                    footer: 280,
                },
            },
        },

        headers: {
            default: new Header({
                children: [
                    topAccentLine(),                         // minimalist top accent bar
                    new Paragraph({ spacing: { before: 200, after: 0 } }),
                    headerTable(),                           // logo + brand + contact
                    new Paragraph({ spacing: { before: 150, after: 0 } }),
                    divider(),                               // subtle gray horizontal divider
                ],
            }),
        },

        footers: {
            default: new Footer({
                children: [
                    divider(),                               // subtle gray horizontal divider
                    footerContent(),                         // centered bulleted contact list
                    bottomDecorLine(),                       // minimalist bottom decor bar
                ],
            }),
        },

        // Empty body – letter template
        children: [
            new Paragraph({ children: [new TextRun("")] }),
        ],
    }],
});

// ── Write ─────────────────────────────────────────────────────────────────────
Packer.toBuffer(doc).then(buf => {
    const outputDir = path.join(__dirname, 'outputs');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    const outputPath = path.join(outputDir, 'DALP_Letterhead_Minimal.docx');
    fs.writeFileSync(outputPath, buf);
    console.log(`✅  DALP_Letterhead_Minimal.docx written successfully to: ${outputPath}`);
}).catch(err => {
    console.error('❌  Error:', err);
    process.exit(1);
});
