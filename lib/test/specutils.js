/**
 * @fileoverview Utility functions only to be used for tests
 */

define(function()  {

    var defaultCanvasWidth = 300;
    var defaultCanvasHeight = 300;

    var newEmptyCanvas = function() {
        var cv = document.createElement("canvas");
        cv.width = defaultCanvasWidth;
        cv.height = defaultCanvasHeight; 
        return cv;
    }

    /** create a canvas in DOM filled with the given color
     * @param {String} id
     * @param {String} [color="black"] color to fill the canvas with, default to black
     * @return 
     */
    var newColorCanvas = function(color) {
        color = color || "#000";

        var cv = newEmptyCanvas()
        var ctx = cv.getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, cv.width, cv.height);

        return cv;
    };
    
    /**
     * A mask canvas is transparent where pixels should be removed, and not transparent where pixel should be kept
     */
    var newMaskCanvas = function(x, y, width, height) {
        var cv = newEmptyCanvas();
        var ctx = cv.getContext('2d');
        ctx.fillStyle = "FFF";
        ctx.fillRect(x, y, width, height);

        return cv;
    };

    return {
        defaultCanvasWidth : defaultCanvasWidth,
        defaultCanvasHeight : defaultCanvasHeight,
        newEmptyCanvas : newEmptyCanvas,
        newColorCanvas : newColorCanvas,
        newMaskCanvas : newMaskCanvas
    };
});