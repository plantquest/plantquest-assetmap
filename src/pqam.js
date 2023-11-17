/* Copyright 2022-2023 PlantQuest Ltd, MIT License */

import L from 'leaflet'
import './leaflet.toolbar.min.js'
import 'leaflet.markercluster'

import 'leaflet-path-drag'
import 'leaflet-editable'


import Pkg from '../package.json'


import Seneca from 'seneca-browser'
import SenecaEntity from 'seneca-entity'

import './rastercoords.js'

// console.log('PQAM 6')

;(function(W, D) {
  W.$L = L
  
  const log = (...args) => {
    if(true === W.PLANTQUEST_ASSETMAP_LOG || 'ERROR' === args[1]) {
      console['log'].apply(null, args)
    }
  }

  const dlog = []
  
  const scriptID = (''+Math.random()).substring(2,8)

  log('PQAM','script-load', 'start', 'version=', Pkg.version, 'scriptid=', scriptID)

  if(W.PlantQuestAssetMap) {
    log('PQAM','script-load', 'exists', scriptID, W.PlantQuestAssetMap.id)
    return
  }
  else {
    log('PQAM','script-load', 'create', scriptID)
  }
  
  let $ = D.querySelector.bind(D)
  let $All = D.querySelectorAll.bind(D)
  let Element = D.createElement.bind(D)
  
  let rc
  
  function PlantQuestAssetMapInstance(id) {
    const self = {
      dlog,
      
      id,
      mark: 0,
      
      info: {
        name: '@plantquest/assetmap',
        version: Pkg.version,
      },
      
      // default config
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
        mapMinZoom: 1, // 2,
        mapMaxZoom: 6,
        assetFontScaleRoom: 10,
        assetFontScaleZoom: 4,
        assetFontHideZoom: -1,

        // TODO: refactor into asset section
        showAllAssets: true,
        showLevelAssets: true,

        debug: {
          click: false,
          coords: false,
        },
        
        infobox: {
          show: false,
          single: true,
        },
        
        data: 'https://demo.plantquest.app/sample-data.js',
        mode: 'demo',
        apikey: '<API KEY>',
        endpoint: '/',
        tilesEndPoint: 'https://demo.plantquest.app/tiles',

        states: {
          up: { color: '#99f', name: 'Up', marker: 'standard' },
          down: { color: '#666', name: 'Down', marker: 'standard' },
          missing: { color: '#f9f', name: 'Missing', marker: 'alert' },
          alarm: { color: '#f99', name: 'Alarm', marker: 'alert' },
        },
        
        map: [],

        start: {
          map: 0,
          level: 0,
        },

        room: {
          click: {
            active: true
          },
          outline: {
            active: true
          },
          label: {
            zoom: null,
          },
          color: '#33f',
          prepare: (x)=>x,
        },

        geofence: {
          click: {
            active: true
          },
          show: {
            all: false,
          },
          color: '#f3f',
          prepare: (x)=>x,
        },

        
        label: {
          zoom: null // null => appear at mapMaxZoom
        },
        
        asset: {
          label: {
            field: 'tag',
          },
          cluster: true,
          label: true,
          click: true,
          cmp: 'circle',
          set: 'global', // 'level'|'global'
          prepare: (x)=>x,
        },

        building: {
          prepare: (x)=>x,
        },
        
        level: {
          prepare: (x)=>x,
        },
        
        update: {
          active: false,
          interval: 30000,
        }
      },
      
      data: {
        building: [],
        level: [],
        room: [],
        asset: [],
        
        // TOOD: refactor 
        assetMap: {},
        roomMap: {},
      },

      current: {
        started: false,
        rendered: false,
        room: {},
        asset: {},

        assetInfo: null,
        clusterInfo: null,
        
        assetInfoShown: {},
        assetHistory: [],

        assetsShownOnLevel: {},
        shownAssets: new Set(),

        building: null,
        
        al: {},
      },

      state: {
        senecaLoading: false,
        senecaLoaded: false,
        dataLoading: false,
        dataLoaded: false,
        rendered: false,
      },
      
      upload: {
        assetI: 0,
        interval: null,
      },

      room: {
        map: {}
      },

      asset: {
        map: {}
      },

      geofence: {
        map: {}
      },

      building: {
        map: {}
      },

      level: {
        map: {}
      },

      ux: {
        room: {

          // { [mapid]: marker }
          label: {}
        }
      },
      
      listeners: [],
      namedListeners: {},
    }

    self.log = function(...args) {
      log('PQAM', ...args)
    }
    
    
    self.start = function(config, readyCallback) {
      if(self.current.started) {
        self.clearRoomAssets()
        self.unselectRoom()

        self.clearGeofences()
        self.closeAssetInfo()
        self.closeClusterInfo()
        self.current.assetsShownOnLevel = {}

        self.map.setView(self.config.mapStart, self.config.mapStartZoom)
        return
      }

      self.clearAssets()
      self.clearGeofences()
      self.closeAssetInfo()
      self.closeClusterInfo()
      self.current.assetsShownOnLevel = {}
      
      self.config = Seneca.util.deep(self.config,config)

      self.log('start', JSON.stringify(self.config))
      
      self.config.base = self.config.base || ''

      if(!self.config.base.endsWith('/')) {
        self.config.base += '/'
      }
      
      async function loading() {
      //   if (false === self.current.started) {
      //     self.current.started = true

      //     clearInterval(loadingInterval)
      //     self.log('start','target-found',self.target)

      //     self.log(
      //       'start','target-size',
      //       'widthcss',self.config.width,
      //       'heightcss',self.config.height,
      //     )

          let seneca = await self.getSeneca()

          // self.render(()=>{
          //   self.log('start','render-done')
          // })

          self.load(()=>{
            self.log('start','load-done',self.data)

            self.render(()=>{
              self.log('start','render-done')
              
              self.showMap(self.loc.map,{
                force: true,
                when: 'load'
              })

              self.addBuildingControl()
              // self.addLevelControl()
              
              if(self.config.update.active) {
                self.log('start','updates',self.data)
                self.updates()
              }

              if(readyCallback) {
                try {
                  readyCallback(null, self)
                }
                catch(e) {
                  self.log('ERROR', 'ready', e)
                }
              }
              
              self.emit({
                srv:'plantquest',
                part:'assetmap',
                state: 'ready'
              })
            })
          })
      }

      
      // const loadingInterval = setInterval(loading, 50)
      setTimeout(loading,1)
    }


    self.restart = function(config, ready) {
      self.current.started = false
      self.state.rendered = false
      self.state.dataLoaded = false
      self.start(config, ready)
    }
    
    
    self.load = async function(done) {
      done = done || (()=>{})
      let ctx = {
        cfg: self.config,
        pqam: self
      }
      
      let seneca = await self.getSeneca()
                  

      // TODO: remove - loads old static data
      let processData = async (json)=> {
      
        self.data = json
        
        let assets = []
        let assetMap = {}
        
        // reference old static data
        self.data.asset = self.data.assets
        self.data.room = self.data.rooms
        self.data.level = self.data.levels
        self.data.building = self.data.buildings
          
        let assetProps = self.data.asset[0]
        
        
        for(let rowI = 1; rowI < self.data.asset.length; rowI++) {
          let row = self.data.asset[rowI]
          let assetID = row[0]
          assetMap[assetID] = assetProps.reduce((a,p,i)=>((a[p]=row[i]),a),{})
        }
            
        
        self.data.assetMap = assetMap
        
        
        let roomMap = self.data.room.reduce((a,r)=>(a[r.room]=r,a),{})
        self.data.roomMap = roomMap
        
        self.data.room.forEach(roomData=>{
          // workaround for old static data
          roomData.id = roomData.room
          roomData.name = roomData.room
          self.room.map[roomData.id] = new Room(roomData, ctx)
        })
        
       Object.values(assetMap).forEach(ent=>{
          let asset = new Asset(ent, ctx)
          self.asset.map[ent.id] =
            self.config.asset.prepare(asset) || asset
        })
        
        self.log('data loaded')
  
  
  
        done(json)        
      }

      
      let loadData = async ()=>{
        while(self.state.dataLoading) {
          await new Promise(r=>setTimeout(r,33))
        }
        if(self.state.dataLoaded) {
          done(self.data)
          return
        }
        self.state.dataLoading = true
        
        let query = {
          project_id: self.config.project_id,
          plant_id: self.config.plant_id,
          stage: self.config.stage,
        }


        // Load entities.
        const entnames = [
          'map',
          'building',
          'level',
          'room',
          'geofence',
          'asset',
        ]

        // Clear previous data.
        for(let kind of entnames) {
          self.data[kind] = self.data[kind] || []
          self.data[kind].length = 0
        }
        
        for(let kind of entnames) {
          try {
            let res = await seneca.post(
              'srv:plantquest,part:assetmap',
              { list: kind, query, }
            )

            // if('room' === kind) {
            //   console.log('RES', kind, res)
            // }
            
            if(res && res.ok) {
              self.data[kind] = res.list
            }
          }
          catch(e) {
            self.log('ERROR', 'list-ent', e)
          }
        }

        self.data.asset.forEach(ent=>{
          if(null == ent.tag) {
            ent.tag = ent.name || 'NO TAG'
          }
          if(null == ent.atype) {
            ent.atype = 'Equipment'
          }
        })

        self.data.room.forEach(roomData=>{
          let room = new Room(roomData, ctx)
          self.room.map[roomData.id] =
            self.config.room.prepare(room) || room
        })

        self.data.geofence.forEach(ent=>{
          let geofence = new Geofence(ent, ctx)
          self.geofence.map[ent.id] =
            self.config.geofence.prepare(geofence) || geofence
        })

        self.data.building.forEach(ent=>{
          let building = new Building(ent, ctx)
          self.building.map[ent.id] =
            self.config.building.prepare(building) || building
        })

        self.data.level.forEach(ent=>{
          let level = new Level(ent, ctx)
          self.level.map[ent.id] =
            self.config.level.prepare(level) || level
        })
        
        self.data.asset.forEach(ent=>{
          let asset = new Asset(ent, ctx)
          self.asset.map[ent.id] =
            self.config.asset.prepare(asset) || asset
        })


        self.data.level.sort((a,b)=>{
          return (+a.map) - (+b.map)
        })
        
        self.data.deps = {}
        
        let {
          deps,
          maps,
          levels,
          // buildings,
          assetMap,
          roomMap
        } = generate({
          assets: self.data.asset,
          rooms: self.data.room,
        })
        

        self.data.maps = maps.sort((a,b) => (a.zo - b.zo))
        
        self.data.assetMap = assetMap
        self.data.roomMap = roomMap
        
        self.data.deps = deps
        self.state.dataLoaded = true
        self.state.dataLoading = false

        self.current.building = self.data.building[0]

        done(self.data)
      }


      // DEPRECATED
      if(self.config.mode == 'demo') {
      
        if('https://demo.plantquest.app/sample-data.js' === self.config.data) {
          const head = $('head')
          const skript = document.createElement('script')
          skript.setAttribute('src', self.config.data)
          head.appendChild(skript)
          

          let waiter = setInterval(()=>{
            self.log('loading data...')
            if(W.PLANTQUEST_ASSETMAP_DATA) {
              
              clearInterval(waiter)
              processData(W.PLANTQUEST_ASSETMAP_DATA)
            }
          },111)
        }
        else {
          fetch(self.config.data)
            .then(response => {
              if (!response.ok) {
                throw new Error("HTTP error " + response.status)
              }
              return response.json()
            })
            .then(json => processData(json))
            .catch((err)=>self.log('ERROR','load',err))
        }
      } else if (self.config.mode == 'live') {
        loadData()
      }
    }


    self.updates = function() {
      clearInterval(self.current.updateInterval)
      self.current.updateInterval = setInterval(async function() {
        let query = {
          project_id: self.config.project_id,
          plant_id: self.config.plant_id,
          stage: self.config.stage,
          t_m:{$gte:(Date.now()-(2*self.config.update.interval))}
        }
        let res =
            await self.seneca.post(
              'aim:web,on:assetmap,list:asset',
              { query, }
            )

        if(res.ok) {
          let updatedAssets = res.list

          for(let assetEnt of updatedAssets) {
            try {
              let existing = self.data.assetMap[assetEnt.id]
              let assetInst = self.asset.map[assetEnt.id]
              
              if(null == assetInst) {
                assetInst = self.asset.map[assetEnt.id] = new Asset(assetEnt, {
                  cfg: self.config,
                  pqam: self
                })
              }
              
              
              if(existing?.t_m < assetEnt.t_m) { // PUT
                self.data.assetMap[assetEnt.id] = assetEnt
                let index = self.data.asset.findIndex(a=>a.id===assetEnt.id)
                if(-1 < index) {
                  self.data.asset[index] = assetEnt
                }

                assetInst.ent = assetEnt
                assetInst = self.config.asset.prepare(assetInst) || assetInst
                
                if(assetInst.shown) {
                  self.layer.asset.removeLayer(assetInst.label)
                  assetInst.label = null
                  assetInst.indicator.remove()
                  assetInst.indicator = null

                  assetInst.show({
                    pqam: self,
                    assetID: assetEnt.id,
                    // stateName: assetCurrent.stateName,
                    hide: false,
                    blink: false ,
                    showRoom: false,
                    infobox: assetInst.infobox,
                    closeinfo: false,
                    whence: 'updatedAssets',
                  })
                }
                else {
                  delete self.current.asset[assetInst.id]
                }
              } else if(!existing) { // POST
                let show = assetEnt.map-1 == self.loc.map
                self.data.assetMap[assetEnt.id] = assetEnt
                
                let index = self.data.asset.findIndex(a=>a.id===assetEnt.id)
                if(-1 < index) {
                  self.data.asset[index] = assetEnt
                } else {
                  self.data.asset.push(assetEnt)
                }
                
                show &&
                  assetInst.show({
                    pqam: self,
                    assetID: assetEnt.id,
                    hide: false,
                    blink: false ,
                    showRoom: false,
                    infobox: false,
                    closeinfo: false,
                    whence: 'updatedAssets',
                  })
                  self.current.shownAssets.add(assetEnt.id)
                  // TODO: full cp check
                  self.data.deps.cp.asset = self.data.deps.cp.asset || {}
                  self.data.deps.cp.asset[assetEnt.id] = { room: assetEnt.room }
              }
            }
            catch(e) {
              self.log('ERROR', 'UPDATE', assetEnt, e)
            }
          }
        }
        
      }, self.config.update.interval)
    }

    
    self.render = function(done) {
      if(self.state.rendered) {
        return done()
      }

      self.state.rendered = true
      
      if(!self.current.styleInjected) {
        injectStyle()
        self.current.styleInjected = true
      }

      self.target = $('#plantquest-assetmap')
      if(!self.target) {
        self.log('ERROR', 'element-id', 'plantquest-assetmap', 'missing')
        return done()
      }

      self.target.style.width = self.config.width
      self.target.style.height = self.config.height

      Object.values(self.asset.map).forEach(asset=>{
        delete asset.label
        delete asset.indicator
      })

      // Only one map in the parent container ( target )
      if(1 <= self.target.children.length) {
        // return done()
        [...self.target.children].map(c=>self.target.removeChild(c))
      }

      let root = Element('div')
      root.style.boxSizing = 'border-box'
      root.style.width = '100%'
      root.style.height = '100%'
      root.style.backgroundColor = 'rgb(203,211,144)'
      root.style.padding = '0px'
      root.style.textAlign = 'center'
      root.style.position = 'relative'
      root.innerHTML = buildContainer()
      self.target.appendChild(root)
      
      // setTimeout(()=>{
        self.vis.map.elem = $('#plantquest-assetmap-map')
        self.build()
        self.current.rendered = true
        // self.showMap(self.loc.map, {force:true,whence:'render'})
        done && done()
      // }, self.domInterval)
    }

    
    self.send = async function(msg, done) {
      self.log('send', 'in', msg)

      let seneca = await self.getSeneca()
      let result = await seneca.post(msg)
      
      if(null != msg.zoom) {
        self.map.setZoom(msg.zoom)
      }
      
      if(null != msg.view) {
        self.map.setView(msg.view, msg.zoom || self.config.mapMinZoom)
      }

      if(done) {
        return done(null, result)
      }
      
      return result
    }

    
    self.listen = function(listenerOrName, listenerMaybe) {
      let listener = listenerMaybe || listenerOrName
      let name = 'string' === typeof listenerOrName ? listenerOrName : null

      if(null == listener || 'function' !== typeof(listener)) {
        self.log('ERROR', 'listen', 'bad-listener', listener)                 
      }
      else if(null != name) {
        self.namedListeners[name] = listener
      }
      else {
        self.listeners.push(listener)
        self.log('listen', 'set-listener',
                 '<<'+listener.toString()
                 .substring(0,77).replace(/[\r\n]/g,'')+'...>>')
      }
    }

    
    self.click = function(what, event) {
      // event && event.stopPropagation()
      let msg = Object.assign({
        srv:'plantquest',
        part:'assetmap',
      }, what)
      self.log('click',msg)
      self.emit(msg)
    }

    
    self.emit = function(msg) {
      self.log('send', msg)
      self.listeners.forEach(listener=>{
        try {
          listener(msg)
        }
        catch(e) {
          self.log('ERROR', 'emit', 'listener', e, msg, listener)
        }
      })
      Object.entries(self.namedListeners).forEach(entry=>{
        try {
          entry[1](msg)
        }
        catch(e) {
          self.log('ERROR', 'emit', 'namedListener', e, msg, entry[0], entry[1])
        }
      })


    }


    self.vis = {
      map: {
      },
      ctrl: {
      }
    }
    

    self.loc = {
      x: 0,
      y: 0,
      poly: null,
      room: null,
      chosen: {
        poly: null,
        room: null,
      },
      stateShown: {},
      asset: {},

      // TODO: use proper levels instead
      map: -1,
    }

    self.leaflet = {

    }
    
    self.map = null
    self.layer = {}

    
    self.build = function() {
      const mapent = self.data.map[0] || {}

      // TODO: refactor, these are inverted
      self.config.mapBounds[0] = null != mapent.ph ? mapent.ph : self.config.mapBounds[0]
      self.config.mapBounds[1] = null != mapent.pw ? mapent.pw : self.config.mapBounds[1]
        
      self.config.mapImg[0] = null != mapent.pw ? mapent.pw : self.config.mapImg[0]
      self.config.mapImg[1] = null != mapent.ph ? mapent.ph : self.config.mapImg[1]
      
      self.config.mapStart[0] = null != mapent.psx ? mapent.psx : self.config.mapStart[0]
      self.config.mapStart[1] = null != mapent.psy ? mapent.psy : self.config.mapStart[1]
            
      if(self.map) {
        self.map.remove()
      }
      
      self.map = L.map('plantquest-assetmap-map', {
        crs: L.CRS.Simple,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        attributionControl: false,
        minZoom: self.config.mapMinZoom,
        maxZoom: self.config.mapMaxZoom,
        editable: true,
      })
      
      rc = self.rc = new L.RasterCoords(self.map, self.config.mapImg)
      self.map.setMaxBounds(self.rc.getMaxBounds())
      
      new ResizeObserver(() => {
        self.map && self.map.invalidateSize()
      }).observe(self.vis.map.elem)

      self.map.getContainer().addEventListener('wheel', (event) => {

        try {

          let elem = event.target
          let stop = 99
          let count = 0
          let classes = ''+(elem && elem.className)
          while(
            null != elem && 
              count < stop
          ) {
            count++
            classes = ''+(elem && elem.className)
            if(
              -1 != classes.indexOf('plantquest-assetmap-assetcluster') ||
                -1 != classes.indexOf('plantquest-assetmap-assetinfo')
            ) {
              return
            }
            else if(-1 != classes.indexOf('leaflet')) {
              break
            }
            elem = elem.parentElement
          }
          
          self.map.scrollWheelZoom._onWheelScroll(event)
        }
        catch(e) {
          self.log('ERROR', 'ZOOM', e, event)
        }
      })

      self.map.scrollWheelZoom._delta = 0
      

      // Separate Pane to ensure ordering below assets,
      // prevents lost click events.
      
      self.map.createPane('geofence')
      let geofencePane = self.map.getPane('geofence')
      geofencePane.style.zIndex = 230
      geofencePane.style.pointerEvents = 'none'

      self.map.createPane('geofenceLabel')
      let geofenceLabelPane = self.map.getPane('geofenceLabel')
      geofenceLabelPane.style.zIndex = 235
      geofenceLabelPane.style.pointerEvents = 'none'


      self.map.createPane('room')
      let roomPane = self.map.getPane('room')
      roomPane.style.zIndex = 240
      roomPane.style.pointerEvents = 'none'

      self.map.createPane('roomLabel')
      let roomLabelPane = self.map.getPane('roomLabel')
      roomLabelPane.style.zIndex = 245
      roomLabelPane.style.pointerEvents = 'none'

      
      self.map.createPane('indicator')
      let indicatorPane = self.map.getPane('indicator')
      indicatorPane.style.zIndex = 2000
      // indicatorPane.style.pointerEvents = 'none'

      self.map.createPane('label')
      let labelPane = self.map.getPane('label')
      labelPane.style.zIndex = 2100
      labelPane.style.pointerEvents = 'none'

      self.map.createPane('info')
      let infoPane = self.map.getPane('info')
      infoPane.style.zIndex = 3000


      
      self.layer.label = L.layerGroup(null,{pane:'label'}).addTo(self.map)
      self.layer.label.name$ = 'label'

      self.layer.room = L.layerGroup(null,{pane:'room'}).addTo(self.map)
      self.layer.room.name$ = 'room'

      self.layer.roomLabel = L.layerGroup(null,{pane:'roomLabel'}).addTo(self.map)
      self.layer.roomLabel.name$ = 'roomLabel'
      
      self.layer.geofence = L.layerGroup(null,{pane:'geofence'}).addTo(self.map)
      self.layer.geofence.name$ = 'geofence'

      self.layer.clusterInfo = L.layerGroup(null,{pane:'info'}).addTo(self.map)
      self.layer.clusterInfo.name$ = 'clusterInfo'

      self.layer.assetInfo = L.layerGroup(null,{pane:'info'}).addTo(self.map)
      self.layer.assetInfo.name$ = 'assetInfo'

      self.layer.indicator = L.layerGroup(null,{pane:'indicator'}).addTo(self.map)
      self.layer.indicator.name$ = 'indicator'

      
      self.map.on('zoomstart', self.zoomStartRender)
      self.map.on('zoomend', self.zoomEndRender)
      
      setTimeout(()=>{
        let mapStart = c_asset_coords({x: self.config.mapStart[0], y: self.config.mapImg[1]-self.config.mapStart[1]})
        self.map.setView(mapStart, self.config.mapStartZoom)
        self.leaflet.mapCenter = self.map.getCenter()
      },self.config.mapInterval/2)
      

      if( self.config.asset.cluster) {
        self.layer.asset = L.markerClusterGroup({
          animateAddingMarkers: false,
          spiderfyOnMaxZoom: false,
          showCoverageOnHover: false,
          // zoomToBoundsOnClick: true,
          zoomToBoundsOnClick: false,
          // singleMarkerMode: true,
          // spiderfyDistanceMultiplier: -100,
          maxClusterRadius: 40,
          chunkedLoading: true,

          spiderLegPolylineOptions: { weight: 1.5, color: 'black', opacity: 2.5 },
          
          spiderfyLinear: false,
          spiderfyLinearDistance: 30,
          spiderfyLinearSeparation: 45,
        }).addTo(self.map)

        
        self.layer.asset.on('clusterclick', mev=>{
          let clusterMarker = mev.layer
          let {xco, yco} = convert_latlng(mev.latlng)
          
          let assetlist = clusterMarker.getAllChildMarkers().map(marker=>{
            return self.data.assetMap[marker.assetID]
          }).filter(asset=>null!=asset)

          if(self.current.clusterInfo &&
             clusterMarker.open$ && 
             self.current.clusterInfo.clusterID$ === clusterMarker.clusterID$
            )
          {
            self.closeClusterInfo()
            clusterMarker.open$ = false
            return 
          }

          self.openClusterInfo({clusterMarker,xco,yco})

          self.emit({
            srv:'plantquest',
            part:'assetmap',
            event: 'clusterclick',
            assets: assetlist,
          })
      })



        self.map.on('layeradd', event=> { // zoom-in
          let layer = event.layer // , circle, latlng, index, asset, arr, assetName
          

	  if(layer instanceof L.Marker && !(layer instanceof L.MarkerCluster)){
            let assetInst = self.asset.map[layer.assetID]
            if(null == assetInst) return;

	    if(assetInst && assetInst.indicator) {
              assetInst.indicator.addTo(self.layer.indicator)
            }
	  }
          
        })
        

        self.map.on('layerremove', event=> { // zoom-in
          let layer = event.layer // , circle, latlng, index, asset, arr, assetName
          

	  if(layer instanceof L.Marker && !(layer instanceof L.MarkerCluster)){
	    
	    let assetInst = self.asset.map[layer.assetID]

	    if(assetInst) {
	      if(assetInst.indicator) {
	        assetInst.indicator.remove()
	      }
	    }
	  }
          
        })
      }

      // No clustering
      else {
        self.layer.asset = L.layerGroup().addTo(self.map)
      }
      
      
      // Define a custom control
      function createDebugLog(content) {
        let debugLog = L.Control.extend({
          options: {
            position: 'topleft',
          },

          onAdd: function (map) {
            let container = L.DomUtil.create('div', 'control-panel')


            let _div = document.createElement('div')
    
            _div.textContent = content
            container.appendChild(_div)
    
    
            L.DomEvent.disableClickPropagation(container)
            L.DomEvent.disableScrollPropagation(container)

            return container
          }
        })
        return new debugLog()
      }
        
      if(self.config.debug.click) {
        self.map.on('click', (mev)=>{
          let {xco, yco} = convert_latlng(mev.latlng)
            
          let content = ''
	  if(self.leaflet.debugLog) {
	    self.leaflet.debugLog.remove()
	    self.leaflet.debugLog = null
	  }
	  let asset_data = {}
	  asset_data.xco = xco
	  asset_data.yco = yco
	  content = JSON.stringify(asset_data)
	    
	  self.leaflet.debugLog = createDebugLog(content)
	  // Add the custom control to the map
          self.map.addControl(self.leaflet.debugLog)
            
          self.emit({
            srv:'plantquest',
            part:'assetmap',
            event: 'click',
            meta: asset_data,
          })
            
        })
      }

      
      if(self.config.debug.coords) {
      
        self.listen((msg) => {
	  if(msg.show == 'asset') {
	    let { asset } = msg
	    let content = ''
	    if(self.leaflet.debugLog) {
	      self.leaflet.debugLog.remove()
	      self.leaflet.debugLog = null
	    }
	    if(asset) {
	      let asset_data = {}
	      asset_data.tag = asset.tag
	      asset_data.id = asset.id
	      asset_data.xco = asset.xco
	      asset_data.yco = asset.yco
	      content = JSON.stringify(asset_data)
	    }
	    self.leaflet.debugLog = createDebugLog(content)
	    // Add the custom control to the map
            self.map.addControl(self.leaflet.debugLog)
	  }
	  else if(msg.event == 'click') {
	    let meta = msg.meta || {}
	      
	    let asset_data = {}
	    let content = ''
	    if(self.leaflet.debugLog) {
	      self.leaflet.debugLog.remove()
	      self.leaflet.debugLog = null
	    }
	    asset_data.xco = meta.xco
	    asset_data.yco = meta.yco
            
	    content = JSON.stringify(asset_data)
	    self.leaflet.debugLog = createDebugLog(content)
            self.map.addControl(self.leaflet.debugLog)
	      
	  }
	  else {
	    if(self.leaflet.debugLog) {
	      self.leaflet.debugLog.remove()
	      self.leaflet.debugLog = null
	    }
	    self.leaflet.debugLog = createDebugLog('DEBUG LOG')
	      
            self.map.addControl(self.leaflet.debugLog)
	  }
	  
	})
      }
            
      self.map.on('mousemove', (mev)=>{
        let {xco, yco} = convert_latlng(mev.latlng)
        self.loc.x = xco
        self.loc.y = yco
      })
      

      if(self.checkRoomsInterval) {
        clearInterval(self.checkRoomsInterval)
      }

      if(self.config.room?.outline?.active) {
        self.checkRoomsInterval =
          setInterval(self.checkRooms, self.config.mapInterval)
      }
    }
    
    self.addLevelControl = function() {
      if(self.current.levelControl) {
        self.current.levelControl.remove()
      }

      let levelActions = []
      let levelsForBuilding =
          self.data.level.filter(level=>
            level.building_id===self.current.building?.id)
      
      levelsForBuilding.forEach((level,index)=>{
        levelActions.push(
          L.Toolbar2.Action.extend({
            options: {
              toolbarIcon: {
                html: level.name,
              }
            },
            
            addHooks: function () {
              self.showMap(index,{
                centerView:false,
                startZoom:false,
                showAllAssets:false,
                showLevelAssets:true,
                whence:'toolbarlevel'
              })
            }
          })
        )
      })

      let levelToolbar = new L.Toolbar2.Control({
        actions: levelActions,
        position: 'topright',
        className: 'plantquest-tool-level'
      })

      self.map.addLayer(levelToolbar)
      self.current.levelControl = levelToolbar
    }
    

    self.addBuildingControl = function() {
      if(self.current.levelControl) {
        self.current.levelControl.remove()
      }
      if(self.current.buildingControl) {
        self.current.buildingControl.remove()
      }
      
      let BuildingControl = L.Control.extend({
        onAdd: function(map) {
          let div = L.DomUtil.create('div')
          div.classList.add('leaflet-control')
          
          let ul = L.DomUtil.create('ul')
          ul.classList.add('leaflet-control-toolbar')
          ul.classList.add('leaflet-toolbar-0')
          ul.classList.add('plantquest-tool-building')

          let selectors = []

          let buildings = [...self.data.building].sort((a,b)=>a.name>b.name?1:a.name<b.name?-1:0)
          
          buildings.forEach((building,index)=>{
            let li = L.DomUtil.create('li')
            li.classList.add('plantquest-tool-select-building')
            li.setAttribute('data-plantquest-building',building.id)

            let a = L.DomUtil.create('a')
            a.classList.add('leaflet-toolbar-icon')
            a.setAttribute('href','#')
            a.innerText = building.name.replace('Building ','')

            li.appendChild(a)
            ul.appendChild(li)

            selectors.push(li)
            
            li.addEventListener('click', ()=>{
              self.current.building = building
              let coords = c_asset_coords({
                x: building.center[0],
                y: building.center[1]
              })
              self.map.setView(coords,self.config.mapMinZoom+1)
              self.addLevelControl()

              for(let selector of selectors) {
                selector.classList.remove('plantquest-tool-select-building-active')
                if(building.id ===
                   selector.getAttribute('data-plantquest-building')) {
                  selector.classList.add('plantquest-tool-select-building-active')
                }
              }
            })
          })

          div.appendChild(ul)
          
          return div
        },

        onRemove: function(map) {
          // Nothing to do here
        }
      })

      self.current.buildingControl = new BuildingControl({ position: 'topright' })
      self.current.buildingControl.addTo(self.map)

      self.addLevelControl()
    }


    self.zoomStartRender = function() {
      let zoom = self.map.getZoom()
      if(null == zoom) return;
    }


    self.zoomEndRender = function() {
      let zoom = self.map.getZoom()
      if (null == zoom) return;

      // TODO: need to define a zoom event schema
      let shown = Object.values(self.room.map).map(room=>
        room.onZoom(zoom, self.loc.map, self.layer.roomLabel))
    }


    self.moveTo = function(x,y,zoom) {
      let coords = c_asset_coords({x,y})
      self.map.setView(coords, zoom||self.config.mapStartZoom)
    }

    
    self.setAsset = function(assetEnt) {
      try {
        let existing = self.data.assetMap[assetEnt.id]
        
        if(existing) {
          Object.assign(existing, assetEnt)
        }
        else {
          self.data.assetMap[assetEnt.id] = assetEnt
        }
        
        let index = self.data.asset.findIndex(a=>a.id===assetEnt.id)
        if(-1 < index) {
          assetEnt = Object.assign(self.data.asset[index], assetEnt)
        }
        else {
          self.data.asset.push(assetEnt)
        }
        
        let assetCurrent = self.current.asset[assetEnt.id]
        
        let assetInst = self.asset.map[assetEnt.id]
        
        if(null == assetInst) {
          assetInst = self.asset.map[assetEnt.id] = new Asset(assetEnt, {
            cfg: self.config,
            pqam: self
          })
        }
        
        assetInst.ent = assetEnt
        assetInst = self.config.asset.prepare(assetInst) || assetInst
          
        if(assetInst.shown) {
          self.layer.asset.removeLayer(assetInst.label)
          assetInst.label = null

          if(assetCurrent) {
            assetCurrent.indicator.remove()
            assetCurrent.indicator = null
          }

          let showinfobox = assetInst.infobox

          if(showinfobox) {
            self.emit({
              srv:'plantquest',
              part:'assetmap',
              show:'asset',
              asset: assetEnt,
            })
          }
          
          assetInst.show({
            pqam: self,
            assetID: assetEnt.id,
            hide: false,
            blink: false ,
            showRoom: false,
            infobox: showinfobox,
            whence: 'setAsset',
          })
        }
        else {
          let show = assetEnt.map-1 == self.loc.map
          show &&
           assetInst.show({
            pqam: self,
            assetID: assetEnt.id,
            hide: false,
            blink: false ,
            showRoom: false,
            infobox: false,
            whence: 'setAsset',
          })
          self.current.shownAssets.add(assetEnt.id)
          self.data.deps.cp.asset = self.data.deps.cp.asset || {}
          self.data.deps.cp.asset[assetEnt.id] = { room: assetEnt.room }
          // delete self.current.asset[assetInst.id]
        }

        return assetEnt
      }
      catch(e) {
        self.log('ERROR', 'setAsset', assetEnt, e)
      }
    }
    
    
    self.checkRooms = function() {
      let xco = self.loc.x
      let yco = convert_poly_y(self.config.mapImg, self.loc.y)
      
      let rooms = Object.values(self.data.room)

      for(let room of rooms) {
        if((1+self.loc.map) != room.map) {
          continue
        }

        let roomInst = self.room.map[room.id]
        
        let alarmState = self.current.room[room.room] ?
            self.current.room[room.room].alarm : null

        let inside = room.poly && pointInPolygon([yco,xco], room.poly)
        let alreadyShown = room === self.loc.room || room === self.loc.chosen.room
        let drawRoom = inside && !alreadyShown && 'red' !== alarmState
        
        
        if(!drawRoom && !inside && self.loc.room === room) {
          if(self.loc.poly) {
            self.loc.poly.remove(self.layer.room)
            self.loc.room = null
          }
        }
        else if(drawRoom) {
          if(self.loc.poly) {
            self.loc.poly.remove(self.layer.room)
            self.loc.room = null
          }
          
          try {
            let roomState = self.current.room[room.room] ||
                (self.current.room[room.room]={alarm:'neutral'})
            let room_poly = convertRoomPoly(self.config.mapImg, room.poly)

            self.loc.room = room
            self.loc.alarmState = alarmState

            self.loc.poly = roomInst.show(self.layer.room, room_poly)

            let tooltip = L.tooltip({
              permanent: true,
              direction: 'center',
              opacity: 1,
              className: 'polygon-labels',
            })

            tooltip.setContent(
              '<div class="'+
                'plantquest-room-label '+
                'plantquest-room-over-label '+
                '">'+`${room.name}</div>`
            )

            self.loc.poly.bindTooltip(tooltip)
          }
          catch(e) {
            self.log('ERROR','map','1020', e.message, e)
          }
        }
      }
    }        

    self.unselectRoom = function() {
      let prevRoom = self.loc.chosen.room
      if(prevRoom) {
        self.loc.chosen.room = null
        let prevRoomState = self.current.room[prevRoom.room] ||
            (self.current.room[prevRoom.room]={alarm:'neutral'})
      
        if('red'===prevRoomState.alarm) {
          self.loc.chosen.poly.setStyle({
            color: self.resolveRoomColor(prevRoomState.alarm,'lo')
          })
          self.loc.stateShown[prevRoom.room].poly = self.loc.chosen.poly
        }
        else {
          self.loc.chosen.poly.remove(self.layer.room)
        }

        self.loc.chosen.poly = null

        if(self.loc.popup) {
          self.loc.popup.remove(self.map)
          self.loc.popop = null
        }
      }
    }

    
    self.showRoom = function(room, stateName) {
      self.log('showRoom', room, stateName)

      
      stateName =
        stateName || assetCurrent.stateName || (Object.keys(self.config.states)[0])

      let stateDef = self.config.states[stateName] || 
          self.config.states[(Object.keys(self.config.states)[0])]
      
      room = 'string' === typeof room ? self.data.roomMap[room] : room
      
      try {
        stateDef = self.alertRoomState(room.room, stateDef)
        
        let roomCurrent =
            self.current.room[room.room] ||
            (self.current.room[room.room]={})

        roomCurrent.stateDef = stateDef

        let stateShown = self.loc.stateShown[room.room] ||
            (self.loc.stateShown[room.room]= {})

        if(room === self.loc.chosen.room) {
          if(self.loc.chosen.poly) {
            self.loc.chosen.poly.setStyle({
              // color: self.resolveRoomColor(roomCurrent.stateDef,'hi')
              color: self.config.room.color
            })
          }
        }
        else {
          if(stateShown.poly) {
            stateShown.poly.remove(self.layer.room)
            stateShown.poly = null
          }
        }
        
      }
      catch(e) {
        self.log('ERROR','map','showRoom','1040', e.message, e)
      }
    }

    
    // Room state is set to highest priority (by order of definition in config.states) alert state
    self.alertRoomState = function(roomID, newStateDef) {
      let actualStateDef = newStateDef
      let newPriority = Object.keys(self.config.states).indexOf(newStateDef.stateName)
      
      let assets = (self.data.deps.pc.room[roomID] ?
                    self.data.deps.pc.room[roomID].asset : []) || []
      for(let assetID of assets) {
        let assetInst = self.asset.map[assetID]
        if(assetInst && assetInst.state) {
          let stateDef = self.config.states[assetInst.state]
          if('alert' === stateDef.marker) {
            let priority = Object.keys(self.config.states).indexOf(assetInst.state)
            if(newPriority < priority) {
              actualStateDef = stateDef
            }
          }
        }
      }

      return actualStateDef
    }
    

    self.getAssetInfoContainer = function() {
      let elem = $('#plantquest-assetmap-assetinfo-'+self.id)
      if(null == elem) {
        elem = D.createElement('div')
        elem.setAttribute('id','plantquest-assetmap-assetinfo-'+self.id)
        elem.style.display='none'
        $('body').appendChild(elem)
      }
      return elem
    }
    
    
    self.openAssetInfo = function(spec) {
      let {asset, assetMarker, xco, yco} = spec

      self.closeAssetInfo()
      self.closeClusterInfo()
          
      let elem = $('#plantquest-assetmap-assetinfo-'+self.id)
      if(null == elem) return;
          
      let assetInfoElem = D.createElement('div')
      assetInfoElem.setAttribute('id','pq-assetinfo-'+self.id)
      assetInfoElem.appendChild(elem)
      elem.style.display='block'
      
      let assetInfo = self.current.assetInfo = L.marker(
        c_asset_coords({x: xco+1, y: yco+20 }),
        {
          zIndexOffset: 1000,
          pane: 'info',
          icon: L.divIcon(
            {
              className: 'plantquest-assetmap-assetinfo',
              html: assetInfoElem,
            }),
        }
      )
          
      assetInfo.addTo(self.layer.assetInfo)

      assetInfo.assetID$ = asset.id

      if(assetMarker) {
        assetMarker.assetID$ = assetInfo.assetID$
        assetMarker.open$ = true
      }

      self.current.assetInfoShown[asset.id] = true
    }


    self.closeAssetInfo = function() {
      let assetInfo = self.current.assetInfo
      if(assetInfo) {
        let elem = $('#plantquest-assetmap-assetinfo-'+self.id)
        if(elem) {
          elem.style.display='none'
          $('body').appendChild(elem)
        }
        
        assetInfo.remove()
        assetInfo.open$ = false
        self.current.assetInfoShown[assetInfo.assetID$] = false
      }
      self.current.assetInfo = null
    }


    self.getClusterInfoContainer = function() {
      let elem = $('#plantquest-assetmap-assetcluster-'+self.id)
      if(null == elem) {
        elem = D.createElement('div')
        elem.setAttribute('id','plantquest-assetmap-assetcluster-'+self.id)
        elem.style.display='none'
        $('body').appendChild(elem)
      }
      return elem
    }
    

    self.openClusterInfo = function(spec) {
      let {clusterMarker, xco, yco} = spec
      
      self.closeAssetInfo()
      self.closeClusterInfo()
          
      let elem = $('#plantquest-assetmap-assetcluster-'+self.id)
      if(null == elem) return;
          
      let clusterInfoElem = D.createElement('div')
      clusterInfoElem.setAttribute('id','pq-clusterinfo-'+self.id)
      clusterInfoElem.appendChild(elem)
      elem.style.display='block'
      
      let clusterInfo = self.current.clusterInfo = L.marker(
        c_asset_coords({x: xco+1, y: yco+20 }),
        {
          pane: 'info',
          zIndexOffset: 1000,
          icon: L.divIcon(
            {
              className: 'plantquest-assetmap-assetcluster',
              html: clusterInfoElem,
            }),
        }
      )
          
      clusterInfo.addTo(self.layer.clusterInfo)

      clusterInfo.clusterID$ = ''+(1e9*Math.random() | 0)

      if(clusterMarker) {
        clusterMarker.clusterID$ = clusterInfo.clusterID$
        clusterMarker.open$ = true
      }
    }


    self.closeClusterInfo = function(spec) {
      let clusterInfo = self.current.clusterInfo
      if(clusterInfo) {
        let elem = $('#plantquest-assetmap-assetcluster-'+self.id)
        if(elem) {
          elem.style.display='none'
          $('body').appendChild(elem)
        }
        
        clusterInfo.remove()
        clusterInfo.open$ = false
      }
    }
    
    
    self.showGeofence = function(geofence, show) {
      if(null == geofence) {
        return
      }

      show = !!show

      if(true === show) {
        geofence.show(self.layer.geofence)
      }
      else if(false === show) {
        geofence.hide()
      }
    }


    self.clearGeofences = function() {
      for(let geofenceID in self.geofence.map) {
        let geofence = self.geofence.map[geofenceID]
        delete self.geofence.map[geofenceID]
        if(geofence && geofence.hide) {
          geofence.hide()
        }
      }
    }
    
    
    self.clearRoomAssets = function(roomID) {
      for(let assetID in self.asset.map) {
        let assetInst = self.asset.map[assetID]
        if(self.data.deps.cp.asset[assetID].room !== roomID) {
          if(assetInst.indicator) {
            assetInst.indicator.remove(self.layer.asset)
          }
          if(assetInst.label) {
            assetInst.label.remove(self.layer.asset)
          }
        }
      }
    }

    self.clearAssets = function(roomID) {
      let counts = {label:0,indicator:0}
      for(let assetID in self.asset.map) {
        let assetInst = self.asset.map[assetID]
        if(assetInst) {
          assetInst.hide({pqam:self})
        }
        delete self.asset.map[assetID]
      }
    }
    
    self.showRoomAssets = function(roomID) {
      let assets = (self.data.deps.pc.room[roomID] ?
                    self.data.deps.pc.room[roomID].asset : []) || []

      for(let assetID of assets) {
        let assetInst = self.asset.map[assetID]
        if(assetInst && assetInst.alarm) {
          self.showAsset({
            assetID,
            // stateName: assetCurrent.alarm,
            whence: 'showRoomAssets',
          })
          // assetID, assetCurrent.alarm)
        }
      }
    }

    self.getUrl = function(mapIndex) {
      return self.config.tilesEndPoint + '/' +
        self.config.plant_id + '/' +
        mapIndex + '/{z}/{x}/{y}.png'
    },
    
    self.createTile = function(mapIndex) {
      let tileLyr = 
        L.tileLayer(self.getUrl(mapIndex), {
          bounds: self.rc.getMaxBounds(),
          minZoom: self.config.mapMinZoom,
          maxZoom: self.config.mapMaxZoom,
        })
      return tileLyr
    },
    
    self.showMap = function(mapIndex, flags) {
      self.log('showMap', mapIndex, flags, self.loc)

      mapIndex = mapIndex < 0 ? 0 : mapIndex
      
      flags = flags || {}
      let centerView = false === flags.centerView ? false : true
      let startZoom = false === flags.startZoom ? false : true
      let showAllAssets = false === flags.showAllAssets ? false : true
      let showLevelAssets = true === flags.showLevelAssets ? true : false
      
      self.closeAssetInfo()
      self.closeClusterInfo()
      
      if(flags.force || mapIndex !== self.loc.map) {        
        if(self.leaflet.maptile) {
          self.leaflet.maptile.remove(self.map)
        }
        self.leaflet.maptile = self.createTile(mapIndex+1)
        self.leaflet.maptile.addTo(self.map)

        self.loc.map = mapIndex
                
        // render labels
        self.zoomEndRender()

        self.unselectRoom()

        if(self.loc.poly) {
          self.loc.poly.remove(self.layer.room)
          self.loc.room = null
        }

        if(centerView) {
          self.map.setView(
            self.config.mapStart,
            startZoom ? self.config.mapStartZoom : self.map.getZoom()
          )
        }
        
        if(self.config.geofence.show.all) {
          self.send({
            srv:'plantquest',
            part:'assetmap',
            show: 'geofence',
            geofence: null,
          })
        }

        if(showAllAssets && self.config.showAllAssets) {
          self.send({
            srv:'plantquest',
            part:'assetmap',
            show: 'asset',
            asset: null,
          })
        }
        else if(showLevelAssets && self.config.showLevelAssets) {
          self.send({
            srv:'plantquest',
            part:'assetmap',
            show: 'asset',
            levelAssets: true,
          })
        }


      }
      else {
        self.map.setView(self.config.mapStart, self.config.mapStartZoom)
      }


      self.emit({
        srv:'plantquest',
        part:'assetmap',
        show:'map',
        map: self.loc.map,
        // level: self.data.level[self.loc.map],
      })
    }

    
    self.resolveRoomColor = function(stateDef, hilo) {
      return 'hi' === hilo ? stateDef.color : self.config.room.color
    }
    

    self.roomPopup = function(room, msg) {
      let html = []

      html.push(
        '<h2 class="plantquest-room-popup">',
        room.room,
        '</h2>'
      )

      return html.join('\n')
    }

    
    self.getRoomAssets = function(roomID) {
      let assets = []
      let roomMap = self.data.deps.pc.room
      let roomEntry = roomMap[roomID]
      assets = roomEntry && roomEntry.asset ? roomEntry.asset.map(a=>({
        asset: a
      })) : assets
      return assets
    }


    self.getSeneca = async function() {
      if(null != self.seneca) {
        return self.seneca
      }

      while(self.state.senecaLoading) {
        await new Promise(r=>setTimeout(r,33))
      }
      if(self.state.senecaLoaded) {
        return self.seneca
      }
      self.state.senecaLoading = true

      
      let endpoint = (msg) => {
        let suffix = '/api/web' + '/public/' + msg.on
        let origin = self.config.endpoint // 'http://127.0.0.1:8888'
        let url = origin + suffix
        return url
      }
  
      let seneca = new Seneca({
        log: { logger: 'flat', level: 'warn' },
        plugin: {
          browser: {
            endpoint,
            headers: {
              'Authorization': 'Bearer ' + self.config.apikey,
	    },
          }
        },
        timeout: 44444,
      })
      
      seneca
        .test()
        .use(SenecaEntity)
        .ready(async function() {
          const seneca = this
        })
            
      // await seneca.ready()
      
      await seneca.client({
        type: 'browser',
        pin: [
          
          'aim:web',
          
          // 'aim:web,on:assetmap,get:info',

          // 'aim:web,on:assetmap,list:asset',
          // 'aim:web,on:assetmap,load:asset',
          // 'aim:web,on:assetmap,save:asset',
          // 'aim:web,on:assetmap,remove:asset',

          // 'aim:web,on:assetmap,list:room',
          // 'aim:web,on:assetmap,load:room',
          // 'aim:web,on:assetmap,save:room',
          // 'aim:web,on:assetmap,remove:room',

          // 'aim:web,on:assetmap,list:building',
          // 'aim:web,on:assetmap,load:building',
          // 'aim:web,on:assetmap,save:building',
          // 'aim:web,on:assetmap,remove:building',

          // 'aim:web,on:assetmap,list:geofence',
          // 'aim:web,on:assetmap,load:geofence',
          // 'aim:web,on:assetmap,save:geofence',
          // 'aim:web,on:assetmap,remove:geofence',

          // 'aim:web,on:assetmap,list:level',
          // 'aim:web,on:assetmap,load:level',
          // 'aim:web,on:assetmap,save:level',
          // 'aim:web,on:assetmap,remove:level',
        ]
      })

        .use(function pqam() {
          const seneca = this
          
          const amseneca = seneca
                .fix('srv:plantquest,part:assetmap')

          amseneca
            .message('get:info', async function getInfo(msg) {
              return { ...self.info }
            })
            .message('cmd:reset', async function resetMap(msg) {
              self.clearRoomAssets()
              self.unselectRoom()
              self.closeAssetInfo()
              self.closeClusterInfo()
              self.current.assetsShownOnLevel = {}
              self.map.setView(self.config.mapStart, self.config.mapStartZoom)
            })

          let ents = ['asset','room','building','level','geofence','map']
          
          for(let entname of ents) {
            amseneca

              .message('save:'+entname, async function saveItem(msg) {
                let item = msg[entname] || msg.item
                item = { ...item, ...{
                  project_id: self.config.project_id,
                  plant_id: self.config.plant_id,
                  stage: self.config.stage,
                } }
                
                let res = await this.post('aim:web,on:assetmap', { save:entname, item } )

                if(res.ok) {
                  self.emit({
                    srv:'plantquest',
                    part:'assetmap',
                    save: entname,
                    item: res.item,
                    [entname]: res.item
                  })
                }
                
                return res
              })
            
              .message('load:'+entname, async function loadItem(msg) {
                const { id } = msg

                let res = await this.post('aim:web,on:assetmap', { load:entname, id, } )

                if(res.ok) {
                  self.emit({
                    srv:'plantquest',
                    part:'assetmap',
                    load: entname,
                    [entname]: res.item
                  })
                }
                
                return res
              })
            
              .message('list:'+entname, async function listItem(msg) {
                let { query } = msg
                query = query || {
                  project_id: self.config.project_id,
                  plant_id: self.config.plant_id,
                  stage: self.config.stage,
                }

                let res = await this.post('aim:web,on:assetmap', { list:entname, query, } )

                if(res.ok) {
                  self.emit({
                    srv:'plantquest',
                    part:'assetmap',
                    list: entname,
                    [entname]: res.list,
                  })
                }
                
                return res
              })

              .message('remove:'+entname, async function removeItem(msg) {
                let { id } = msg
                let res = await this.post('aim:web,on:assetmap', { remove:entname, id } )

                if(res.ok) {
                  self.emit({
                    srv: 'plantquest',
                    part: 'assetmap',
                    remove: entname,
                    [entname]: res.item,
                  })
                }
                
                return res
              })
          }       

          amseneca
            .message('show:map', async function(msg) {
              self.showMap(msg.map, {whence:'message'})
            })
          
            .message('show:room', async function(msg) {
              let room = self.data.roomMap[msg.room]
              let roomInst = self.room.map[room.id]
              
              if(room) {
                if(msg.assets) {
                  if(msg.assets) {
                    for(let assetID of msg.assets) {
                      let asset = self.asset.map[assetID]
                      if(asset) {
                        asset.show({
                          pqam: self,
                          // stateName: asset.state,
                          whence: 'show-room',
                        })
                      }
                    }
                  }
                }

                if(msg.focus) {
                  roomInst.select(room.room, { mute: true })
                }
              }
              else {
                self.log('ERROR', 'send', 'room', 'unknown-room', msg)
              }
              
            })
          
            .message('show:plant', async function(msg) {
              self.showMap(msg.plant, {whence:'plant'})
            })
          
            .message('show:floor', async function(msg) {
              self.showMap(msg.map, {whence:'floor'})
              self.clearRoomAssets()
              self.unselectRoom()
              self.map.setView(self.config.mapStart, self.config.mapStartZoom)
              
            })

            .message('show:asset', showAssetMsg)
            .message('hide:asset', showAssetMsg)
            .message('load:asset', loadAssetMsg)
            .message('set:asset', setAssetMsg)

            .message('show:geofence', showGeofenceMsg)
            .message('hide:geofence', showGeofenceMsg)

          
            .message('relate:room-asset', async function(msg) {
              self.emit({
                srv: 'plantquest',
                part: 'assetmap',
                relate: 'room-asset',
                relation: clone(self.data.deps.pc.room)
              })
            })

            .message('srv:plantquest,part:assetmap', async function(msg) {})

            .message('close:assetinfo', closeAssetInfoMsg)
            .message('close:clusterinfo', closeClusterInfoMsg)
        })
      
      await seneca.ready()


      async function closeAssetInfoMsg(msg) {
        self.closeAssetInfo()
      }

      
      async function closeClusterInfoMsg(msg) {
        self.closeClusterInfo()
      }

      
      async function loadAssetMsg(msg) {
        let assetIDs = msg.asset || []
        assetIDs = Array.isArray(assetIDs) ? assetIDs : [assetIDs]
        assetIDs = assetIDs.filter(assetID=>'string' === typeof assetID)
        let query = {}
        if(0 < assetIDs.length) {
          query.id = assetIDs
        }
        let assetEnts =
            await self.seneca.post('aim:web,on:assetmap,list:asset',{query})

        if(assetEnts.ok) {
          self.seneca.act('srv:plantquest,part:assetmap,set:asset',{
            asset: assetEnts.list
          })
        }
        
        return assetEnts
      }
      
      
      async function setAssetMsg(msg) {
        let assetProps = msg.asset || []
        assetProps = Array.isArray(assetProps) ? assetProps : [assetProps]
        assetProps = assetProps.filter(assetProp=>null!=assetProp)

        let assetEnts = []
        
        for(let aI = 0; aI < assetProps.length; aI++) {
          let assetEnt = self.setAsset(assetProps[aI])
          assetEnts.push(assetEnt)
        }
        
        return assetEnts
      }
      
      async function clearPrevious(assetList, msg, mark) {
        for(let assetID of assetList) {
          let assetInst = self.asset.map[assetID]
          assetInst.show({
            pqam: self,
            // state: undefined,
            hide: true,
            blink: !!msg.blink,
            showRoom: false,
            infobox: false,
            whence: 'multiple~'+mark,
            closeinfo: false,
          })
        }
      }
      
      async function showAssetMsg(msg) {
        let mark = Math.random()
        let out = { multiple: false }

        dlog.push('showAssetMsg '+mark, msg)
        
        try {
          if(msg.reset) {
            await this.post('srv:plantquest,part:assetmap,cmd:reset')
            out.reset = true
            clearPrevious(self.current.shownAssets, msg, mark)
            self.current.shownAssets.clear()
          }

          self.closeAssetInfo()
          self.closeClusterInfo()
          
          self.current.assetHistory.map(hist=>hist.remove())
          self.current.assetHistory.length = 0
          
          let multiple = Array.isArray(msg.asset)
          let showAll = null === msg.asset
          
          
          
          if(multiple ||
             showAll ||
             msg.only ||
             msg.levelAssets
            ) {
            
            self.current.shownAssets = showAll ? new Set(Object.keys(self.data.assetMap)) : self.current.shownAssets
            
            // Clear the map out of assets when there is a 'clear' message
            if(msg.only || (showAll && 'asset' === msg.hide) ) {
              clearPrevious(self.current.shownAssets, msg, mark)
              self.current.shownAssets.clear()
              
            }
            
            // append
            if(multiple) {
              let set = self.current.shownAssets
              msg.asset.forEach(a => set.add(a))

              if('asset' === msg.hide) {
                msg.asset.forEach(asset => {
                  set.delete(asset)
                  clearPrevious([asset], msg, mark)
                })
              }
            }
            
            
            
            let assetIDList = self.current.shownAssets

            let stateName = msg.state

            let assetList = assetIDList
            
            
            out.multiple = true
            let showargs = []
            for(let assetID of assetList) {
              let assetInst = self.asset.map[assetID]
              let assetData = assetInst.ent
              
              if(assetData) {

                // Avoid double showAsset for single
                if(msg.asset === assetData.id) {
                  continue
                }
                
                let shown = showAll || true
                
                shown = 'hide'===msg.asset ? !shown : shown

                shown = assetData.map-1 == self.loc.map ? shown : false
                
                showargs.push([assetInst,{
                  pqam: self,
                  state: stateName,
                  hide: !shown,
                  blink: !!msg.blink,
                  showRoom: false,
                  infobox: false,
                  whence: 'multiple~'+mark,
                  closeinfo: false,
                }])
              }
            }
            
            function showBatch(n,m) {
              for(let i = n; i < m; i++) {
                showargs[i] && showargs[i][0].show(showargs[i][1])
              }
            }
            let size = 444
            for(let j = 0; j < showargs.length; j+=size) {
              ((jj)=>setTimeout(()=>showBatch(jj,jj+size),2*((j+1)/size)))(j)
            }
          }



          if('string' === typeof msg.asset) {
            let assetInst = self.asset.map[msg.asset]
            if(null == assetInst) {
              out.err = new Error('unknown asset: '+msg.asset)
              return out
            }
            
            let assetRoom = self.data.deps.cp.asset[msg.asset]
            // let assetData = self.asset.map[assetID].ent
            let assetData = assetInst.ent
            let zoom = msg.zoom || self.config.mapMaxZoom
            
            if(assetRoom) {
              dlog.push('showAssetMsg single '+mark)

              // emit-show-asset
              self.emit({
                srv:'plantquest',
                part:'assetmap',
                show:'asset',
                // before:true,
                focus: !!msg.focus,
                zoom: zoom,
                asset: assetData,
                closeinfo: false,
              })
              let coords = c_asset_coords({x: assetData.xco, y: assetData.yco})
              
              
              setTimeout(()=>{
                if(!!msg.focus) {
                  self.map.setView(coords, zoom)
                }
              }, 55)
              
              let showInfoBox =
                  null == msg.infobox ? self.config.infobox.show : !!msg.infobox

              let assetMapIndex = assetData.map
              if(null != assetMapIndex) {
                let mapIndex = (+assetMapIndex)-1
                if(mapIndex !== self.loc.map) {
                  self.showMap(mapIndex, {
                    startZoom: false,
                    // showAllAssets: false,
                    whence: 'showAssetMsg'
                  })
                }
              }

              // TODO: fix - this Timeout is needed if map changes, and showMap
              // resets all the assets, unsetting infobox etc
              setTimeout(()=>{
                let set = self.current.shownAssets
                if('asset' === msg.hide) {
                  set.delete(msg.asset)
                } else {
                  set.add(msg.asset)
                }

                assetInst.show({
                  pqam: self,
                  state: msg.state,
                  hide: 'asset' === msg.hide,
                  blink: !!msg.blink,
                  showRoom: false,
                  infobox: showInfoBox,
                  history: msg.history,
                  whence: 'single~'+mark,
                })
              },11)

              out.asset = assetData
            }
            else {
              self.log('ERROR', 'send', 'asset', 'unknown-asset', msg)
            }
          }
        }
        catch(e) {
          self.log('ERROR', 'showAssetMsg', e)
          out.err = e
        }

        return out
      }


      async function showGeofenceMsg(msg) {
        try {
          if(msg.reset) {
            await this.post('srv:plantquest,part:assetmap,cmd:reset')
          }

          let showAll = null === msg.geofence
          let geofenceIDList = []
          
          if(showAll || Array.isArray(msg.geofence)) {
            geofenceIDList = msg.geofence || Object.keys(self.geofence.map)
          }
          else {
            geofenceIDList = [msg.geofence]
          }

          for(let geofenceID of Object.keys(self.geofence.map)) {
            let geofence = self.geofence.map[geofenceID]
              
            if(geofence) {
              let shown = showAll || -1!=geofenceIDList.indexOf(geofenceID)
              shown = 'geofence'===msg.hide ? false : shown
              shown = geofence.ent.map == self.loc.map ? shown : false
              
              self.showGeofence(geofence, shown)
            }
            else {
              self.log('ERROR', 'send', 'geofence', 'unknown-geofence', geofenceID)
            }
          }

        }
        catch(e) {
          self.log('ERROR','showGeofenceMsg', e)
        }
      }
      
      
      self.state.senecaLoading = false
      self.state.senecaLoaded = true
      return self.seneca = seneca
    }
    
    return self
  }

  
  class Building {
    ent = null
    ctx = null
    
    constructor(ent,ctx) {
      this.ent = ent
      this.ctx = ctx
    }
  }


  class Level {
    ent = null
    ctx = null
    
    constructor(ent,ctx) {
      this.ent = ent
      this.ctx = ctx
    }
  }

  

  class Asset {
    mid = Math.random()
    ent = null
    ctx = null
    infobox = null
    shown = null
    label = null
    state = null
    alarm = null

    
    constructor(ent,ctx) {
      this.ent = ent
      this.ctx = ctx

      if(null != ent.x_status) {
        this.state = ent.x_status
      }
    }
    

    buildIndicator(args) {
      const {
        pqam,
        color,
      } = args
      
      let indicator = pqam.config.asset.cmp
      let indicators = {
        'circle': () => L.circle(
          c_asset_coords({x: this.ent.xco, y: this.ent.yco}), {
            radius: 0.2,
            color,
            weight: 2,
          }),
        'marker': () => L.marker(
          c_asset_coords({x: this.ent.xco, y: this.ent.yco}),
          { icon: L.icon({
              iconUrl: '/green-pin.png',
              iconSize: [32, 37],
              iconAnchor: [16, 37],
              popupAnchor: [-3, -37],
            }) 
          })
      }
      
      return indicators[indicator]()
    }


    show(spec) {
      let {
        pqam,
        state,
        hide,
        blink,
        showRoom,
        infobox,
        history,
        whence,
        closeinfo,
      } = spec

      let asset = this
      let assetID = asset.ent.id
      let showLabel = pqam.config.asset.label
      let assetClick = pqam.config.asset.click

      let defaultState = (Object.keys(pqam.config.states)[0])
      
      state = state || this.state || defaultState

      
      let stateDef = pqam.config.states[state] || 
          pqam.config.states[defaultState]

      let assetProps = asset.ent

      try {
        if(false !== closeinfo) {
          pqam.closeAssetInfo()
          pqam.closeClusterInfo()
        }

        // Ignore assets with invalid coords
        if(null == assetProps || null == assetProps.xco || null == assetProps.yco) {
          return
        }
      
        asset.infobox = infobox == null ? true : !!infobox
        
        if(hide) {
          asset.hide({
            pqam
          })
          return
        }
        else if(infobox) {
          pqam.current.assetInfoShown[assetID] = asset
        }

        asset.shown = true
        
        let assetPoint = [
          assetProps.yco,
          assetProps.xco,
        ]
        let ax = assetPoint[1]
        let ay = assetPoint[0]


        const onAssetClick = ()=>{
          if(!assetClick) {
            return
          }
          if(pqam.current.assetInfoShown[assetProps.id]) {
            pqam.closeAssetInfo()
          }
          else {

            // FIX: race condition
            // first clock afte select room doubles asset!
            pqam.send({
              srv:'plantquest',
              part:'assetmap',
              show:'asset',
              infobox: true,
              asset: assetProps.id,
            })
          }          
          pqam.emit({
            srv: 'plantquest',
            part: 'assetmap',
            event: 'click',
            on: 'asset',
            asset: assetProps,
          })
        }


        if(null == asset.indicator || (
          null != state && state !== this.state)) {
          this.state = state
          
          // asset.stateName = stateName
          let color = stateDef.color

          if(asset.indicator) {
            asset.indicator.remove()
            delete asset.indicator
          }

          if(asset.label) {
            pqam.layer.asset.removeLayer(asset.label)
            delete asset.label
          }

          asset.indicator = asset
            .buildIndicator({ color, pqam })
            .on('click', onAssetClick)
        }

      
        asset.blink = null == blink ? false : blink
        
        if(null == asset.label) {
          let textField = pqam.config.asset.label.field
          let text = assetProps[textField].replace(/\s+/g,'&nbsp;')

          // NOTE: this marker gets clustered!
          asset.label = L.marker(
            c_asset_coords({x: ax+12, y: ay-5+(10*Math.random()) }),
            { icon: L.divIcon({
              className: 'plantquest-assetmap-asset-marker',
              // iconSize: [38, 95]
              html: showLabel ? '<span class="'+
                'plantquest-font-asset-label '+
                `">${text}</span>` : ''
            }) }
          )

          showLabel && asset.label.on('click', onAssetClick)
          
          asset.label.id$ = Math.random()
          asset.label.assetID = assetID

          pqam.current.al[assetID] = (pqam.current.al[assetID]||[])
          pqam.current.al[assetID].push(asset.label)
        }


        asset.label.addTo(pqam.layer.asset)
        
        if( !pqam.config.asset.cluster) {
          asset.indicator.addTo(pqam.layer.indicator)
        }
        
        
        if(asset.infobox) {
          setTimeout(()=>{
            pqam.openAssetInfo({
              asset: assetProps,
              assetMarker: asset.indicator,
              xco: assetProps.xco,
              yco: assetProps.yco
            })
          },1)
        }
      
        
        if(history) {
          
          pqam.seneca.act('aim:web,on:assetmap,load:asset',{
            query: { id:assetProps.id }, history: true
          }, (err, res) => {
            if(err) return;
            
            if(res.ok) {
              pqam.current.assetHistory.map(hist=>hist.remove())
              pqam.current.assetHistory.length = 0
              
              for(let hist of res.item.history) {
                let histdot = L.circle(
                  c_asset_coords({x: hist.xco, y: hist.yco}), {
                    radius: 0.1,
                    color: 'black',
                    weight: 4,
                  })
                
                let tooltip = L.tooltip({
                  permanent: true,
                  direction: 'bottom',
                  opacity: 1,
                  className: 'polygon-labels',
                })
                
                let t_c = new Date(hist.t_c)
                let when = t_c.toISOString()
                tooltip.setContent('<span class="'+
                                   'plantquest-asset-history-label '+
                                   `">${when}<span>`)
                
                histdot.bindTooltip(tooltip)
                
                histdot.addTo(pqam.layer.indicator)
                pqam.current.assetHistory.push(histdot)
              }
            }
          })
        }
      }
      catch(e) {
        pqam.log('ERROR','showAsset','1050',
                 e.message, e, assetID, assetProps)
      }
    }

    hide(args) {
      const { pqam } = args

      let asset = this
      let assetID = asset.ent.id

      asset.shown = false
      if(asset.label) {
        pqam.layer.asset.removeLayer(asset.label)
      }
      if(asset.indicator) {
        asset.indicator.remove()
      }
      delete pqam.current.assetInfoShown[assetID] 
    }
  }


  class Room {
    ent = null
    ctx = null
    poly = null
    cfgroom = null
    label = null
    
    constructor(ent,ctx) {
      this.ent = ent
      this.ctx = ctx
      this.cfgroom = ctx.cfg.room
    }

    show(layer, room_poly) {
      if(null == this.poly) {
        this.poly = L.polygon(
          room_poly, {
            pane: "room",
            color: this.cfgroom.color
          })

        if(this.cfgroom.click.active) {
          this.poly.on('click', this.onClick.bind(this))
        }
      }

      this.poly.addTo(layer)
      
      return this.poly
    }

    focus(room) {
      if(null == room) return;
      
      let pqam = this.ctx.pqam
      
      let roomlatlng = [0,0]
      for(let point of room.poly) {
        if(point[0] > roomlatlng[0]) {
          roomlatlng[0] = point[0]
          roomlatlng[1] = point[1]
        }
      }

      // let roompos = [roomlatlng[0],roomlatlng[1]-30]
      
      let roompos_y = convert_poly_y(pqam.config.mapImg, roomlatlng[0])
      let roompos_x = roomlatlng[1]
      let roompos = c_asset_coords({y: roompos_y, x: roompos_x-30 } )
      // pqam.map.setView(roompos, pqam.config.mapRoomFocusZoom)
      pqam.map.setView(roompos,
                        pqam.config.mapRoomFocusZoom)
                        
      // pqam.zoomEndRender()
      
      return roomlatlng
    }

    select(roomId, opts) {
      opts = opts || {}

      let pqam = this.ctx.pqam

      try {
        let room = pqam.data.roomMap[roomId]
        let isChosen = pqam.loc.chosen.room && roomId === pqam.loc.chosen.room.room
        
        if(null == pqam.data.roomMap[roomId] || isChosen) {
          this.focus(pqam.loc.chosen.room)
          return
        }

        pqam.log('selectRoom', roomId, room)
        
        let roomState = pqam.current.room[room.room] ||
            (pqam.current.room[room.room]={alarm:'neutral'})

        if(pqam.loc.poly) {
          pqam.loc.poly.remove(pqam.layer.room)
          pqam.loc.poly = null
        }
        pqam.loc.room = null

        if(pqam.loc.chosen.poly && room !== pqam.loc.chosen.room) {
          let prevRoom = pqam.loc.chosen.room
          let prevRoomState = pqam.current.room[prevRoom.room] ||
              (pqam.current.room[prevRoom.room]={alarm:'neutral'})

          pqam.loc.chosen.poly.remove(pqam.layer.room)
          pqam.loc.chosen.poly = null
        }

        if(pqam.loc.popup) {
          pqam.loc.popup.remove(pqam.map)
          pqam.loc.popop = null
        }

        pqam.loc.chosen.room = room


        let room_poly = convertRoomPoly(pqam.config.mapImg, room.poly)
        
        pqam.loc.chosen.poly = L.polygon(
          room_poly, {
            pane: 'room',
            color: pqam.config.room.color
          })
        pqam.loc.chosen.poly.on('click', ()=>this.select(room.room))
        
        pqam.loc.chosen.poly.addTo(pqam.layer.room)

        let roomlatlng = this.focus(room)
        
        // convert for popup
        let roompos_y = convert_poly_y(pqam.config.mapImg, roomlatlng[0])
        let roompos_x = roomlatlng[1]
        let roompos = c_asset_coords({y: roompos_y-4, x: roompos_x+5 } )
               
        // map focus on room selection
        pqam.loc.popup = L.popup({
          autoClose: false,
          closeOnClick: false,
        })
          .setLatLng(roompos)
          .setContent(pqam.roomPopup(pqam.loc.chosen.room))
          .openOn(pqam.map)
                
        if(!opts.mute) {
          pqam.click({select:'room', room:pqam.loc.chosen.room.room})
        }
      }
      catch(e) {
        pqam.log('ERROR','selectRoom','1010', roomId, e.message, e)
      }
    }


    // TODO: need a mapState object
    onZoom(zoom, mapID, layer) {
      let mapMatch = (1+parseInt(mapID)) == parseInt(this.ent.map)
      let showRoomLabel = 1 === parseInt(this.ent.showlabel)
      
      let showNameZoom =
          null == this.cfgroom.label.zoom ? this.ctx.cfg.mapMaxZoom :
          this.cfgroom.label.zoom

      let showLabel = (showNameZoom <= zoom) && mapMatch && showRoomLabel

      let shown = false
      
      if(showLabel) {
        if(null == this.label && this.ent.poly) {
          this.label = L.polygon(
            convertRoomPoly(this.ctx.cfg.mapImg, this.ent.poly),
            {
              color: 'transparent',
              pane: 'roomLabel',
              interactive: false,
            })

          this.label.name$ = 'ROOM:'+this.ent.name

          let tooltip = L.tooltip({
            permanent: true,
            direction: 'center',
            opacity: 1,
            className: 'polygon-labels',
          })

          tooltip
            .setContent('<div class="'+
                        'xleaflet-zoom-animated '+
                        'plantquest-room-label '+
                        `">${this.ent.name}</div>`)
          
          this.label.bindTooltip(tooltip)
          
          // let _c = poly.getBounds().getCenter()
        }

        if(layer) {
          this.label.addTo(layer)
          shown = true
        }
      }
      else {
        if(null != this.label) {
          this.label.remove()
        }
      }
      return shown
    }
    
    onClick(event) {
      this.select(this.ent.id)
    }
  }


  class Geofence {
    ent = null
    ctx = null
    poly = null
    
    constructor(ent,ctx) {
      this.ent = ent
      this.ctx = ctx
    }
    
    show(layer) {
      if(null == this.poly) {
        let polyCoords = convertPoly(this.ctx.cfg.mapImg, this.ent.polygon)

        this.poly = L.polygon(
          polyCoords, {
            pane: 'geofence',
            color: this.ctx.cfg.geofence.color
          })
        
        if(this.ctx.cfg.geofence.click.active) {
          this.poly.on('click', this.onClick.bind(this))
        }

        let tooltip = L.tooltip({
          pane: 'geofenceLabel',
          permanent: true,
          direction: 'center',
          opacity: 1,
          className: 'polygon-labels',
        })

        this.poly.bindTooltip(tooltip)

        tooltip
          .setContent('<div class="'+
                      'leaflet-zoom-animated '+
                      'plantquest-geofence-label '+
                      `">${this.ent.title}</div>`)
      }
      
      this.poly.addTo(layer)
    }

    hide() {
      this.poly && this.poly.remove()
    }
    
    onClick(event) {
      // TODO: emit
    }
  }

  


  
  function buildContainer() {
    let html = `
  <div id="plantquest-assetmap-map" class="plantquest-assetmap-vis"></div>
`     
    return html
  }
  
  function fixid(idstr) {
    return idstr.replace(/[ \t]/g, '-')
  }
  
  function clear() {
  }
  
  function clone(obj) {
    if(null != obj && 'object' === typeof obj) {
      return JSON.parse(JSON.stringify(obj))
    }
    return obj
  }


  // pointInPolygon
  // The MIT License (MIT) Copyright (c) 2016 James Halliday
  // See https://github.com/substack/point-in-polygon
  
  function pointInPolygon (point, vs, start, end) {
    if (vs.length > 0 && Array.isArray(vs[0])) {
      return pointInPolygonNested(point, vs, start, end)
    } else {
      return pointInPolygonFlat(point, vs, start, end)
    }
  }

  function pointInPolygonFlat (point, vs, start, end) {
    let x = point[0], y = point[1]
    let inside = false
    if (start === undefined) start = 0
    if (end === undefined) end = vs.length
    let len = (end-start)/2
    for (let i = 0, j = len - 1; i < len; j = i++) {
      let xi = vs[start+i*2+0], yi = vs[start+i*2+1]
      let xj = vs[start+j*2+0], yj = vs[start+j*2+1]
      let intersect = ((yi > y) !== (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
      if (intersect) inside = !inside
    }
    return inside
  }
  
  function pointInPolygonNested (point, vs, start, end) {
    let x = point[0], y = point[1]
    let inside = false
    if (start === undefined) start = 0
    if (end === undefined) end = vs.length
    let len = end - start
    for (let i = 0, j = len - 1; i < len; j = i++) {
      let xi = vs[i+start][0], yi = vs[i+start][1]
      let xj = vs[j+start][0], yj = vs[j+start][1]
      let intersect = ((yi > y) !== (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
      if (intersect) inside = !inside
    }
    return inside
  }
  
  // utility functions
  
  // transform poly coords for tilesets
  function convertPoly(img, poly) {
    let p = []
    for(let part of poly) {
      p.push( rc.unproject({ x: part[1], y: part[0] }) )
    }
    return p
  }


  function convertRoomPoly(img, poly) {
    // console.log('CRP', img[1])
    let p = []
    for(let part of poly) {
      p.push( rc.unproject({ x: part[1], y: img[1] - part[0] }) )
    }
    return p
  }
  
  function convert_latlng(latlng) {
    let Lng = rc.project(latlng)
    return { 
      xco: Math.floor(Lng.x),
      yco: Math.floor(Lng.y)
    }
    
  }
  
  function convert_poly_y(img, y) {
    return img[1] - y
  }
  
  function c_asset_coords({ x, y }) {
    return rc.unproject({ x, y })
  }

  function make_parent_key(relate, asset) {
    return relate.p.split(/~/g).map(pn => asset[pn]).join('~')
  }

  function make_parent_val(relate, asset) {
    return relate.p.split(/~/g).reduce(((a, pn) => (a[pn] = asset[pn], a)), {})
  }


  function make_child_id(relate, asset) {
    // let ccol = 'asset' === relate.c ? 'tag' : relate.c
    return asset[relate.c]
  }

  function insert_child(arr, child) {
    if(arr instanceof Array) {
      for (let i = 0; i < arr.length; i++) {
        // ( ('~'+arr[i]) == ('~'+child) )
        if ( (arr[i]) === (child) ) {
          return
        } else if ( (arr[i]) > (child) ) {
          arr.splice(i, 0, child)
          return
        }
      }
      arr.push(child)
    }
    else if(arr instanceof Set) {
      arr.add(child)
    }
  }

  function generate(collection) {
    let ROOM_ATYPE = {
      'Room/Area': 1,
    }
    
    let deps = {
      cp: {},
      pc: {},
    }

    // Use a declarative data structure to define the relations we want.
    let relate = [
      { pc: true, p: 'room', c: 'asset', exclude: (asset) => ROOM_ATYPE[asset.atype] },
      { pc: true, p: 'map',c: 'building' },
      { pc: true, p: 'building', c: 'level' },
      { pc: true, p: 'building', c: 'map' },
      { pc: true, p: 'map~building', c: 'level' },
      { pc: true, p: 'map~building~level', c: 'room',include: (asset) => ROOM_ATYPE[asset.atype] },
      { pc: true, p: 'building~level', c: 'map' },
      { pc: true, p: 'map~level',c: 'level', include: (asset) => asset.map },

      { cp: true, p: 'map~building~level', c: 'room' },
      { cp: true, p: 'room', c: 'asset', exclude: (asset) => ROOM_ATYPE[asset.atype] },
    ]

    let maps = []
    let levels = []
    let buildings = new Set()
    
    let assetMap = {}
    let roomMap = {}
    
    Object.values(collection).forEach(assets => {
    
      assets.forEach(asset => {

        // asset = { ...asset }
      
        if (!ROOM_ATYPE[asset.atype]) {
          asset.asset = asset.id // asset.tag || asset.asset
          asset.room = asset.room || asset.room_id
          assetMap[asset.id] = asset
          
        
          asset.xco = asset.xco || asset.xval
          asset.yco = asset.yco || asset.yval

        } else {
          asset.room = asset.room || asset.name
          roomMap[asset.room] = asset
          roomMap[asset.id] = asset
          asset.poly = asset.polygon.points
        }
        asset.map = asset.map
        asset.level = asset.level
        asset.building = asset.building || asset.building_id
      

        if (null != asset.level && '' !== asset.level) {
          if(!levels.includes(asset.level)) {
            levels.push(asset.level)
          }
          
        }

        if (null != asset.building && '' !== asset.building) {
          buildings.add(asset.building)
        }

        if (null != asset.map && '' !== asset.map) {
          if(!maps.includes(asset.map)) {
            maps.push(asset.map)
          }
        }


        // Build each relation.
        relate.forEach(r => {


          // Build a Child-to-Parent
          if (r.cp && (!r.exclude || !r.exclude(asset)) && (!r.include || r.include(asset))) {
            let pv = make_parent_val(r, asset)
            deps.cp[r.c] = (deps.cp[r.c] || {})
            deps.cp[r.c][asset[r.c]] = pv
          }

          // Build a Parent-to-Child
          if (r.pc && (!r.exclude || !r.exclude(asset)) && (!r.include || r.include(asset))) {
            let pk = make_parent_key(r, asset)

            deps.pc[r.p] = (deps.pc[r.p] || {})
            deps.pc[r.p][pk] = (deps.pc[r.p][pk] || {})
            deps.pc[r.p][pk][r.c] = (deps.pc[r.p][pk][r.c] || [])

            let cid = make_child_id(r, asset)

            // insert_child(deps.pc[r.p][pk][r.c],''+asset[r.c])
            insert_child(deps.pc[r.p][pk][r.c], cid)
          
            // deps.pc[r.p][pk][r.c] = [ ... deps.pc[r.p][pk][r.c] ]
          
          }
        })
      })
    
    })

    buildings = Array.from(buildings)

    return {
      deps,
      maps,
      levels,
      buildings,
      assetMap,
      roomMap
    }

  }

  
  const top = {
    make: (id)=>{
      id = id || (''+Math.random()).substring(2,8)
      let pqam = top.instance[id]

      if(null == pqam) {
        pqam = new PlantQuestAssetMapInstance(id)
        top.instance[pqam.id] = pqam
      }

      return pqam
    },
    instance: {},
    prepare() {
      top.info = {
        name: '@plantquest/assetmap',
        version: Pkg.version,
      }
    }
  }
  
    
  W.PlantQuestAssetMap = top

  W.PlantQuestAssetMap.prepare()


  function injectStyle() {
    const head = $('head')
    const style = document.createElement('style')
    style.innerHTML = `


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

ul.leaflet-control-toolbar > li {
  margin: 0px;
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
    z-index: 1000;
}


img.plantquest-assetmap-logo {
    cursor: pointer;
}



div.plantquest-assetmap-asset-cluster {
    xwidth: 96px;
    xheight: 48px;
    font-size: 16px;
    xoverflow: hidden;
    z-index: 1000;
}



.plantquest-asset-history-label {
  color: #CCC;
  font-size: 4pt;
  width: min-content;
  overflow: visible;
}

div.plantquest-assetmap-asset-marker {
   width: min-content;
   overflow: visible;
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
    opacity: 0.9;
}

div.plantquest-assetmap-asset-state-missing {
    color: white;
    border: 2px solid #f3f;
    border-radius: 4px;
    background-color: #f3f;
    opacity: 0.9;
}

div.plantquest-assetmap-asset-state-alarm {
    color: white;
    border: 2px solid #f33;
    border-radius: 4px;
    background-color: #f33;
    opacity: 0.9;
}

.leaflet-pane svg {
    width: unset !important;
    height: unset !important;
    min-width: unset !important;
    min-height: unset !important;
    max-width: unset !important;
    max-height: unset !important;
}

.plantquest-room-over-label {}

.plantquest-room-popup {
}


.plantquest-font-normal {
  font-weight: normal;
  font-size: 12pt;
  color: black;
}

.plantquest-font-asset-label {
  font-weight: normal;
  font-size: 8pt;
  color: #666;
}

.plantquest-room-label {
  font-weight: normal;
  font-size: 12pt;
  color: #333;
}

.plantquest-geofence-label {
  font-weight: normal;
  font-size: 12pt;
  font-style: italic;
  color: #333;
}


.plantquest-tool-level {
  box-sizing: border-box;
  width: 100px;
}

.plantquest-tool-level .leaflet-toolbar-icon {
  width: 100% !important;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  padding: 0px 4px;
  box-sizing: border-box;
}


.plantquest-tool-building {
  box-sizing: border-box;
  width: 100px;
}

.plantquest-tool-building .leaflet-toolbar-icon {
  width: 100% !important;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  padding: 0px 4px;
  box-sizing: border-box;
}

.plantquest-tool-select-building {
}
.plantquest-tool-select-building-active a {
  background-color:#CCC !important;
}

.plantquest-font-s0 {
  font-size: 4pt;
}
.plantquest-font-s1 {
  font-size: 8pt;
}
.plantquest-font-s2 {
  font-size: 12pt;
}
.plantquest-font-s3 {
  font-size: 16pt;
}
.plantquest-font-s4 {
  font-size: 20pt;
}
.plantquest-font-s5 {
  font-size: 24pt;
}

`
    head.appendChild(style)
  }
  
})(window, document);

