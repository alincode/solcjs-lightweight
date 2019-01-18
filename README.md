# solcjs lightweight

![Travis](https://img.shields.io/travis/alincode/solcjs-lightweight.svg)
[![codecov](https://codecov.io/gh/alincode/solcjs-lightweight/branch/master/graph/badge.svg)](https://codecov.io/gh/alincode/solcjs-lightweight)![npm downloads](https://img.shields.io/npm/dt/solcjs-lightweight.svg)
[![Dependency Status](https://img.shields.io/david/alincode/solcjs-lightweight.svg?style=flat)](https://david-dm.org/alincode/solcjs-lightweight)

### Install

```sh
npm install solcjs-lightweight
```

### Usage

```js
const solcjs = require('solcjs-lightweight');
```
**await solcjs(version)**

```js
const version = 'v0.5.1-stable-2018.12.03';
let compiler = await solcjs(version);

// or

// let compiler = await solcjs();

const sourceCode = `
  pragma solidity >0.4.99 <0.6.0;

  library OldLibrary {
    function someFunction(uint8 a) public returns(bool);
  }

  contract NewContract {
    function f(uint8 a) public returns (bool) {
        return OldLibrary.someFunction(a);
    }
  }`;
let output = await compiler(sourceCode);
```

**await compiler(sourceCode, getImportContent)**

```js
const version = 'v0.5.1-stable-2018.12.03';
let compiler = await solcjs(version);
const solcResolver = require('solc-resolver');

const sourceCode = `
  pragma solidity >0.4.99 <0.6.0;

  import "lib.sol";

  library OldLibrary {
    function someFunction(uint8 a) public returns(bool);
  }

  contract NewContract {
    function f(uint8 a) public returns (bool) {
        return OldLibrary.someFunction(a);
    }
  }`;

let myDB = new Map();
myDB.set('lib.sol', 'library L { function f() internal returns (uint) { return 7; } }');

const getImportContent = async function (path) {
  return myDB.has(path) ? myDB.get(path) : await solcResolver.getImportContent(path);
};

let output = await compiler(sourceCode, getImportContent);
```

**await compiler(sourceCode);**

```js
let compiler = await solcjs();

const sourceCode = `
  library OldLibrary {
      function someFunction(uint8 a) public returns(bool);
  }

  contract NewContract {
      function f(uint8 a) public returns (bool) {
          return OldLibrary.someFunction(a);
      }
  }`;

let output = await compiler(sourceCode);
```

**await solcjs(version).version**

```js
const version = 'v0.4.25-stable-2018.09.13';
let compiler = await solcjs(version);
console.dir(compiler.version);
// { name: 'v0.4.25-stable-2018.09.13',
// url: 'https://solc-bin.ethereum.org/bin/soljson-v0.4.25+commit.59dbf8f1.js' }
```

**await solcjs.versions()**

```js
const solcjs = require('solc-js');
let select = await solcjs.versions();
const { releases, nightly, all } = select;
console.log(releases[0]);
// v0.4.25-stable-2018.09.13
```

**await solcjs.version2url(version)**

```js
const solcjs = require('solc-js');
let version = 'v0.4.25-stable-2018.09.13';
let url = await solcjs.version2url(version);
console.log(url);
// https://solc-bin.ethereum.org/bin/soljson-v0.4.25+commit.59dbf8f1.js
```

```js
const solcjs = require('solc-js');
let version = 'latest';
let url = await solcjs.version2url(version);
console.log(url);
// https://solc-bin.ethereum.org/bin/soljson-v0.1.1+commit.6ff4cd6.js
```

## License
MIT © [alincode](https://github.com/alincode/solcjs-lightweight)