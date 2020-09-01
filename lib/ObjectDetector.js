const ImagePyramid = require('./ImagePyramid');
const SlidingWindow = require('./SlidingWindow');
const BoundingBox = require('./BoundingBox');

function _saveBBox(instance, { label, x, y, width, height }) {
    const box = new BoundingBox(x, y, width, height);
    if (instance.bboxes[label]) {
        instance.bboxes[label].push(box);
    } else {
        instance.bboxes[label] = [ box ];
    }
}

async function _validCapture(instance, { canvas }) {
    const tensor = instance.mobilenet.infer(canvas, 'conv_preds');
    const pred = await instance.classifier.predictClass(tensor);
    return pred.confidences[pred.label] > instance.confMin;
}

class ObjectDetector {
    constructor({ classifier, mobilenet }) {
        this.classifier = classifier;
        this.mobilenet = mobilenet;
        this.pyramidScale = [ 8, 4, 2, 1 ];
        this.confMin = 0.9;
        this.windowDelta = 2;
    }

    setPyramidScale(scale) {
        this.pyramidScale = scale;
    }

    setConfidenceMinimum(min) {
        this.confMin = min;
    }

    setSlidingWindowDelta(delta) {
        this.windowDelta = delta;
    }

    async find(image) {
        this.bboxes = {};
        const pyramid = await ImagePyramid.create(image, this.pyramidScale);

        await SlidingWindow.scan(pyramid, this.windowDelta, async (capture) => {
            if (await _validCapture(this, capture)) {
                _saveBBox(this, capture);
            }
        });

        return BoundingBox.shiftMean(this.bboxes);
    }
}

module.exports = ObjectDetector;