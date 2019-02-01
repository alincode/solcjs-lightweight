require('solcjs-mock')();

const chai = require('chai');
chai.should();
const solcjs = require('../src/index');

async function test(output) {
  let item = output[0];
  item.should.have.all.keys('name', 'abi', 'sources', 'compiler', 'assembly', 'binary', 'metadata');
  item.metadata.analysis.should.have.all.keys('warnings', 'others');
}

describe('index', () => {
  let compiler;

  it('await solcjs() - get latest compiler', async () => {
    compiler = await solcjs();
    compiler.should.be.a('function');
  });

  it('solcjs.versions()', async () => {
    let select = await solcjs.versions();
    const { releases, nightly, all } = select;
    releases[0].indexOf('stable').should.be.above(-1);
  });

  it('solcjs.versions()', async () => {
    let version = 'v0.4.25-stable-2018.09.13';
    let url = await solcjs.version2url(version);
    url.should.be.eq('https://solc-bin.ethereum.org/bin/soljson-v0.4.25+commit.59dbf8f1.js');
  });

  it('compiler.version - name and url', async () => {
    compiler.version.should.have.all.keys('name', 'url');
    compiler.version.name.should.be.a('string');
    compiler.version.url.should.be.a('string');
  });

  it('await compiler(sourceCode)', async () => {
    compiler.should.be.a('function');

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
    test(output);
  });

  it('await compiler(sourceCode, getImportContent)', async () => {
    compiler.should.be.a('function');

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
      return myDB.get(path);
    };

    let output = await compiler(sourceCode, getImportContent);
    test(output);
  });

});