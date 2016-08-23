# internationalize

## About the tool
This simple Node.js CLI tools reads from JSON files some translation keys and applies them to the specific template, creating new internationalized files.

First thought to be used with MJML produced HTML files, but it can handle any other type of files containing variables.

## Caveat
This project is not yet designed to be a npm package. This may be done in the near future.

## Usage
Basic usage is:
`node internationalize.js --lang=en`

Here is the complete list of options available:

	-l  --lang				[required] the list of languages to apply, separated with commas
	-d  --delete			delete the source file after reading it
	-f  --file				read a specific file (default is 'index.html')
	-h  --help				display help
	-i  --input-directory	translation keys directory (default is './lang')
