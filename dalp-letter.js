const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType,
    VerticalAlign, ExternalHyperlink, TabStopType, HeightRule, ImageRun
} = require('docx');
const fs = require('fs');
const path = require('path');

// ── Colours ──────────────────────────────────────────────────────────────────
const DARK_NAVY = "0C2340";   // top / bottom accent bars
const LOGO_BLUE = "0093FB";   // DALP logo blue (sampled from logo file)
const NAVY_TEXT = "0C2340";   // "EDUCATION BEYOND BORDERS" text
const WHITE = "FFFFFF";

// ── Borders ───────────────────────────────────────────────────────────────────
const NO_BDR = { style: BorderStyle.NONE, size: 0, color: WHITE };
const NO_BDRS = { top: NO_BDR, bottom: NO_BDR, left: NO_BDR, right: NO_BDR };
const ALL_NO = { ...NO_BDRS, insideH: NO_BDR, insideV: NO_BDR };

// ── Page / layout dims (A4) ───────────────────────────────────────────────────
// A4: 11906 × 16838 DXA  |  margins L/R 1000 DXA (~0.69")
const PAGE_W = 11906;
const L_MARGIN = 1000;
const R_MARGIN = 1000;
const BODY_W = PAGE_W - L_MARGIN - R_MARGIN;   // 9906

// Header table column widths – must sum to BODY_W (9906)
const C_LOGO = 1800;      // Fits the 120px wide logo (120 * 15 = 1800 dxa)
const C_ORG = 3906;       // "EDUCATION BEYOND BORDERS"
const C_CONTACT = 4200;   // phone / web / address

// ── Helpers: Edge-to-edge Accent Bars (rendered via Puppeteer PNGs) ───────────
function topAccentBar() {
    return new Paragraph({
        indent: { left: -1000, right: -1000 },
        spacing: { before: 0, after: 0 },
        children: [
            new ImageRun({
                data: fs.readFileSync(path.join(__dirname, 'outputs', 'header-bar-exact.png')),
                transformation: {
                    width: 794,  // A4 page width in px at 96 DPI
                    height: 40,  // height in px
                },
            }),
        ],
    });
}

function bottomAccentBar() {
    return new Paragraph({
        indent: { left: -1000, right: -1000 },
        spacing: { before: 0, after: 0 },
        children: [
            new ImageRun({
                data: fs.readFileSync(path.join(__dirname, 'outputs', 'footer-bar-exact.png')),
                transformation: {
                    width: 794,
                    height: 40,
                },
            }),
        ],
    });
}

// ── Helper: bi-color horizontal separator ─────────────────────────────────────
function separator() {
    const w_navy = Math.round(BODY_W * 0.55); // 5448 dxa
    const w_blue = BODY_W - w_navy;           // 4458 dxa
    return new Table({
        width: { size: BODY_W, type: WidthType.DXA },
        columnWidths: [w_navy, w_blue],
        borders: ALL_NO,
        rows: [
            new TableRow({
                height: { value: 30, rule: HeightRule.EXACT }, // thin 1.5pt height
                children: [
                    new TableCell({
                        width: { size: w_navy, type: WidthType.DXA },
                        shading: { fill: DARK_NAVY, type: ShadingType.CLEAR },
                        children: [new Paragraph({ spacing: { before: 0, after: 0 } })],
                        margins: { top: 0, bottom: 0, left: 0, right: 0 },
                    }),
                    new TableCell({
                        width: { size: w_blue, type: WidthType.DXA },
                        shading: { fill: LOGO_BLUE, type: ShadingType.CLEAR },
                        children: [new Paragraph({ spacing: { before: 0, after: 0 } })],
                        margins: { top: 0, bottom: 0, left: 0, right: 0 },
                    }),
                ],
            }),
        ],
    });
}

// ── Logo cell (insert dalp-logo.jpg) ──────────────────────────────────────────
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
                            width: 120, // 120px = 1800 dxa (fits C_LOGO)
                            height: 90,  // keeps aspect ratio
                        },
                    }),
                ],
            }),
        ],
    });
}

// ── Org-name cell ─────────────────────────────────────────────────────────────
function orgCell() {
    return new TableCell({
        width: { size: C_ORG, type: WidthType.DXA },
        borders: NO_BDRS,
        margins: { top: 80, bottom: 80, left: 240, right: 120 },
        verticalAlign: VerticalAlign.CENTER,
        children: [
            new Paragraph({
                spacing: { before: 0, after: 0 },
                children: [new TextRun({ text: "EDUCATION", bold: true, size: 28, font: "Arial", color: NAVY_TEXT })],
            }),
            new Paragraph({
                spacing: { before: 0, after: 0 },
                children: [new TextRun({ text: "BEYOND BORDERS", bold: true, size: 28, font: "Arial", color: NAVY_TEXT })],
            }),
        ],
    });
}

