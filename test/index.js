require('./utils/mock')();

const chai = require('chai');
chai.should();
const solcjs = require('../src/index');

describe('index', () => {
  let latestCompiler;

  it('await solcjs() - get latest compiler', async () => {
    latestCompiler = await solcjs();
    latestCompiler.should.be.a('function');
  });

  it('compiler.version - name and url', async () => {
    latestCompiler.version.name.should.be.a('string');
    latestCompiler.version.url.should.be.a('string');
  });

  it('await compiler(sourceCode, getImportContent)', async () => {
    latestCompiler.should.be.a('function');

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

    let output = await latestCompiler(sourceCode, getImportContent);
    let item = output[0];
    item.should.have.all.keys('name', 'abi', 'sources', 'compiler', 'assembly', 'binary', 'metadata');
    item.metadata.analysis.should.have.all.keys('warnings', 'others');
  });


});