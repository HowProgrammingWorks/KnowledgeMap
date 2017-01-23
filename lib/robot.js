'use strict';

global.api = {};

api.vm = require('vm');
api.https = require('https');
api.metasync = require('metasync');

const COLLECT_TIMEOUT = 5000;

global.application = {};
application.repos = {};

application.repoUrl = function(repoName) {
  return (
    'https://raw.githubusercontent.com/HowProgrammingWorks/' +
    repoName +
    '/master/knowledge.map'
  );
};

application.getRepo = function(repoName, callback) {
  let repo = application.repos[repoName];
  let err = null;

  if (repo) {
    callback(err, repo);
  } else {
    let buf = '';
    const url = application.repoUrl(repoName);

    repo = {
      name: repoName,
      from: [], // links from dependencies
      to: [], // links to dependencies
      map: null
    };

    application.repos[repoName] = repo;

    const req = api.https.get(url, res => {
      if (res.statusCode === 200) {
        res.on('data', data => {
          buf += data.toString();
        });
      } else {
        err = new Error('File not found');
      }
    });

    req.on('close', () => {
      repo.map = application.parseMap(buf);
      callback(err, repo);
    });

    req.on('error', e => err = e);
  }
};

application.parseMap = function(src) {
  if (src) {
    const code = '(' + src + ')';
    const script = new api.vm.Script(code, {});
    const map = script.runInThisContext();
    return map;
  } else {
    return {};
  }
};

application.checkRepo = function(repoName, dc) {
  const repo = application.repos[repoName];
  if (repo) {
    console.log('\nPrevent recursion: ' + repoName);
    if (dc) dc.collect(repoName);
  } else {
    application.getRepo(repoName, (err, repo) => {
      if (dc) dc.collect(repoName);
      if (err) {
        console.log('\nNo knownedge.map in repository: ' + repoName);
      } else {
        console.log(
          '\nRepository: ' + repoName +
          '\nDependencies: ' + repo.map.dependencies.join(', ')
        );
        const dCount = repo.map.dependencies.length;
        const dCol = new api.metasync.DataCollector(dCount, COLLECT_TIMEOUT);
        dCol.on('done', () => {
          console.log('All dependencies are processed for: ' + repoName);
        });
        repo.map.dependencies.forEach(
          name => application.checkRepo(name, dCol)
        );
      }
    });
  }
};

application.checkRepo('Composition');
application.checkRepo('Functor');