// ── Contact-info cell ─────────────────────────────────────────────────────────
function contactCell() {
    return new TableCell({
        width: { size: C_CONTACT, type: WidthType.DXA },
        borders: {
            top: NO_BDR,
            bottom: NO_BDR,
            right: NO_BDR,
            left: { style: BorderStyle.SINGLE, size: 16, color: LOGO_BLUE }, // 2pt left border
        },
        margins: { top: 80, bottom: 80, left: 220, right: 120 },
        verticalAlign: VerticalAlign.CENTER,
        children: [
            new Paragraph({
                spacing: { before: 0, after: 20 },
                children: [
                    new TextRun({ text: "Phone: ", bold: true, size: 18, font: "Arial", color: NAVY_TEXT }),
                    new TextRun({ text: "+260764168592", size: 18, font: "Arial" }),
                ],
            }),
            new Paragraph({
                spacing: { before: 0, after: 20 },
                children: [
                    new TextRun({ text: "Web: ", bold: true, size: 18, font: "Arial", color: NAVY_TEXT }),
                    new ExternalHyperlink({
                        link: "http://www.dalpzambia.com",
                        children: [new TextRun({ text: "www.dalpzambia.com", size: 18, font: "Arial", style: "Hyperlink" })],
                    }),
                ],
            }),
            new Paragraph({
                spacing: { before: 0, after: 20 },
                children: [
                    new TextRun({ text: "ADD: ", bold: true, size: 18, font: "Arial", color: NAVY_TEXT }),
                    new TextRun({ text: "EDU-HUB, 2nd Floor,", size: 18, font: "Arial" }),
                ],
            }),
            new Paragraph({
                spacing: { before: 0, after: 0 },
                indent: { left: 450 },
                children: [
                    new TextRun({ text: "Omelo Mumba Road, Lusaka, Zambia", size: 18, font: "Arial" }),
                ],
            }),
        ],
    });
}

// ── Header table ──────────────────────────────────────────────────────────────
function headerTable() {
    return new Table({
        width: { size: BODY_W, type: WidthType.DXA },
        columnWidths: [C_LOGO, C_ORG, C_CONTACT],
        borders: ALL_NO,
        rows: [
            new TableRow({ children: [logoCell(), orgCell(), contactCell()] }),
        ],
    });
}

// ── Footer row (3 columns with image icons) ───────────────────────────────────
function footerContent() {
    return new Table({
        width: { size: BODY_W, type: WidthType.DXA },
        columnWidths: [5200, 2300, 2406],
        borders: ALL_NO,
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 5200, type: WidthType.DXA },
                        verticalAlign: VerticalAlign.CENTER,
                        children: [
                            new Paragraph({
                                spacing: { before: 0, after: 0 },
                                children: [
                                    new ImageRun({
                                        data: fs.readFileSync(path.join(__dirname, 'outputs', 'pin.png')),
                                        transformation: { width: 12, height: 12 },
                                    }),
                                    new TextRun({
                                        text: "  EDU-HUB, 2nd Floor, Omelo Mumba Road, Rhodespark, Lusaka, Zambia",
                                        size: 16, font: "Arial", color: "333333"
                                    }),
                                ],
                              }),
                          ],
                      }),
                      new TableCell({
                          width: { size: 2300, type: WidthType.DXA },
                          verticalAlign: VerticalAlign.CENTER,
                          children: [
                              new Paragraph({
                                  spacing: { before: 0, after: 0 },
                                  children: [
                                      new ImageRun({
                                          data: fs.readFileSync(path.join(__dirname, 'outputs', 'phone.png')),
                                          transformation: { width: 12, height: 12 },
                                      }),
                                      new TextRun({
                                          text: "  +260764168592",
                                          size: 16, font: "Arial", color: "333333"
                                      }),
                                  ],
                              }),
                          ],
                      }),
                      new TableCell({
                          width: { size: 2406, type: WidthType.DXA },
                          verticalAlign: VerticalAlign.CENTER,
                          children: [
                              new Paragraph({
                                  spacing: { before: 0, after: 0 },
                                  children: [
                                      new ImageRun({
                                          data: fs.readFileSync(path.join(__dirname, 'outputs', 'envelope.png')),
                                          transformation: { width: 12, height: 12 },
                                      }),
                                      new TextRun({ text: "  ", size: 16 }),
                                      new ExternalHyperlink({
                                          link: "mailto:info@dalpzambia.com",
                                          children: [
                                              new TextRun({
                                                  text: "info@dalpzambia.com",
                                                  size: 16, font: "Arial", style: "Hyperlink"
                                              }),
                                          ],
                                      }),
                                  ],
                              }),
                          ],
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
                    top: 2100,   // gives header room to breathe
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
                    topAccentBar(),                          // edge-to-edge curved top accent bar
                    new Paragraph({ spacing: { before: 180, after: 0 } }), // spacing
                    headerTable(),                           // logo + brand + contact
                    new Paragraph({ spacing: { before: 100, after: 0 } }), // spacing
                    separator(),                             // bi-color horizontal line
                ],
            }),
        },

        footers: {
            default: new Footer({
                children: [
                    footerContent(),                         // 3-column contact details with SVG icons
                    new Paragraph({ spacing: { before: 150, after: 0 } }), // spacing
                    bottomAccentBar(),                       // edge-to-edge curved bottom accent bar
                ],
            }),
        },

        // Empty body – this is a template letterhead
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
    const outputPath = path.join(outputDir, 'DALP_Letterhead.docx');
    fs.writeFileSync(outputPath, buf);
    console.log(`✅  DALP_Letterhead.docx written successfully to: ${outputPath}`);
}).catch(err => {
    console.error('❌  Error:', err);
    process.exit(1);
});