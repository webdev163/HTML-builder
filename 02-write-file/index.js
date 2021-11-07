const fs = require('fs');
const path = require('path');
const { stdin, stdout } = process;

const filePath = path.join(__dirname, 'text.txt');

fs.writeFile(filePath, '', (err) => {
  if (err) throw err;
});

stdout.write('Введите текст для добавления в файл:\n');

stdin.on('data', data => {
  if (data.toString().trim() === 'exit') {
    exit();
  } else {
    fs.appendFile(filePath, data, (err) => {
      if (err) throw err;
    });
  }
});

process.on('SIGINT', function () {
  exit();
});

function exit() {
  stdout.write('Завершение программы, до новых встреч!');
  process.exit();
}