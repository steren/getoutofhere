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

    return {
        mergeImages : mergeImages
    };
});