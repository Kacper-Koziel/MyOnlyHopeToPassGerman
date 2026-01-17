import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, '..', 'Data', 'data.txt');
const outputPath = path.join(__dirname, '..', 'src', 'data', 'vocabulary.json');

try {
    const content = fs.readFileSync(dataPath, 'utf8');
    const lines = content.split('\n');
    const vocabulary = [];
    let idCounter = 1;

    let currentPage = "Unknown";
    let currentChapter = "Unknown";
    let currentLesson = "Unknown";

    for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        if (line.includes('📘 STRONA')) {
            currentPage = line.replace('📘', '').trim();
            continue;
        }
        if (line.startsWith('Kapitel')) {
            currentChapter = line.trim();
            continue;
        }
        if (line.startsWith('Lektion')) {
            currentLesson = line.trim();
            continue;
        }

        let parts = line.split(' – ');
        if (parts.length < 2) {
            parts = line.split(' - ');
        }

        if (parts.length >= 2) {
            const de = parts[0].trim();
            const pl = parts[1].trim();

            if (de && pl) {
                vocabulary.push({
                    id: idCounter++,
                    pl: pl,
                    de: de,
                    page: currentPage,
                    chapter: currentChapter,
                    lesson: currentLesson
                });
            }
        }
    }

    fs.writeFileSync(outputPath, JSON.stringify(vocabulary, null, 2));
    console.log(`Successfully parsed ${vocabulary.length} words.`);

} catch (e) {
    console.error("Error parsing data:", e);
}
