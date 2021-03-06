/// <reference path="../node_modules/fs-git/fs-git.d.ts" />
/// <reference path="../node_modules/packagemanager-backend/packagemanager-backend.d.ts" />

/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/insight/insight.d.ts" />
/// <reference path="../typings/es6-promise/es6-promise.d.ts" />
/// <reference path="../typings/mkdirp/mkdirp.d.ts" />
/// <reference path="../typings/rimraf/rimraf.d.ts" />
/// <reference path="../typings/which/which.d.ts" />

export import Tracker = require("./tracker");

/* tslint:disable:no-unused-variable */
import ma = require("./manager");
export import createManager = ma.createManager;
export import Manager = ma.Manager;
/* tslint:enable:no-unused-variable */

/* tslint:disable:no-unused-variable */
import m = require("./model");
export import Options = m.Options;
export import Recipe = m.Recipe;
export import GlobalConfig = m.GlobalConfig;
/* tslint:enable:no-unused-variable */
