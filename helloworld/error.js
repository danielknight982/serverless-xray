'use strict';

/* 
  This will produce and error everytime.
*/
module.exports.thisHasError = (event, context, callback) => {
  // This example code only throws error. 
  var error = new Error("Something is wrong.");
  callback(error);
};


