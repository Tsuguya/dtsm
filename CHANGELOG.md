<a name="0.7.0"></a>
## 0.7.0 (2015-02-25)


#### Features

* **deps:**
  * add archy to dependencies ([1e8321da](https://github.com/vvakame/dtsm/commit/1e8321da5eefe8c6616390c61d342fb0b0193a81))
  * update dependencies and apply packagemanager-backend 0.5.0 ([888b2270](https://github.com/vvakame/dtsm/commit/888b227080acaa761458d701d2ec1c4cf50d92a6))
* **dtsm:**
  * improve display dependency tree styling ([1a374496](https://github.com/vvakame/dtsm/commit/1a37449609bf7537e46fa472f16d385ffb8ef593))
  * implement resolveMissingDependency ([15af730b](https://github.com/vvakame/dtsm/commit/15af730b99457d9ba39584851c8917c3c515e8bf))
  * improve install result displaying ([001f348c](https://github.com/vvakame/dtsm/commit/001f348c700f6b6bee928eb2bb1913092590a057))
  * add utils.padString function ([e13ee8a1](https://github.com/vvakame/dtsm/commit/e13ee8a19b3154f5ceba7f1ffc4ef8a89af86857))


<a name="0.6.1"></a>
### 0.6.1 (2015-02-09)


#### Bug Fixes

* **dtsm:** fix install from file is failed when dtsm.json are hand assembled ([e0c7a9a9](https://github.com/vvakame/dtsm/commit/e0c7a9a98f7f3cc2b83462796242a8aa3f03d1f4))


<a name="0.6.0"></a>
## 0.6.0 (2015-02-08)


#### Features

* **dtsm:**
  * add `dtsm refs` sub-command ([f2ea9773](https://github.com/vvakame/dtsm/commit/f2ea9773897e0430049dd77ab44db2f27c71e835))
  * move feature of es6 polyfill main code to test code ([c9938369](https://github.com/vvakame/dtsm/commit/c99383697f10a8288aa87cdf9dde8640d09ce4ed))
  * add `--ref` option ([0a541f21](https://github.com/vvakame/dtsm/commit/0a541f21ce9ac9e0e50115e37898d347460a2e87))

If you want to get definition files for older version tsc, exec `dtsm --ref 1.3.0 install <libname>`.
If you know what ref-name accepted by dtsm, exec `dtsm refs`.

e.g. get definition files without union types!

```
$ dtsm refs
Branches:
	 0.8
	 0.9.1.1
	 0.9.5
	 1.0.1
	 1.3.0
	 def/node
	 master
$ dtsm --ref 1.3.0 search promise
Search results.

	chai-as-promised/chai-as-promised.d.ts
	es6-promise/es6-promise.d.ts
	es6-promises/es6-promises.d.ts
	promise-pool/promise-pool.d.ts
	promises-a-plus/promises-a-plus.d.ts
	tspromise/tspromise.d.ts
$ dtsm --ref 1.3.0 install es6-promise
es6-promise/es6-promise.d.ts
```

<a name="0.5.0"></a>
## 0.5.0 (2015-02-08)


#### Features

* **deps:** add grunt-conventional-changelog ([6c30106a](https://github.com/vvakame/dtsm/commit/6c30106a3aa7d86e167fc4609e80288f359c87c9))
* **dtsm:** add update sub command ([d753cedf](https://github.com/vvakame/dtsm/commit/d753cedfbb92bfcaa17c38947d1bda8fbb88134c))

If you want to update dependencies revision, you can use `dtsm update` or `dtsm update --save`.

The general procedure.

```
$ dtsm update
...omitted...
$ npm run test
...omitted...
$ echo $?
0
$ dtsm update --save
$ git status -s
 M dtsm.json
```
