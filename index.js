const browserify = require('browserify')

module.exports = server => {
  const { debug, prod } = server.options
  const parse = async (file, exporting = false, options = {}) => {
    return new Promise((resolve, reject) => {
      const b = browserify(file)
        .transform(`${__dirname}/node_modules/babelify`, {
          presets: [ `${__dirname}/node_modules/babel-preset-env`, {} ],
          sourceMaps: debug ? 'inline' : false,
          minified: prod,
        }).bundle()

      let js = ''
      b.on('data', chunk => (js += chunk))
      b.on('end', _ => resolve({ content: js }))
      b.on('error', err => reject(err))
    })
  }

  return { parse, ext: '.js' }
}
