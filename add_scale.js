const fs = require('fs');
const files = [
  'app/page.tsx', 
  'app/components/ExpedientesView.tsx', 
  'app/components/DocumentManager.tsx',
  'app/components/CronogramaMaestros.tsx',
  'app/components/CronogramaObra.tsx',
  'app/components/PlanosIngenieria.tsx'
];
for(const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/className=\"([^\"]*bg-[a-z]+-[0-9]+[^\"]*hover:bg-[a-z]+-[0-9]+[^\"]*)\"/g, (match, classes) => {
    if (!classes.includes('active:scale-95') && !classes.includes('hover:scale-105')) {
      return `className=\"${classes} active:scale-95 transition-transform duration-150\"`;
    }
    return match;
  });
  fs.writeFileSync(file, content);
}
console.log('Done replacing button classes');
