/**
 * @fileoverview Tests on anomalies detection and deletion
 */
/* global describe, it, expect */

define([
  'app/getoutofhere',
  'specutils'
], function (GOOH, SpecUtils) {

    var displayImages = true;

    var displayImage = function(img) {
        if(displayImages) {
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
        
        
        it("should do a simple diff between images", function() {
            var diffParams = { x : 5, y: 0, width: 50, heigth: 50};
            // red canvas
            var img1 = SpecUtils.newColorCanvas("rgb(100, 0, 0)");
            
            // new red canvas, with a white rectangle
            var img2 = SpecUtils.newColorCanvas("rgb(100, 0, 0)");  
            var img2ctx = img2.getContext('2d');
            img2ctx.fillStyle = 'rgb(255, 255, 255)';
            img2ctx.fillRect(diffParams.x, diffParams.y, diffParams.width, diffParams.heigth);
            displayImage(img1);
            displayImage(img2);
            
            var result = SpecUtils.newEmptyCanvas();
            displayImage(result);
            
            GOOH.diff(img1, img2, 5, result);
            
            var resultContent = result.getContext('2d').getImageData(0, 0, result.width, result.height);
            
            expect(resultContent.data[0]).toBe(0);
            expect(resultContent.data[1]).toBe(0);
            expect(resultContent.data[2]).toBe(0);
            expect(resultContent.data[3]).toBe(0);
            
            expect(resultContent.data[4 * (diffParams.x + diffParams.y * resultContent.width) + 3]).not.toBe(0);
        });
    });
});