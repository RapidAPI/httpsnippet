/**
 * @description
 * HTTP code snippet generator for Java using OkHttp.
 *
 * @author
 * @shashiranjan84
 *
 * for any questions or issues regarding the generated code snippet, please open an issue mentioning the author.
 */

'use strict'

const CodeBuilder = require('../../helpers/code-builder')

module.exports = function (source, options) {
  const opts = Object.assign({
    indent: '  '
  }, options)

  const code = new CodeBuilder(opts.indent)

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD']

  const methodsWithBody = ['POST', 'PUT', 'DELETE', 'PATCH']

  code.push('OkHttpClient client = new OkHttpClient();')
    .blank()

  if (source.postData.mimeType === 'multipart/form-data') {
    code.push('RequestBody body = new MultipartBody.Builder()')
      .push('%s.setType(MultipartBody.FORM)', opts.indent)

    source.postData.params.forEach((param) => {
      if (param.fileName) {
        code.push('%s.addFormDataPart(%s, %s,', opts.indent, JSON.stringify(param.name), JSON.stringify(param.fileName))
          .push('%s%sRequestBody.create(MediaType.parse("text/plain"), fileInput))', opts.indent, opts.indent)
      } else {
        const value = JSON.stringify(param.value.toString()) || ""
        code.push('%s.addFormDataPart(%s, %s)', opts.indent, JSON.stringify(param.name), value)
      }
    })
    
    code.push('%s.build();', opts.indent)
  } else if (source.postData.mimeType === 'application/x-www-form-urlencoded') {
    code.push('RequestBody body = new FormBody.Builder()')
    
    source.postData.params.forEach((param) => {
      const value = JSON.stringify(param.value.toString()) || ""
      code.push('%s.add(%s, %s)', opts.indent, JSON.stringify(param.name), value)
    })

    code.push('%s.build();', opts.indent)
  } else if (source.postData.text) {
    code.push('MediaType mediaType = MediaType.parse("%s");', source.postData.mimeType)
      .push('String value = %s;', JSON.stringify(source.postData.text))
      .push('RequestBody body = RequestBody.create(mediaType, value);')
  }

  if (source.postData.params) {
    code.blank()
  }

  code.push('Request request = new Request.Builder()')
    .push(1, '.url("%s")', source.fullUrl)
  
  if (methods.indexOf(source.method.toUpperCase()) === -1) {
    if (source.postData.text) {
      code.push(1, '.method("%s", body)', source.method.toUpperCase())
    } else {
      code.push(1, '.method("%s", null)', source.method.toUpperCase())
    }
  } else if (methodsWithBody.indexOf(source.method.toUpperCase()) >= 0) {
    if (source.postData.text) {
      code.push(1, '.%s(body)', source.method.toLowerCase())
    } else {
      code.push(1, '.%s(null)', source.method.toLowerCase())
    }
  } else {
    code.push(1, '.%s()', source.method.toLowerCase())
  }

  // Add headers, including the cookies
  const headers = Object.keys(source.allHeaders)

  // construct headers
  if (headers.length) {
    headers.filter(key => !(source.allHeaders[key].toLowerCase().includes('multipart/form-data'))) // Remove content type header if form-data
      .forEach((key) => { code.push(1, '.addHeader("%s", "%s")', key, source.allHeaders[key]) })
  }

  code.push(1, '.build();')
    .blank()
    .push('Response response = client.newCall(request).execute();')

  return code.join()
}

module.exports.info = {
  key: 'okhttp',
  title: 'OkHttp',
  link: 'http://square.github.io/okhttp/',
  description: 'An HTTP Request Client Library'
}
