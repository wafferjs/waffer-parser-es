const babel = require('babel-core')

const parse = async (file, exporting = false, options = {}) => {
  return new Promise((resolve, reject) => {
    babel.transformFile(file, options, (err, res) => {
      if (err) {
        return reject(err)
      }

      return resolve({ content: res.code })
    })
  })
}

module.exports = server => {
  return { parse, ext: '.js' }
}
