'use strict';

const awsxray = require('aws-xray-sdk-core');
const aws = awsxray.captureAWS(require('aws-sdk'));
const dynamo = new aws.DynamoDB.DocumentClient();
const uuidv4 = require('uuid/v4')

var lambda = new aws.Lambda({
  region: 'us-east-1' //change to your region
});

/*
  Just needed an index to test the service.
*/
module.exports.index = (event, context, callback) => {
  
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Serverless Calculator'
    }),
  };

  callback(null, response);
};

/*
  Process an expression.
*/
module.exports.calc = (event, context, callback) => {
  
  //Check to make sure there is something in the request body.  If not, return a 400.
  if(event.body == null){
    const response = {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Request body not present.'
      }),
    };
  
    callback(null, response);
    return;
  }

  //Parse the body.
  let body = JSON.parse(event.body);
  
  //Check to make sure there is an expression in the request body.  If not, return a 400.
  if(body.expression == null){
    const response = {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Expression not present.'
      }),
    };
  
    callback(null, response);
    return;
  }

  //The regular expression to match the expression.
  let equationRegEx = /([0-9]+)(.)([0-9]+)/;
  //Match the expression 
  let parseResult = body.expression.match(equationRegEx);

  //Determine the function name;
  var funcName = "";
  switch(parseResult[2]){
      case '+': funcName = "serverless-calculator-dev-add"; break;
      case '-': funcName = "serverless-calculator-dev-sub"; break;
      case '*': funcName = "serverless-calculator-dev-mult"; break;
      case '/': funcName = "serverless-calculator-dev-div"; break;
      default:
        //If we can't determine the function, then its a bad request.
        const response = {
          statusCode: 400,
          body: JSON.stringify({
            message: 'Operation not known.'
          }),
        };
      
        callback(null, response);
        return;
  }

  //Invoke the determined function.
  lambda.invoke({
    FunctionName: funcName,
    //Pass the parameter.
    Payload: JSON.stringify({ 
      "factors": [
        //Convert the factors to integers.
        Number(parseResult[1]),
        Number(parseResult[3])
      ]
    })
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
        body: data.Payload,
      };
      
      console.log(data.Payload);
      callback(null, response);
    }
  });
};

/*
  Do Addition
*/
module.exports.add = (event, context, callback) => {
  //Calculate
  var result = event.factors[0] + event.factors[1];

  callback(null,{
    "result": result
  });

  //Store the results in dynamo.
  lambda.invoke({
    FunctionName: 'serverless-calculator-dev-saveToDynamo',
    //Pass the parameter.
    Payload: JSON.stringify({ 
      "expression": event.factors[0] + "+" + event.factors[1],
      "result": result
    })
  }, function(error, data) {
    //Handle any error.
    if (error) {
      console.log(error);
    }
  });
}

/*
  Do Subtraction
*/
module.exports.sub = (event, context, callback) => {
  //Calculate
  var result = event.factors[0] - event.factors[1];

  callback(null,{
    "result": result
  });

  lambda.invoke({
    FunctionName: 'serverless-calculator-dev-saveToDynamo',
    //Pass the parameter.
    Payload: JSON.stringify({ 
      "expression": event.factors[0] + "-" + event.factors[1],
      "result": result
    })
  }, function(error, data) {
    //Handle any error.
    if (error) {
      console.log(error);
    }
  });
}

/*
  Do Multiplication
*/
module.exports.mult = (event, context, callback) => {
  //Calculate
  var result = event.factors[0] * event.factors[1];

  callback(null,{
    "result": result
  });

  //Store the results in dynamo.
  lambda.invoke({
    FunctionName: 'serverless-calculator-dev-saveToDynamo',
    //Pass the parameter.
    Payload: JSON.stringify({ 
      "expression": event.factors[0] + "*" + event.factors[1],
      "result": result
    })
  }, function(error, data) {
    //Handle any error.
    if (error) {
      console.log(error);
    }
  });
}

/*
  Do Division
*/
module.exports.div = (event, context, callback) => {
  //Calculate
  var result = event.factors[0] / event.factors[1];

  callback(null,{
    "result": result
  });

  //Store the results in dynamo.
  lambda.invoke({
    FunctionName: 'serverless-calculator-dev-saveToDynamo',
    //Pass the parameter.
    Payload: JSON.stringify({ 
      "expression": event.factors[0] + "/" + event.factors[1],
      "result": result
    })
  }, function(error, data) {
    //Handle any error.
    if (error) {
      console.log(error);
    }
  });
}

/*
  Store the expression and results in Dynamo.
*/
module.exports.saveToDynamo = (event, context, callback) => {
  return dynamo.put({
    TableName: "expressions",
    Item: {
      "id": uuidv4(),
      "hello": event.expression,
      "result": event.result
    }
  },callback);
}