class TreeVisualizerEngine {
  constructor(treeType, values, operation, target) {
    this.treeType = treeType;
    this.values = values;
    this.operation = operation;
    this.target = target;
  }

  buildSteps() {
    const values = this.values.filter((value) => value !== '');
    const targetValue = String(this.target || '').trim();
    const steps = [];
    const tree = this.createTree();

    if (this.treeType === 'trie') {
      values.forEach((value, index) => {
        tree.insert(String(value));
        steps.push(this.makeStep('insert', `Build ${value}`, index, tree, value));
      });

      if (this.operation === 'insert' && targetValue) {
        tree.insert(targetValue);
        steps.push(this.makeStep('insert', `Insert ${targetValue}`, steps.length, tree, targetValue));
      } else if (this.operation === 'search' && targetValue) {
        const found = tree.search(targetValue);
        steps.push(this.makeStep('search', found ? `Found ${targetValue}` : `${targetValue} not found`, steps.length, tree, targetValue));
      } else if (this.operation === 'delete' && targetValue) {
        const deleted = tree.delete(targetValue);
        steps.push(this.makeStep('delete', deleted ? `Delete ${targetValue}` : `${targetValue} not found`, steps.length, tree, targetValue));
      } else if (this.operation === 'prefix' && targetValue) {
        const matches = tree.startsWith(targetValue);
        const message = matches.length > 0 ? `Matches for prefix ${targetValue}` : `No matches for ${targetValue}`;
        const step = this.makeStep('prefix', message, steps.length, tree, targetValue);
        step.meta.matches = matches;
        steps.push(step);
      } else if (['bfs', 'dfs', 'traverse'].includes(this.operation)) {
        const traversal = tree.traverse(this.operation);
        const labelMap = {
          dfs: 'DFS Visit',
          bfs: 'BFS Visit',
          traverse: 'Visit'
        };
        const label = labelMap[this.operation] || 'Visit';
        traversal.forEach((val, index) => {
          steps.push(this.makeStep(this.operation, `${label} ${val}`, steps.length, tree, val));
        });
      }

      return steps;
    }

    const insertValues = values.slice(0, Math.min(values.length, 6));
    insertValues.forEach((value, index) => {
      tree.insert(Number(value));
      steps.push(this.makeStep('insert', `Insert ${value}`, index, tree, value));
    });

    if (this.operation === 'insert' && targetValue) {
      tree.insert(Number(targetValue));
      steps.push(this.makeStep('insert', `Insert ${targetValue}`, steps.length, tree, targetValue));
    }

    if (this.operation === 'delete' && targetValue) {
      tree.delete(Number(targetValue));
      steps.push(this.makeStep('delete', `Delete ${targetValue}`, steps.length, tree, targetValue));
    }

    if (this.operation === 'search' && targetValue) {
      const found = tree.search(Number(targetValue));
      steps.push(this.makeStep('search', found ? `Found ${targetValue}` : `${targetValue} not found`, steps.length, tree, targetValue));
    }

    const isTraverse = ['traverse', 'inorder', 'preorder', 'postorder', 'dfs', 'bfs'].includes(this.operation);
    if (isTraverse) {
      const traversal = tree.traverse(this.operation);
      const labelMap = {
        inorder: 'In-Order Visit',
        preorder: 'Pre-Order Visit',
        postorder: 'Post-Order Visit',
        dfs: 'DFS Visit',
        bfs: 'BFS Visit',
        traverse: 'Visit'
      };
      const label = labelMap[this.operation] || 'Visit';
      traversal.forEach((val, index) => {
        steps.push(this.makeStep(this.operation, `${label} ${val}`, steps.length, tree, val));
      });
    }

    return steps;
  }

  createTree() {
    const treeType = this.treeType;
    switch (treeType) {
      case 'none':
      case 'bst':
        return new BinarySearchTree();
      case 'avl':
        return new AVLTree();
      case 'heap':
      case 'heap-tree':
        return new HeapTree();
      case 'red-black':
        return new RedBlackTree();
      case 'trie':
        return new TrieTree();
      default:
        return new BinarySearchTree();
    }
  }

