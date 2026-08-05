const test = require('node:test');
const assert = require('node:assert/strict');
const { buildTreeAnimationSteps, TREE_TYPES } = require('../tree-visualizer');

test('buildTreeAnimationSteps creates insertion steps for BST', () => {
  const steps = buildTreeAnimationSteps('bst', '10,5,3,7', 'insert', '');
  assert.ok(steps.length > 0);
  assert.equal(steps[0].type, 'insert');
  assert.equal(steps[0].treeType, 'bst');
});

test('TREE_TYPES contains the requested tree families', () => {
  assert.deepEqual(TREE_TYPES, ['BST', 'AVL', 'Trie', 'Heap', 'Red Black Tree']);
});
