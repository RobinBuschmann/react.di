const {JSDOM} = require('jsdom');

const exposedProperties = ['window', 'navigator', 'document'];

const jsdom = new JSDOM('<!doctype html><html><head><title>Mocha Testing Page</title></head><body></body></html>');
global.window = jsdom.window;

Object.keys(window).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = window[property];
  }
});

global.navigator = {
  userAgent: 'node.js'
};

documentRef = document;
