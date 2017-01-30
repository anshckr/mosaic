# Project Title

Generate the photo-mosaic for images

Creates and exposes a module called PhotoMosaic to manage everything related to the generation of the photo mosaic. To get a better performance and optimization, it uses Promise and Worker (HTML5 features) to process the operations asynchronously, with the former, and the heavy ones in parallel, with the latter.

The PhotoMosaic module, through the generate function, returns a promise so when every tile is processed and loaded. It responds with a canvas with the photomosaic image ready to be displayed.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes

### Download the project
Download or clone the project using following command:
```sh
$ git clone https://github.com/anshckr/mosaic
```

### Project Structure
```
.
├── README
├── css
│   └── main.css
├── js
│   ├── client.js
│   ├── image-helper.js
│   ├── mosaic.js
│   ├── photo-mosaic.js
│   └── worker.js
├── mosaic.html
├── package.json
└── server.js
```

### Prerequisites

* [NodeJs][1] is a must to run this project

### Running
##### Dev Environment

To get the project running -

`npm run start`

Then, open on your browser: http://localhost:8765/

## Code Conventions and Guidelines

* Javascript
  * Summary:
    * indentation should be of 4 space char
  * [Comprehensive code conventions and guidelines][4]
* CSS
  * [BEM - CSS Class Naming Conventions][2]
  * [General CSS Conventions][3]
* HTML - 4 spaces

## Authors

* **Anshul Nema** - [anshckr](https://github.com/anshckr)

[1]: https://nodejs.org/en/download/
[2]: https://github.com/airbnb/css
[3]: http://getbem.com/
