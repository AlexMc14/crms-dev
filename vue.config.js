module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/crms-dev/' : '/',
  outputDir: 'dist',
  assetsDir: 'assets',
  lintOnSave: false,
  filenameHashing: true,
  productionSourceMap: false
};
