const { createCanvas, loadImage } = require('canvas');

class ImagePyramid {
    static async create(image, ratios) {
        const pyramid = [];
        for (let i = 0; i < ratios.length; i++) {
            const img = await loadImage(image);
            const w = img.width/ratios[i], h = img.height/ratios[i];
            const canvas = await createCanvas(w, h);
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            pyramid.push(canvas);
        }
        return pyramid;
    }
}

module.exports = ImagePyramid;