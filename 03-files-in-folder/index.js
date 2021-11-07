const fsp = require('fs').promises;
const path = require('path');
const { stdout } = process;

const dirPath = path.join(__dirname, 'secret-folder');

const listFiles = async () => {
  const dataArr = await fsp.readdir(dirPath, { withFileTypes: true });
  dataArr.forEach(async file => {
    if (file.isFile()) {
      await fsp.stat(path.join(dirPath, file.name))
        .then(stats => {
          const ext = path.extname(path.join(dirPath, file.name));
          const filename = path.basename(file.name, ext);
          stdout.write(`${filename} - ${ext.slice(1)} - ${stats.size} bytes\n`);
        })
        .catch(err => console.error(err));
    }
  });
};

listFiles().catch(err => console.error(err));
