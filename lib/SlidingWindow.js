const { createCanvas } = require('canvas');
const { EventEmitter } = require('events');

function _getScanBoxFromPyramid(pyramid) {
    let minCanvas = { width: Infinity };
    for (const canvas of pyramid) {
        if (canvas.width < minCanvas.width) {
            minCanvas = canvas;
        }
    }
    return minCanvas;
}

async function _capture(canvas, x, y, width, height) {
    const data = canvas.getContext('2d').getImageData(x, y, width, height);
    const capture = await createCanvas(data.width, data.height);
    capture.getContext('2d').putImageData(data, 0, 0);
    return {
        label: `${canvas.width}x${canvas.height}`,
        canvas: capture,
        x,
        y,
        width,
        height
    }
}

class SlidingWindow {
    static async scan(pyramid, step, cb) {
        const minCanvas = _getScanBoxFromPyramid(pyramid);
        const stepX = minCanvas.width/step;
        const stepY = minCanvas.height/step;
        const promises = [];

        for (const canvas of pyramid) {
            for (let y = 0; y < canvas.height - minCanvas.height; y += stepY) {
                for (let x = 0; x < canvas.width - minCanvas.width; x += stepX) {
                    promises.push(cb(await _capture(canvas, x, y, minCanvas.width, minCanvas.height)));
                }
            }
        }

        return Promise.all(promises);
    }
}

module.exports = SlidingWindow;