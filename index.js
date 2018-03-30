const browserify = require('browserify')
const babelify = require('babelify')
const vueify = require('vueify')

module.exports = server => {
  const { debug, prod } = server.options
  const parse = async (file, exporting = false, options = {}) => {
    return new Promise((resolve, reject) => {
      vueify.compiler.applyConfig({
        customCompilers: Object.keys(server.parsers).map(ext => {
          const parser = (str, next, instance, file) => {
            const promise = server.parser(ext).parse(str, false, { fragment: true })
            promise.then(content => next(null, content))
            promise.catch(err => next(err))
          }

          if (ext[0] === '.') ext = ext.slice(1)

          return { ext, parser }
        }).reduce((a, b) => {
          a[b.ext] = b.parser
          return a
        }, {}),
      })

      const b = browserify(file, { debug })
        .transform(babelify, {
          presets: [ `${__dirname}/node_modules/babel-preset-env`, {} ],
          sourceMaps: 'inline',
          minified: prod,
        })
        .transform(vueify)
        .bundle()

      let js = ''
      b.on('data', chunk => (js += chunk))
      b.on('end', _ => resolve({ content: js }))
      b.on('error', err => reject(new Error(`${err}`)))
    })
  }

  return { parse, ext: '.js' }
}
