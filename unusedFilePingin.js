const fs = require("fs");
const path = require("path");

const appDirectory = fs.realpathSync(process.cwd()); // 项目根目录
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

// 除掉打包时使用的公共包
const NODE_MODULES = "node_modules";

class UnusedFilePingin {
  constructor(options = {}) {
    const defaultOptions = {
      // 扫描的根目录
      root: "./src",
      // 不扫描目录
      exclude: [],
      // 不扫描后缀, 为空时扫描所有后缀
      excludeSuffix: [],
      // 扫描后缀, 为空时扫描所有后缀
      includeSuffix: [],
      // 无用文件列表 json文件
      out: "unused-files.json",
      // 是否删除
      remove: false,
    };

    // 加载配置
    this.options = {
      root: options.root || defaultOptions.root,
      exclude: Array.isArray(options.exclude)
        ? options.exclude
        : defaultOptions.exclude,
      excludeSuffix: Array.isArray(options.excludeSuffix)
        ? options.excludeSuffix
        : defaultOptions.excludeSuffix,
      includeSuffix: Array.isArray(options.includeSuffix)
        ? options.includeSuffix
        : defaultOptions.includeSuffix,
      out: options.out || defaultOptions.out,
      remove: options.remove || defaultOptions.remove,
    };
  }

  apply(compiler) {
    const { root, exclude, excludeSuffix, out, includeSuffix, remove } =
      this.options;

    compiler.hooks.afterEmit.tap("UnusedFilePingin", (compilation) => {
      // fileDependencies 利用set做一遍去重
      const fileDependenciesList = [...new Set(compilation.fileDependencies)];
      // 排除掉 node_module
      const filterFileDependenciesList = fileDependenciesList.filter(
        (file) => !file.includes(NODE_MODULES)
      );

      // 扫描全部文件列表
      // 扫描规则, exclude, excludeSuffix, includeSuffix
      const allFileList = getAllFiles(resolveApp(root));
      const allFilterFiles = filterFiles({
        allFiles: allFileList,
        exclude,
        excludeSuffix,
        includeSuffix,
      });
      // console.log(allFilterFiles);

      // 对比两个文件列表
      const unUsedFiles = allFilterFiles.filter(
        (item) => !filterFileDependenciesList.includes(item)
      );

      // 输出json文件
      jsonFiles(out, JSON.stringify(unUsedFiles));
      if (remove) {
        // 删除文件
        removeFiles(unUsedFiles);
      }
    });
  }
}

// 获取指定目录下所有文件
function getAllFiles(dirPath) {
  const allFiles = [];
  function fn(dirPath) {
    const files = fs.readdirSync(dirPath);
    files.forEach((item) => {
      const fp = path.resolve(dirPath, `./${item}`);
      const tmp = fs.lstatSync(fp);
      if (tmp.isDirectory()) {
        fn(fp);
      } else {
        allFiles.push(fp);
      }
    });
  }
  fn(dirPath);
  return allFiles;
}

// 过滤文件
function filterFiles(option) {
  const {
    allFiles = [],
    exclude = [],
    excludeSuffix = [],
    includeSuffix = [],
  } = option;

  // 过滤 exclude
  const allFileList1 = allFiles.filter((item) => {
    return !exclude.find((ex) => {
      const reg = new RegExp(ex);
      return reg.test(item);
    });
  });

  // 过滤 excludeSuffix
  const allFileList2 = allFileList1.filter((item) => {
    return excludeSuffix.indexOf(path.extname(item)) < 0;
  });

  // 过滤 includeSuffix
  const allFileList3 =
    includeSuffix.length > 0
      ? allFileList2.filter((item) => {
          return includeSuffix.indexOf(path.extname(item)) >= 0;
        })
      : allFileList2;

  return allFileList3;
}

// 生成文件json
function jsonFiles(file, data) {
  // !fs.existsSync(dir) && fs.mkdirSync(dir);
  fs.writeFileSync(`./${file}`, data);
}

// 删除文件
function removeFiles(unUsedFiles) {
  unUsedFiles.forEach((file) => {
    fs.unlink(file, (err) => {
      if (err) {
        console.log(`${file}: delete failed.`);
        throw err;
      }
    });
  });
}

module.exports = UnusedFilePingin;
