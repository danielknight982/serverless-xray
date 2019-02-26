'use strict';

console.log("Error Funciton");

module.exports.thisHasError = (event, context, callback) => {
  // This example code only throws error. 
  var error = new Error("something is wrong");
  callback(error);
};
