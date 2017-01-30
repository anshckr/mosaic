(function () {
    'use strict';

    var INITAL = 'initial',
      LOADING = 'loading',
      PROCESSING = 'processing',
      ERROR = 'error',
      currentState = INITAL;

    /**
     * renders the image and performs actions.
     *
     * @param      {String}  src  URL of the image
     */
    function render(src) {
        var image = new Image();
        image.onload = function (e) {
            changeState(PROCESSING);
            // generates the photo mosaic from original image
            PhotoMosaic.generate(e.target).then(function (result) {
                changeState(INITAL);
                // Display the canvas result
                document.getElementById('canvas-results').appendChild(result);
            });
        };
        image.src = src;
    }

    /**
     * changes the state while creating mosaic
     */
    function changeState(state) {
        var innerBox = document.querySelector('.box__inner');

        innerBox.className = innerBox.className.replace(currentState, state);
        currentState = state;
    }

    /**
     * renders the image and performs actions.
     *
     * @param      {String}  src  URL of the image
     * @param      {Function}  callback  callback to be invoked after file loads
     */
    function loadImage(src, callback) {
        if (currentState !== INITAL) return;

        changeState(LOADING);

        //  Create FileReader
        var reader = new FileReader();

        //  Prevent any non-image file type from being read.
        if (!src.type.match(/image.*/)){
            console.log('The dropped file is not an image: ', src.type);
            return;
        }

        // Run callback function with the results on load
        reader.onload = function (e) {
            callback(e.target.result);
        };
        reader.readAsDataURL(src);
    }

    /**
     * Determines if canvas supported.
     *
     * @return     {boolean}  True if canvas supported, False otherwise.
     */
    function isCanvasSupported() {
        return !!(window.HTMLCanvasElement);
    }

    document.onreadystatechange = function () {
        if (document.readyState === 'complete') {
            // document ready
            // check if Canvas is supported
            if (!isCanvasSupported()) {
                changeState(ERROR);
                return;
            }

            var dropTarget = document.getElementById('drop-target'),
              fileInput = document.getElementById('image-input');

            // add Drag & Drop actions
            dropTarget.addEventListener('dragover', function (e) {
                e.preventDefault();
            }, true);
            dropTarget.addEventListener('drop', function (e) {
                e.preventDefault();
                // Load image from src then Run the results through the render function.
                loadImage(e.dataTransfer.files[0], render);
            }, true);

            // add File input action
            fileInput.addEventListener('change', function (e) {
                e.preventDefault();
                // Load image from src then Run the results through the render function.
                loadImage(e.target.files[0], render);
            });
        }
    };

})();
