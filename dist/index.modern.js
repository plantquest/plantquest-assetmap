import L$1 from 'leaflet';
import 'leaflet.markercluster';
import Seneca from 'seneca-browser';
import SenecaEntity from 'seneca-entity';

!function (t, o, i) {

  t.L.Toolbar2 = (L.Layer || L.Class).extend({
    statics: {
      baseClass: "leaflet-toolbar"
    },
    options: {
      className: "",
      filter: function () {
        return !0;
      },
      actions: []
    },
    initialize: function (t) {
      L.setOptions(this, t), this._toolbar_type = this.constructor._toolbar_class_id;
    },
    addTo: function (t) {
      return this._arguments = [].slice.call(arguments), t.addLayer(this), this;
    },
    onAdd: function (t) {
      var o = t._toolbars[this._toolbar_type];
      0 === this._calculateDepth() && (o && t.removeLayer(o), t._toolbars[this._toolbar_type] = this);
    },
    onRemove: function (t) {
      0 === this._calculateDepth() && delete t._toolbars[this._toolbar_type];
    },
    appendToContainer: function (t) {
      var o,
        i,
        e,
        n,
        s = this.constructor.baseClass + "-" + this._calculateDepth() + " " + this.options.className;
      for (this._container = t, this._ul = L.DomUtil.create("ul", s, t), this._disabledEvents = ["click", "mousemove", "dblclick", "mousedown", "mouseup", "touchstart"], i = 0, n = this._disabledEvents.length; i < n; i++) L.DomEvent.on(this._ul, this._disabledEvents[i], L.DomEvent.stopPropagation);
      for (o = 0, e = this.options.actions.length; o < e; o++) new (this._getActionConstructor(this.options.actions[o]))()._createIcon(this, this._ul, this._arguments);
    },
    _getActionConstructor: function (t) {
      var o = this._arguments,
        i = this;
      return t.extend({
        initialize: function () {
          t.prototype.initialize.apply(this, o);
        },
        enable: function (o) {
          i._active && i._active.disable(), i._active = this, t.prototype.enable.call(this, o);
        }
      });
    },
    _hide: function () {
      this._ul.style.display = "none";
    },
    _show: function () {
      this._ul.style.display = "block";
    },
    _calculateDepth: function () {
      for (var t = 0, o = this.parentToolbar; o;) t += 1, o = o.parentToolbar;
      return t;
    }
  }), L.Evented || L.Toolbar2.include(L.Mixin.Events), L.toolbar = {};
  var e = 0;
  L.Toolbar2.extend = function (t) {
    var o = L.extend({}, t.statics, {
      _toolbar_class_id: e
    });
    return e += 1, L.extend(t, {
      statics: o
    }), L.Class.extend.call(this, t);
  }, L.Map.addInitHook(function () {
    this._toolbars = {};
  }), L.Toolbar2.Action = L.Handler.extend({
    statics: {
      baseClass: "leaflet-toolbar-icon"
    },
    options: {
      toolbarIcon: {
        html: "",
        className: "",
        tooltip: ""
      },
      subToolbar: new L.Toolbar2()
    },
    initialize: function (t) {
      var o = L.Toolbar2.Action.prototype.options.toolbarIcon;
      L.setOptions(this, t), this.options.toolbarIcon = L.extend({}, o, this.options.toolbarIcon);
    },
    enable: function (t) {
      t && L.DomEvent.preventDefault(t), this._enabled || (this._enabled = !0, this.addHooks && this.addHooks());
    },
    disable: function () {
      this._enabled && (this._enabled = !1, this.removeHooks && this.removeHooks());
    },
    _createIcon: function (t, o, i) {
      var e = this.options.toolbarIcon;
      this.toolbar = t, this._icon = L.DomUtil.create("li", "", o), this._link = L.DomUtil.create("a", "", this._icon), this._link.innerHTML = e.html, this._link.setAttribute("href", "#"), this._link.setAttribute("title", e.tooltip), L.DomUtil.addClass(this._link, this.constructor.baseClass), e.className && L.DomUtil.addClass(this._link, e.className), L.DomEvent.on(this._link, "click", this.enable, this), this._addSubToolbar(t, this._icon, i);
    },
    _addSubToolbar: function (t, o, i) {
      var e = this.options.subToolbar,
        n = this.addHooks,
        s = this.removeHooks;
      e.parentToolbar = t, e.options.actions.length > 0 && ((i = [].slice.call(i)).push(this), e.addTo.apply(e, i), e.appendToContainer(o), this.addHooks = function (t) {
        "function" == typeof n && n.call(this, t), e._show();
      }, this.removeHooks = function (t) {
        "function" == typeof s && s.call(this, t), e._hide();
      });
    }
  }), L.toolbarAction = function (t) {
    return new L.Toolbar2.Action(t);
  }, L.Toolbar2.Action.extendOptions = function (t) {
    return this.extend({
      options: t
    });
  }, L.Toolbar2.Control = L.Toolbar2.extend({
    statics: {
      baseClass: "leaflet-control-toolbar " + L.Toolbar2.baseClass
    },
    initialize: function (t) {
      L.Toolbar2.prototype.initialize.call(this, t), this._control = new L.Control.Toolbar(this.options);
    },
    onAdd: function (t) {
      this._control.addTo(t), L.Toolbar2.prototype.onAdd.call(this, t), this.appendToContainer(this._control.getContainer());
    },
    onRemove: function (t) {
      L.Toolbar2.prototype.onRemove.call(this, t), this._control.remove ? this._control.remove() : this._control.removeFrom(t);
    }
  }), L.Control.Toolbar = L.Control.extend({
    onAdd: function () {
      return L.DomUtil.create("div", "");
    }
  }), L.toolbar.control = function (t) {
    return new L.Toolbar2.Control(t);
  }, L.Toolbar2.Popup = L.Toolbar2.extend({
    statics: {
      baseClass: "leaflet-popup-toolbar " + L.Toolbar2.baseClass
    },
    options: {
      anchor: [0, 0]
    },
    initialize: function (t, o) {
      L.Toolbar2.prototype.initialize.call(this, o), this._marker = new L.Marker(t, {
        icon: new L.DivIcon({
          className: this.options.className,
          iconAnchor: [0, 0]
        })
      });
    },
    onAdd: function (t) {
      this._map = t, this._marker.addTo(t), L.Toolbar2.prototype.onAdd.call(this, t), this.appendToContainer(this._marker._icon), this._setStyles();
    },
    onRemove: function (t) {
      t.removeLayer(this._marker), L.Toolbar2.prototype.onRemove.call(this, t), delete this._map;
    },
    setLatLng: function (t) {
      return this._marker.setLatLng(t), this;
    },
    _setStyles: function () {
      for (var t, o, i, e = this._container, n = this._ul, s = L.point(this.options.anchor), a = n.querySelectorAll(".leaflet-toolbar-icon"), l = [], r = 0, c = 0, h = a.length; c < h; c++) a[c].parentNode.parentNode === n && (l.push(parseInt(L.DomUtil.getStyle(a[c], "height"), 10)), r += Math.ceil(parseFloat(L.DomUtil.getStyle(a[c], "width"))), r += Math.ceil(parseFloat(L.DomUtil.getStyle(a[c], "border-right-width"))));
      n.style.width = r + "px", this._tipContainer = L.DomUtil.create("div", "leaflet-toolbar-tip-container", e), this._tipContainer.style.width = r + Math.ceil(parseFloat(L.DomUtil.getStyle(n, "border-left-width"))) + "px", this._tip = L.DomUtil.create("div", "leaflet-toolbar-tip", this._tipContainer), t = Math.max.apply(void 0, l), n.style.height = t + "px", o = parseInt(L.DomUtil.getStyle(this._tip, "width"), 10), i = new L.Point(r / 2, t + 1.414 * o), e.style.marginLeft = s.x - i.x + "px", e.style.marginTop = s.y - i.y + "px";
    }
  }), L.toolbar.popup = function (t) {
    return new L.Toolbar2.Popup(t);
  };
}(window);

