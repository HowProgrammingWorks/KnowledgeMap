'use strict';

function KnowledgeGraph() {
  this.vertices = [];
  this.size = 0;
}

KnowledgeGraph.prototype.add = function(
  name,
  languages,
  description,
  dependencies
) {
  const element = {
    name,
    languages,
    description,
    dependencies,
    dependent: []
  };
  if (this.vertices.length >= 1) {
    // add edges from dependent vertices to this one
    this.vertices
      .filter(v => !!element.dependencies.find(e => e === v.name))
      .forEach(v => {
        v.dependent.push(element.name);
      });

    // add edges from this vertex to dependent
    this.vertices
      .filter(v => !!v.dependencies.find(e => e === element.name))
      .forEach(v => {
        element.dependent.push(v.name);
      });
  }

  this.vertices.push(element);
  this.size++;
};

// Get vertex by name
//
KnowledgeGraph.prototype.get = function(name) {
  return this.vertices.find(v => v.name === name);
};

module.exports = KnowledgeGraph;
