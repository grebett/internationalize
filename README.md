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
	-t  --tags				opening and closing tag, separated with a comma (default is '{{,}}')

## License

The MIT License (MIT)
Copyright (c) 2016 grebett

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
