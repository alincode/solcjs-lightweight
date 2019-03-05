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

  it('interface', async () => {
    let compiler = await solcjs();

    const sourceCode = `
  pragma solidity ^0.5.0;

    import "https://gist.githubusercontent.com/ryestew/add9633c2b0101f6fda0aadcfe350f60/raw/f4b63d9b95be22c4b676477c42cb49c22db04c3a/ERC20Mintable.sol";
    import "https://gist.githubusercontent.com/ryestew/add9633c2b0101f6fda0aadcfe350f60/raw/f4b63d9b95be22c4b676477c42cb49c22db04c3a/Ballot.sol";

    contract AwardToken is ERC20Mintable {
        uint quantity;
        uint ballotPeriod = 7 hours;
        Ballot public currBallot;
        address[] public prevWinners;
        event log (string _msg);
        event winLog (address _win);
        event newBallot (address _addr);

        constructor () public {
            quantity = 100;
        }

        function getPreviousWinners() public view returns (address[] memory) {
          return prevWinners;
        }

        // either a name change or it works fine without it
        // function approve(address spender, uint256 value) public returns (bool);
        function startRound() onlyMinter public returns (bool) {
            // if this is the first minting then we should let this go immediately
            if (address(currBallot) == address (0x0)) {
                currBallot = new Ballot(ballotPeriod);
              emit newBallot(address (currBallot));
            } else {
                return false;
            }
        }

        function closeRoundEarly () public onlyMinter {
            if (address(currBallot) != address (0x0) && !currBallot.timeOut()) {
              currBallot.finish();
            } else revert();
        }

        function closeRound() public onlyMinter {
            //  this can only be done by the owner of the contract

            if (address(currBallot) != address(0x0) && currBallot.timeOut()) {
                // get winner
                address winner = currBallot.winningProposal();
                emit winLog(winner);
                // send to winner - but first make sure the address is valid
                if ( winner == address(0x0)){
                    emit log("no winner");
                } else {
                    emit winLog(winner);
                    super.mint(winner, quantity);
                    prevWinners.push(winner);
                }
                delete currBallot;
                // start new round
            }else revert();
        }

        function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
            revert();
        }

        function approve(address _spender, uint256 _value) public returns (bool) {
            revert();
        }

        function increaseApproval(address _spender, uint _addedValue) public returns (bool) {
            revert();
        }

        function decreaseApproval(address _spender, uint _subtractedValue) public returns (bool) {
            revert();
        }

        function transfer(address _to, uint256 _value) public returns (bool) {
            revert();
        }

    }`;

    let myDB = new Map();
    myDB.set('lib.sol', 'library L { function f() internal returns (uint) { return 7; } }');

    const ResolverEngine = require('solc-resolver').resolverEngine;
    let resolveGithub = require('resolve-github');
    let resolveIpfs = require('resolve-ipfs');
    let resolveHttp = require('resolve-http');

    let resolverEngine = new ResolverEngine();
    resolverEngine.addResolver(resolveGithub);
    resolverEngine.addResolver(resolveIpfs);
    resolverEngine.addResolver(resolveHttp);

    const getImportContent = async function (path) {
      return myDB.has(path) ? myDB.get(path) : await resolverEngine.require(path);
    };

    let output = await compiler(sourceCode, getImportContent);
    test(output);
  });

});