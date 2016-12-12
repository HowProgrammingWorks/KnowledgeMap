'use strict';

function KnowledgeGraph() {
  this.vertices = [];
  this.size = 0;
}

KnowledgeGraph.prototype.add = function(element) {
  if (this.vertices.length >= 1) {
    // add edges from dependent vertices to this one
    this.vertices
      .filter(v => element.dependencies.findIndex(e => e === v.name) !== -1)
      .forEach(v => v.dependent.push(element.name));

    // add edges from this vertex to dependent
    this.vertices
      .filter(v => v.dependencies.findIndex(e => e === element.name) !== -1)
      .forEach(v => element.dependent.push(v.name));
  }

  this.vertices.push(element);
  this.size++;
}

// Get vertex by name
//
KnowledgeGraph.prototype.get = function(name) {
  return this.vertices.find(v => v.name === name);
}

/*
 * name - repository name
 * languages - list of languages used in repo
 * description - repo description
 * dependencies - repos this repo depends on
 * dependent - repos dependent on this repo
 */
function Vertex(name, languages, description, dependencies) {
  this.name = name;
  this.languages = languages;
  this.description = description;
  this.dependencies = dependencies;
  this.dependent = [];
}

/* Example:

let graph = new KnowledgeGraph();
graph.add(new Vertex('one', ['js'], {en:'test'}, ['two', 'three']));

graph.add(new Vertex('two', ['js'], {en:'test'}, ['one']));

graph.add(new Vertex('three', ['js'], {en:'test'}, ['two']));

console.dir(graph.get('one'));
console.dir(graph.get('two'));
console.dir(graph.get('three'));

*/
