const fs = require('fs');
const path = require('path');
const argv = require('yargs').argv;
const chalk = require('chalk');
const rimraf = require('rimraf');

// display help
if (argv.h || argv.help) {
    console.log('Thank you for using internationalize.js tool. Basic usage is:\nnode internationalize.js --lang=en\n')
    console.log('Here is the complete list of options available:\n');
    console.log(`-l  --lang\t\t${chalk.bold('[required]')} the list of languages to apply, separated with commas`);
    console.log('-u  --unlink\t\tdelete the source file after reading it');
    console.log('-f  --file\t\tread a specific file (default is \'index.html\')');
    console.log('-h  --help\t\tdisplay this current help');
    console.log('-i  --input-directory\ttranslation keys directory (default is \'./lang\')');
    console.log('-t  --tags\t\topening and closing tag, separated with a comma (default is \'{{,}}\')');
    console.log('-d  --output-directory\tdestination directory of the output file (default is ./dist)');
    console.log('-o  --output-name\toutput file name (default is input file name + "_" + lang)');
    return;
}

// arguments errors
if ((argv.lang === undefined && argv.l === undefined) || (typeof argv.lang !== 'string' && typeof argv.l !== 'string')) {
    console.error(chalk.red(`Error: you must provide at least a language argument! Use ${chalk.white('node internationalize.js -h')} for help.`));
    return;
}

// read the source file (by defaut `index.html`)
try {
  var filename = argv.f || argv.file ? argv.f || argv.file : 'index.html';
  var src = fs.readFileSync(`${filename}`).toString();

  // delete source file if -d option is on
  if (argv.u || argv.unlink) {
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
        var regex = new RegExp(escaped, 'gi');
        var result = src.replace(regex, matched => {
          var key = matched.substring(tags[0].length, matched.length - tags[1].length);

          return translations[key];
        });

        // create path according to option values
        var dist = '.';
        var outpuname;
        var inputname = argv.f || argv.file || 'index.html';
        inputname = inputname.split('/');
        inputname = inputname[inputname.length - 1];

        // if the output name is provided, take it as it is
        if (typeof argv.o === 'string' || typeof argv['output-name'] === 'string') {
          outputname = argv.o || argv['output-name'];
        } else {
          outputname = inputname.replace(/\..*$/, '');
          outputname += `_${lang}.html`;
        }

        // is there a dist directory provided?
        dist = argv.d || argv['output-directory'] || './dist';

        // create the dist directory if not exists
        if (!fs.existsSync(dist)){
          fs.mkdirSync(dist);
        }

        // write the file
        fs.writeFile(path.join(dist, outputname), result, error => {
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
var langs = argv.l ? argv.l.split(',') : argv.lang.split(',');
var tagsOption = argv.t || argv.tags;
var tags = tagsOption ? tagsOption.split(',') : ['{{', '}}'];

if (tags.length !== 2) {
  console.error(chalk.red(`The tags given in argument must match the following pattern: opening_tag,closing_tag`));
  return;
}

var inputDirectoryOption = argv.i || argv.inputDirectory;
var inputDirectory = inputDirectoryOption ? inputDirectoryOption.replace(/\/+$/, '') : './lang';
if (inputDirectoryOption === '/') {
  inputDirectory = '/';
}

for (var i = 0; i < langs.length; i++) {
  internationalize(src, filename, inputDirectory, langs[i], tags).then(result => {
    console.log(result);
  }, error => {
    console.error(chalk.red(error));
  });
}
