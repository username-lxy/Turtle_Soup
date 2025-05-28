module.exports = {
  lintOnSave: false,
  pages: {
    index: {
      entry: 'src/main.js',
      title: '乌龟汤'
    }
  },
  devServer: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://turtlesoup-api.monadshow.xyz',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'
        }
      }
    }
  }
};
