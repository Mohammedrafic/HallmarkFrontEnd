if (require('puppeteer').executablePath()) {
  process.env.CHROME_BIN = require('puppeteer').executablePath()
}

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true, // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/einstein-ui'),
      subdir: '.',
      reporters: [
        {
          type: 'lcovonly',
          subdir: '.',
          file: 'report-lcovonly.txt',
        },
        { type: 'html' },
        { type: 'text-summary' },
      ],
      fixWebpackSourcePaths: true,
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browserNoActivityTimeout: 60000,
    browsers: ['Chrome'],
    singleRun: true,
    restartOnFileChange: true,
    customLaunchers: {
      ChromeHeadlessCustom: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--headless',
          '--remote-debugging-port=9222',
        ],
      },
    },
  });
};
