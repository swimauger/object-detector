const fs = require('fs').promises;
const { createCanvas, loadImage } = require('canvas');

Math.mean = function(arr) {
    let total = 0;
    for (const val of arr) {
        total += val;
    }
    return total/arr.length;
}

class BoundingBox {
    static shiftMean(bboxes) {
        const ratios = [];
        let mainBBox = null;
        for (const label in bboxes) {
            const result = { x: 0, y: 0, maxX: -Infinity, maxY: -Infinity }
            for (const bbox of bboxes[label]) {
                result.x += bbox.x;
                result.y += bbox.y;
                if (bbox.x > result.maxX) {
                    result.maxX = bbox.x;
                }
                if (bbox.y > result.maxY) {
                    result.maxY = bbox.y;
                }
            }
            result.x /= bboxes[label].length;
            result.y /= bboxes[label].length;
            mainBBox = new BoundingBox(result.x, result.y, result.maxX-result.x, result.maxY-result.y);
            ratios.push(mainBBox.width/mainBBox.height);
        }
        const avgRatios = Math.mean(ratios);
        return new BoundingBox(mainBBox.x, mainBBox.y, mainBBox.height*avgRatios, mainBBox.width*avgRatios);
    }

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    async draw(img, dest=img) {
        const image = await loadImage(img);
        const canvas = await createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, image.width, image.height);
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.stroke();
        await fs.writeFile(dest, canvas.toBuffer());
    }
}

module.exports = BoundingBox;