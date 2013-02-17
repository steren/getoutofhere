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
    
    var newAnomalyColorCanvas = function(color, anomalyRect, anomalyColor) {
        var cv = newColorCanvas(color || "#FFF");
        var ctx = cv.getContext('2d');
        ctx.fillStyle = anomalyColor || "#000";
        ctx.fillRect(anomalyRect.x, anomalyRect.y, anomalyRect.width, anomalyRect.heigth);
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

    var expectSameColor = function (imageData1, imageData2, x, y) {
        expect(imageData1.data[4 * (imageData1.width * y + x)    ]).toBe(imageData2.data[4 * (imageData2.width * y + x)    ]);
        expect(imageData1.data[4 * (imageData1.width * y + x) + 1]).toBe(imageData2.data[4 * (imageData2.width * y + x) + 1]);
        expect(imageData1.data[4 * (imageData1.width * y + x) + 2]).toBe(imageData2.data[4 * (imageData2.width * y + x) + 2]);
        expect(imageData1.data[4 * (imageData1.width * y + x) + 3]).toBe(imageData2.data[4 * (imageData2.width * y + x) + 3]);
    };

    var expectColor = function (imageData1, color, x, y) {
        expect(imageData1.data[4 * (imageData1.width * y + x)    ]).toBe(color[0]);
        expect(imageData1.data[4 * (imageData1.width * y + x) + 1]).toBe(color[1]);
        expect(imageData1.data[4 * (imageData1.width * y + x) + 2]).toBe(color[2]);
        expect(imageData1.data[4 * (imageData1.width * y + x) + 3]).toBe(color[3]);
    };

    return {
        defaultCanvasWidth : defaultCanvasWidth,
        defaultCanvasHeight : defaultCanvasHeight,
        newEmptyCanvas : newEmptyCanvas,
        newColorCanvas : newColorCanvas,
        newAnomalyColorCanvas : newAnomalyColorCanvas,
        newMaskCanvas : newMaskCanvas,
        expectSameColor : expectSameColor,
        expectColor : expectColor
    };
});