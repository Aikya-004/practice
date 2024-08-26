const path = require('path');

module.exports = function override(config, env) {
  if (env === 'production') {
    config.output.path = path.resolve(__dirname, 'dist');
    config.output.publicPath = '/';
  }
  return config;
};
