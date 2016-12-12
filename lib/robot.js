global.api = {};

api.vm = require('vm');
api.https = require('https');
api.metasync = require('metasync');

global.application = {};
application.repos = {};

function repoUrl(repoName) {
  return (
    'https://raw.githubusercontent.com/HowProgrammingWorks/' +
    repoName +
    '/master/knowledge.map'
  );
}

function getRepo(repoName, callback) {
  let repo = application.repos[repoName];
  let err = null;

  if (repo) {
    callback(err, repo);
  } else {
    let buf = '';
    let url = repoUrl(repoName);

    repo = {
      name: repoName,
      from: [], // links from dependencies
      to: [], // links to dependencies
      map: null
    };

    application.repos[repoName] = repo;

    let req = api.https.get(url, res => {
      if (res.statusCode === 200) {
        res.on('data', data => {
          buf += data.toString();
        });
      } else {
        err = new Error('File not found');
      }
    });

    req.on('close', () => {
      repo.map = parseMap(buf);
      callback(err, repo);
    });

    req.on('error', e => err = e);
  }
}

function parseMap(src) {
  if (src) {
    let code = '(' + src + ')';
    let script = new api.vm.Script(code, {});
    let map = script.runInThisContext();
    return map;
  } else {
    return {};
  }
}

function checkRepo(repoName) {
  let repo = application.repos[repoName];
  if (repo) {
    console.log('\nPrevent recursion: ' + repoName);
  } else {
    getRepo(repoName, (err, repo) => {
      if (err) {
        console.log('\nNo knownedge.map in repository: ' + repoName);
      } else {
        console.log(
          '\nRepository: ' + repoName +
          '\nDependencies: ' + repo.map.dependencies.join(', ')
        );
        repo.map.dependencies.forEach(name => checkRepo(name));
      }
    });
  }
}

checkRepo('Composition');
checkRepo('Generators');
