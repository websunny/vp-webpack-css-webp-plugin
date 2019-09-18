const handleCss = require('./handleCss');

function HtmlWebpackCssWebpPlugin(options) {
  this.options = options || {};
}

HtmlWebpackCssWebpPlugin.prototype.apply = function(compiler) {
  var self = this;
  if (compiler.hooks) {
    // webpack 4 support
    compiler.hooks.compilation.tap('HtmlWebpackCssWebpPluginHandleHtml', function(compilation) {
      compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(
        'HtmlWebpackCssWebpPluginHandleHtml',
        self.checkSupportWebp.bind(self)
      );
    });

    compiler.hooks.done.tap('HtmlWebpackCssWebpPluginHandleCss', function(stats) {
      try {
        self.handleCss.apply(self);
      } catch (error) {
        
      }
    });
  } else {
    compiler.plugin('compilation', compilation => {
      compilation.plugin(
        'html-webpack-plugin-alter-asset-tags',
        self.checkSupportWebp.bind(self)
      );
    });

    compiler.plugin('done', (stats) => {
      try {
        self.handleCss(stats);
      } catch (error) {
        
      }
    });
  }
};

HtmlWebpackCssWebpPlugin.prototype.checkSupportWebp = function(
  htmlPluginData,
  callback
) {
  ['head', 'body'].map(position => {
    for (var i = 0; i < htmlPluginData[position].length; i++) {
      let isIgnore = false;
      const url = htmlPluginData[position][i].attributes.href;

      if (
        this.options.hasOwnProperty('ignore') &&
        this.options.ignore.length > 0
      ) {
        this.options.ignore.map(item => {
          if (istype(item, 'RegExp') && item.test(url)) {
            isIgnore = true;
          }
        });
      }
      if (isIgnore) {
        break;
      }

      if (htmlPluginData[position][i].attributes.rel === 'stylesheet') {
        // 添加webp支持判断代码
        htmlPluginData[position][i] = {
          tagName: 'script',
          closeTag: true,
          attributes: {
            type: 'text/javascript'
          },
          innerHTML: `
            var isSupportWebp = !![].map && document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') == 0;
  
            var oHead = document.querySelector('head');
            var oStyle = document.createElement('link');
            oStyle.rel = "stylesheet";
            
            if (isSupportWebp) {
              oStyle.href = '${url.replace(/\.css/, '.webp.css')}';
            } else {
              oStyle.href = '${url}';
            }
            oHead.appendChild(oStyle)
          `
        };
      }
    }
  });
  callback(null, htmlPluginData);
};

HtmlWebpackCssWebpPlugin.prototype.handleCss = function(stats) {
  handleCss(stats.compilation.outputOptions.path, stats.compilation.outputOptions.publicPath, this.options.postfix);
};

function istype(o, type) {
  return (
    Object.prototype.toString.call(o) === '[object ' + (type || 'Object') + ']'
  );
}

module.exports = HtmlWebpackCssWebpPlugin;
