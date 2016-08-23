const fs = require('fs');
const argv = require('yargs').argv;
const chalk = require('chalk');
const rimraf = require('rimraf');

// display help
if (argv.h || argv.help) {
    console.log('Thank you for using internationalize.js tool. Basic usage is:\nnode internationalize.js --lang=en\n')
    console.log('Here is the complete list of options available:\n');
    console.log(`    --lang\t${chalk.bold('[required]')} the list of languages to apply, separated with commas`);
    console.log('-d  --delete\tdelete the source file after reading it');
    console.log('-f  --file\tread a specific file (default is \'index.html\')');
    console.log('-h  --help\tdisplay this current help');
    console.log('-i  --input-directory\ttranslation keys directory (default is \'./lang\') ');
    return;
}

// arguments errors
if (argv.lang === undefined || typeof argv.lang !== 'string') {
    console.error(chalk.red(`Error: you must provide at least a language argument! Use ${chalk.white('node internationalize.js -h')} for help.`));
    return;
}

// read the source file (by defaut `index.html`)
try {
  var filename = typeof argv.f === 'string' ? argv.f : 'index.html';
    var src = fs.readFileSync(`./${filename}`).toString();

    // delete source file if -d option is on
    if (argv.d) {
      rimraf.sync(filename);
    }
} catch (e) {
    if (e.message.match(/ENOENT/)) {
        console.error(chalk.red(`Error: internationalize tried to read ${chalk.white(filename)} but it does not exists.`));
    } else {
        console.error(chalk.red(e.stack));
    }
    return;
}

// internationalize logic
var internationalize = (src, filename, inputDirectory, lang) => {
  return new Promise((resolve, reject) => {
    // get language translation keys and handle file errors
    fs.readFile(`${inputDirectory}/${lang}.json`, (error, file) => {
      if (error) {
        if (error.code === 'ENOENT') {
          reject(chalk.red(`Error: the ${chalk.white(lang)} language is not yet supported! Check if ${chalk.white(error.path)} file exists.`));
        } else {
          reject(chalk.red(error.stack));
        }
      } else {
        // parse JSON and handle error
        try {
          translations = JSON.parse(file.toString());
        } catch (e) {
          reject(e.stack);
        }

        // apply translations keys
        var regex = new RegExp(Object.keys(translations).map((key) => `{{${key}}}`).join('|'), 'gi');
        var result = src.replace(regex, function(matched){
          return translations[matched.substr(2, matched.length - 4)];
        });
        fs.writeFile(`./index_${lang}.html`, result, error => {
          if (error) {
            throw error;
          } else {
            resolve(chalk.green(`Success: ${filename} has been internationalized with ${lang} translation keys.`));
          }
        });
      }
    });
  });
}

// main
var langs = argv.lang.split(',');
var inputDirectoryOption = argv.i || argv.inputDirectory;
var inputDirectory = typeof inputDirectoryOption === 'string' ? inputDirectoryOption.replace(/\/+$/, '') : './lang';
if (inputDirectoryOption === '/') inputDirectory = '/';

for (var i = 0; i < langs.length; i++) {
  internationalize(src, filename, inputDirectory, langs[i]).then(result => {
    console.log(result);
  }, error => {
    console.error(chalk.red(error));
  });
}