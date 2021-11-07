const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

const srcPath = path.join(__dirname, 'styles');
const distPath = path.join(__dirname, 'project-dist', 'bundle.css');

const initFunc = async () => {
  await fsp.unlink(distPath).catch(err => {
    if (err && err.code === 'ENOENT') {
      return;
    } else console.error(err);
  });
  const files = await fsp.readdir(srcPath, { withFileTypes: true }).catch(err => console.error(err));
  files.forEach(async file => {
    if (file.isFile() && path.extname(path.join(srcPath, file.name)) === '.css') {
      await fsp.readFile(path.join(srcPath, file.name), 'utf8')
        .then(data => {
          fs.appendFile(path.join(distPath), '\n' + data + '\n/* --------- divider --------- */\n', (err) => {
            if (err) throw err;
          });
        })
        .catch(err => console.error(err));
    }
  });
};

initFunc().catch(err => console.error(err));
