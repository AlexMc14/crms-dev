module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/peritomedicotest/' : '/',
  outputDir: 'dist',
  assetsDir: 'assets',
  lintOnSave: false,
  filenameHashing: true,
  productionSourceMap: false
};
