'use strict'

var util = require('util')
var stringifyObject = require('stringify-object')
var CodeBuilder = require('../../helpers/code-builder')

module.exports = function (source, options) {
  var opts = Object.assign({
    indent: '  '
  }, options)

  var code = new CodeBuilder(opts.indent)

  code.push('var axios = require("axios").default;')
      .blank()

  var reqOpts = {
    method: source.method,
    url: source.url
  }

  if (Object.keys(source.queryObj).length) {
    reqOpts.params = source.queryObj
  }

  if (Object.keys(source.allHeaders).length) {
    reqOpts.headers = source.allHeaders
  }

  switch (source.postData.mimeType) {
    case 'application/x-www-form-urlencoded':
      reqOpts.data = source.postData.paramsObj
      break

    case 'application/json':
      if (source.postData.jsonObj) {
        reqOpts.data = source.postData.jsonObj
      }
      break

    default:
      if (source.postData.text) {
        reqOpts.data = source.postData.text
      }
  }

  code.push('var options = %s;', stringifyObject(reqOpts, { indent: '  ', inlineCharacterLimit: 80 }))
    .blank()

  code.push(util.format('axios.request(options).then(%s', 'function (response) {'))
      .push(1, 'console.log(response.data);')
      .push('}).catch(%s', 'function (error) {')
      .push(1, 'console.error(error);')
      .push('});')

  return code.join()
}

module.exports.info = {
  key: 'rapidql',
  title: 'RapidQL',
  link: 'https://github.com/RapidAPI/rapidql',
  description: ''
}