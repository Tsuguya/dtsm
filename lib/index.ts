/// <reference path="../node_modules/fs-git/fs-git.d.ts" />
/// <reference path="../node_modules/packagemanager-backend/packagemanager-backend.d.ts" />

/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/es6-promise/es6-promise.d.ts" />
/// <reference path="../typings/mkdirp/mkdirp.d.ts" />
/// <reference path="../typings/rimraf/rimraf.d.ts" />

try {
    // optional
    require("source-map-support").install();
} catch (e) {
}

import fs = require("fs");
import mkdirp = require("mkdirp");
import _path = require("path");

import fsgit = require("fs-git");
import _pmb = require("packagemanager-backend");

export interface IRecipe {
    baseRepo:string;
    baseRef:string;
    path:string;
    dependencies:{[path:string]:_pmb.PackageManagerBackend.IDependency};
}

export class Manager {

    rootDir = "~/.dtsm";
    baseRepo = "https://github.com/borisyankov/DefinitelyTyped.git";
    baseRef = "master";
    path = "typings";

    pmb:_pmb.PackageManagerBackend;

    constructor() {
        this.pmb = new _pmb.PackageManagerBackend({
            rootDir: this.rootDir,
            offlineFirst: true,
            repos: [
                {
                    url: this.baseRepo,
                    ref: this.baseRef
                }
            ]
        });
    }

    init(path:string):string {
        var content = this.load(path);
        content = content || <any>{};
        content.baseRepo = content.baseRepo || this.baseRepo;
        content.baseRef = content.baseRef || this.baseRef;
        content.path = content.path || this.path;
        content.dependencies = content.dependencies || {};

        return this.save(path, content);
    }

    load(path:string):IRecipe {
        var recipe:IRecipe;

        if (fs.existsSync(path)) {
            recipe = JSON.parse(fs.readFileSync(path, "utf8"));
        }
        return recipe;
    }

    save(path:string, recipe:IRecipe):string {
        var jsonContent = JSON.stringify(recipe, null, 2);

        mkdirp.sync(_path.resolve(path, "../"));
        fs.writeFileSync(path, jsonContent);

        return jsonContent;
    }

    search(phrase:string):Promise<fsgit.IFileInfo[]> {
        return this.pmb.search({
            globPatterns: [
                "**/*.d.ts",
                "!_infrastructure/**/*"
            ]
        }).then(fileList=> {
            return fileList.filter(fileInfo => fileInfo.path.indexOf(phrase) !== -1);
        }).then(fileList=> {
            var reorderedList:fsgit.IFileInfo[] = [];
            fileList = fileList.sort((a, b) => a.path.length - b.path.length);
            // exact match
            fileList.forEach(fileInfo => {
                if (fileInfo.path === phrase) {
                    reorderedList.push(fileInfo);
                }
            });
            // library name match
            fileList.forEach(fileInfo => {
                if (fileInfo.path === phrase + "/" + phrase + ".d.ts" && reorderedList.indexOf(fileInfo) === -1) {
                    reorderedList.push(fileInfo);
                }
            });
            // .d.t.s file match
            fileList.forEach(fileInfo => {
                if (fileInfo.path.indexOf("/" + phrase + ".d.ts") !== -1 && reorderedList.indexOf(fileInfo) === -1) {
                    reorderedList.push(fileInfo);
                }
            });
            // directory name match
            fileList.forEach(fileInfo => {
                if (fileInfo.path.indexOf(phrase + "/") === 0 && reorderedList.indexOf(fileInfo) === -1) {
                    reorderedList.push(fileInfo);
                }
            });

            // junk
            fileList.forEach(fileInfo => {
                if (reorderedList.indexOf(fileInfo) === -1) {
                    reorderedList.push(fileInfo);
                }
            });

            return reorderedList;
        });
    }

