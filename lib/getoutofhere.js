define(function()  {
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
     * Compute the difference between two images, they should be of the same size
     * @param img1
     * @param img2
     * @param threshold distance of every RGBA component
     * @param result a empty canvas on which the difference will be saved
     */
    var diff = function(img1, img2, threshold, result) {
        var data1 = img1.getContext('2d').getImageData(0, 0, img1.width, img1.height).data;
        var data2 = img2.getContext('2d').getImageData(0, 0, img2.width, img2.height).data;
        var resCtx = result.getContext('2d');
        var resImageData = resCtx.getImageData(0, 0, result.width, result.height);
        
        var d;
        for( var p = 0; p < img1.width * img1.height; p++ ) {
            // compute an euclidian distance
            d = Math.sqrt(Math.pow(data1[4*p] - data2[4*p], 2) + Math.pow(data1[4*p+1] - data2[4*p+1], 2) + Math.pow(data1[4*p+2] - data2[4*p+2], 2));
            if(d > threshold) {
                // canvas pixel are alpha premultiplied when put back to ImageDat, we MUST change the alpha channel otherwise RGB
                resImageData.data[4*p+3] = d;
            }
        }
        
        resCtx.putImageData(resImageData, 0, 0);
    };

    return {
        mergeImages : mergeImages,
        diff : diff
    };
});