const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'project-dist');
const templatePath = path.join(__dirname, 'template.html');
const stylesDirPath = path.join(__dirname, 'styles');
const assetsDirPath = path.join(__dirname, 'assets');

const createDir = () => {
  fs.mkdir(distPath, { recursive: true }, (err) => {
    if (err) throw err;
    copyTemplate();
    copyFiles(assetsDirPath);
  });
};

const updateDir = () => {
  fs.access(distPath, (err) => {
    if (err && err.code === 'ENOENT') {
      createDir();
    } else {
      fs.rmdir(distPath, { recursive: true }, (err) => {
        if (err) throw err;
        createDir();
      });
    }
  });
};

const copyTemplate = () => {
  fs.copyFile(templatePath, path.join(distPath, 'index.html'), (err) => {
    if (err) throw err;
    readTemplate();
  });
};

const readTemplate = () => {
  fs.readFile(path.join(distPath, 'index.html'), 'utf8', function (err, data) {
    if (err) throw err;
    const filenamesArr = data.match(/(?<={{).+?(?=}})/gm);
    const arr = [];
    filenamesArr.forEach((filename, ndx) => {
      fs.readFile(path.join(__dirname, 'components', `${filename}.html`), 'utf8', (err, data) => {
        if (err) throw err;
        arr.push({ filename, data });
        if (ndx === filenamesArr.length - 1) {
          generateHtml(arr);
        }
      });
    });
  });
};

const generateHtml = (arr) => {
  fs.readFile(path.join(distPath, 'index.html'), 'utf8', function (err, data) {
    if (err) throw err;
    let html = data;
    arr.forEach(el => {
      const regex = `{{${el.filename}}}`;
      html = html.replace(new RegExp(regex, 'm'), el.data);
    });
    fs.writeFile(path.join(distPath, 'index.html'), html, 'utf8', (err) => {
      if (err) throw err;
      concatStyles();
    }); 
  });
};

const concatStyles = () => {
  fs.readdir(stylesDirPath, { withFileTypes: true }, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
      if (file.isFile() && path.extname(path.join(stylesDirPath, file.name)) === '.css') {
        fs.readFile(path.join(stylesDirPath, file.name), 'utf8', function (err, data) {
          if (err) throw err;
          fs.appendFile(path.join(distPath, 'style.css'), data + '\n\n', (err) => {
            if (err) throw err;
          });
        });
      }
    });
  });
};

const copyFiles = (currPath) => {
  const newDirPath = path.join(distPath, 'assets');
  fs.readdir(currPath, { withFileTypes: true }, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
      if (file.isFile()) {
        const relativePath = path.relative(assetsDirPath, currPath);
        const copyFunc = () => {
          fs.copyFile(path.join(assetsDirPath, relativePath, file.name), path.join(newDirPath, relativePath, file.name), (err) => {
            if (err) throw err;
          });
        };
        fs.access(path.join(newDirPath, relativePath), (err) => {
          if (err && err.code === 'ENOENT') {
            fs.mkdir(path.join(newDirPath, relativePath), { recursive: true }, (err) => {
              if (err) throw err;
              copyFunc();
            });
          } else {
            copyFunc();
          }
        });
      } else {
        copyFiles(path.join(currPath, file.name));
      }
    });
  });
};

updateDir();
