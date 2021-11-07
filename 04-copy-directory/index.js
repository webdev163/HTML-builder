const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'files');

const createDir = () => {
  fs.mkdir(path.join(__dirname, 'files-copy'), { recursive: true }, (err) => {
    if (err) throw err;
    copyFiles(dirPath);
  });
};

const updateDir = () => {
  fs.access(path.join(__dirname, 'files-copy'), (err) => {
    if (err && err.code === 'ENOENT') {
      createDir();
    } else {
      fs.rmdir(path.join(__dirname, 'files-copy'), { recursive: true }, (err) => {
        if (err) throw err;
        createDir();
      });
    }
  });
};

const copyFiles = (currPath) => {
  const newDirPath = path.join(__dirname, 'files-copy');
  fs.readdir(currPath, { withFileTypes: true }, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
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
  });
};

updateDir();
