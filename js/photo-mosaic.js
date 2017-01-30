var PhotoMosaic = (function () {
    'use strict';

    // limits of image size
    var MAX_HEIGHT = 680,
    MAX_WIDTH = 680;

    /**
       * Resize the image in case it's bigger than the limit size
       *
       * @param      {DOMElement}  img  The image element
       */
    function scaleSize(img) {
        var canvas = document.createElement('canvas'),
                    context = canvas.getContext('2d'),
                    resizedImage = new Image();

        if (img.width < MAX_WIDTH && img.height < MAX_HEIGHT) {
            return img;
        }

        if (img.width > MAX_WIDTH) {
            img.height *= MAX_WIDTH / img.width;
            img.width = MAX_WIDTH;
        }

        if (img.height > MAX_HEIGHT) {
            img.width *= MAX_HEIGHT / img.height;
            img.height = MAX_HEIGHT;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);
        resizedImage.src = canvas.toDataURL();
        return resizedImage;
    }

    /**
     * generates the photo-mosaic
     *
     * @param      {DOMElement}  image  The image element
     */
    function generate(image) {
        var resizedImage = scaleSize(image); // Resize the image in case it's bigger than the limit size

        // Create promise to return the result when the whole canvas is ready
        var promise = new Promise(function (resolve, reject) {
            var canvas = document.createElement('canvas'), context;
            canvas.width = resizedImage.width;
            canvas.height = resizedImage.height;
            context = canvas.getContext('2d');

            // call function to composite the tiles results into a photomosaic of the original image
            var photomosaic = new Mosaic(resizedImage, TILE_WIDTH, TILE_HEIGHT);
            photomosaic.build().then(function (result) {
                var tile, end;

                for (var i = 0; i < result.length; i++) {
                    tile = result[i];
                    context.drawImage(tile.image, tile.x, tile.y, tile.width, tile.height);
                }
                resolve(canvas);
            }, function (err) {
                reject(err);
            });
        });
        return promise;
    }

    function Mosaic(image, width, height) {
        var _originalImage = image,
        _tileWidth = width,
        _tileHeight = height,
        _workersPool = [],
        _workersCount = 4,
        _index = 0,
        _handlers = [];


        function launchWorkers() {
            // Launching every worker
            for (var i = 0; i < _workersCount; i++) {
                var worker = new Worker('js/worker.js');
                worker.onmessage = onWorkerMessage;
                // add to pool
                _workersPool.push(worker);
            }
        }

        function onWorkerMessage(e) {
            var handler = _handlers[e.data.index];
            if (e.data.err){
                handler.reject(e.data.err);
            } else {
                handler.resolve(e.data.result);
            }
        }

        function getWorker() {
            var index = 0;
            function getWorkerFromPool() {
                var worker = _workersPool[index];
                if (index === _workersCount - 1) {
                    index = 0;
                } else {
                    index++;
                }
                return worker;
            }
            // return closure function
            return getWorkerFromPool();
        }

        /**
         * computes the average color of each tile, fetches a tile from the server for that color, and
         * composites the results into a photomosaic of the original image.
         *
         * @return     {Object}  promise  the promise object
         */
        this.build = function () {
            // load workers in advance
            launchWorkers();

            // divide the image into tiles
            var canvas = document.createElement('canvas'),
            dx = canvas.width = _tileWidth,
            dy = canvas.height = _tileHeight,
            ctx = canvas.getContext('2d'),
            cols = _originalImage.width / _tileWidth,
            rows = _originalImage.height / _tileHeight,
            slicedImageList = [],
            total = Math.ceil(rows) * Math.ceil(cols),
            count = 0;

            var promise = new Promise(function (resolve, reject) {
                for (var row = 0; row < rows; row++) {
                    for (var col = 0; col < cols; col++) {
                        // Take snapshot of a part of the source image. The tile.
                        // to divide the image into tiles
                        ctx.drawImage(_originalImage, dx * col, dy * row, dx, dy, 0, 0, dx, dy);

                        // create the tile with the slice
                        var tile = {
                            data: ctx.getImageData(0, 0, dx, dy),
                            width: dx,
                            height: dy,
                            x: dx * col,
                            y: dy * row
                        };

                        slicedImageList.push(tile);

                        // compute its average color
                        getAverageColor(tile.data, count).then(function (result) {
                            // Set the source image to the one fetched from the server for the color
                            var sourceTile = 'color/' + result.colorHex.substring(1),
                            // create an image object and set the url source to preload the image
                            tempImg = new Image();

                            tempImg.onload = function (e) {
                                slicedImageList[result.index].src = e.target.src;
                                slicedImageList[result.index].image = e.target;

                                total--;

                                // when every image is loaded, resolve
                                if (total === 0) {
                                    resolve(slicedImageList);
                                }
                            };

                            tempImg.src = sourceTile;
                        }, function (err) {
                            reject(err);
                        });

                        count++;
                    }
                }
            });
            return promise;
        };

        /**
         * computes the average color of each tile, operation done by the worker.
         *
         * @param      {Object}  imageData  The image data
         * @return     {Number}  index  the tile index
         */
        function getAverageColor(imageData, index) {
            _index++;

            var promise = new Promise(function (resolve, reject) {
                // Add the resolve and reject functions to handler
                // This promise will be called several times so it's necessary to keep a track of it.
                _handlers[_index] = {
                    resolve: resolve,
                    reject: reject
                };
                // start backgroud process via worker.
                // The index property is to find the right handler on return
                // The tileIndex is to find the right tile on return
                getWorker().postMessage({
                    index: _index,
                    imageData: imageData,
                    tileIndex: index
                });
            });

            return promise;
        }
    }

    return {
        generate: generate
    };
})();


var exports = exports || null;
if (exports) {
    exports.PhotoMosaic = PhotoMosaic;
}
