/*!
 * canvasImageSaver v0.1.1
 * Copyright 2015 aaccurso <accurso.alan@gmail.com>
 * See LICENSE in this repository for license information
 */
(function(global){
'use strict';

function BrowserCanvasSaver (fileName) {
  this.anchor = document.createElement('a');
  this.fileName = fileName || 'canvas.png';
}

BrowserCanvasSaver.prototype.save = function(canvas, successCallback, errorCallback) {
  this.anchor.download = this.fileName;
  this.anchor.href = canvas.toDataURL('image/png');
  this.anchor.click();
  successCallback(canvas, fileName);
};

if (typeof exports === 'object' && typeof module !== 'undefined') {
  module.exports = CanvasImageSaver;
} else {
  global.CanvasImageSaver = CanvasImageSaver;
}

function CanvasImageSaver (canvas, cropOptions, successCallback, errorCallback, callbackContext) {
  var noop = function () {};

  this.canvas = canvas;
  this.cropOptions = cropOptions;
  this.successCallback = successCallback || noop;
  this.errorCallback = errorCallback || noop;
  this.callbackContext = callbackContext || this;

  if (window.cordova) {
    this.saverImplementator = new CordovaCanvasSaver();
  } else {
    this.saverImplementator = new BrowserCanvasSaver();
  }
};

CanvasImageSaver.prototype = {
  save: function () {
    var canvas;

    if (this.cropOptions) {
      // Sets default crop options
      this.cropOptions.xCropOffset = this.cropOptions.xCropOffset || 0;
      this.cropOptions.yCropOffset = this.cropOptions.yCropOffset || 0;
      this.cropOptions.width = this.cropOptions.width || this.canvas.width - this.cropOptions.xCropOffset;
      this.cropOptions.height = this.cropOptions.height || this.canvas.height - this.cropOptions.yCropOffset;
      // Creates temporal canvas to draw cropped image
      canvas = document.createElement('canvas');
      canvas.width = this.cropOptions.width;
      canvas.height = this.cropOptions.height;
      canvas.getContext('2d').drawImage(this.canvas,
        this.cropOptions.xCropOffset, this.cropOptions.yCropOffset,
        canvas.width, canvas.height,
        0, 0,
        canvas.width, canvas.height
      );
    } else {
      canvas = this.canvas;
    }

    return this.saverImplementator.save(
      canvas,
      this.successCallback.bind(this.callbackContext),
      this.errorCallback.bind(this.callbackContext)
    );
  }
};

function CordovaCanvasSaver () {
  if (!window.canvas2ImagePlugin) {
    throw('You are using cordova. This library requires canvas2ImagePlugin.');
  }
}

CordovaCanvasSaver.prototype.save = function(canvas, successCallback, errorCallback) {
  window.canvas2ImagePlugin.saveImageDataToLibrary(
    function(fileName) {
     successCallback(canvas, fileName);
    },
    function(error) {
      console.error(error);
      errorCallback(error);
    },
    canvas
  );
};

})(this);