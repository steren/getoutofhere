/**
 * @fileoverview Tests on anomalies detection and deletion
 */
/* global describe, it, expect */

define([
  'app/getoutofhere',
  'specutils'
], function (GOOH, SpecUtils) {

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
});