const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'Data');
const outputFile = path.join(__dirname, '..', 'vocabulary.json');

async function extractText() {
    const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.jpg') || file.endsWith('.png'));
    let vocabulary = [];
    let idCounter = 1;

    console.log(`Found ${files.length} images.`);

    for (const file of files) {
        console.log(`Processing ${file}...`);
        const filePath = path.join(dataDir, file);

        try {
            const { data: { text } } = await Tesseract.recognize(filePath, 'deu', { logger: m => console.log(m) });

            const lines = text.split('\n');
            lines.forEach(line => {
                line = line.trim();
                // Simple heuristic: look for " - " separator or similar common patterns
                // Adjust this regex based on actual image content structure if needed
                const match = line.match(/(.+?)\s*-\s*(.+)/);
                if (match) {
                    // Assuming Left side is Polish, Right side is German based on "Polsko - Niemieckim" description
                    // BUT usually German books might have German - Polish. 
                    // Let's rely on standard detection or prompt user.
                    // The user said "Polsko - Niemieckim", implying Polish first.
                    const pl = match[1].trim();
                    const de = match[2].trim();

                    if (pl && de) {
                        vocabulary.push({
                            id: idCounter++,
                            pl: pl,
                            de: de,
                            sourceInfo: file
                        });
                    }
                }
            });
        } catch (error) {
            console.error(`Error processing ${file}:`, error);
        }
    }

    fs.writeFileSync(outputFile, JSON.stringify(vocabulary, null, 2));
    console.log(`Extraction complete. Saved ${vocabulary.length} words to ${outputFile}`);
}

extractText();
