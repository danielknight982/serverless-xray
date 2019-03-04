'use strict';

var AWSXRay = require('aws-xray-sdk-core');
var aws = AWSXRay.captureAWS(require('aws-sdk'));

var lambda = new aws.Lambda({
  region: 'us-east-1' //change to your region
});

/*
  This will say hello with the provided value.
*/
module.exports.sayHello = (event, context, callback) => {
    //Check URL parameter is present.  If not, return a 'bad request' error.
    if(event["queryStringParameters"] == null){
      let response = {
        statusCode: 400,
        body: JSON.stringify({
          message: "Bad request: Value was not provied."
        }),
      };

      //Log that an value was not provided.
      console.log("Value was not provided.");
      callback(null, response);
      return;
    }
  
    //Get the URL parameter.
    var value = event["queryStringParameters"]['value'];
  
    //Call the function that will assemble the message.
    lambda.invoke({
      FunctionName: 'serverless-x-ray-dev-buildHelloMessage',
      //Pass the parameter.
      Payload: JSON.stringify({ "value": value })
    }, function(error, data) {
      //Handle any error.
      if (error) {
        console.log(error);
        callback(error);
      }
      //Handle the return.
      if(data.Payload){
        const response = {
          statusCode: 200,
          body: JSON.stringify({
            message: JSON.parse(data.Payload)
          }),
        };
        
        console.log(data.Payload);
        callback(null, response);
      }
    });
  };
  
  /*
    This will assemble the message and return.
  */
  module.exports.buildHelloMessage = (event, context, callback) => {
    //Just for fun, lets trigger and error if the value starts with Z.
    if(event.value.charAt(0) == "Z"){
      throw new Error("Can't say hello to things that start with 'Z'.");
    }

    callback(null, { message: "Hello, " + event.value});
  };