var name = "@plantquest/assetmap";
var version = "2.0.2";
var description = "PlantQuest Asset Map";
var author = "plantquest";
var license = "MIT";
var repository = "plantquest/plantquest-assetmap";
var main = "dist/index.js";
var module = "dist/index.modern.js";
var types = "plantquest-assetmap.d.ts";
var source = "src/pqam.js";
var scripts = {
	serve: "serve -p 3030 dist",
	build: "microbundle-crl --no-compress --format modern,cjs",
	start: "microbundle-crl watch --no-compress --format modern,cjs",
	prepare: "run-s build",
	test: "echo test",
	"test:build": "run-s build",
	"test:lint": "eslint .",
	"test:unit": "echo test-unit",
	"test:watch": "",
	clean: "rm -rf node_modules yarn.lock package-lock.json",
	reset: "npm run clean && npm install && npm test:build && npm test:unit",
	"repo-tag": "REPO_VERSION=`node -e \"console.log(require('./package').version)\"` && echo TAG: v$REPO_VERSION && git commit -a -m v$REPO_VERSION && git push && git tag v$REPO_VERSION && git push --tags",
	"repo-publish": "npm run clean && npm i && npm run repo-publish-quick",
	"repo-publish-quick": "npm run build && npm run test:unit && npm run repo-tag && npm publish --access public --registry https://registry.npmjs.org "
};
var devDependencies = {
	"babel-eslint": "10.0.3",
	"cross-env": "7.0.3",
	eslint: "6.8.0",
	"eslint-config-prettier": "6.7.0",
	"eslint-config-standard": "14.1.0",
	"eslint-config-standard-react": "9.2.0",
	"eslint-plugin-import": "2.18.2",
	"eslint-plugin-node": "11.0.0",
	"eslint-plugin-prettier": "3.1.1",
	"eslint-plugin-promise": "4.2.1",
	"eslint-plugin-react": "7.17.0",
	"eslint-plugin-standard": "4.0.1",
	"microbundle-crl": "0.13.10",
	"npm-run-all": "4.1.5",
	prettier: "2.0.4",
	serve: "14.0.1"
};
var files = [
	"LICENSE",
	"README.md",
	"dist"
];
var dependencies = {
	leaflet: "1.8.0",
	"leaflet-rastercoords": "1.0.5",
	"leaflet.markercluster": "1.5.3",
	"seneca-browser": "4.0.1",
	"seneca-entity": "21.1.0",
	"seneca-mem-store": "8.0.1"
};
var resolutions = {
	"react-error-overlay": "6.0.9"
};
var Pkg = {
	name: name,
	version: version,
	description: description,
	author: author,
	license: license,
	repository: repository,
	main: main,
	module: module,
	types: types,
	source: source,
	scripts: scripts,
	devDependencies: devDependencies,
	files: files,
	dependencies: dependencies,
	resolutions: resolutions
};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var rastercoords = createCommonjsModule(function (module) {
(function (factory) {
  var L;
  {
    // Node/CommonJS
    L = L$1;
    module.exports = factory(L);
  }
}(function (L) {
  /**
   * L.RasterCoords
   * @param {L.map} map - the map used
   * @param {Array} imgsize - [ width, height ] image dimensions
   * @param {Number} [tilesize] - tilesize in pixels. Default=256
   * @param {Boolean} setmaxbounds - automatically set map max bounds. Default=true
   */
  L.RasterCoords = function (map, imgsize, tilesize, setmaxbounds = true) {
    this.map = map;
    this.width = imgsize[0];
    this.height = imgsize[1];
    this.tilesize = tilesize || 256;
    this.zoom = this.zoomLevel();
    if (setmaxbounds && this.width && this.height) {
      this.setMaxBounds();
    }
  };

  L.RasterCoords.prototype = {
    /**
     * calculate accurate zoom level for the given image size
     */
    zoomLevel: function () {
      return Math.ceil(
        Math.log(
          Math.max(this.width, this.height) /
          this.tilesize
        ) / Math.log(2)
      )
    },
    /**
     * unproject `coords` to the raster coordinates used by the raster image projection
     * @param {Array} coords - [ x, y ]
     * @return {L.LatLng} - internal coordinates
     */
    unproject: function (coords) {
      return this.map.unproject(coords, this.zoom)
    },
    /**
     * project `coords` back to image coordinates
     * @param {Array} coords - [ x, y ]
     * @return {L.LatLng} - image coordinates
     */
    project: function (coords) {
      return this.map.project(coords, this.zoom)
    },
    /**
     * get the max bounds of the image
     */
    getMaxBounds: function () {
      var southWest = this.unproject([0, this.height]);
      var northEast = this.unproject([this.width, 0]);
      return new L.LatLngBounds(southWest, northEast)
    },
    /**
     * sets the max bounds on map
     */
    setMaxBounds: function () {
      var bounds = this.getMaxBounds();
      this.map.setMaxBounds(bounds);
    }
  };

  return L.RasterCoords
}))
; // eslint-disable-line semi
});