  makeStep(type, title, index, tree, value) {
    const snapshot = tree.snapshot();
    const metadata = {
      activeValue: value,
      accent: this.treeType === 'avl' ? 'rotation' : this.treeType === 'red-black' ? 'recolor' : 'standard',
      rotationHint: this.treeType === 'avl' ? (value % 2 === 0 ? 'Rotate Right' : 'Rotate Left') : null,
    };

    if (this.treeType === 'red-black') {
      this.applyRedBlackColors(snapshot);
    }

    if (this.treeType === 'avl') {
      this.annotateAVL(snapshot, value);
    }

    return {
      type,
      treeType: this.treeType,
      title,
      index,
      value,
      snapshot,
      message: `${title} • ${this.treeType.toUpperCase()}`,
      explanation: this.explanationFor(type, value),
      meta: metadata,
    };
  }

  applyRedBlackColors(node) {
    if (!node) return;
    node.color = node.color || 'red';
    if (node.left) this.applyRedBlackColors(node.left);
    if (node.right) this.applyRedBlackColors(node.right);
  }

  annotateAVL(node, value) {
    if (!node) return;
    node.rotationHint = node.rotationHint || { value, direction: value % 2 === 0 ? 'Rotate Right' : 'Rotate Left' };
    if (node.left) this.annotateAVL(node.left, value);
    if (node.right) this.annotateAVL(node.right, value);
  }

  explanationFor(type, value) {
    const base = [];
    if (type === 'insert') {
      base.push(`Add ${value} into the ${this.treeType.toUpperCase()} structure.`);
      base.push('The node is placed according to the tree rules and the view updates live.');
    } else if (type === 'delete') {
      base.push(`Remove ${value} from the ${this.treeType.toUpperCase()} structure.`);
      base.push('Rebalancing or restructuring is shown as the shape changes.');
    } else if (type === 'search') {
      base.push(`Search for ${value} within the ${this.treeType.toUpperCase()} structure.`);
      base.push('The simulation checks whether the value exists in the current tree.');
    } else if (type === 'prefix') {
      base.push(`Collect words with the prefix ${value} from the TRIE.`);
      base.push('The simulation shows which words begin with the given prefix.');
    } else if (['inorder', 'preorder', 'postorder', 'dfs', 'bfs', 'traverse'].includes(type)) {
      const names = {
        inorder: 'In-Order Traversal (Left → Node → Right)',
        preorder: 'Pre-Order Traversal (Node → Left → Right)',
        postorder: 'Post-Order Traversal (Left → Right → Node)',
        dfs: 'Depth-First Search (DFS)',
        bfs: 'Breadth-First Search (BFS / Level-Order)',
        traverse: 'Traversal'
      };
      const name = names[type] || `${this.treeType.toUpperCase()} traversal`;
      base.push(`Traverse using ${name} and visit node ${value}.`);
      base.push('The animation highlights the active node along the traversal path.');
    } else {
      base.push(`Traverse the ${this.treeType.toUpperCase()} structure and visit ${value}.`);
      base.push('The animation highlights the active path for each visited node.');
    }
    return base;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  insert(value) {
    const node = { value, left: null, right: null };
    if (!this.root) {
      this.root = node;
      return;
    }
    let current = this.root;
    while (true) {
      if (value < current.value) {
        if (!current.left) {
          current.left = node;
          return;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = node;
          return;
        }
        current = current.right;
      }
    }
  }

  delete(value) {
    this.root = this.remove(this.root, value);
  }

  remove(node, value) {
    if (!node) return null;
    if (value < node.value) {
      node.left = this.remove(node.left, value);
      return node;
    }
    if (value > node.value) {
      node.right = this.remove(node.right, value);
      return node;
    }
    if (!node.left) return node.right;
    if (!node.right) return node.left;
    const successor = this.findMin(node.right);
    node.value = successor.value;
    node.right = this.remove(node.right, successor.value);
    return node;
  }

  findMin(node) {
    let current = node;
    while (current.left) current = current.left;
    return current;
  }

  search(value) {
    let current = this.root;
    while (current) {
      if (value === current.value) return true;
      current = value < current.value ? current.left : current.right;
    }
    return false;
  }

  traverse(order = 'inorder') {
    const output = [];
    if (order === 'preorder' || order === 'dfs') {
      this.preorderWalk(this.root, output);
    } else if (order === 'postorder') {
      this.postorderWalk(this.root, output);
    } else if (order === 'bfs') {
      this.bfsWalk(this.root, output);
    } else {
      this.inorderWalk(this.root, output);
    }
    return output;
  }

  inorderWalk(node, output) {
    if (!node) return;
    this.inorderWalk(node.left, output);
    output.push(node.value);
    this.inorderWalk(node.right, output);
  }

  preorderWalk(node, output) {
    if (!node) return;
    output.push(node.value);
    this.preorderWalk(node.left, output);
    this.preorderWalk(node.right, output);
  }

  postorderWalk(node, output) {
    if (!node) return;
    this.postorderWalk(node.left, output);
    this.postorderWalk(node.right, output);
    output.push(node.value);
  }

  bfsWalk(node, output) {
    if (!node) return;
    const queue = [node];
    while (queue.length > 0) {
      const current = queue.shift();
      output.push(current.value);
      if (current.left) queue.push(current.left);
      if (current.right) queue.push(current.right);
    }
  }

  snapshot() {
    return this.serialize(this.root);
  }

  serialize(node) {
    if (!node) return null;
    return { value: node.value, left: this.serialize(node.left), right: this.serialize(node.right) };
  }
}

class AVLTree extends BinarySearchTree {
  insert(value) {
    this.root = this._insert(this.root, value);
  }

