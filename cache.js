// Generated by CoffeeScript 1.7.1
(function() {
  var Cache, isEmpty;

  isEmpty = require('./util/is_empty');

  module.exports = Cache = (function() {
    var clearObject;

    function Cache() {
      this.root = {
        children: {}
      };
    }

    Cache.prototype.get = function(path) {
      var key, target, _i, _len;
      target = this.root;
      for (_i = 0, _len = path.length; _i < _len; _i++) {
        key = path[_i];
        target = target.children[key];
        if (target == null) {
          return void 0;
        }
      }
      return target.cursor;
    };

    Cache.prototype.store = function(cursor) {
      var key, target, _base, _i, _len, _ref;
      target = this.root;
      _ref = cursor.path;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        (_base = target.children)[key] || (_base[key] = {
          children: {}
        });
        target = target.children[key];
      }
      return target.cursor = cursor;
    };

    Cache.prototype.clearPath = function(path) {
      var i, key, nodes, target, _i, _len;
      target = this.root;
      nodes = [];
      for (i = _i = 0, _len = path.length; _i < _len; i = ++_i) {
        key = path[i];
        if (target.children[key] == null) {
          break;
        }
        target = target.children[key];
        nodes.push(target);
        delete target.cursor;
      }
      return this.root;
    };

    clearObject = function(node, changes) {
      var child, k;
      for (k in changes) {
        if ((child = node.children[k]) != null) {
          delete child.cursor;
          clearObject(child, changes[k]);
        }
      }
      return node;
    };

    Cache.prototype.clearObject = function(obj) {
      return clearObject(this.root, obj);
    };

    return Cache;

  })();

}).call(this);