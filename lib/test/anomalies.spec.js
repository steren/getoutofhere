/**
 * @fileoverview Tests on anomalies detection and deletion
 */
/* global describe, it, expect */

define([
  'app/getoutofhere',
  'specutils'
], function (GOOH, SpecUtils) {

    var displayCanvases = true;

    /**
     * @param img element
     * @param {String} title: title of the image
     */
    var appendCanvas = function(img, title) {
        if(displayCanvases) {
            document.body.appendChild(img);
            var titleElement = document.createElement("p");
            if(title) {
                titleElement.innerHTML = title;
            }
            document.body.appendChild(titleElement);
            document.body.appendChild(img);
        }
    };

    describe("Image merging", function() {
        it("should be able to take a part of one image using a mask and merge it on another", function() {
            // create first image on which to paste something
            var background = SpecUtils.newColorCanvas("rgb(100, 0, 0)");
            // create second image from which to take something
            var foregroud = SpecUtils.newColorCanvas("rgb(0, 0, 100)");        
            // create an alpha mask
            var maskParams = { x : 50, y: 50, width: 50, heigth: 50};
            var mask = SpecUtils.newMaskCanvas(maskParams.x, maskParams.y, maskParams.width, maskParams.heigth);
            // the result canvas
            var result = SpecUtils.newColorCanvas();
            
            GOOH.mergeImages(background, foregroud, mask, result);
            
            var resultContent = result.getContext('2d').getImageData(0, 0, result.width, result.height);
            // pixels not in mask should be background
            expect(resultContent.data[0]).toBe(100);
            expect(resultContent.data[2]).toBe(0);

            // pixels in mask should be foreground
            expect(resultContent.data[ 4 * (maskParams.x + maskParams.y * resultContent.width)]).toBe(0);
            expect(resultContent.data[ 4 * (maskParams.x + maskParams.y * resultContent.width) + 2 ]).toBe(100);
        });
    });
        
    describe("Image comparison", function() {
        it("should do a simple diff between images", function() {
            var diffParams = { x : 5, y: 0, width: 50, heigth: 50};
            // red canvas
            var img1 = SpecUtils.newColorCanvas("rgb(100, 0, 0)");
            
            // new red canvas, with a white rectangle
            var img2 = SpecUtils.newAnomalyColorCanvas("rgb(100, 0, 0)", diffParams, 'rgb(150, 0, 0)');  

            appendCanvas(img1);
            appendCanvas(img2);
            
            var result = SpecUtils.newEmptyCanvas();
            GOOH.diff(img1, img2, 5, result);
            appendCanvas(result, "Final diff");
            
            var resultContent = result.getContext('2d').getImageData(0, 0, result.width, result.height);
            
            expect(resultContent.data[0]).toBe(0);
            expect(resultContent.data[1]).toBe(0);
            expect(resultContent.data[2]).toBe(0);
            expect(resultContent.data[3]).toBe(0);
            
            expect(resultContent.data[4 * (diffParams.x + diffParams.y * resultContent.width) + 3]).not.toBe(0);
        });
    });

    describe("Remove anomalies", function() {
        it("From 3 images with one containing an anomaly, should return an image identical to the one without anomaly", function() {
            var diffParams = { x : 3, y: 0, width: 50, heigth: 50};
            // green canvas
            var imgClean1 = SpecUtils.newColorCanvas("rgb(100, 100, 0)");
            appendCanvas(imgClean1);

            var imgClean2 = SpecUtils.newColorCanvas("rgb(100, 100, 0)");
            appendCanvas(imgClean2);

            // new green canvas, with a white rectangle
            var imgWithAnomaly = SpecUtils.newAnomalyColorCanvas("rgb(100, 100, 0)", diffParams, "rgb(0, 0, 0)");  
            appendCanvas(imgWithAnomaly, "Image with anomaly");
            
            var inputs = [imgClean1, imgClean2, imgWithAnomaly];

            var result = SpecUtils.newEmptyCanvas();
            GOOH.process(inputs, {}, result);
            appendCanvas(result, "Process result of GOOH");

            var imgClean1Content = imgClean1.getContext('2d').getImageData(0, 0, imgClean1.width, imgClean1.height);            
            var resultContent = result.getContext('2d').getImageData(0, 0, result.width, result.height);

            SpecUtils.expectSameColor(resultContent, imgClean1Content, 0, 0);
            SpecUtils.expectSameColor(resultContent, imgClean1Content, diffParams.x, diffParams.y);

        });

        it("From 3 images, each containing one anomaly at a different spot, should return a clean image", function() {
            var bgCol = [100, 100, 100, 255];
            var bgString = "rgb("+ bgCol[0] +", "+ bgCol[1] +", "+ bgCol[2] +")";

            var diffParams1 = { x : 10, y: 10, width: 50, heigth: 50};
            var imgWithAnomaly1 = SpecUtils.newAnomalyColorCanvas(bgString, diffParams1, "rgb(100, 0, 0)");  
            appendCanvas(imgWithAnomaly1, "Image with anomaly 1");
            
            var diffParams2 = { x : 100, y: 0, width: 50, heigth: 50};
            var imgWithAnomaly2 = SpecUtils.newAnomalyColorCanvas(bgString, diffParams2, "rgb(0, 100, 0)");  
            appendCanvas(imgWithAnomaly2, "Image with anomaly 2");

            var diffParams3 = { x : 0, y: 100, width: 50, heigth: 50};
            var imgWithAnomaly3 = SpecUtils.newAnomalyColorCanvas(bgString, diffParams3, "rgb(0, 0, 100)");  
            appendCanvas(imgWithAnomaly3, "Image with anomaly 3");

            var inputs = [imgWithAnomaly1, imgWithAnomaly2, imgWithAnomaly3];

            var result = SpecUtils.newEmptyCanvas();

            GOOH.process(inputs, {}, result);
            appendCanvas(result, "Process result of GOOH");

            var resultContent = result.getContext('2d').getImageData(0, 0, result.width, result.height);

            SpecUtils.expectColor(resultContent, bgCol, 0, 0);
            SpecUtils.expectColor(resultContent, bgCol, diffParams1.x, diffParams1.y);
            SpecUtils.expectColor(resultContent, bgCol, diffParams2.x, diffParams2.y);
            SpecUtils.expectColor(resultContent, bgCol, diffParams3.x, diffParams3.y);

        });

    });
});