(function (W, D) {
  window.PLANTQUEST_ASSETMAP_DEBUG = {};
  const log = (...args) => {
    if (true === window.PLANTQUEST_ASSETMAP_LOG || 'ERROR' === args[1]) {
      console.log.apply(null, args);
    }
  };
  const scriptID = ('' + Math.random()).substring(2, 8);
  log('PQAM', 'script-load', 'start', 'version=', Pkg.version, 'scriptid=', scriptID);
  if (W.PlantQuestAssetMap) {
    log('PQAM', 'script-load', 'exists', scriptID, W.PlantQuestAssetMap.id);
    return;
  } else {
    log('PQAM', 'script-load', 'create', scriptID);
  }
  let $ = D.querySelector.bind(D);
  let $All = D.querySelectorAll.bind(D);
  let Element = D.createElement.bind(D);
  let rc;
  function PlantQuestAssetMap() {
    const self = {
      id: ('' + Math.random()).substring(2, 8),
      info: {
        name: '@plantquest/assetmap',
        version: Pkg.version
      },
      config: {
        width: '100%',
        height: '100%',
        domInterval: 111,
        mapInterval: 111,
        mapBounds: [5850, 7800],
        mapImg: [7800, 5850],
        mapStart: [3000, 2200],
        mapStartZoom: 2,
        mapRoomFocusZoom: 5,
        mapMinZoom: 2,
        mapMaxZoom: 6,
        assetFontScaleRoom: 10,
        assetFontScaleZoom: 4,
        assetFontHideZoom: -1,
        showAllAssets: true,
        debugClick: false,
        infobox: true,
        data: 'https://demo.plantquest.app/sample-data.js',
        mode: 'demo',
        apikey: '<API KEY>',
        endpoint: '/',
        tilesEndPoint: 'https://demo.plantquest.app/tiles',
        states: {
          up: {
            color: '#99f',
            name: 'Up',
            marker: 'standard'
          },
          down: {
            color: '#666',
            name: 'Down',
            marker: 'standard'
          },
          missing: {
            color: '#f9f',
            name: 'Missing',
            marker: 'alert'
          },
          alarm: {
            color: '#f99',
            name: 'Alarm',
            marker: 'alert'
          }
        },
        map: [],
        start: {
          map: 0,
          level: 0
        },
        room: {
          color: '#33f'
        },
        label: {
          zoom: null
        },
        plants: [],
        asset: {
          cluster: true
        }
      },
      data: {},
      assetMap: {},
      roomMap: {},
      current: {
        started: false,
        room: {},
        asset: {}
      },
      upload: {
        assetI: 0,
        interval: null
      },
      listeners: []
    };
    self.log = function (...args) {
      log('PQAM', ...args);
    };
    self.start = function (config) {
      if (self.current.started) {
        self.clearRoomAssets();
        self.unselectRoom();
        self.map.setView(self.config.mapStart, self.config.mapStartZoom);
        return;
      }
      self.config = {
        ...self.config,
        ...(config || {})
      };
      self.log('start', JSON.stringify(config));
      self.config.base = self.config.base || '';
      if (!self.config.base.endsWith('/')) {
        self.config.base += '/';
      }
      function loading() {
        self.target = $('#plantquest-assetmap');
        if (!self.target) {
          self.log('ERROR', 'element-id', 'plantquest-assetmap', 'missing');
          clearInterval(loadingInterval);
          return;
        }
        if (null != self.target && false === self.current.started) {
          self.current.started = true;
          self.target.style.width = self.config.width;
          self.target.style.height = self.config.height;
          clearInterval(loadingInterval);
          self.log('start', 'target-found', self.target);
          self.log('start', 'target-size', 'widthcss', self.config.width, 'heightcss', self.config.height);
          self.load(() => {
            self.log('start', 'load-done', self.data);
            self.render(() => {
              self.log('start', 'render-done');
              self.emit({
                srv: 'plantquest',
                part: 'assetmap',
                state: 'ready'
              });
            });
          });
        }
      }
      const loadingInterval = setInterval(loading, 50);
    };
    self.load = async function (done) {
      let endpoint = msg => {
        let suffix = '/api/web' + '/public/' + msg.on;
        let origin = self.config.endpoint;
        let url = origin + suffix;
        return url;
      };
      let seneca = new Seneca({
        log: {
          logger: 'flat',
          level: 'warn'
        },
        plugin: {
          browser: {
            endpoint,
            headers: {
              'Authorization': 'Bearer ' + self.config.apikey
            }
          }
        },
        timeout: 44444
      });
      seneca.test().use(SenecaEntity).ready(async function () {
      });
      await seneca.ready();
      await seneca.client({
        type: 'browser',
        pin: ['aim:web', 'aim:web,on:assetmap,get:info', 'aim:web,on:assetmap,list:asset', 'aim:web,on:assetmap,load:asset', 'aim:web,on:assetmap,save:asset', 'aim:web,on:assetmap,remove:asset', 'aim:web,on:assetmap,list:room', 'aim:web,on:assetmap,load:room', 'aim:web,on:assetmap,save:room', 'aim:web,on:assetmap,remove:room', 'aim:web,on:assetmap,list:building', 'aim:web,on:assetmap,load:building', 'aim:web,on:assetmap,save:building', 'aim:web,on:assetmap,remove:building']
      });
      window.seneca = self.seneca = seneca;
      function assetShow(msg) {
        if (Array.isArray(msg.asset) || msg.asset === null) {
          msg.asset = msg.asset || Object.keys(self.data.assetMap);
          for (let assetID of msg.asset) {
            let stateName = msg.state;
            let assetData = self.data.assetMap[assetID];
            if (assetData == null) {
              self.log('ERROR', 'send', 'asset', 'unknown-asset', assetID);
              continue;
            }
            if (assetData.xco == null || assetData.yco == null) {
              self.log('ERROR', 'send', 'asset', 'invalid-asset', assetData);
              continue;
            }
            self.emit({
              srv: 'plantquest',
              part: 'assetmap',
              show: 'asset',
              before: true,
              asset: assetData
            });
            let showInfoBox = null == msg.infobox ? self.config.infobox : !!msg.infobox;
            self.showAsset(assetData.id, stateName, 'asset' === msg.hide, !!msg.blink, false, showInfoBox);
          }
        } else {
          let assetRoom = self.data.deps.cp.asset[msg.asset];
          let assetData = self.data.assetMap[msg.asset];
          let zoom = msg.zoom || self.config.mapMaxZoom;
          if (assetRoom) {
            self.emit({
              srv: 'plantquest',
              part: 'assetmap',
              show: 'asset',
              before: true,
              focus: !!msg.focus,
              zoom: zoom,
              asset: assetData
            });
            let coords = c_asset_coords({
              x: assetData.xco,
              y: assetData.yco
            });
            setTimeout(() => {
              if (!!msg.focus) {
                self.map.setView(coords, zoom);
              }
            }, 55);
            let showInfoBox = null == msg.infobox ? self.config.infobox : !!msg.infobox;
            self.showAsset(msg.asset, msg.state, 'asset' === msg.hide, !!msg.blink, false, showInfoBox);
          } else {
            self.log('ERROR', 'send', 'asset', 'unknown-asset', msg);
          }
        }
      }
      seneca.message('srv:plantquest,part:assetmap,remove:asset', async function removeAsset(msg, reply) {
        let {
          id
        } = msg;
        let result = await this.post('aim:web,on:assetmap,remove:asset', {
          id
        });
        self.emit({
          srv: 'plantquest',
          part: 'assetmap',
          remove: 'asset',
          asset: id
        });
        return result;
      });
      seneca.message('srv:plantquest,part:assetmap,remove:room', async function (msg, reply) {
        let {
          id
        } = msg;
        let result = await this.post('aim: web, on: assetmap, remove: room', {
          id
        });
        self.emit({
          srv: 'plantquest',
          part: 'assetmap',
          remove: 'room',
          room: id
        });
        return result;
      });
      seneca.message('srv:plantquest,part:assetmap,remove:building', async function (msg, reply) {
        let {
          id
        } = msg;
        let result = await this.post('aim: web, on: assetmap, remove: building', {
          id
        });
        self.emit({
          srv: 'plantquest',
          part: 'assetmap',
          remove: 'building',
          building: id
        });
        return result;
      });
      seneca.message('srv:plantquest,part:assetmap,save:asset', async function (msg, reply) {
        let {
          asset
        } = msg;
        asset = asset || {};
        asset = {
          ...asset,
          ...{
            project_id: self.config.project_id,
            plant_id: self.config.plant_id,
            stage: self.config.stage
          }
        };
        asset = await this.post('aim: web, on: assetmap, save: asset', {
          asset: {
            ...asset
          }
        });
        self.emit({
          srv: 'plantquest',
          part: 'assetmap',
          save: 'asset',
          asset: asset.asset
        });
        return asset;
      }).message('srv:plantquest,part:assetmap,save:room', async function (msg, reply) {
        let {
          room
        } = msg;
        room = room || {};
        room = {
          ...room,
          ...{
            project_id: self.config.project_id,
            plant_id: self.config.plant_id,
            stage: self.config.stage
          }
        };
        room = await this.post('aim: web, on: assetmap, save: room', {
          room: {
            ...room
          }
        });
        self.emit({
          srv: 'plantquest',
          part: 'assetmap',
          save: 'room',
          room: room.room
        });
        return room;
      }).message('srv:plantquest,part:assetmap,save:building', async function (msg, reply) {
        let {
          building
        } = msg;
        building = building || {};
        building = {
          ...building,
          ...{
            project_id: self.config.project_id,
            plant_id: self.config.plant_id,
            stage: self.config.stage
          }
        };
        building = await this.post('aim: web, on: assetmap, save: building', {
          building: {
            ...building
          }
        });
        self.emit({
          srv: 'plantquest',
          part: 'assetmap',
          save: 'building',
          building: building.building
        });
        return building;
      }).message('srv:plantquest,part:assetmap,load:asset', async function (msg, reply) {
        const {
          id
        } = msg;
        let asset = await this.post('aim: web, on: assetmap, load: asset', {
          id
        });
        self.emit({
          srv: 'plantquest',
          part: 'assetmap',
          load: 'asset',
          asset: asset.asset
        });
        return asset;
      }).message('srv:plantquest,part:assetmap,load:room', async function (msg, reply) {
        const {
          id
        } = msg;
        let room = await this.post('aim: web, on: assetmap, load: room', {
          id
        });
        self.emit({
          srv: 'plantquest',
          part: 'assetmap',
          load: 'room',
          room: room.room
        });
        return room;
      }).message('srv:plantquest,part:assetmap,load:building', async function (msg, reply) {
        const {
          id
        } = msg;
        let building = await this.post('aim: web, on: assetmap, load: building', {
          id
        });
        self.emit({
          srv: 'plantquest',
          part: 'assetmap',
          load: 'building',
          building: building.building
        });
        return building;
      }).message('srv:plantquest,part:assetmap,list:asset', async function (msg, reply) {
        let {
          query
        } = msg;
        query = query || {
          project_id: self.config.project_id,
          plant_id: self.config.plant_id,
          stage: self.config.stage
        };
        let assets = await this.post('aim: web, on: assetmap, list: asset', {
          query
        });
        self.emit({
          srv: 'plantquest',
          part: 'assetmap',
          list: 'asset',
          assets: assets.assets
        });
        return assets;
      }).message('srv:plantquest,part:assetmap,list:room', async function (msg, reply) {
        let {
          query
        } = msg;
        query = query || {
          project_id: self.config.project_id,
          plant_id: self.config.plant_id,
          stage: self.config.stage
        };
        let rooms = await this.post('aim: web, on: assetmap, list: room', {
          query
        });
        self.emit({
          srv: 'plantquest',
          part: 'assetmap',
          list: 'room',
          rooms: rooms.rooms
        });
        return rooms;
      }).message('srv:plantquest,part:assetmap,list:building', async function (msg, reply) {
        let {
          query
        } = msg;
        query = query || {
          project_id: self.config.project_id,
          plant_id: self.config.plant_id,
          stage: self.config.stage
        };
        let buildings = await this.post('aim: web, on: assetmap, list: building', {
          query
        });
        self.emit({
          srv: 'plantquest',
          part: 'assetmap',
          list: 'building',
          buildings: buildings.buildings
        });
        return buildings;
      }).message('srv:plantquest,part:assetmap,show:map', async function (msg, reply) {
        self.showMap(msg.map);
      }).message('srv:plantquest,part:assetmap,show:room', async function (msg, reply) {
        let room = self.data.roomMap[msg.room];
        if (room) {
          if (msg.assets) {
            if (msg.assets) {
              for (let asset of msg.assets) {
                self.showAsset(asset.asset, asset.state);
              }
            }
          }
          if (msg.focus) {
            self.selectRoom(room.room, {
              mute: true
            });
          }
        } else {
          self.log('ERROR', 'send', 'room', 'unknown-room', msg);
        }
      }).message('srv:plantquest,part:assetmap,show:plant', async function (msg, reply) {
        self.showMap(msg.plant);
      }).message('srv:plantquest,part:assetmap,show:floor', async function (msg, reply) {
        self.showMap(msg.map);
        self.clearRoomAssets();
        self.unselectRoom();
        self.map.setView(self.config.mapStart, self.config.mapStartZoom);
      }).message('srv:plantquest,part:assetmap,show:asset', async function (msg, reply) {
        assetShow(msg);
      }).message('srv:plantquest,part:assetmap,hide:asset', async function (msg, reply) {
        assetShow(msg);
      }).message('srv:plantquest,part:assetmap,relate:room-asset', async function (msg, reply) {
        self.emit({
          srv: 'plantquest',
          part: 'assetmap',
          relate: 'room-asset',
          relation: clone(self.data.deps.pc.room)
        });
      }).message('srv:plantquest,part:assetmap', async function (msg, reply) {});
      async function processData(json) {
        self.data = json;
        let assetMap = {};
        let assetProps = self.data.assets[0];
        for (let rowI = 1; rowI < self.data.assets.length; rowI++) {
          let row = self.data.assets[rowI];
          let assetID = row[0];
          assetMap[assetID] = assetProps.reduce((a, p, i) => (a[p] = row[i], a), {});
        }
        self.data.assetMap = assetMap;
        let roomMap = self.data.rooms.reduce((a, r) => (a[r.room] = r, a), {});
        self.data.roomMap = roomMap;
        self.log('data loaded');
        done(json);
      }
      async function loadData() {
        if (self.dataLoaded) {
          done(self.data);
          return;
        }
        let query = {
          project_id: self.config.project_id,
          plant_id: self.config.plant_id,
          stage: self.config.stage
        };
        let {
          assets
        } = await seneca.post('srv:plantquest,part:assetmap,list:asset', {
          query
        });
        let {
          rooms
        } = await seneca.post('srv:plantquest,part:assetmap,list:room', {
          query
        });
        let {
          buildings
        } = await seneca.post('srv:plantquest,part:assetmap,list:building', {
          query
        });
        self.data.assets = assets;
        self.data.rooms = rooms;
        self.data.deps = {};
        let {
          deps,
          maps,
          levels,
          assetMap,
          roomMap
        } = generate({
          assets,
          rooms
        });
        self.data.buildings = buildings;
        self.data.levels = levels;
        self.data.maps = maps;
        self.data.assetMap = assetMap;
        self.data.roomMap = roomMap;
        self.data.deps = deps;
        self.dataLoaded = true;
        done(self.data);
      }
      if (self.config.mode == 'demo') {
        if ('https://demo.plantquest.app/sample-data.js' === self.config.data) {
          const head = $('head');
          const skript = document.createElement('script');
          skript.setAttribute('src', self.config.data);
          head.appendChild(skript);
          let waiter = setInterval(() => {
            self.log('loading data...');
            if (window.PLANTQUEST_ASSETMAP_DATA) {
              clearInterval(waiter);
              processData(window.PLANTQUEST_ASSETMAP_DATA);
            }
          }, 111);
        } else {
          fetch(self.config.data).then(response => {
            if (!response.ok) {
              throw new Error("HTTP error " + response.status);
            }
            return response.json();
          }).then(json => processData(json)).catch(err => self.log('ERROR', 'load', err));
        }
      } else if (self.config.mode == 'live') {
        loadData();
      }
    };
    self.render = function (done) {
      injectStyle();
      let root = Element('div');
      root.style.boxSizing = 'border-box';
      root.style.width = '100%';
      root.style.height = '100%';
      root.style.backgroundColor = 'rgb(203,211,144)';
      root.style.padding = '0px';
      root.style.textAlign = 'center';
      root.style.position = 'relative';
      root.innerHTML = buildContainer();
      self.target.appendChild(root);
      setTimeout(() => {
        self.vis.map.elem = $('#plantquest-assetmap-map');
        self.build();
        self.showMap(0);
        done();
      }, self.domInterval);
    };
    self.send = async function (msg) {
      self.log('send', 'in', msg);
      let result = await self.seneca.post(msg);
      if (null != msg.zoom) {
        self.map.setZoom(msg.zoom);
      }
      if (null != msg.view) {
        self.map.setView(msg.view, msg.zoom || self.config.mapMinZoom);
      }
      return result;
    };
    self.listen = function (listener) {
      if (null == listener || 'function' !== typeof listener) {
        self.log('ERROR', 'listen', 'bad-listener', listener);
      } else {
        self.listeners.push(listener);
        self.log('listen', 'set-listener', '<<' + listener.toString().substring(0, 77).replace(/[\r\n]/g, '') + '...>>');
      }
    };
    self.click = function (what, event) {
      event && event.stopPropagation();
      let msg = Object.assign({
        srv: 'plantquest',
        part: 'assetmap'
      }, what);
      self.log('click', msg);
      self.emit(msg);
    };
    self.emit = function (msg) {
      self.log('send', msg);
      self.listeners.forEach(listener => {
        try {
          listener(msg);
        } catch (e) {
          self.log('ERROR', 'emit', 'listener', e, msg, listener);
        }
      });
    };
    self.vis = {
      map: {},
      ctrl: {}
    };
    self.loc = {
      x: 0,
      y: 0,
      poly: null,
      room: null,
      chosen: {
        poly: null,
        room: null
      },
      stateShown: {},
      asset: {},
      map: -1
    };
    self.leaflet = {};
    self.map = null;
    self.layer = {};
    self.build = function () {
      let ms = {
        mapurl: self.config.map[self.config.start.map],
        bounds: [[0, 0], [...self.config.mapBounds]]
      };
      self.log('build', ms, L$1);
      self.map = L$1.map('plantquest-assetmap-map', {
        crs: L$1.CRS.Simple,
        scrollWheelZoom: true,
        attributionControl: false,
        minZoom: self.config.mapMinZoom,
        maxZoom: self.config.mapMaxZoom
      });
      rc = self.rc = new L$1.RasterCoords(self.map, self.config.mapImg);
      self.map.createPane('labels');
      self.map.getPane('labels').style.zIndex = 220;
      self.map.getPane('labels').style.pointerEvents = 'none';
      self.layer.room = L$1.layerGroup().addTo(self.map);
      self.layer.room.name$ = 'room';
      self.layer.label = L$1.layerGroup().addTo(self.map);
      self.layer.label.name$ = 'label';
      self.map.on('zoomstart', self.zoomStartRender);
      self.map.on('zoomend', self.zoomEndRender);
      setTimeout(() => {
        let mapStart = c_asset_coords({
          x: self.config.mapStart[0],
          y: self.config.mapImg[1] - self.config.mapStart[1]
        });
        self.map.setView(mapStart, self.config.mapStartZoom);
        self.leaflet.mapCenter = self.map.getCenter();
      }, self.config.mapInterval / 2);
      if (self.config.asset.cluster) {
        self.layer.circles = L$1.layerGroup().addTo(self.map);
        self.layer.circles.name$ = 'circles';
        self.layer.asset = L$1.markerClusterGroup({
          spiderfyOnMaxZoom: false,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: false,
          maxClusterRadius: 40,
          chunkedLoading: true,
          spiderLegPolylineOptions: {
            weight: 1.5,
            color: 'black',
            opacity: 2.5
          },
          spiderfyLinear: false,
          spiderfyLinearDistance: 30,
          spiderfyLinearSeparation: 45
        }).addTo(self.map);
        self.layer.asset.on('clusterclick', mev => {
          let layer = mev.layer;
          let {
            xco,
            yco
          } = convert_latlng(mev.latlng);
          let assetlist = layer.getAllChildMarkers().map(marker => {
            return self.data.assetMap[marker.assetID];
          });
          console.log('CLUSTER-CLICK', assetlist);
          self.emit({
            srv: 'plantquest',
            part: 'assetmap',
            event: 'clusterclick',
            assetlist
          });
        });
        self.map.on('layeradd', event => {
          let layer = event.layer;
          if (layer instanceof L$1.Marker && !(layer instanceof L$1.MarkerCluster)) {
            let assetCurrent = self.current.asset[layer.assetID];
            let infobox = assetCurrent.infobox;
            if (assetCurrent) {
              setTimeout(() => {
                try {
                  let lem = assetCurrent.label.getElement();
                  lem.style.display = infobox ? null : 'none';
                  lem.style.width = '';
                  lem.style.height = '';
                  lem.style.fontSize = '';
                  assetCurrent.poly.addTo(self.layer.circles);
                } catch (err) {
                  console.log(err);
                }
                assetCurrent.blinkId = setInterval(function blink() {
                  if (assetCurrent.poly) {
                    if (assetCurrent.blink) {
                      if (true === assetCurrent.blinkState) {
                        assetCurrent.poly.addTo(self.layer.circles);
                        assetCurrent.blinkState = false;
                      } else {
                        assetCurrent.poly.remove(self.layer.circles);
                        assetCurrent.blinkState = true;
                      }
                    }
                  }
                }, self.config.mapInterval);
              }, 11);
            }
          }
        });
        self.map.on('layerremove', event => {
          let layer = event.layer;
          if (layer instanceof L$1.Marker && !(layer instanceof L$1.MarkerCluster)) {
            let assetCurrent = self.current.asset[layer.assetID];
            if (assetCurrent) {
              setTimeout(() => {
                if (assetCurrent.poly) {
                  assetCurrent.poly.remove();
                }
                if (assetCurrent.blinkId) {
                  clearInterval(assetCurrent.blinkId);
                }
              }, 11);
            }
          }
        });
      } else {
        self.layer.asset = L$1.layerGroup().addTo(self.map);
      }
      function generate_labels() {
        self.poly_labels = self.poly_labels || {};
        for (let room of self.data.rooms) {
          let poly_labels = self.poly_labels[room.map] = self.poly_labels[room.map] || [];
          if (self.data.roomMap[room.room] && room.area === '1') {
            let room_poly = convertRoomPoly(self.config.mapImg, room.poly);
            let poly = L$1.polygon(room_poly, {
              color: 'transparent',
              pane: 'labels'
            });
            poly.name$ = 'ROOM:' + room.room;
            var tooltip = L$1.tooltip({
              permanent: true,
              direction: 'center',
              opacity: 1,
              className: 'polygon-labels'
            });
            poly.bindTooltip(tooltip);
            let _c = poly.getBounds().getCenter();
            tooltip.setContent(`<div class="leaflet-zoom-animted"> ${room.room} </div>`);
            poly_labels.push(poly);
          }
        }
      }
      generate_labels();
      function createDebugLog(content) {
        let debugLog = L$1.Control.extend({
          options: {
            position: 'topleft'
          },
          onAdd: function (map) {
            let container = L$1.DomUtil.create('div', 'control-panel');
            let _div = document.createElement('div');
            _div.textContent = content;
            container.appendChild(_div);
            L$1.DomEvent.disableClickPropagation(container);
            L$1.DomEvent.disableScrollPropagation(container);
            return container;
          }
        });
        return new debugLog();
      }
      if (self.config.debugClick) {
        self.map.on('click', mev => {
          let {
            xco,
            yco
          } = convert_latlng(mev.latlng);
          let content = '';
          if (self.leaflet.debugLog) {
            self.leaflet.debugLog.remove();
            self.leaflet.debugLog = null;
          }
          let asset_data = {};
          asset_data.xco = xco;
          asset_data.yco = yco;
          content = JSON.stringify(asset_data);
          self.leaflet.debugLog = createDebugLog(content);
          self.map.addControl(self.leaflet.debugLog);
          self.emit({
            srv: 'plantquest',
            part: 'assetmap',
            event: 'click',
            meta: asset_data
          });
        });
      }
      if (window.PLANTQUEST_ASSETMAP_DEBUG.show_coords) {
        self.listen(msg => {
          if (msg.show == 'asset') {
            let {
              asset
            } = msg;
            let content = '';
            if (self.leaflet.debugLog) {
              self.leaflet.debugLog.remove();
              self.leaflet.debugLog = null;
            }
            if (asset) {
              let asset_data = {};
              asset_data.tag = asset.tag;
              asset_data.id = asset.id;
              asset_data.xco = asset.xco;
              asset_data.yco = asset.yco;
              content = JSON.stringify(asset_data);
            }
            self.leaflet.debugLog = createDebugLog(content);
            self.map.addControl(self.leaflet.debugLog);
          } else if (msg.event == 'click') {
            let meta = msg.meta;
            let asset_data = {};
            let content = '';
            if (self.leaflet.debugLog) {
              self.leaflet.debugLog.remove();
              self.leaflet.debugLog = null;
            }
            asset_data.xco = meta.xco;
            asset_data.yco = meta.yco;
            content = JSON.stringify(asset_data);
            self.leaflet.debugLog = createDebugLog(content);
            self.map.addControl(self.leaflet.debugLog);
          } else {
            if (self.leaflet.debugLog) {
              self.leaflet.debugLog.remove();
              self.leaflet.debugLog = null;
            }
            self.leaflet.debugLog = createDebugLog('DEBUG LOG');
            self.map.addControl(self.leaflet.debugLog);
          }
        });
      }
      if (self.config.showAllAssets) {
        setTimeout(() => {
          self.send({
            srv: 'plantquest',
            part: 'assetmap',
            show: 'asset',
            asset: null
          });
        }, 11);
      }
      self.map.on('mousemove', mev => {
        let {
          xco,
          yco
        } = convert_latlng(mev.latlng);
        self.loc.x = xco;
        self.loc.y = yco;
      });
      let levelActions = [];
      self.data.levels.forEach((level, index) => {
        levelActions.push(L$1.Toolbar2.Action.extend({
          options: {
            toolbarIcon: {
              html: level
            }
          },
          addHooks: function () {
            self.showMap(index);
          }
        }));
      });
      self.config.plants.forEach((plant, index) => {
        levelActions.push(L$1.Toolbar2.Action.extend({
          options: {
            toolbarIcon: {
              html: plant.name
            }
          },
          addHooks: function () {
            self.showMap(index);
          }
        }));
      });
      self.map.addLayer(new L$1.Toolbar2.Control({
        actions: levelActions,
        position: 'topright'
      }));
    };
    self.zoomStartRender = function () {
      let zoom = self.map.getZoom();
      if (null == zoom) return;
    };
    self.zoomEndRender = function () {
      let zoom = self.map.getZoom();
      if (null == zoom) return;
      let pos = 1 + self.loc.map;
      self.poly_labels = self.poly_labels || {};
      let labels = self.poly_labels[pos] || [];
      self.prev_labels = self.prev_labels || [];
      let labelZoomLevel = null == self.config.label.zoom ? self.config.mapMaxZoom : self.config.label.zoom;
      if (zoom >= labelZoomLevel) {
        for (let label of self.prev_labels) {
          label.remove();
        }
        for (let label of labels) {
          label.remove();
          label.addTo(self.layer.label);
        }
        self.setLabel = true;
        self.prev_labels = labels;
      } else {
        for (let label of self.prev_labels) {
          label.remove();
        }
        for (let label of labels) {
          label.remove();
        }
        self.setLabel = false;
      }
    };
    self.checkRooms = function () {
      let xco = self.loc.x;
      let yco = convert_poly_y(self.config.mapImg, self.loc.y);
      let rooms = Object.values(self.data.rooms);
      for (let room of rooms) {
        if (1 + self.loc.map != room.map) {
          continue;
        }
        let alarmState = self.current.room[room.room] ? self.current.room[room.room].alarm : null;
        let inside = room.poly && pointInPolygon([yco, xco], room.poly);
        let alreadyShown = room === self.loc.room || room === self.loc.chosen.room;
        let drawRoom = inside && !alreadyShown && 'red' !== alarmState;
        if (!drawRoom && !inside && self.loc.room === room) {
          if (self.loc.poly) {
            self.loc.poly.remove(self.layer.room);
            self.loc.room = null;
          }
        } else if (drawRoom) {
          if (self.loc.poly) {
            self.loc.poly.remove(self.layer.room);
            self.loc.room = null;
          }
          try {
            let roomState = self.current.room[room.room] || (self.current.room[room.room] = {
              alarm: 'neutral'
            });
            let room_poly = convertRoomPoly(self.config.mapImg, room.poly);
            self.loc.room = room;
            self.loc.alarmState = alarmState;
            self.loc.poly = L$1.polygon(room_poly, {
              color: self.config.room.color
            });
            self.loc.poly.on('click', () => {
              self.selectRoom(room.room);
            });
            self.loc.poly.addTo(self.layer.room);
          } catch (e) {
            self.log('ERROR', 'map', '1020', e.message, e);
          }
        }
      }
    };
    self.selectRoom = function (roomId, opts) {
      opts = opts || {};
      try {
        let room = self.data.roomMap[roomId];
        let isChosen = self.loc.chosen.room && roomId === self.loc.chosen.room.room;
        if (null == self.data.roomMap[roomId] || isChosen) {
          self.focusRoom(self.loc.chosen.room);
          return;
        }
        self.log('selectRoom', roomId, room);
        let roomState = self.current.room[room.room] || (self.current.room[room.room] = {
          alarm: 'neutral'
        });
        if (self.loc.poly) {
          self.loc.poly.remove(self.layer.room);
          self.loc.poly = null;
        }
        self.loc.room = null;
        if (self.loc.chosen.poly && room !== self.loc.chosen.room) {
          let prevRoom = self.loc.chosen.room;
          let prevRoomState = self.current.room[prevRoom.room] || (self.current.room[prevRoom.room] = {
            alarm: 'neutral'
          });
          self.loc.chosen.poly.remove(self.layer.room);
          self.loc.chosen.poly = null;
        }
        if (self.loc.popup) {
          self.loc.popup.remove(self.map);
          self.loc.popop = null;
        }
        self.loc.chosen.room = room;
        let room_poly = convertRoomPoly(self.config.mapImg, room.poly);
        self.loc.chosen.poly = L$1.polygon(room_poly, {
          color: self.config.room.color
        });
        self.loc.chosen.poly.on('click', () => self.selectRoom(room.room));
        self.loc.chosen.poly.addTo(self.layer.room);
        let roomlatlng = self.focusRoom(room);
        let roompos_y = convert_poly_y(self.config.mapImg, roomlatlng[0]);
        let roompos_x = roomlatlng[1];
        let roompos = c_asset_coords({
          y: roompos_y - 4,
          x: roompos_x + 5
        });
        self.loc.popup = L$1.popup({
          autoClose: false,
          closeOnClick: false
        }).setLatLng(roompos).setContent(self.roomPopup(self.loc.chosen.room)).openOn(self.map);
        self.showRoomAssets(room.room);
        self.clearRoomAssets(room.room);
        if (!opts.mute) {
          self.click({
            select: 'room',
            room: self.loc.chosen.room.room
          });
        }
      } catch (e) {
        self.log('ERROR', 'selectRoom', '1010', roomId, e.message, e);
      }
    };
    self.unselectRoom = function () {
      let prevRoom = self.loc.chosen.room;
      if (prevRoom) {
        self.loc.chosen.room = null;
        let prevRoomState = self.current.room[prevRoom.room] || (self.current.room[prevRoom.room] = {
          alarm: 'neutral'
        });
        if ('red' === prevRoomState.alarm) {
          self.loc.chosen.poly.setStyle({
            color: self.resolveRoomColor(prevRoomState.alarm, 'lo')
          });
          self.loc.stateShown[prevRoom.room].poly = self.loc.chosen.poly;
        } else {
          self.loc.chosen.poly.remove(self.layer.room);
        }
        self.loc.chosen.poly = null;
        if (self.loc.popup) {
          self.loc.popup.remove(self.map);
          self.loc.popop = null;
        }
      }
    };
    self.focusRoom = function (room) {
      if (null == room) return;
      let roomlatlng = [0, 0];
      for (let point of room.poly) {
        if (point[0] > roomlatlng[0]) {
          roomlatlng[0] = point[0];
          roomlatlng[1] = point[1];
        }
      }
      let roompos_y = convert_poly_y(self.config.mapImg, roomlatlng[0]);
      let roompos_x = roomlatlng[1];
      let roompos = c_asset_coords({
        y: roompos_y,
        x: roompos_x - 30
      });
      self.map.setView(roompos, self.config.mapRoomFocusZoom);
      self.zoomEndRender();
      return roomlatlng;
    };
    self.showRoom = function (room, stateName) {
      self.log('showRoom', room, stateName);
      stateName = stateName || assetCurrent.stateName || Object.keys(self.config.states)[0];
      let stateDef = self.config.states[stateName];
      room = 'string' === typeof room ? self.data.roomMap[room] : room;
      try {
        stateDef = self.alertRoomState(room.room, stateDef);
        let roomCurrent = self.current.room[room.room] || (self.current.room[room.room] = {});
        roomCurrent.stateDef = stateDef;
        let stateShown = self.loc.stateShown[room.room] || (self.loc.stateShown[room.room] = {});
        if (room === self.loc.chosen.room) {
          if (self.loc.chosen.poly) {
            self.loc.chosen.poly.setStyle({
              color: self.config.room.color
            });
          }
        } else {
          if (stateShown.poly) {
            stateShown.poly.remove(self.layer.room);
            stateShown.poly = null;
          }
        }
      } catch (e) {
        self.log('ERROR', 'map', 'showRoom', '1040', e.message, e);
      }
    };
    self.alertRoomState = function (roomID, newStateDef) {
      let actualStateDef = newStateDef;
      let newPriority = Object.keys(self.config.states).indexOf(newStateDef.stateName);
      let assets = (self.data.deps.pc.room[roomID] ? self.data.deps.pc.room[roomID].asset : []) || [];
      for (let assetID of assets) {
        let assetState = self.current.asset[assetID];
        if (assetState && assetState.stateName) {
          let stateDef = self.config.states[assetState.stateName];
          if ('alert' === stateDef.marker) {
            let priority = Object.keys(self.config.states).indexOf(assetState.stateName);
            if (newPriority < priority) {
              actualStateDef = stateDef;
            }
          }
        }
      }
      return actualStateDef;
    };
    self.showAsset = function (assetID, stateName, hide, blink, showRoom, infobox) {
      let assetCurrent = self.current.asset[assetID] || (self.current.asset[assetID] = {});
      stateName = stateName || assetCurrent.stateName || Object.keys(self.config.states)[0];
      let stateDef = self.config.states[stateName];
      let assetProps = self.data.assetMap[assetID];
      assetCurrent.infobox = infobox == null ? true : infobox;
      self.log('showAsset', assetID, stateName, stateDef, 'hide', hide, 'blink', blink, assetProps);
      if (null == assetProps) {
        return;
      }
      if (assetCurrent.poly) {
        assetCurrent.poly.remove(self.layer.asset);
        assetCurrent.poly = null;
      }
      if (assetCurrent.label) {
        self.layer.asset.removeLayer(assetCurrent.label);
        assetCurrent.label = null;
      }
      if (showRoom) {
        self.showRoom(assetProps.room, stateName);
        if (hide || null == self.loc.chosen.room || assetProps.room !== self.loc.chosen.room.room) {
          return;
        }
      }
      if (hide) {
        return;
      }
      let assetPoint = [assetProps.yco, assetProps.xco];
      let ax = assetPoint[1];
      let ay = assetPoint[0];
      assetCurrent.stateName = stateName;
      let color = stateDef.color;
      let ay_poly = convert_poly_y(self.config.mapImg, ay);
      let room_poly = convertRoomPoly(self.config.mapImg, [[ay_poly + 10, ax], [ay_poly - 10, ax + 10], [ay_poly - 10, ax - 10]]);
      if ('alert' === stateDef.marker) {
        assetCurrent.poly = L$1.polygon(room_poly, {
          color: color
        });
      } else {
        assetCurrent.poly = L$1.circle(c_asset_coords({
          x: ax,
          y: ay
        }), {
          radius: 0.2,
          color: color,
          weight: 2
        }).on('click', () => {
          console.log('ASSET-CLICK', assetCurrent);
          self.emit({
            srv: 'plantquest',
            part: 'assetmap',
            event: 'click',
            on: 'asset',
            asset: assetProps
          });
        });
      }
      assetCurrent.blink = null == blink ? false : blink;
      setTimeout(() => {
        if (null != assetCurrent.label) {
          return;
        }
        let elem = $('#plantquest-assetmap-assetinfo');
        if (null == elem) return;
        let html = elem.innerHTML;
        assetCurrent.label = L$1.marker(c_asset_coords({
          x: ax + 1,
          y: ay + 20
        }), {
          icon: L$1.divIcon({
            className: 'plantquest-assetmap-asset-label ' + 'plantquest-assetmap-asset-state-' + stateName,
            html
          })
        });
        assetCurrent.label.setOpacity(0.7);
        assetCurrent.label.assetID = assetID;
        assetCurrent.label.addTo(self.layer.asset);
        self.zoomEndRender();
      }, 11);
    };
    self.clearRoomAssets = function (roomID) {
      for (let assetID in self.current.asset) {
        let assetCurrent = self.current.asset[assetID];
        if (self.data.deps.cp.asset[assetID].room !== roomID) {
          if (assetCurrent.poly) {
            assetCurrent.poly.remove(self.layer.asset);
          }
          if (assetCurrent.label) {
            assetCurrent.label.remove(self.layer.asset);
          }
        }
      }
    };
    self.showRoomAssets = function (roomID) {
      let assets = (self.data.deps.pc.room[roomID] ? self.data.deps.pc.room[roomID].asset : []) || [];
      for (let assetID of assets) {
        let assetCurrent = self.current.asset[assetID];
        if (assetCurrent && assetCurrent.alarm) {
          self.showAsset(assetID, assetCurrent.alarm);
        }
      }
    };
    self.getUrl = function (mapIndex) {
      return self.config.tilesEndPoint + '/' + mapIndex + '/{z}/{x}/{y}.png';
    }, self.createTile = function (mapIndex) {
      let tileLyr = L$1.tileLayer(self.getUrl(mapIndex), {
        bounds: self.rc.getMaxBounds(),
        minZoom: self.config.mapMinZoom,
        maxZoom: self.config.mapMaxZoom
      });
      return tileLyr;
    }, self.showMap = function (mapIndex) {
      self.log('showMap', mapIndex, self.loc);
      if (mapIndex !== self.loc.map) {
        if (self.leaflet.maptile) {
          self.leaflet.maptile.remove(self.map);
        }
        self.leaflet.maptile = self.createTile(mapIndex + 1);
        self.leaflet.maptile.addTo(self.map);
        self.loc.map = mapIndex;
        self.zoomEndRender();
        self.unselectRoom();
        if (self.loc.poly) {
          self.loc.poly.remove(self.layer.room);
          self.loc.room = null;
        }
        self.emit({
          srv: 'plantquest',
          part: 'assetmap',
          show: 'map',
          map: self.loc.map,
          level: self.data.levels[self.loc.map]
        });
      }
    };
    self.resolveRoomColor = function (stateDef, hilo) {
      return 'hi' === hilo ? stateDef.color : self.config.room.color;
    };
    self.roomPopup = function (room, msg) {
      let html = [];
      html.push('<h2>', room.room, '</h2>');
      return html.join('\n');
    };
    self.getRoomAssets = function (roomID) {
      let assets = [];
      let roomMap = self.data.deps.pc.room;
      let roomEntry = roomMap[roomID];
      assets = roomEntry && roomEntry.asset ? roomEntry.asset.map(a => ({
        asset: a
      })) : assets;
      return assets;
    };
    function buildContainer() {
      let html = ['<div id="plantquest-assetmap-map" class="plantquest-assetmap-vis"></div>'];
      return html.join('');
    }
    return self;
  }
  function clone(obj) {
    if (null != obj && 'object' === typeof obj) {
      return JSON.parse(JSON.stringify(obj));
    }
    return obj;
  }
  function pointInPolygon(point, vs, start, end) {
    if (vs.length > 0 && Array.isArray(vs[0])) {
      return pointInPolygonNested(point, vs, start, end);
    } else {
      return pointInPolygonFlat(point, vs, start, end);
    }
  }
  function pointInPolygonFlat(point, vs, start, end) {
    let x = point[0],
      y = point[1];
    let inside = false;
    if (start === undefined) start = 0;
    if (end === undefined) end = vs.length;
    let len = (end - start) / 2;
    for (let i = 0, j = len - 1; i < len; j = i++) {
      let xi = vs[start + i * 2 + 0],
        yi = vs[start + i * 2 + 1];
      let xj = vs[start + j * 2 + 0],
        yj = vs[start + j * 2 + 1];
      let intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }
  function pointInPolygonNested(point, vs, start, end) {
    let x = point[0],
      y = point[1];
    let inside = false;
    if (start === undefined) start = 0;
    if (end === undefined) end = vs.length;
    let len = end - start;
    for (let i = 0, j = len - 1; i < len; j = i++) {
      let xi = vs[i + start][0],
        yi = vs[i + start][1];
      let xj = vs[j + start][0],
        yj = vs[j + start][1];
      let intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }
  function convertRoomPoly(img, poly) {
    let p = [];
    for (let part of poly) {
      p.push(rc.unproject({
        x: part[1],
        y: img[1] - part[0]
      }));
    }
    return p;
  }
  function convert_latlng(latlng) {
    let Lng = rc.project(latlng);
    return {
      xco: Math.floor(Lng.x),
      yco: Math.floor(Lng.y)
    };
  }
  function convert_poly_y(img, y) {
    return img[1] - y;
  }
  function c_asset_coords({
    x,
    y
  }) {
    return rc.unproject({
      x,
      y
    });
  }
  function make_parent_key(relate, asset) {
    return relate.p.split(/~/g).map(pn => asset[pn]).join('~');
  }
  function make_parent_val(relate, asset) {
    return relate.p.split(/~/g).reduce((a, pn) => (a[pn] = asset[pn], a), {});
  }
  function make_child_id(relate, asset) {
    return asset[relate.c];
  }
  function insert_child(arr, child) {
    if (arr instanceof Array) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === child) {
          return;
        } else if (arr[i] > child) {
          arr.splice(i, 0, child);
          return;
        }
      }
      arr.push(child);
    } else if (arr instanceof Set) {
      arr.add(child);
    }
  }
  function generate(collection) {
    let ROOM_ATYPE = {
      'Room/Area': 1
    };
    let deps = {
      cp: {},
      pc: {}
    };
    let relate = [{
      pc: true,
      p: 'room',
      c: 'asset',
      exclude: asset => ROOM_ATYPE[asset.atype]
    }, {
      pc: true,
      p: 'map',
      c: 'building'
    }, {
      pc: true,
      p: 'building',
      c: 'level'
    }, {
      pc: true,
      p: 'building',
      c: 'map'
    }, {
      pc: true,
      p: 'map~building',
      c: 'level'
    }, {
      pc: true,
      p: 'map~building~level',
      c: 'room',
      include: asset => ROOM_ATYPE[asset.atype]
    }, {
      pc: true,
      p: 'building~level',
      c: 'map'
    }, {
      pc: true,
      p: 'map~level',
      c: 'level',
      include: asset => asset.map
    }, {
      cp: true,
      p: 'map~building~level',
      c: 'room'
    }, {
      cp: true,
      p: 'room',
      c: 'asset',
      exclude: asset => ROOM_ATYPE[asset.atype]
    }];
    let maps = [];
    let levels = [];
    let buildings = new Set();
    let assetMap = {};
    let roomMap = {};
    Object.values(collection).forEach(assets => {
      assets.forEach(asset => {
        if (!ROOM_ATYPE[asset.atype]) {
          asset.asset = asset.id;
          asset.room = asset.room || asset.room_id;
          assetMap[asset.id] = asset;
          asset.xco = asset.xco || asset.xval;
          asset.yco = asset.yco || asset.yval;
        } else {
          asset.room = asset.room || asset.name;
          roomMap[asset.room] = asset;
          asset.poly = asset.polygon.points;
        }
        asset.map = asset.map;
        asset.level = asset.level;
        asset.building = asset.building || asset.building_id;
        if (null != asset.level && '' !== asset.level) {
          if (!levels.includes(asset.level)) {
            levels.push(asset.level);
          }
        }
        if (null != asset.building && '' !== asset.building) {
          buildings.add(asset.building);
        }
        if (null != asset.map && '' !== asset.map) {
          if (!maps.includes(asset.map)) {
            maps.push(asset.map);
          }
        }
        relate.forEach(r => {
          if (r.cp && (!r.exclude || !r.exclude(asset)) && (!r.include || r.include(asset))) {
            let pv = make_parent_val(r, asset);
            deps.cp[r.c] = deps.cp[r.c] || {};
            deps.cp[r.c][asset[r.c]] = pv;
          }
          if (r.pc && (!r.exclude || !r.exclude(asset)) && (!r.include || r.include(asset))) {
            let pk = make_parent_key(r, asset);
            deps.pc[r.p] = deps.pc[r.p] || {};
            deps.pc[r.p][pk] = deps.pc[r.p][pk] || {};
            deps.pc[r.p][pk][r.c] = deps.pc[r.p][pk][r.c] || [];
            let cid = make_child_id(r, asset);
            insert_child(deps.pc[r.p][pk][r.c], cid);
          }
        });
      });
    });
    buildings = Array.from(buildings);
    return {
      deps,
      maps,
      levels,
      buildings,
      assetMap,
      roomMap
    };
  }
  W.PlantQuestAssetMap = new PlantQuestAssetMap();
  function injectStyle() {
    const head = $('head');
    const style = document.createElement('style');
    style.innerHTML = `

#plantquest-assetmap {
    background-color: rgb(203,211,144);
}

#plantquest-assetmap-map {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    background-color: rgb(203,211,144);
}


div.plantquest-assetmap-vis {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 100;
}


img.plantquest-assetmap-logo {
    cursor: pointer;
}


div.plantquest-assetmap-asset-label {
    xwidth: 96px;
    xheight: 48px;
    font-size: 16px;
    xoverflow: hidden;
}

div.plantquest-assetmap-asset-label-green {
    xcolor: #696;
    color: white;
    border: 2px solid #696;
    border-radius: 4px;
    background-color: rgba(102,153,102,0.8);
}

div.plantquest-assetmap-asset-label-red {
    xcolor: #f66;
    color: white;
    border: 2px solid #f66;
    border-radius: 4px;
    background-color: rgba(255,102,102,0.8);
}

#plantquest-assetmap-assetinfo {
    display: none;
}



/* 
 * Leaflet 1.8.0, a JS library for interactive maps. https://leafletjs.com
 * (c) 2010-2022 Vladimir Agafonkin, (c) 2010-2011 CloudMade
 * BSD 2-Clause License, See https://leafletjs.com/
 */

.leaflet-tile,.leaflet-zoom-anim .leaflet-zoom-hide{visibility:hidden}.leaflet-image-layer,.leaflet-layer,.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-pane,.leaflet-pane>canvas,.leaflet-pane>svg,.leaflet-tile,.leaflet-tile-container,.leaflet-zoom-box{position:absolute;left:0;top:0}.leaflet-container{overflow:hidden;-webkit-tap-highlight-color:transparent;background:#ddd;outline:0;font:12px/1.5 "Helvetica Neue",Arial,Helvetica,sans-serif}.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-tile{-webkit-user-select:none;-moz-user-select:none;user-select:none;-webkit-user-drag:none}.leaflet-overlay-pane svg,.leaflet-tooltip{-moz-user-select:none}.leaflet-tile::selection{background:0 0}.leaflet-safari .leaflet-tile{image-rendering:-webkit-optimize-contrast}.leaflet-safari .leaflet-tile-container{width:1600px;height:1600px;-webkit-transform-origin:0 0}.leaflet-control-layers label,.leaflet-marker-icon,.leaflet-marker-shadow{display:block}.leaflet-container .leaflet-marker-pane img,.leaflet-container .leaflet-overlay-pane svg,.leaflet-container .leaflet-shadow-pane img,.leaflet-container .leaflet-tile,.leaflet-container .leaflet-tile-pane img,.leaflet-container img.leaflet-image-layer{max-width:none!important;max-height:none!important}.leaflet-container.leaflet-touch-zoom{-ms-touch-action:pan-x pan-y;touch-action:pan-x pan-y}.leaflet-container.leaflet-touch-drag{-ms-touch-action:pinch-zoom;touch-action:none;touch-action:pinch-zoom}.leaflet-container.leaflet-touch-drag.leaflet-touch-zoom{-ms-touch-action:none;touch-action:none}.leaflet-container a{-webkit-tap-highlight-color:rgba(51,181,229,0.4);color:#0078a8}.leaflet-tile{filter:inherit}.leaflet-tile-loaded{visibility:inherit}.leaflet-zoom-box{width:0;height:0;-moz-box-sizing:border-box;box-sizing:border-box;z-index:800}.leaflet-overlay-pane,.leaflet-pane{z-index:400}.leaflet-map-pane svg,.leaflet-tile-pane{z-index:200}.leaflet-shadow-pane{z-index:500}.leaflet-marker-pane{z-index:600}.leaflet-tooltip-pane{z-index:650}.leaflet-popup-pane{z-index:700}.leaflet-map-pane canvas{z-index:100}.leaflet-vml-shape{width:1px;height:1px}.lvml{behavior:url(#default#VML);display:inline-block;position:absolute}.leaflet-control{position:relative;z-index:800;pointer-events:visiblePainted;pointer-events:auto;float:left;clear:both}.leaflet-bottom,.leaflet-top{position:absolute;z-index:1000;pointer-events:none}.leaflet-top{top:0}.leaflet-right{right:0}.leaflet-bottom{bottom:0}.leaflet-left{left:0}.leaflet-right .leaflet-control{float:right;margin-right:10px}.leaflet-top .leaflet-control{margin-top:10px}.leaflet-bottom .leaflet-control{margin-bottom:10px}.leaflet-left .leaflet-control{margin-left:10px}.leaflet-fade-anim .leaflet-tile{will-change:opacity}.leaflet-fade-anim .leaflet-popup{opacity:0;-webkit-transition:opacity .2s linear;-moz-transition:opacity .2s linear;transition:opacity .2s linear}.leaflet-fade-anim .leaflet-map-pane .leaflet-popup{opacity:1}.leaflet-zoom-animated{-webkit-transform-origin:0 0;-ms-transform-origin:0 0;transform-origin:0 0}.leaflet-zoom-anim .leaflet-zoom-animated{will-change:transform;-webkit-transition:-webkit-transform .25s cubic-bezier(0,0,.25,1);-moz-transition:-moz-transform .25s cubic-bezier(0,0,.25,1);transition:transform .25s cubic-bezier(0,0,.25,1)}.leaflet-pan-anim .leaflet-tile,.leaflet-zoom-anim .leaflet-tile{-webkit-transition:none;-moz-transition:none;transition:none}.leaflet-interactive{cursor:pointer}.leaflet-grab{cursor:-webkit-grab;cursor:-moz-grab;cursor:grab}.leaflet-crosshair,.leaflet-crosshair .leaflet-interactive{cursor:crosshair}.leaflet-control,.leaflet-popup-pane{cursor:auto}.leaflet-dragging .leaflet-grab,.leaflet-dragging .leaflet-grab .leaflet-interactive,.leaflet-dragging .leaflet-marker-draggable{cursor:move;cursor:-webkit-grabbing;cursor:-moz-grabbing;cursor:grabbing}.leaflet-image-layer,.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-pane>svg path,.leaflet-tile-container{pointer-events:none}.leaflet-image-layer.leaflet-interactive,.leaflet-marker-icon.leaflet-interactive,.leaflet-pane>svg path.leaflet-interactive,svg.leaflet-image-layer.leaflet-interactive path{pointer-events:visiblePainted;pointer-events:auto}.leaflet-container a.leaflet-active{outline:orange solid 2px}.leaflet-zoom-box{border:2px dotted #38f;background:rgba(255,255,255,.5)}.leaflet-bar{box-shadow:0 1px 5px rgba(0,0,0,.65);border-radius:4px}.leaflet-bar a,.leaflet-bar a:hover{background-color:#fff;border-bottom:1px solid #ccc;width:26px;height:26px;line-height:26px;display:block;text-align:center;text-decoration:none;color:#000}.leaflet-bar a,.leaflet-control-layers-toggle{background-position:50% 50%;background-repeat:no-repeat;display:block}.leaflet-bar a:hover{background-color:#f4f4f4}.leaflet-bar a:first-child{border-top-left-radius:4px;border-top-right-radius:4px}.leaflet-bar a:last-child{border-bottom-left-radius:4px;border-bottom-right-radius:4px;border-bottom:none}.leaflet-bar a.leaflet-disabled{cursor:default;background-color:#f4f4f4;color:#bbb}.leaflet-touch .leaflet-bar a{width:30px;height:30px;line-height:30px}.leaflet-touch .leaflet-bar a:first-child{border-top-left-radius:2px;border-top-right-radius:2px}.leaflet-touch .leaflet-bar a:last-child{border-bottom-left-radius:2px;border-bottom-right-radius:2px}.leaflet-control-zoom-in,.leaflet-control-zoom-out{font:bold 18px 'Lucida Console',Monaco,monospace;text-indent:1px}.leaflet-touch .leaflet-control-zoom-in,.leaflet-touch .leaflet-control-zoom-out{font-size:22px}.leaflet-control-layers{box-shadow:0 1px 5px rgba(0,0,0,.4);background:#fff;border-radius:5px}.leaflet-control-layers-toggle{background-image:url(images/layers.png);width:36px;height:36px}.leaflet-retina .leaflet-control-layers-toggle{background-image:url(images/layers-2x.png);background-size:26px 26px}.leaflet-touch .leaflet-control-layers-toggle{width:44px;height:44px}.leaflet-control-layers .leaflet-control-layers-list,.leaflet-control-layers-expanded .leaflet-control-layers-toggle{display:none}.leaflet-control-layers-expanded .leaflet-control-layers-list{display:block;position:relative}.leaflet-control-layers-expanded{padding:6px 10px 6px 6px;color:#333;background:#fff}.leaflet-control-layers-scrollbar{overflow-y:scroll;overflow-x:hidden;padding-right:5px}.leaflet-control-layers-selector{margin-top:2px;position:relative;top:1px}.leaflet-control-layers-separator{height:0;border-top:1px solid #ddd;margin:5px -10px 5px -6px}.leaflet-default-icon-path{background-image:url(images/marker-icon.png)}.leaflet-container .leaflet-control-attribution{background:rgba(255,255,255,.7);margin:0}.leaflet-control-attribution,.leaflet-control-scale-line{padding:0 5px;color:#333}.leaflet-control-attribution a{text-decoration:none}.leaflet-control-attribution a:hover{text-decoration:underline}.leaflet-container .leaflet-control-attribution,.leaflet-container .leaflet-control-scale{font-size:11px}.leaflet-left .leaflet-control-scale{margin-left:5px}.leaflet-bottom .leaflet-control-scale{margin-bottom:5px}.leaflet-control-scale-line{border:2px solid #777;border-top:none;line-height:1.1;padding:2px 5px 1px;font-size:11px;white-space:nowrap;overflow:hidden;-moz-box-sizing:border-box;box-sizing:border-box;background:rgba(255,255,255,.5)}.leaflet-control-scale-line:not(:first-child){border-top:2px solid #777;border-bottom:none;margin-top:-2px}.leaflet-control-scale-line:not(:first-child):not(:last-child){border-bottom:2px solid #777}.leaflet-touch .leaflet-bar,.leaflet-touch .leaflet-control-attribution,.leaflet-touch .leaflet-control-layers{box-shadow:none}.leaflet-touch .leaflet-bar,.leaflet-touch .leaflet-control-layers{border:2px solid rgba(0,0,0,.2);background-clip:padding-box}.leaflet-popup{position:absolute;text-align:center;margin-bottom:20px}.leaflet-popup-content-wrapper{padding:1px;text-align:left;border-radius:12px}.leaflet-popup-content{margin:13px 19px;line-height:1.4}.leaflet-popup-content p{margin:18px 0}.leaflet-popup-tip-container{width:40px;height:20px;position:absolute;left:50%;margin-left:-20px;overflow:hidden;pointer-events:none}.leaflet-popup-tip{width:17px;height:17px;padding:1px;margin:-10px auto 0;-webkit-transform:rotate(45deg);-moz-transform:rotate(45deg);-ms-transform:rotate(45deg);transform:rotate(45deg)}.leaflet-popup-content-wrapper,.leaflet-popup-tip{background:#fff;color:#333;box-shadow:0 3px 14px rgba(0,0,0,.4)}.leaflet-container a.leaflet-popup-close-button{position:absolute;top:0;right:0;padding:4px 4px 0 0;border:none;text-align:center;width:18px;height:14px;font:700 16px/14px Tahoma,Verdana,sans-serif;color:#c3c3c3;text-decoration:none;background:0 0}.leaflet-container a.leaflet-popup-close-button:hover{color:#999}.leaflet-popup-scrolled{overflow:auto;border-bottom:1px solid #ddd;border-top:1px solid #ddd}.leaflet-oldie .leaflet-popup-content-wrapper{-ms-zoom:1}.leaflet-oldie .leaflet-popup-tip{width:24px;margin:0 auto}.leaflet-oldie .leaflet-popup-tip-container{margin-top:-1px}.leaflet-oldie .leaflet-control-layers,.leaflet-oldie .leaflet-control-zoom,.leaflet-oldie .leaflet-popup-content-wrapper,.leaflet-oldie .leaflet-popup-tip{border:1px solid #999}.leaflet-div-icon{background:#fff;border:1px solid #666}.leaflet-tooltip{position:absolute;padding:6px;background-color:#fff;border:1px solid #fff;border-radius:3px;color:#222;white-space:nowrap;-webkit-user-select:none;-ms-user-select:none;user-select:none;pointer-events:none;box-shadow:0 1px 3px rgba(0,0,0,.4)}.leaflet-tooltip.leaflet-clickable{cursor:pointer;pointer-events:auto}.leaflet-tooltip-bottom:before,.leaflet-tooltip-left:before,.leaflet-tooltip-right:before,.leaflet-tooltip-top:before{position:absolute;pointer-events:none;border:6px solid transparent;background:0 0;content:""}.leaflet-tooltip-bottom{margin-top:6px}.leaflet-tooltip-top{margin-top:-6px}.leaflet-tooltip-bottom:before,.leaflet-tooltip-top:before{left:50%;margin-left:-6px}.leaflet-tooltip-top:before{bottom:0;margin-bottom:-12px;border-top-color:#fff}.leaflet-tooltip-bottom:before{top:0;margin-top:-12px;margin-left:-6px;border-bottom-color:#fff}.leaflet-tooltip-left{margin-left:-6px}.leaflet-tooltip-right{margin-left:6px}.leaflet-tooltip-left:before,.leaflet-tooltip-right:before{top:50%;margin-top:-6px}.leaflet-tooltip-left:before{right:0;margin-right:-12px;border-left-color:#fff}.leaflet-tooltip-right:before{left:0;margin-left:-12px;border-right-color:#fff}

/* MIT LICENSE, Copyright (c) 2014-2015, Justin Manley */
.leaflet-toolbar-0{list-style:none;padding-left:0;border:2px solid rgba(0,0,0,.2);border-radius:4px}.leaflet-toolbar-0>li{position:relative}.leaflet-toolbar-0>li>.leaflet-toolbar-icon{display:block;width:30px;height:30px;line-height:30px;margin-right:0;padding-right:0;border-right:0;text-align:center;text-decoration:none;background-color:#fff}.leaflet-toolbar-0>li>.leaflet-toolbar-icon:hover{background-color:#f4f4f4}.leaflet-toolbar-0 .leaflet-toolbar-1{display:none;list-style:none}.leaflet-toolbar-tip-container{margin:-16px auto 0;height:16px;position:relative;overflow:hidden}.leaflet-toolbar-tip{width:16px;height:16px;margin:-8px auto 0;background-color:#fff;border:2px solid rgba(0,0,0,.2);background-clip:content-box;-webkit-transform:rotate(45deg);-ms-transform:rotate(45deg);transform:rotate(45deg);border-radius:4px}.leaflet-control-toolbar .leaflet-toolbar-1>li:last-child>.leaflet-toolbar-icon,.leaflet-popup-toolbar>li:last-child>.leaflet-toolbar-icon{border-top-right-radius:4px;border-bottom-right-radius:4px}.leaflet-control-toolbar>li>.leaflet-toolbar-icon{border-bottom:1px solid #ccc}.leaflet-control-toolbar>li:first-child>.leaflet-toolbar-icon{border-top-left-radius:4px;border-top-right-radius:4px}.leaflet-control-toolbar>li:last-child>.leaflet-toolbar-icon{border-bottom-left-radius:4px;border-bottom-right-radius:4px;border-bottom-width:0}.leaflet-control-toolbar .leaflet-toolbar-1{margin:0;padding:0;position:absolute;left:30px;top:0;white-space:nowrap;height:30px}.leaflet-control-toolbar .leaflet-toolbar-1>li{display:inline-block}.leaflet-control-toolbar .leaflet-toolbar-1>li>.leaflet-toolbar-icon{display:block;background-color:#919187;border-left:1px solid #aaa;color:#fff;font:11px/19px "Helvetica Neue",Arial,Helvetica,sans-serif;line-height:30px;text-decoration:none;padding-left:10px;padding-right:10px;height:30px}.leaflet-control-toolbar .leaflet-toolbar-1>li>.leaflet-toolbar-icon:hover{background-color:#a0a098}.leaflet-popup-toolbar{position:relative;box-sizing:content-box}.leaflet-popup-toolbar>li{float:left}.leaflet-popup-toolbar>li>.leaflet-toolbar-icon{border-right:1px solid #ccc}.leaflet-popup-toolbar>li:first-child>.leaflet-toolbar-icon{border-top-left-radius:4px;border-bottom-left-radius:4px}.leaflet-popup-toolbar>li:last-child>.leaflet-toolbar-icon{border-bottom-width:0;border-right:none}.leaflet-popup-toolbar .leaflet-toolbar-1{position:absolute;top:30px;left:0;padding-left:0}.leaflet-popup-toolbar .leaflet-toolbar-1>li>.leaflet-toolbar-icon{position:relative;float:left;width:30px;height:30px}
.marker-cluster-small {
	background-color: rgba(181, 226, 140, 0.6);
	}
.marker-cluster-small div {
	background-color: rgba(110, 204, 57, 0.6);
	}

.marker-cluster-medium {
	background-color: rgba(241, 211, 87, 0.6);
	}
.marker-cluster-medium div {
	background-color: rgba(240, 194, 12, 0.6);
	}

.marker-cluster-large {
	background-color: rgba(253, 156, 115, 0.6);
	}
.marker-cluster-large div {
	background-color: rgba(241, 128, 23, 0.6);
	}

	/* IE 6-8 fallback colors */
.leaflet-oldie .marker-cluster-small {
	background-color: rgb(181, 226, 140);
	}
.leaflet-oldie .marker-cluster-small div {
	background-color: rgb(110, 204, 57);
	}

.leaflet-oldie .marker-cluster-medium {
	background-color: rgb(241, 211, 87);
	}
.leaflet-oldie .marker-cluster-medium div {
	background-color: rgb(240, 194, 12);
	}

.leaflet-oldie .marker-cluster-large {
	background-color: rgb(253, 156, 115);
	}
.leaflet-oldie .marker-cluster-large div {
	background-color: rgb(241, 128, 23);
}

.marker-cluster {
	background-clip: padding-box;
	border-radius: 20px;
	}
.marker-cluster div {
	width: 30px;
	height: 30px;
	margin-left: 5px;
	margin-top: 5px;

	text-align: center;
	border-radius: 15px;
	font: 12px "Helvetica Neue", Arial, Helvetica, sans-serif;
	}
.marker-cluster span {
	line-height: 30px;
	}
.leaflet-cluster-anim .leaflet-marker-icon, .leaflet-cluster-anim .leaflet-marker-shadow {
	-webkit-transition: -webkit-transform 0.3s ease-out, opacity 0.3s ease-in;
	-moz-transition: -moz-transform 0.3s ease-out, opacity 0.3s ease-in;
	-o-transition: -o-transform 0.3s ease-out, opacity 0.3s ease-in;
	transition: transform 0.3s ease-out, opacity 0.3s ease-in;
}

.leaflet-cluster-spider-leg {
	/* stroke-dashoffset (duration and function) should match with leaflet-marker-icon transform in order to track it exactly */
	-webkit-transition: -webkit-stroke-dashoffset 0.3s ease-out, -webkit-stroke-opacity 0.3s ease-in;
	-moz-transition: -moz-stroke-dashoffset 0.3s ease-out, -moz-stroke-opacity 0.3s ease-in;
	-o-transition: -o-stroke-dashoffset 0.3s ease-out, -o-stroke-opacity 0.3s ease-in;
	transition: stroke-dashoffset 0.3s ease-out, stroke-opacity 0.3s ease-in;
}


.leaflet-toolbar-0>li>.leaflet-toolbar-icon {
  width: 80px;
}

.control-panel {
  position: absolute;
  top: 0em;
  left: 5em;
  background-color: white;
  border: 1px solid black;
  width: 10em;
  height: 6em;
  padding: 10px;
  font-size: 14px;
  font-family: Arial, sans-serif;
  word-wrap: break-word;
  height: fit-content;
  width: fit-content;
  opacity: 0.5;
  /*block-size: fit-content;*/
}


.class1 {
    background-color: transparent;
    border: 0;
    box-shadow: none;
} 

.polygon-labels {
  background-color: transparent;
  font-weight: bold;
  color: #000000;
  border: 0;
  box-shadow: none;
  font-size: 1em;
}

div.plantquest-assetmap-asset-label {
    width: 200px;
}

div.plantquest-assetmap-asset-state-up {
    color: white;
    border: 2px solid #696;
    border-radius: 4px;
    background-color: #696;
    opacity: 0;
}

div.plantquest-assetmap-asset-state-down {
    color: white;
    border: 2px solid #666;
    border-radius: 4px;
    background-color: #666;
    opacity: 0.7;
}

div.plantquest-assetmap-asset-state-missing {
    color: white;
    border: 2px solid #f3f;
    border-radius: 4px;
    background-color: #f3f;
    opacity: 0.7;
}

div.plantquest-assetmap-asset-state-alarm {
    color: white;
    border: 2px solid #f33;
    border-radius: 4px;
    background-color: #f33;
    opacity: 0.7;
}

`;
    head.appendChild(style);
  }
})(window, document);
//# sourceMappingURL=index.modern.js.map