    install(opts:{path:string; save:boolean;}, phrases:string[]):Promise<_pmb.PackageManagerBackend.IResult> {
        if (!opts.path) {
            return Promise.reject("path is required");
        }
        var content = this.load(opts.path);
        if (!content && opts.save) {
            return Promise.reject(opts.path + " is not exists");
        }

        var promises = phrases.map(phrase => {
            return this.search(phrase).then(fileList => {
                if (fileList.length === 1) {
                    return Promise.resolve(fileList[0]);
                } else if (fileList.length === 0) {
                    return Promise.reject(phrase + " is not found");
                } else {
                    var found:fsgit.IFileInfo;
                    // exact match
                    found = fileList.filter(fileInfo => fileInfo.path === phrase)[0];
                    if (found) {
                        return Promise.resolve(found);
                    }
                    // exact match without ext
                    found = fileList.filter(fileInfo => fileInfo.path === phrase + ".d.ts")[0];
                    if (found) {
                        return Promise.resolve(found);
                    }
                    // library name match
                    found = fileList.filter(fileInfo => fileInfo.path === phrase + "/" + phrase + ".d.ts")[0];
                    if (found) {
                        return Promise.resolve(found);
                    }
                    return Promise.reject(phrase + " could not be identified. found: " + fileList.length);
                }
            });
        });
        return Promise.all(promises)
            .then((fileList:fsgit.IFileInfo[])=> {
                if (!opts.save) {
                    return fileList;
                }
                fileList.forEach(fileInfo => {
                    if (content.dependencies[fileInfo.path]) {
                        return;
                    }
                    content.dependencies[fileInfo.path] = {
                        ref: fileInfo.ref
                    };
                });
                this.save(opts.path, content);

                return fileList;
            })
            .then((fileList:fsgit.IFileInfo[])=> {
                content = content || <any>{};
                content.baseRepo = content.baseRepo || this.baseRepo;
                content.baseRef = content.baseRef || this.baseRef;
                content.path = content.path || this.path;
                content.dependencies = content.dependencies || {};
                var diff:IRecipe = {
                    baseRepo: content.baseRepo,
                    baseRef: content.baseRef,
                    path: content.path,
                    dependencies: {}
                };
                fileList.forEach(fileInfo => {
                    diff.dependencies[fileInfo.path] = {
                        ref: fileInfo.ref // TODO expend ref
                    };
                });
                return this.installFromOptions(diff);
            });
    }

    installFromFile(path:string):Promise<_pmb.PackageManagerBackend.IResult> {
        "use strict";

        if (!path) {
            return Promise.reject("path is required");
        }
        var content = this.load(path);
        if (!content) {
            return Promise.reject(path + " is not exists");
        }

        return this.installFromOptions(content);
    }

    installFromOptions(recipe:IRecipe):Promise<_pmb.PackageManagerBackend.IResult> {
        return this.pmb.getByRecipe({
            baseRepo: recipe.baseRepo,
            baseRef: recipe.baseRef,
            path: recipe.path,
            dependencies: recipe.dependencies,
            postProcessForDependency: (recipe, dep, content) => {
                var reference = /\/\/\/\s+<reference\s+path=["']([^"']*)["']\s*\/>/;
                var body:string = content.toString("utf8");
                body
                    .split("\n")
                    .map(line => line.match(reference))
                    .filter(matches => !!matches)
                    .forEach(matches => {
                        this.pmb.pushAdditionalDependency(recipe, dep, matches[1]);
                    });
            }
        }).then(result => {
            var errors:any[] = Object.keys(result.dependencies).map(depName => {
                var depResult = result.dependencies[depName];
                return depResult.error;
            }).filter(error => !!error);
            if (errors.length !== 0) {
                // TODO toString
                return Promise.reject(errors);
            }

            Object.keys(result.dependencies).forEach(depName => {
                var dep = result.recipe.dependencies[depName];
                var depResult = result.dependencies[depName];

                var path = _path.resolve(recipe.path, dep.path);
                mkdirp.sync(_path.resolve(path, "../"));
                fs.writeFileSync(path, depResult.content.toString("utf8"));
            });

            return Promise.resolve(result);
        });
    }

    uninstall(opts:{path:string; save:boolean;}, phrase:string):Promise<fsgit.IFileInfo[]> {
        // TODO
        return null;
    }

    outdated():Promise<fsgit.IFileInfo[]> {
        // TODO
        return null;
    }

    fetch():Promise<void> {
        return this.pmb
            .fetch(this.baseRepo)
            .then(repo => repo.gitFetchAll())
            .then(()=> Promise.resolve(<any>null));
    }
}

var manager = new Manager();

export var init:typeof manager.init = manager.init.bind(manager);
export var search:typeof manager.search = manager.search.bind(manager);
export var fetch:typeof manager.fetch = manager.fetch.bind(manager);
export var installFromFile:typeof manager.installFromFile = manager.installFromFile.bind(manager);
export var install:typeof manager.install = manager.install.bind(manager);
export var uninstall:typeof manager.uninstall = manager.uninstall.bind(manager);
export var outdated:typeof manager.outdated = manager.outdated.bind(manager);