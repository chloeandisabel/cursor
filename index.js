// Generated by CoffeeScript 1.7.1
(function() {
  var Cache, deepFreeze, deepMerge;

  deepFreeze = require('./util/deep_freeze');

  deepMerge = require('./util/deep_merge');

  Cache = require('./cache');

  module.exports = {
    create: function(inputData, onChange, historySize) {
      var Cursor, batched, cache, data, redo, redos, undo, undos, update;
      if (historySize == null) {
        historySize = 100;
      }
      cache = new Cache;
      data = deepFreeze(inputData);
      batched = false;
      undos = [];
      redos = [];
      Cursor = (function() {
        function Cursor(path) {
          this.path = path != null ? path : [];
        }

        Cursor.prototype.cursor = function(path) {
          var cached, cursor, fullPath;
          if (path == null) {
            path = [];
          }
          fullPath = this.path.concat(path);
          if ((cached = cache.get(fullPath)) != null) {
            return cached;
          }
          cursor = new Cursor(fullPath);
          cache.store(cursor);
          return cursor;
        };

        Cursor.prototype.get = function(path) {
          var key, target, _i, _len, _ref;
          if (path == null) {
            path = [];
          }
          target = data;
          _ref = this.path.concat(path);
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            key = _ref[_i];
            target = target[key];
            if (target == null) {
              return void 0;
            }
          }
          return target;
        };

        Cursor.prototype.modifyAt = function(path, modifier, silent) {
          var fullPath, k, key, newData, target, updated, v, _i, _len, _ref, _ref1;
          fullPath = this.path.concat(path);
          newData = target = {};
          for (k in data) {
            v = data[k];
            target[k] = v;
          }
          _ref = fullPath.slice(0, -1);
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            key = _ref[_i];
            updated = Array.isArray(target[key]) ? [] : {};
            _ref1 = target[key];
            for (k in _ref1) {
              v = _ref1[k];
              updated[k] = v;
            }
            target[key] = updated;
            Object.freeze(target);
            target = target[key];
          }
          modifier(target, fullPath.slice(-1));
          Object.freeze(target);
          cache.clearPath(fullPath);
          return update(newData, silent);
        };

        Cursor.prototype.set = function(path, value, silent) {
          if (silent == null) {
            silent = false;
          }
          if (this.path.length > 0 || path.length > 0) {
            return this.modifyAt(path, function(target, key) {
              return target[key] = value;
            }, silent);
          } else {
            return update(value, silent);
          }
        };

        Cursor.prototype["delete"] = function(path, silent) {
          if (silent == null) {
            silent = false;
          }
          if (this.path.length > 0 || path.length > 0) {
            return this.modifyAt(path, function(target, key) {
              return delete target[key];
            }, silent);
          } else {
            return update(void 0, silent);
          }
        };

        Cursor.prototype.merge = function(data, silent) {
          if (silent == null) {
            silent = false;
          }
          cache.clearObject(data);
          return update(deepMerge(this.get(), deepFreeze(data)), silent);
        };

        Cursor.prototype.bind = function(path, pre) {
          return (function(_this) {
            return function(v, silent) {
              return _this.set(path, (pre ? pre(v) : v), silent);
            };
          })(this);
        };

        Cursor.prototype.batched = function(cb, silent) {
          if (silent == null) {
            silent = false;
          }
          batched = true;
          cb();
          batched = false;
          return update(data, silent);
        };

        return Cursor;

      })();
      undo = function() {
        if (!(undos.length > 0)) {
          return;
        }
        redos.push(data);
        if (redos.length > historySize) {
          redos.shift();
        }
        data = undos.pop();
        return onChange(new Cursor(), undo, redo);
      };
      redo = function() {
        if (!(redos.length > 0)) {
          return;
        }
        undos.push(data);
        if (undos.length > historySize) {
          undos.shift();
        }
        data = redos.pop();
        return onChange(new Cursor(), undo, redo);
      };
      update = function(newData, silent) {
        if (silent == null) {
          silent = false;
        }
        if (!(silent || batched)) {
          undos.push(data);
          if (undos.length > historySize) {
            undos.shift();
          }
        }
        data = newData;
        if (!batched) {
          return onChange(new Cursor(), undo, redo);
        }
      };
      return onChange(new Cursor(), undo, redo);
    }
  };

}).call(this);
