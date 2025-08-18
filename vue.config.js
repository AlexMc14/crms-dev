module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/crms-front/' : '/',
  outputDir: 'dist',
  assetsDir: 'assets',
  lintOnSave: false,
  filenameHashing: true,
  productionSourceMap: false
};
