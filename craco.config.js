const CracoLessPlugin = require('craco-less');

module.exports = {
  rules: [{
    test: /\.less$/,
  },{
    test:/\.(jpg|png)$/,
    use:[{
      loader:"url-loader",
      options:{
        esModule:false,
      }
    }]
  }],
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: { '@primary-color': '#1DA57A' },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};