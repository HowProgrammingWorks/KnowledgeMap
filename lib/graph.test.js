'use strict';

const KnowledgeGraph = require('./graph');

// Example:

const graph = new KnowledgeGraph();
graph.add('one', ['js'], { en: 'test' }, ['two', 'three']);
graph.add('two', ['js'], { en: 'test' }, ['one']);
graph.add('three', ['js'], { en: 'test' }, ['two']);

console.dir(graph.get('one'));
console.dir(graph.get('two'));
console.dir(graph.get('three'));
