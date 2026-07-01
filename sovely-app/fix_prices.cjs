const fs = require('fs');
const path = require('path');

const dir = './src';

function walk(d) {
  fs.readdirSync(d).forEach(f => {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.jsx')) {
      let c = fs.readFileSync(p, 'utf8');
      const regex = /price:\s*\(p\.dropshipBasePrice\s*\|\|\s*p\.price\s*\|\|\s*0\)\s*\+\s*30,[\s\S]*?badgeColor:.*?\,/g;
      if (regex.test(c)) {
        c = c.replace(regex, `price: p.price !== undefined ? p.price : (p.dropshipBasePrice || 0) + 30,
              originalPrice: p.originalPrice !== undefined ? p.originalPrice : (p.suggestedRetailPrice || p.dropshipBasePrice || 0) + 30,
              rating: p.averageRating || p.rating || 0,
              reviews: p.reviewCount || p.reviews || 0,
              badge: p.badge || ((p.originalPrice || p.suggestedRetailPrice) > (p.price || p.dropshipBasePrice) ? 'Sale' : null),
              badgeColor: p.badgeColor || '#ef4444',`);
        fs.writeFileSync(p, c);
        console.log('Updated ' + p);
      }
    }
  });
}

walk(dir);
