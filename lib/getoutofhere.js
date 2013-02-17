define([
    'app/vendor/underscore/underscore'
    ], function(_)  {
    /**
     * Merges a foreground image into a background image using a mask
     * @param backgroundImage canvas of background
     * @param foregroundImage canvas of foreground to be cut by mask
     * @param foregroundMask canvas of the mask that will be applied to the foreground. Transparent part of the mask will turn the foreground transparent
     * @param result The result canvas
     */
    var mergeImages = function(backgroundImage, foregroundImage, foregroundMask, result) {
        
        var ctxresult = result.getContext('2d');
        
        // copy foreground to our result
        ctxresult.drawImage(foregroundImage, 0, 0);
        // The foreground is kept where both the mak and foreground content overlap.
        ctxresult.globalCompositeOperation = "destination-in";
        ctxresult.drawImage(foregroundMask, 0, 0);
        
        // then paint the background in the back of the image
        ctxresult.globalCompositeOperation = "destination-over";
        ctxresult.drawImage(backgroundImage, 0, 0);
    };
    
    /**
     * Compute the euclidian distance between two pixel colors
     * @param data1: imageData.data of the first image
     * @param data2: imageData.data of the second image
     * @param p: pixel index
     * @param alpha: take into account alpha or not
     * @return {Number}
     */
    var pixelEuclidianDistance = function(data1, data2, p, alpha) {
        if(!alpha) {
            return Math.sqrt(Math.pow(data1[4*p] - data2[4*p], 2) + Math.pow(data1[4*p+1] - data2[4*p+1], 2) + Math.pow(data1[4*p+2] - data2[4*p+2], 2));
        } else {
            return Math.sqrt(Math.pow(data1[4*p] - data2[4*p], 2) + Math.pow(data1[4*p+1] - data2[4*p+1], 2) + Math.pow(data1[4*p+2] - data2[4*p+2], 2) + Math.pow(data1[4*p+3] - data2[4*p+3], 2));
        }
    }

    /**
     * Compute the difference between two images, they should be of the same size
     * @param img1
     * @param img2
     * @param threshold distance of every RGBA component
     * @param result a empty canvas on which the difference will be saved, alpha channel is used to store the distance between pixels.
     */
    var diff = function(img1, img2, threshold, result) {
        // TODO: result should not be an image array, but more an array of the size of the number of pixels and with values negative and positive, not clamped to 255.
        var data1 = getImageData(img1).data;
        var data2 = getImageData(img2).data;
        var resCtx = result.getContext('2d');
        var resImageData = resCtx.getImageData(0, 0, result.width, result.height);
        
        var d; // distance between the two pixel colors
        for( var p = 0; p < img1.width * img1.height; p++ ) {
            d = pixelEuclidianDistance(data1, data2, p, false);
            if(d > threshold) {
                resImageData.data[4*p+3] = d;
            }
        }
        
        resCtx.putImageData(resImageData, 0, 0);
    };

    /** 
     * Every not 0 pixel is set to 255
     */
    var imgFloor = function(img, result) {
        var data = img.getContext('2d').getImageData(0, 0, img.width, img.height).data;
        var resImageData = getImageData(result);

        for( var p = 0; p < data.length; p++) {
            if( data[p] > 0) {
                resImageData.data[p] = 255;
            }
        }

        var resCtx = result.getContext('2d');
        resCtx.putImageData(resImageData, 0, 0);
    };

    /**
     * Returns the ImageData object of every input canvases
     *
     * @param images: single canvas or array of canvases 
     * @return imageData: of the input images
     */
    var getImageData = function(images) {
        if(_.isArray(images)) {
            var inputImagesData = [];
            for(var i = 0; i < images.length; i++) {  
                inputImagesData.push(images[i].getContext('2d').getImageData(0, 0, images[i].width, images[i].height));
            }
            return inputImagesData;
        } else {
            return images.getContext('2d').getImageData(0, 0, images.width, images.height);
        }
    }

    /**
     * Process input images to return an image without any anomalies
     *
     * @param inputImages Array of input images
     * @param params parameters: {threshold}
     * @param result: the result image will be generated inside this canvas
     */
    var process = function(inputImages, params, result) {
        _.defaults(params, {threshold: 10})
        var inputImagesData = getImageData(inputImages);
        var resultImageData = getImageData(result);

        // for every pixel of result image, have a look to the input pixels, take the pixel that is the more commen for all the images.
        // Improvement: This may not be the solution since an anomaly can be in almost every image and still be an anomaly.

        // d is a symetrical square matrix of the size of the number of input images.
        // Its indices (i,j) are the distance between the pixel in image i and the pixel in image j.
        // Store it in an array. TODO: find a Math library with Matrix suport.
        var d;

        // s is the sum of the lines of the marix d
        var s;

        // store the pixel index of the pixel we choose to pick
        var pixelToKeep;

        var minSum; // store here the min sum of s.

        for( var p = 0; p < resultImageData.width * resultImageData.height; p++ ) {
            // compute this pixel's distance between every image couple
            // TODO use a Math library to declare this matrix symetrical and null on diagonal to do less computations
            d = [];
            s = [];
            for( var i = 0; i < inputImages.length; i++ ) {
                for( var j = 0; j < inputImages.length; j++ ) {
                d[ i + j * inputImages.length ] = pixelEuclidianDistance(inputImagesData[i].data, inputImagesData[j].data, p, false);
                };
            };

            // compute the sum
            for( var j = 0; j < inputImages.length; j++ ) {
                s[j] = 0;
                for( var i = 0; i < inputImages.length; i++ ) {
                    s[j] += d[ i + j * inputImages.length ];
                }
            }

            // we choose the pixel that has the smaller line sum
            pixelToKeep = 0;
            minSum = Infinity;
            for( var j = 0; j < s.length; j++ ) {
                if(s[j] < minSum) {
                    minSum = s[j];
                    pixelToKeep = j;
                }
            }
            resultImageData.data[4*p  ] = inputImagesData[pixelToKeep].data[4*p  ];
            resultImageData.data[4*p+1] = inputImagesData[pixelToKeep].data[4*p+1];
            resultImageData.data[4*p+2] = inputImagesData[pixelToKeep].data[4*p+2];
            resultImageData.data[4*p+3] = inputImagesData[pixelToKeep].data[4*p+3];
        }

        // put back the result
        var resCtx = result.getContext('2d');
        resCtx.putImageData(resultImageData, 0, 0);

        return true;
    };

    return {
        mergeImages : mergeImages,
        diff : diff,
        process: process
    };
});