# Webpack 打包和部署

我们可以不精通 Webpack，但要知道它是什么，帮我们做了哪些事
情。这样的话，在遇到问题的时候，我们就能知道是哪个环节出了问题，以便进一步寻找解决问题的方案。

## 核心思路
将源代码、图片、样式等资源文件当作模块，并提供对不同类型资源的处理器统一处理，成为可在浏览器运行的代码

Webpack 不仅是用于打包最终发布出去的应用程序，而且还能在开发时，为我们提供开发时服务器。它可以通过监测源代码的变化并实时编译，让我们能在代码发生变化时，及时看到运行的效果。Webpack 对于开发环境和生产环境的配置会有所区别，但基本流程是一致的。总体来说，Webpack 的配置会分为下面三个部分。

1. 输入输出配置：定义你的应用程序的入口，以及打包结果输出的文件夹位置。
2. 配置对于每一类资源文件的处理器：比如说，对 JavaScript 是用 babel-loader 去编译；对 less 文件则是用 less-loader 去编译；图片则用 file-loader 去处理。你在项目中能使用哪些技术或者资源，完全取决于配置了哪些 loader。
3. 除了核心的源代码编译和打包流程，Webpack 还支持插件扩展功能，可以通过插件生成额外的打包结果，或者进行一些其它的处理。比如打包过程生成 index.html，源代码分析报表，提取 CSS 到独立文件，代码压缩，等等。

看看一个标准的 Webpack 配置文件究竟长什么样：
```js

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');


module.exports = {
  entry: {
    // 定义应用的入口点 src/app.js，并命名为 main
    main: path.resolve(__dirname, './src/app.js'),
  },
  output: {
    // 打包输出的文件名，这里将生成 main.bundle.js
    filename: '[name].bundle.js',
    // 定义打包结果的输出位置
    path: path.resolve(__dirname, 'build'),
  },
  module: {
    // 定义处理源文件的规则，rules 下会按顺序使用匹配的规则
    rules: [
      {
        // 遇到 .js 结尾的文件则使用这个规则
        test: /\.js$/,
        // 忽略 node_modules 目录下的 js 文件
        exclude: /node_modules/,
        use: {
          // 使用 babel-loader 处理 js
          loader: 'babel-loader',
          // babel-loader 的一些选项
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    // 使用 HtmlWebpackPlugin 生成一个 index.html，其中自动引入 js
    // 并配置了页面的 title
    new HtmlWebpackPlugin({
      title: 'Webpack Output',
    }),
  ],
};
```

针对这段配置代码，我们一般会把它存储为 webpack.config.js 这样一个文件，这样在我们的项目下运行 webpack 命令，就会使用这个文件作为配置。

代码中其实已经很直观了，我们不仅定义了输入输出，还配置了 babel-loader，用于编译 JavaScript 文件到兼容主流浏览器的代码。同时，还为 babel-loader 设置了参数 presets，例子中这个参数的值 @babel/preset-env 可以确保 Babel 能够处理 JSX 等语法。最后，我们通过一个 HtmlWebpackPlugin，来自动生成 index.html。

在这几块配置中，主要的复杂度其实都集中在 loader 和 plugin。


## 理解 loader 和 plugin
loader 和 plugin 是 Webpack 最核心的两个概念，了解了这两个核心概念，我们就能掌握 Webpack 是如何处理你的代码，并最终生成打包结果。

为了理解它们的工作机制，我们来看一个 Less 文件处理的例子，看看要如何配置 Webpack，才能在项目中使用 Less 作为 Css 的预处理器。

Less 允许我们通过更强大的机制去写 Css，比如可以定义变量，允许嵌套的规则定义，等等。要让一个 Less 文件最终打包到目标文件中，并被浏览器运行，那么首先需要把 Less 代码转换成 Css，再通过 style 标记插入到浏览器中。

这个过程涉及到三个 loader，如下：
- less-loader：用于将 Less 代码转换成 Css。
- css-loader：用于处理 Css 中的 import、url 等语句，以便能分析出图片等静态资源打包到最终结果。
- style-loader：会自动生成代码，并将打包后的 Css 插入到页面 style 标签。这个 loader 会将 Css 打包到 js 文件中，在应用运行时，自动生成的代码再把这些 css 应用到页面上。

从中可以看到，这个过程涉及到 loader 的一个重要机制：链式使用。前面一个 loader 的输出结果，可以作为后一个 loader 的输入，这样的话，整个编译过程可以由各个独立的 loader 完成不同的步骤，一方面让每个步骤的任务更加明确，另外也可以让 loader 得以重用。

那么，支持 css loader 的 Webpack 配置就可以用如下代码来实现：
```js
module.exports = {
  // ...
  module: {
    rules: [
      // ...
      {
        // 检测 less 文件
        test: /\.less$/,
        // 使用了三个 loader，注意执行顺序是数组的倒序
        // 也就是先执行 less-loader
        use: ['style-loader', 'css-loader', 'less-loader'], //loader 是按照数组倒序执行的，也就是从最后一个开始执行。
      },
    ],
  },
  //...
};
```

为什么 CSS 代码会进入到 JavaScript 文件中呢？最终它是怎么应用到页面的呢？其实背后的过程主要是，生成的 CSS 代码会以字符串的形式作为一个模块打包到最终结果，然后在运行时由 style-loader 提供的一个函数 injectStylesIntoStyleTag ，来将这个模块加入到页面的 style 标签中，从而最终生效。(动态使用CSS代码)

在这里，我们也看到 CSS 代码之所以能进入到最终的 JavaScript 包，是因为 style-loader 做了这个事情。那么如果我们想让生成的 CSS 文件和 JavaScript 文件分开，应该如何做呢？
这就需要使用到 plugin 了。同时呢，我们还要从 rules 中去掉 style-loader 这个配置，以避免 CSS 进入到 JavaScript 文件中。

实现提取 CSS 模块到单独 CSS 文件的 plugin 是 mini-css-extract-plugin，下面的代码就展示了这个 plugin 的用法：
```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


module.exports = {
  // ...
  module: {
    rules: [
      // ...
      {
        test: /\.less$/,
        // 去掉 style-loader
        use: ['css-loader', 'less-loader'],
      },
    ],
  },
  plugins: [
    // ...
    // 引入提取 CSS 的插件以及参数
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:8].css',
    }),
  ],
};
```

## loader 与 plugin 的区别

plugin 和 loader 的一个区别，就是 loader 主要用于处理不同类型的资源，将它们转换成模块；而 plugin 通常用于生成一些除了 JavaScript bundle 之外的一些打包结果，比如例子中的 index.html 和 css 文件。


## 总结
Webpack虽然很重要，但并不意味着我们每个人都需要精通它的配置，以及 loader 、plugin 的开发方式。大多数情况下，只需要理解它的基本工作机制就可以了，这样已经足够你在遇到问题时，能够定位到究竟是代码问题，还是打包配置的问题。(loader 更多的是对资源的处理，plugin 则是补充处理。)

学习的目标就是能够读懂一个 Webpack 的配置，<b>知道自己的代码是如何最终转换成最后的 Web 应用的。</b>