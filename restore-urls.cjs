const fs = require('fs');
const path = require('path');

function fixUrls(dir) {
    fs.readdirSync(dir).forEach(f => {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!['node_modules', '.git', 'dist'].includes(f)) {
                fixUrls(fullPath);
            }
        } else if (f.endsWith('.jsx') || f.endsWith('.js')) {
            let code = fs.readFileSync(fullPath, 'utf8');
            let changed = false;

            // Fix broken API URLs (e.g. import.meta.env... || "http:)
            const apiRegex = /(import\.meta\.env\.VITE_API_URL\s*\|\|\s*["'])http:\s*(?:\r?\n|$)/g;
            if (apiRegex.test(code)) {
                code = code.replace(apiRegex, '$1http://127.0.0.1:8014";\n');
                changed = true;
            }

            if (changed) {
                fs.writeFileSync(fullPath, code);
                console.log(`✅ Restored API URL in: ${f}`);
            }
        }
    });
}

console.log('🚀 Running API URL restorer...');
fixUrls(path.join(__dirname, 'sovely-app', 'src'));
console.log('🎉 API URLs restored!');
