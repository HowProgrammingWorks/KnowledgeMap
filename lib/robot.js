'use strict';

const vm = require('vm');
const https = require('https');
const metasync = require('metasync');

const COLLECT_TIMEOUT = 5000;

const repos = {};

const repoUrl = (repoName) => (
  'https://raw.githubusercontent.com/HowProgrammingWorks/' +
  repoName + '/master/knowledge.map'
);

const parseMap = (src) => {
  if (!src) return {};
  const code = '(' + src + ')';
  const script = new vm.Script(code, {});
  const map = script.runInThisContext();
  return map;
};

const getRepo = (
  repoName, // repo name
  callback // function, (err, fileContent)
) => {
  let repo = repos[repoName];
  let err = null;

  if (repo) {
    callback(err, repo);
  } else {
    const buffers = [];
    const url = repoUrl(repoName);

    repo = {
      name: repoName,
      from: [], // links from dependencies
      to: [], // links to dependencies
      map: null
    };

    repos[repoName] = repo;

    const req = https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.on('data', data => {
          buffers.push(data);
        });
      } else {
        err = new Error('File not found');
        callback(err);
      }
    });

    req.on('close', () => {
      if (err) return;
      const result = Buffer.concat(buffers).toString();
      repo.map = parseMap(result);
      callback(null, repo);
    });

    req.on('error', (e) => {
      err = e;
      callback(err);
    });
  }
};

const checkRepo = (repoName, dc) => {
  const repo = repos[repoName];
  if (repo) {
    console.log('\nPrevent double getting: ' + repoName);
    if (dc) dc.pick(repoName, repo);
    return;
  }
  getRepo(repoName, (err, repo) => {
    if (err) {
      if (dc) dc.fail(repoName, err);
      console.log(`\nNo knownedge.map in repository: ${repoName}`);
      return;
    }
    if (dc) dc.pick(repoName, repo);
    const list = repo.map.dependencies.join(', ');
    console.log(`\nRepository: ${repoName}\nDependencies: ${list}`);
    const dCount = repo.map.dependencies.length;
    const dCol = metasync.collect(dCount)
      .timeout(COLLECT_TIMEOUT)
      .done(() => {
        console.log('All dependencies are processed for: ' + repoName);
      });
    repo.map.dependencies.forEach((name) => {
      checkRepo(name, dCol);
    });
  });
};

checkRepo('EventDrivenProgramming');

checkRepo('Composition');
checkRepo('Functor');
