/*
 * @Author: Joker
 * @Date: 2023-05-09 10:27:55
 * @LastEditTime: 2023-05-10 11:28:42
 * @filePath: Do not edit
 * @Description: 
 */
const fs = require("fs")
const path = require("path")
const gulp = require("gulp")
const kolorist = require("kolorist")
const vite = require("vite")
const through2 = require("through2")
const matched = require("matched")
const tsMorph = require("ts-morph")

let project;
let include;
let sourceFiles;
let allFiles;
let multientry = "multientry:entry-point"
let fileName = "game.origin"
let myNamespace = "gameOrigin"
let outputDir = ".output"

/**获取两个输入参数 */
const processArgs = process.argv.splice(2)
const buildTask = ["defaultTask"]

function subFile(p) {
    if (p.substr(p.length - 3) == ".ts") {
        p = p.substr(0, p.length - 3);
    }
    return JSON.stringify(p);
}

let exportFunc = function exportFile(p) {
    return `export * from ${subFile(p)}`;
}

let importFunc = function importFile(p) {
    return `import ${subFile(p)}`;
}

async function buildTS() {
    console.log(kolorist.green("开始执行buildTS......"))
    await vite.build({
        optimizeDeps: {
            include: []
        },
        build: {
            /**不清空输出文件夹 */
            emptyOutDir: false,
            /**压缩方式 */
            minify: false,
            terserOptions: {

            },
            sourcemap: false,
            outDir: path.join(__dirname, outputDir),
            lib: {
                formats: ["iife"],
                entry: ["./src/**/*.*"],
                fileName: fileName,
                name: myNamespace
            },
            rollupOptions: {
                cache: true,
                treeshake: false,
                external: [],
                output: {
                    globals: {}
                }
            },
        },
        plugins: [
            {
                enforce: "pre",
                configResolved(config) {
                    console.log(kolorist.green("configResolved......"));
                    let root = config.root;
                    project = new tsMorph.Project({
                        tsConfigFilePath: path.resolve(__dirname, "./tsconfig.json"),
                        skipAddingFilesFromTsConfig: true,
                        skipLoadingLibFiles: true,
                        compilerOptions: {
                            rootDir: root,
                            outDir: path.join(__dirname, ".output", "dts"),
                            declaration: true,
                            noEmit: false,
                            emitDeclarationOnly: true,
                            emitOnlyDtsFiles: true,
                            removeComments: false,
                            skipLibCheck: true,
                            skipDefaultLibCheck: true,
                            skipLoadingLibFiles: true,
                        }
                    })
                },
                /**上一个钩子:	如果我们正在解析入口点，则为 buildStart，如果我们正在解析导入，则为 moduleParsed，否则作为 resolveDynamicImport 的后备。此外，此钩子可以通过调用 this.emitFile 来在构建阶段的插件钩子中触发以发出入口点，或随时调用 this.resolve 手动解析 id。
                下一个钩子:	如果尚未加载解析的 id，则为 load，否则为 buildEnd。 */
                resolveId(source, importer, options) {
                    console.log(kolorist.green("resolveId......"));
                    if (source === multientry) return source;
                    if (importer === multientry) return;
                    let importFile = path.join(path.dirname(importer), source);
                    let ext = path.extname(importFile);
                    if (ext != ".ts") {
                        importFile += ".ts";
                    }
                    importFile = importFile.replace(/\\/g, "/");
                    if (allFiles.indexOf(importFile) < 0) {
                        // allFiles.push(importFile);
                        return myNamespace;
                    }
                },
                /**上一个钩子：	moduleParsed、resolveId 或 resolveDynamicImport
                下一个钩子：	输出生成阶段的 outputOptions，因为这是构建阶段的最后一个钩子 */
                /**在 Rollup 完成产物但尚未调用 generate 或 write 之前调用；也可以返回一个 Promise。如果在构建过程中发生错误，则将其传递给此钩子。 */
                buildEnd(error) {
                    console.log(kolorist.green("buildEnd......"));
                    /**这里可以处理d.ts文件输出  */
                    // let im = sourceFiles[0].getImportDeclarations();
                    // for (let temp of im) {
                    //     console.log(kolorist.blue(temp.getModuleSpecifierValue()));
                    // }
                },
                /**上一个钩子 已解析加载的 id 的 resolveId 或 resolveDynamicImport。此外，此钩子可以通过调用 this.load 来从插件钩子中的任何位置触发预加载与 id 对应的模块 */
                /**下一个钩子： 如果未使用缓存，或者没有具有相同 code 的缓存副本，则为 transform，否则为 shouldTransformCachedModule */
                load(id) {
                    console.log(kolorist.green("load......"));
                    if (id === multientry) {
                        let patterns = include.concat();
                        return matched.promise(patterns, { realPath: true }).then((paths) => {
                            let pArr = [];
                            paths.forEach((element) => {
                                pArr.push(element.replace(/\\/g, "/"));
                            });
                            allFiles = allFiles.concat(pArr);
                            let pamp = paths.map(exportFunc).join('\n');
                            return pamp;
                        })
                    }
                },
                /**上一个钩子:	这是构建阶段的第一个钩子
                下一个钩子:	buildStart */
                options(options) {
                    console.log(kolorist.green("options......"));
                    include = options.input;
                    options.input = multientry;
                    sourceFiles = [];
                    allFiles = [];
                },
                /**上一个钩子:	load，用于加载当前处理的文件。如果使用缓存并且该模块有一个缓存副本，则为 shouldTransformCachedModule，如果插件为该钩子返回了 true
                下一个钩子:	moduleParsed，一旦文件已被处理和解析 */
                transform(code, id) {
                    console.log(kolorist.green("transform......"));
                    if (id === multientry) return;
                    let ext = path.extname(id);
                    if (ext == ".ts") sourceFiles.push(project.addSourceFileAtPath(id));
                }
            }
        ]
    })

    let filepath = path.join(__dirname, outputDir);
    filepath = filepath.replace(/\\/g, "/");
    await changeName(filepath + "/" + fileName + ".iife.js", filepath + "/" + fileName + ".js");
}

async function changeName(oldName, newName) {
    return new Promise((resolve, reject) => {
        fs.rename(oldName, newName, () => {
            resolve();
        });
    })
}

gulp.task("defaultTask", async () => {
    console.log(kolorist.green("__dirname=" + __dirname))
    await buildTS();
})

gulp.task("build", gulp.series(buildTask))