  _insert(node, value) {
    if (!node) return { value, left: null, right: null, height: 1 };
    if (value < node.value) node.left = this._insert(node.left, value);
    else node.right = this._insert(node.right, value);
    node.height = 1 + Math.max(this._height(node.left), this._height(node.right));
    const balance = this._balance(node);
    if (balance > 1) {
      if (value < node.left.value) return this._rotateRight(node);
      return this._rotateLeftRight(node);
    }
    if (balance < -1) {
      if (value > node.right.value) return this._rotateLeft(node);
      return this._rotateRightLeft(node);
    }
    return node;
  }

  _height(node) {
    return node ? node.height : 0;
  }

  _balance(node) {
    return this._height(node.left) - this._height(node.right);
  }

  _rotateRight(node) {
    const left = node.left;
    node.left = left.right;
    left.right = node;
    node.height = 1 + Math.max(this._height(node.left), this._height(node.right));
    left.height = 1 + Math.max(this._height(left.left), this._height(left.right));
    return left;
  }

  _rotateLeft(node) {
    const right = node.right;
    node.right = right.left;
    right.left = node;
    node.height = 1 + Math.max(this._height(node.left), this._height(node.right));
    right.height = 1 + Math.max(this._height(right.left), this._height(right.right));
    return right;
  }

  _rotateLeftRight(node) {
    node.left = this._rotateLeft(node.left);
    return this._rotateRight(node);
  }

  _rotateRightLeft(node) {
    node.right = this._rotateRight(node.right);
    return this._rotateLeft(node);
  }

  snapshot() {
    return this.serialize(this.root);
  }

  serialize(node) {
    if (!node) return null;
    return { value: node.value, left: this.serialize(node.left), right: this.serialize(node.right), height: node.height };
  }
}

class HeapTree extends BinarySearchTree {
  constructor() {
    super();
    this.root = null;
    this._nodes = [];
  }

  insert(value) {
    const node = { value, left: null, right: null, parent: null };
    if (!this.root) {
      this.root = node;
      this._nodes.push(node);
      return;
    }

    this._nodes.push(node);
    this._rebuildPointers();
    this._bubbleUp(this._nodes[this._nodes.length - 1]);
  }

  _bubbleUp(node) {
    while (node.parent && node.value > node.parent.value) {
      const temp = node.value;
      node.value = node.parent.value;
      node.parent.value = temp;
      node = node.parent;
    }
  }

  delete(value) {
    if (!this.root) return false;
    const index = this._nodes.findIndex((node) => node.value === value);
    if (index === -1) return false;

    const lastNode = this._nodes.pop();
    if (index < this._nodes.length) {
      this._nodes[index].value = lastNode.value;
      this._rebuildPointers();
      this._bubbleDown(this._nodes[index]);
      if (this._nodes[index].parent && this._nodes[index].value > this._nodes[index].parent.value) {
        this._bubbleUp(this._nodes[index]);
      }
    } else {
      this._rebuildPointers();
    }

    return true;
  }

  _bubbleDown(node) {
    while (node) {
      let largest = node;
      if (node.left && node.left.value > largest.value) largest = node.left;
      if (node.right && node.right.value > largest.value) largest = node.right;
      if (largest === node) break;
      const temp = node.value;
      node.value = largest.value;
      largest.value = temp;
      node = largest;
    }
  }

  _rebuildPointers() {
    if (this._nodes.length === 0) {
      this.root = null;
      return;
    }

    this.root = this._nodes[0];
    this.root.parent = null;
    for (let i = 0; i < this._nodes.length; i += 1) {
      const node = this._nodes[i];
      node.left = null;
      node.right = null;
      const leftIndex = 2 * i + 1;
      const rightIndex = 2 * i + 2;
      if (leftIndex < this._nodes.length) {
        node.left = this._nodes[leftIndex];
        this._nodes[leftIndex].parent = node;
      }
      if (rightIndex < this._nodes.length) {
        node.right = this._nodes[rightIndex];
        this._nodes[rightIndex].parent = node;
      }
    }
  }

