const path = require('path');
const ImageClassifier = require("image-classifier");
const ObjectDetector = require('../lib/ObjectDetector');

const ic = new ImageClassifier(path.resolve(__dirname, 'dataset.json'), false);

ic.load().then(async () => {
    const test = new ObjectDetector(ic);
    const box = await test.find(path.resolve(__dirname, 'cat.jpg'));
    await box.draw(path.resolve(__dirname, 'cat.jpg'), path.resolve(__dirname, 'test.jpg'));
});