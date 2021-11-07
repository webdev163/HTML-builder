const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

const dirPath = path.join(__dirname, 'files');

const initFunc = async () => {
  await fsp.rm(path.join(__dirname, 'files-copy'), { recursive: true }).catch(err => {
    if (err && err.code === 'ENOENT') {
      return;
    } else console.error(err);
  });
  await fsp.mkdir(path.join(__dirname, 'files-copy'), { recursive: true }).catch(err => console.error(err));
  copyFiles(dirPath);
};

initFunc().catch(err => console.error(err));

const copyFiles = async currPath => {
  const newDirPath = path.join(__dirname, 'files-copy');
  const files = await fsp.readdir(currPath, { withFileTypes: true }).catch(err => console.error(err));
  files.forEach(async file => {
    if (file.isFile()) {
      const relativePath = path.relative(dirPath, currPath);
      const copyFunc = () => {
        fs.copyFile(path.join(dirPath, relativePath, file.name), path.join(newDirPath, relativePath, file.name), (err) => {
          if (err) throw err;
        });
      };
      fs.access(path.join(newDirPath, relativePath), (err) => {
        if (err && err.code === 'ENOENT') {
          fs.mkdir(path.join(newDirPath, relativePath), (err) => {
            if (err && err.code === 'EEXIST') {
              copyFunc();
            }
          });
        }
        copyFunc();
      });
    } else {
      copyFiles(path.join(currPath, file.name));
    }
  });
};
