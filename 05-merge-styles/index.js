const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'styles');
const distPath = path.join(__dirname, 'project-dist', 'bundle.css');

fs.access(distPath, (err) => {
  if (err && err.code === 'ENOENT') {
    concat();
  } else {
    fs.unlink(distPath, (err) => {
      if (err) throw err;
      concat();
    });
  }
});

const concat = () => {
  fs.readdir(srcPath, { withFileTypes: true }, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
      if (file.isFile() && path.extname(path.join(srcPath, file.name)) === '.css') {
        fs.readFile(path.join(srcPath, file.name), 'utf8', function (err, data) {
          if (err) throw err;
          fs.appendFile(path.join(distPath), data + '\n', (err) => {
            if (err) throw err;
          });
        });
      }
    });
  });
};