  search(value) {
    return this._nodes.some((node) => node.value === value);
  }

  traverse(order = 'bfs') {
    if (order === 'bfs') {
      const result = [];
      const queue = this.root ? [this.root] : [];
      while (queue.length > 0) {
        const node = queue.shift();
        result.push(node.value);
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
      }
      return result;
    }
    return super.traverse(order);
  }

  snapshot() {
    return this.serialize(this.root);
  }

  serialize(node) {
    if (!node) return null;
    return { value: node.value, left: this.serialize(node.left), right: this.serialize(node.right) };
  }
}

class RedBlackTree extends BinarySearchTree {
  insert(value) {
    this.root = this._insert(this.root, value, false);
  }

  _insert(node, value, isRed) {
    if (!node) return { value, left: null, right: null, red: isRed };
    if (value < node.value) node.left = this._insert(node.left, value, true);
    else node.right = this._insert(node.right, value, false);
    return node;
  }

  snapshot() {
    return this.serialize(this.root);
  }

  serialize(node) {
    if (!node) return null;
    return { value: node.value, left: this.serialize(node.left), right: this.serialize(node.right), red: node.red };
  }
}

class TrieTree {
  constructor() {
    this.root = { children: {}, isWord: false };
  }

  insert(value) {
    let node = this.root;
    for (const char of String(value)) {
      if (!node.children[char]) node.children[char] = { children: {}, isWord: false };
      node = node.children[char];
    }
    node.isWord = true;
  }

  delete(value) {
    const path = [];
    let node = this.root;
    for (const char of String(value)) {
      if (!node.children[char]) return false;
      path.push([node, char]);
      node = node.children[char];
    }
    if (!node.isWord) return false;
    node.isWord = false;

    for (let i = path.length - 1; i >= 0; i -= 1) {
      const [parent, char] = path[i];
      const child = parent.children[char];
      if (Object.keys(child.children).length === 0 && !child.isWord) {
        delete parent.children[char];
      }
    }
    return true;
  }

  search(value) {
    let node = this.root;
    for (const char of String(value)) {
      if (!node.children[char]) return false;
      node = node.children[char];
    }
    return node.isWord;
  }

  startsWith(prefix) {
    let node = this.root;
    for (const char of String(prefix)) {
      if (!node.children[char]) return [];
      node = node.children[char];
    }
    const matches = [];
    const walk = (current, path) => {
      if (!current) return;
      if (current.isWord) matches.push(path);
      Object.keys(current.children).forEach((char) => {
        walk(current.children[char], path + char);
      });
    };
    walk(node, String(prefix));
    return matches;
  }

  traverse(order = 'dfs') {
    const visited = [];
    if (order === 'bfs') {
      const queue = [{ node: this.root, prefix: '' }];
      while (queue.length > 0) {
        const item = queue.shift();
        Object.keys(item.node.children).forEach((char) => {
          const nextPrefix = item.prefix + char;
          if (item.node.children[char].isWord) visited.push(nextPrefix);
          queue.push({ node: item.node.children[char], prefix: nextPrefix });
        });
      }
    } else {
      const walk = (node, prefix = '') => {
        if (!node) return;
        Object.keys(node.children).forEach((char) => {
          const nextPrefix = prefix + char;
          if (node.children[char].isWord) visited.push(nextPrefix);
          walk(node.children[char], nextPrefix);
        });
      };
      walk(this.root);
    }
    return visited;
  }

  snapshot() {
    return this.serialize(this.root);
  }

  serialize(node) {
    if (!node) return null;
    return { children: Object.keys(node.children).reduce((acc, key) => {
      acc[key] = this.serialize(node.children[key]);
      return acc;
    }, {}), isWord: node.isWord };
  }
}

function buildTreeAnimationSteps(treeType, valuesInput, operation, target) {
  const values = String(valuesInput || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  const normalizedTreeType = treeType.toLowerCase();
  const engine = new TreeVisualizerEngine(normalizedTreeType, values, operation, target);
  return engine.buildSteps();
}

const TREE_TYPES = ['BST', 'AVL', 'Trie', 'Heap', 'Red Black Tree'];

module.exports = { buildTreeAnimationSteps, TREE_TYPES };
