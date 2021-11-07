const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

const distPath = path.join(__dirname, 'project-dist');
const templatePath = path.join(__dirname, 'template.html');
const stylesDirPath = path.join(__dirname, 'styles');
const assetsDirPath = path.join(__dirname, 'assets');

const initFunc = async () => {
  await fsp.rm(distPath, { recursive: true }).catch(err => {
    if (err && err.code === 'ENOENT') {
      return;
    } else console.error(err);
  });
  await fsp.mkdir(distPath, { recursive: true }).catch(err => console.error(err));
  createHtml();
  copyFiles(assetsDirPath);
  concatStyles();
};

const createHtml = async () => {
  await fsp.copyFile(templatePath, path.join(distPath, 'index.html')).catch(err => console.error(err));
  await fsp.readFile(path.join(distPath, 'index.html'), 'utf8')
    .then(data => {
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
    })
    .catch(err => console.error(err));
};

const generateHtml = async arr => {
  await fsp.readFile(path.join(distPath, 'index.html'), 'utf8')
    .then(data => {
      let html = data;
      arr.forEach(el => {
        const regex = `{{${el.filename}}}`;
        html = html.replace(new RegExp(regex, 'm'), el.data);
      });
      fs.writeFile(path.join(distPath, 'index.html'), html, 'utf8', (err) => {
        if (err) throw err;
      });
    })
    .catch(err => console.error(err));
};

const concatStyles = async () => {
  await fsp.readdir(stylesDirPath, { withFileTypes: true })
    .then(files => {
      files.forEach(async file => {
        if (file.isFile() && path.extname(path.join(stylesDirPath, file.name)) === '.css') {
          await fsp.readFile(path.join(stylesDirPath, file.name), 'utf8')
            .then(data => {
              fs.appendFile(path.join(distPath, 'style.css'), '\n' + data + '\n/* --------- divider --------- */\n', (err) => {
                if (err) throw err;
              });
            })
            .catch(err => console.error(err));
        }
      });
    })
    .catch(err => console.error(err));
};

const copyFiles = async currPath => {
  const newDirPath = path.join(distPath, 'assets');
  await fsp.readdir(currPath, { withFileTypes: true })
    .then(files => {
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

initFunc().catch(err => console.error(err));
