'use strict'

var queryString = require('query-string')
var _ = require('lodash')
import Mock  from 'mockjs';
import config from './config'
var request = {}
request.get = function(url,params){
	if(params){
		url += '?' +  queryString.stringify(params)
	}
	return fetch(url)
		.then((response) => response.json())
		.then((response) =>Mock.mock(response))
		.catch((error) => {
        console.error(error);
      });
}
request.post = ( url,body ) => {
	console.log(body)
	var options =_.extend(config.header,{
		body:JSON.stringify(body)
	})
	console.log(options)
	return fetch(url,options)
		.then((response) => response.json())
		.then((response) => Mock.mock(response))
		.catch((error) => {
        console.error(error);
      });
}
module.exports = request