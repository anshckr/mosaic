var ImageHelper = (function () {
    /**
     * Gets the average rgb.
     *
     * @param      {Object}  imageData  The image data
     * @return     {Object}  rgb  Object containing averaged rgb color
     */
    function getAverageRGB(imageData) {
        var length = imageData.data.length,
            blockSize = 5, // only visit every 5 pixels
            i = -4,
            length,
            rgb = { r:0, g:0, b:0 },
            count = 0;

        while ((i += blockSize * 4) < length) {
            ++count;
            rgb.r += imageData.data[i];
            rgb.g += imageData.data[i + 1];
            rgb.b += imageData.data[i + 2];
        }

        rgb.r = Math.floor(rgb.r / count);
        rgb.g = Math.floor(rgb.g / count);
        rgb.b = Math.floor(rgb.b / count);

        return rgb;
    }

    /**
     * Converts the passed rgb color to hex
     *
     * @param      {number}  r       { red, as a number from 0 to 255 }
     * @param      {number}  g       { green, as a number from 0 to 255 }
     * @param      {number}  b       { blue, as a number from 0 to 255 }
     * @return     {string}  { rgb value converted to hex }
     */
    function convertRgbToHex(r, g, b) {
        return '#' +   // return a number sign, plus
        (   // a number calculated by using
            b |          // blue as is,
            g << 8 |     // green shifted up two digits,
            r << 16 |    // red shifted up four digits,
            1 << 24      // and 1 shifted up six digits,
        )
        .toString(16)  // then serialize to a hex string, and
        .slice(1);      // remove the 1 to get the number with 0s intact.
    }

    return {
        getAverageRGB: getAverageRGB,
        convertRgbToHex: convertRgbToHex
    };
})();

var exports = exports || null;
if (exports) {
    exports.ImageHelper = ImageHelper;
}
