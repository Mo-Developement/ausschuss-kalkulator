const { defineConfig } = require('@vue/cli-service')
const packageJson = require('./package.json')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.VUE_APP_BUILD_MODE === 'offline' ? './' : '/',

  chainWebpack: (config) => {
    config.plugin('define').tap((definitions) => {
      Object.assign(definitions[0], {
        __VUE_OPTIONS_API__: 'true',
        __VUE_PROD_DEVTOOLS__: 'false',
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',

        'process.env.PROJECT_VERSION': JSON.stringify(packageJson.version),
      })
      return definitions
    })
  },
})
