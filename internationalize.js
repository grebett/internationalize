const fs = require('fs');
const argv = require('yargs').argv;
const chalk = require('chalk');
const rimraf = require('rimraf');

// display help
if (argv.h || argv.help) {
    console.log('Thank you for using internationalize.js tool. Basic usage is:\nnode internationalize.js --lang=en\n')
    console.log('Here is the complete list of options available:\n');
    console.log(`-l  --lang\t${chalk.bold('[required]')} the list of languages to apply, separated with commas`);
    console.log('-d  --delete\tdelete the source file after reading it');
    console.log('-f  --file\tread a specific file (default is \'index.html\')');
    console.log('-h  --help\tdisplay this current help');
    console.log('-i  --input-directory\ttranslation keys directory (default is \'./lang\') ');
    console.log('-t  --tags\topening and closing tag, separated with a comma (default is \'{{,}}\') ');
    return;
}

// arguments errors
if ((argv.lang === undefined && argv.l === undefined) || (typeof argv.lang !== 'string' && typeof argv.l !== 'string')) {
    console.error(chalk.red(`Error: you must provide at least a language argument! Use ${chalk.white('node internationalize.js -h')} for help.`));
    return;
}

// read the source file (by defaut `index.html`)
try {
  var filename = typeof argv.f === 'string' ? argv.f : 'index.html';
    var src = fs.readFileSync(`${filename}`).toString();

    // delete source file if -d option is on
    if (argv.d) {
      rimraf.sync(filename);
    }
} catch (e) {
    console.log(e); return;
    if (e.message.match(/ENOENT/)) {
        console.error(chalk.red(`Error: internationalize tried to read ${chalk.white(filename)} but it does not exists.`));
    } else {
        console.error(chalk.red(e.stack));
    }
    return;
}

// internationalize logic
var internationalize = (src, filename, inputDirectory, lang, tags) => {
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
        var str = Object.keys(translations).map((key) => `${tags[0]}${key}${tags[1]}`).join('|');
        var escaped = str.replace(/[-[\]{}()*+?.,\\^$#\s]/g, '\\$&');

        // return;
        var regex = new RegExp(escaped, 'gi');
        var result = src.replace(regex, matched => {
          var key = matched.substring(tags[0].length, matched.length - tags[1].length);

          return translations[key];
        });
        fs.writeFile(`./index_${lang}.html`, result, error => {
          if (error) {
            throw error;
          } else {
            resolve(chalk.green(`Success: ${chalk.white(filename)} has been internationalized with ${chalk.white(lang)} translation keys.`));
          }
        });
      }
    });
  });
}


// MAIN
var langs = argv.l !== undefined ? argv.l.split(',') : argv.lang.split(',');
var tagsOption = argv.t || argv.tags || undefined;
var tags = tagsOption !== undefined && typeof tagsOption === 'string' ? tagsOption.split(',') : ['{{', '}}'];

if (tags.length !== 2) {
  console.error(chalk.red(`The tags given in argument must match the following pattern: opening_tag,closing_tag`));
  return;
}

var inputDirectoryOption = argv.i || argv.inputDirectory;
var inputDirectory = typeof inputDirectoryOption === 'string' ? inputDirectoryOption.replace(/\/+$/, '') : './lang';
if (inputDirectoryOption === '/') inputDirectory = '/';

for (var i = 0; i < langs.length; i++) {
  internationalize(src, filename, inputDirectory, langs[i], tags).then(result => {
    console.log(result);
  }, error => {
    console.error(chalk.red(error));
  });
}
