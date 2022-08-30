# unused-file-pligun

## install

`npm i --save-dev unused-file-pligun`

## Usage

webpack.config.js

```js
const UnusedFilesPlugin = require("unused-file-pligun");
module.exports = {
  // ...
  plugins: [new UnusedFilesPlugin(option)],
};
```

详细实现思路可参考[100 行代码删除前端项目中的无用文件](https://juejin.cn/post/7137639757898743821)

## option 说明

| 参数          | 说明                                                              | 默认值            |
| ------------- | ----------------------------------------------------------------- | ----------------- |
| root          | 要扫描的根目录                                                    | ./src             |
| exclude       | 不扫描的目录, 从 root 中过滤,例如不扫描 commonm 目录, ['/common'] | []                |
| excludeSuffix | 不扫描后缀, 为空时扫描所有后缀, 比如不扫描图片 ['.png']           | []                |
| includeSuffix | 扫描后缀, 为空时扫描所有后缀, 例如仅扫描 js 文件['.js']           | []                |
| out           | 输出文件名称, 例如想将输出的无用文件列表命名为 abc, 'abc.json'    | unused-files.json |
| remove        | 是否执行删除操作                                                  | false             |
