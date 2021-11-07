const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'secret-folder');

fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
  if (err) throw err;
  files.forEach(file => {
    if (file.isFile()) {
      fs.stat(path.join(dirPath, file.name), (err, stats) => {
        if (err) throw err;
        const ext = path.extname(path.join(dirPath, file.name));
        const filename = path.basename(file.name, ext);
        console.log(`${filename} - ${ext.slice(1)} - ${stats.size} bytes`);
      });
    }
  });
});
