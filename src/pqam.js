/* Copyright 2022 PlantQuest Ltd, MIT License */

import L from 'leaflet'
import './leaflet.toolbar.min.js'
import Pkg from '../package.json'

import '../node_modules/leaflet-rastercoords/rastercoords.js'


;(function(W, D) {
  const log = (...args) => {
    if(true === window.PLANTQUEST_ASSETMAP_LOG || 'ERROR' === args[1]) {
      console.log.apply(null, args)
    }
  }
  
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
  
  function PlantQuestAssetMap() {
    const self = {
      id: (''+Math.random()).substring(2,8),
      config: {
        width: 600,
        height: 400,
        domInterval: 111,
        mapInterval: 111,
        mapBounds: [5850, 7800],
        mapImg: [7800, 5850],
        mapStart: [2925,3900],
        mapStartZoom: -4,
        mapRoomFocusZoom: 0,
        mapMinZoom: 2,
        mapMaxZoom: 6,
        assetFontScaleRoom: 10,
        assetFontScaleZoom: 4,
        assetFontHideZoom: -1,

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
          color: '#33f'
        },

        plants: [
          { id: 'aaa', name: 'Plant AAA' },
          { id: 'bbb', name: 'Plant BBB' }
        ],
      },
      data: {},
      current: {
        started: false,
        room: {},
        asset: {
        },
      },
      listeners: [],
    }

    self.log = function(...args) {
      log('PQAM', ...args)
    }
    
    
    self.start = function(config) {
      if(self.current.started) {
        self.clearRoomAssets()
        self.unselectRoom()
        self.map.setView([...self.config.mapStart], self.config.mapStartZoom)
        return
      }
      
      self.config = { ...self.config, ...(config || {}) }
      self.log('start', JSON.stringify(config))
      
      self.config.base = self.config.base || ''

      if(!self.config.base.endsWith('/')) {
        self.config.base += '/'
      }
      
      function loading() {
        self.target = $('#plantquest-assetmap')
        if(!self.target) {
          self.log('ERROR', 'element-id', 'plantquest-assetmap', 'missing')
          clearInterval(loadingInterval)
          return
        }
                
        if (null != self.target && false === self.current.started) {
          self.current.started = true

          self.target.style.width = self.config.width
          self.target.style.height = self.config.height

          clearInterval(loadingInterval)
          self.log('start','target-found',self.target)

          self.log(
            'start','target-size',
            'widthcss',self.config.width,
            'heightcss',self.config.height,
          )
          
          self.load(()=>{
            self.log('start','load-done',self.data)
            
            self.render(()=>{
              self.log('start','render-done')
              
              self.emit({
                srv:'plantquest',
                part:'assetmap',
                state: 'ready'
              })
            })
          })
        }
      }

      const loadingInterval = setInterval(loading, 50)
    }

    
    self.load = function(done) {

      function processData(json) {
        self.data = json
        
        let assetMap = {}
        let assetProps = self.data.assets[0]
        for(let rowI = 1; rowI < self.data.assets.length; rowI++) {
          let row = self.data.assets[rowI]
          let assetID = row[0]
          assetMap[assetID] = assetProps.reduce((a,p,i)=>((a[p]=row[i]),a),{})
        }
        
        self.data.assetMap = assetMap
        
        
        let roomMap = self.data.rooms.reduce((a,r)=>(a[r.room]=r,a),{})
        self.data.roomMap = roomMap
        
        self.log('data loaded')
        done(json)
      }

      if('https://demo.plantquest.app/sample-data.js' === self.config.data) {
        const head = $('head')
        const skript = document.createElement('script')
        skript.setAttribute('src', self.config.data)
        head.appendChild(skript)

        let waiter = setInterval(()=>{
          self.log('loading data...')
          if(window.PLANTQUEST_ASSETMAP_DATA) {
            clearInterval(waiter)
            processData(window.PLANTQUEST_ASSETMAP_DATA)
          }
        },111)
      }
      else {
        // fetch(self.config.base+self.config.data)
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
    }

    
    self.render = function(done) {      
      injectStyle()
      
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

      setTimeout(()=>{
        self.vis.map.elem = $('#plantquest-assetmap-map')
        self.build()
        self.showMap(0)
        done()
      }, self.domInterval)
    }

    self.send = function(msg) {
      self.log('send', 'in', msg)

      if('room-asset' === msg.relate) {
        self.emit({
          srv:'plantquest',
          part:'assetmap',
          relate:'room-asset',
          relation:clone(self.data.deps.pc.room)
        })        
      }
      else if('map' === msg.show) {
        self.showMap(msg.map)
      }
      else if('plant' === msg.show) {
        self.showMap(msg.plant)
      }
      else if('floor' === msg.show) {
        self.showMap(msg.map)
        self.clearRoomAssets()
        self.unselectRoom()
        self.map.setView([...self.config.mapStart], self.config.mapStartZoom)
      }
      else if('room' === msg.show) {
        let room = self.data.roomMap[msg.room]
        
        if(room) {

          if(msg.assets) {
            if(msg.assets) {
              for(let asset of msg.assets) {
                self.showAsset(asset.asset, asset.state)
              }
            }
          }

          if(msg.focus) {
            self.selectRoom(room.room, {mute:true})
          }
        }
        else {
          self.log('ERROR', 'send', 'room', 'unknown-room', msg)
        }
      }
      else if('asset' === msg.show || 'asset' === msg.hide) {
        let assetRoom = self.data.deps.cp.asset[msg.asset]
        let assetData = self.data.assetMap[msg.asset]
        if(assetRoom) {
          self.emit({
            srv:'plantquest',
            part:'assetmap',
            show:'asset',
            before:true,
            asset: assetData,
          })
          self.showAsset(msg.asset, msg.state, 'asset' === msg.hide, !!msg.blink)
        }
        else {
          self.log('ERROR', 'send', 'asset', 'unknown-asset', msg)
        }
      }
      else if(null != msg.zoom) {
        self.map.setZoom(msg.zoom)
      }
    }

    self.listen = function(listener) {
      if(null == listener || 'function' !== typeof(listener)) {
        self.log('ERROR', 'listen', 'bad-listener', listener)
                 
      }
      else {
        self.listeners.push(listener)
        self.log('listen', 'set-listener',
                 '<<'+listener.toString()
                 .substring(0,77).replace(/[\r\n]/g,'')+'...>>')
      }
    }

    
    self.click = function(what, event) {
      event && event.stopPropagation()
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
      map: -1,
    }

    self.leaflet = {

    }
    
    self.map = null
    self.layer = {}

    
    self.build = function() {
      let ms = {
        mapurl: self.config.map[self.config.start.map],
        bounds: [[0, 0], [...self.config.mapBounds]]
      }

      self.log('build', ms, L)
      
      
      self.map = L.map('plantquest-assetmap-map', {
        crs: L.CRS.Simple,
        scrollWheelZoom: true,
        attributionControl: false,
        minZoom: self.config.mapMinZoom,
        maxZoom: self.config.mapMaxZoom,
      })
      rc = self.rc = new L.RasterCoords(self.map, self.config.mapImg)

      self.map.on('zoomstart', self.zoomStartRender)
      self.map.on('zoomend', self.zoomEndRender)
      
      setTimeout(()=>{
        self.map.setView([...self.config.mapStart], self.config.mapStartZoom)
      },self.config.mapInterval/2)

      // L.imageOverlay(ms.mapurl, ms.bounds).addTo(self.map);

      self.layer.room = L.layerGroup().addTo(self.map)
      self.layer.asset = L.layerGroup().addTo(self.map)
      
      self.map.on('mousemove', (mev)=>{
        let {xco, yco} = convert_latlng(mev.latlng)
        self.loc.x = xco
        self.loc.y = yco
      })
      
      setInterval(self.checkRooms, self.config.mapInterval)


      let levelActions = []
      self.data.levels.forEach((level,index)=>{
        levelActions.push(
          L.Toolbar2.Action.extend({
            options: {
              toolbarIcon: {
                html: level,
              }
            },
            
            addHooks: function () {
              self.showMap(index)
            }
          })
        )
      })

      self.config.plants.forEach((plant,index)=>{
        levelActions.push(
          L.Toolbar2.Action.extend({
            options: {
              toolbarIcon: {
                html: plant.name,
              }
            },
            
            addHooks: function () {
              self.showMap(index)
            }
          })
        )
      })

      self.map.addLayer(new L.Toolbar2.Control({
        actions: levelActions,
        position: 'topright',
      }))

        
      /*
      // new L.Toolbar2.Control({
      //   actions: levelActions
      // }).addTo(self.map)

      let plantActions = []
      self.config.plants.forEach((plant,index)=>{
        plantActions.push(
          L.Toolbar2.Action.extend({
            options: {
              toolbarIcon: {
                html: plant.name,
              }
            },
            
            addHooks: function () {
              self.showMap(index)
            }
          })
        )
      })
      
      // new L.Toolbar2.Control({
      //   position: 'bottomleft',
      //   actions: plantActions,
      // }).addTo(self.map)

      self.map.addLayer(
        new L.Toolbar2.Control({
          position: 'bottomleft',
          actions: plantActions,
        }).addTo(self.map)
        )
        */
    }


    self.zoomStartRender = function() {
      let zoom = self.map.getZoom()
      if(null == zoom) return;
    }


    self.zoomEndRender = function() {
      let zoom = self.map.getZoom()
      if(null == zoom) return;

      /*
      if(self.config.assetFontHideZoom < zoom) {
        let assetFontSize = self.config.assetFontScaleRoom +
          (zoom * self.config.assetFontScaleZoom)        

        let assetFontSizePts = assetFontSize+'pt'
      
        $All('.plantquest-assetmap-asset-label-green')
          .forEach(label => {
            label.style.display='block'
          })
        $All('.plantquest-assetmap-asset-label-red')
          .forEach(label => {
            label.style.display='block'
          })
      }
      else {
        $All('.plantquest-assetmap-asset-label-green')
          .forEach(label => {
            label.style.display='none'
          })
        $All('.plantquest-assetmap-asset-label-red')
          .forEach(label => {
            label.style.display='none'
          })
      }
      */
    }
    
    
    self.checkRooms = function() {
      let xco = self.loc.x
      let yco = convert_poly_y(self.config.mapImg, self.loc.y)
      
      let rooms = Object.values(self.data.rooms)

      for(let room of rooms) {
        if((1+self.loc.map) != room.map) {
          continue
        }
        
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
            

            self.loc.poly = L.polygon(
              room_poly, {
                // color: self.resolveRoomColor(roomState.alarm,'lo')
                color: self.config.room.color
              })

            self.loc.poly.on('click', ()=>self.selectRoom(room.room))
            
            self.loc.poly.addTo(self.layer.room)
          }
          catch(e) {
            self.log('ERROR','map','1020', e.message, e)
          }
        }
      }

      Object.values(self.current.asset).map((assetState)=>{
        if(assetState.poly) {
          if(assetState.blink) {
            if(true === assetState.blinkState) {
              assetState.poly.addTo(self.layer.asset)
              assetState.blinkState = false
            }
            else {
              assetState.poly.remove(self.layer.asset)
              assetState.blinkState = true
            }
          }
        }
      })
    }        


    self.selectRoom = function(roomId,opts) {
      opts = opts || {}
      try {
        let room = self.data.roomMap[roomId]
        let isChosen = self.loc.chosen.room && roomId === self.loc.chosen.room.room
        
        if(null == self.data.roomMap[roomId] || isChosen) {
          self.focusRoom(self.loc.chosen.room)
          return
        }

        self.log('selectRoom', roomId, room)

        // self.showMap(parseInt(room.map)-1)
        
        let roomState = self.current.room[room.room] ||
            (self.current.room[room.room]={alarm:'neutral'})

        if(self.loc.poly) {
          self.loc.poly.remove(self.layer.room)
          self.loc.poly = null
        }
        self.loc.room = null

        if(self.loc.chosen.poly && room !== self.loc.chosen.room) {
          let prevRoom = self.loc.chosen.room
          let prevRoomState = self.current.room[prevRoom.room] ||
              (self.current.room[prevRoom.room]={alarm:'neutral'})

          // if('red'===prevRoomState.alarm) {
          //   self.loc.chosen.poly.setStyle({
          //     color: self.resolveRoomColor(prevRoomState.alarm,'lo')
          //   })
          //   self.loc.stateShown[prevRoom.room].poly = self.loc.chosen.poly
          // }
          // else {
            self.loc.chosen.poly.remove(self.layer.room)
            self.loc.chosen.poly = null
        // }
        }

        if(self.loc.popup) {
          self.loc.popup.remove(self.map)
          self.loc.popop = null
        }

        self.loc.chosen.room = room


        // if('red' === roomState.alarm) {
        //   let stateShown = self.loc.stateShown[room.room] ||
        //       (self.loc.stateShown[room.room]= {})
        //   if(stateShown.poly) {
        //     stateShown.poly.setStyle({
        //       color: self.resolveRoomColor(roomState.alarm,'hi')
        //     })
        //     self.loc.chosen.poly = stateShown.poly
        //   }
        // }
        // else {
          let room_poly = convertRoomPoly(self.config.mapImg, room.poly)
          
          self.loc.chosen.poly = L.polygon(
            room_poly, {
              // color: self.resolveRoomColor(roomState.alarm,'hi')
              color: self.config.room.color
          })
          self.loc.chosen.poly.on('click', ()=>self.selectRoom(room.room))
          
          self.loc.chosen.poly.addTo(self.layer.room)
      // }

        let roomlatlng = self.focusRoom(room)
        
        // convert for popup
        let roompos_y = convert_poly_y(self.config.mapImg, roomlatlng[0])
        let roompos_x = roomlatlng[1]
        let roompos = c_asset_coords({y: roompos_y-50, x: roompos_x+50 } )
               
        // map focus on room selection
        self.loc.popup = L.popup({
          autoClose: false,
          closeOnClick: false,
        })
          .setLatLng(roompos)
          .setContent(self.roomPopup(self.loc.chosen.room))
          .openOn(self.map)
        
        // self.map.setView(roompos,
                         // self.map.getZoom())
                         

        self.showRoomAssets(room.room)
        self.clearRoomAssets(room.room)
        // self.zoomEndRender()
        
        if(!opts.mute) {
          self.click({select:'room', room:self.loc.chosen.room.room})
        }
      }
      catch(e) {
        self.log('ERROR','selectRoom','1010', roomId, e.message, e)
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

    
    self.focusRoom = function(room) {
      if(null == room) return;
      
      let roomlatlng = [0,0]
      for(let point of room.poly) {
        if(point[0] > roomlatlng[0]) {
          roomlatlng[0] = point[0]
          roomlatlng[1] = point[1]
        }
      }

      // let roompos = [roomlatlng[0],roomlatlng[1]-30]
      
      let roompos_y = convert_poly_y(self.config.mapImg, roomlatlng[0])
      let roompos_x = roomlatlng[1]
      let roompos = c_asset_coords({y: roompos_y, x: roompos_x-30 } )
      // self.map.setView(roompos, self.config.mapRoomFocusZoom)
      self.map.setView(roompos,
                        self.map.getZoom())
                        
      self.zoomEndRender()
      
      return roomlatlng
    }

    
    self.showRoom = function(room, stateName) {
      self.log('showRoom', room, stateName)

      stateName = stateName || assetCurrent.stateName || (Object.keys(self.config.states)[0])
      let stateDef = self.config.states[stateName]

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
            
          // if('red' === alarm) {
          //   stateShown.poly = L.polygon(
          //     room.poly, {
          //       color: self.resolveRoomColor(roomCurrent.stateDef,'lo')
          //     })
          //   stateShown.poly.addTo(self.layer.room)
          //   stateShown.poly.on('click', ()=>self.selectRoom(room.room))
          // }
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
        let assetState = self.current.asset[assetID]
        if(assetState && assetState.stateName) {
          let stateDef = self.config.states[assetState.stateName]
          if('alert' === stateDef.marker) {
            let priority = Object.keys(self.config.states).indexOf(assetState.stateName)
            if(newPriority < priority) {
              actualStateDef = stateDef
            }
          }
        }
      }

      return actualStateDef
    }
    

    self.showAsset = function(assetID, stateName, hide, blink) {
      let assetCurrent = self.current.asset[assetID] || (self.current.asset[assetID]={})

      stateName = stateName || assetCurrent.stateName || (Object.keys(self.config.states)[0])
      let stateDef = self.config.states[stateName]

      let assetProps = self.data.assetMap[assetID]
      self.log('showAsset', assetID, stateName, stateDef, 'hide', hide, 'blink', blink, assetProps)
      
      if(null == assetProps) {
        return
      }
      
      if(assetCurrent.poly) {
        assetCurrent.poly.remove(self.layer.asset)
        assetCurrent.poly = null
      }

      if(assetCurrent.label) {
        assetCurrent.label.remove(self.layer.asset)
        assetCurrent.label = null
      }

      self.showRoom(assetProps.room, stateName)
      
      // Only draw polys if room is chosen or not hiding
      if(hide ||
         (null == self.loc.chosen.room ||
          assetProps.room !== self.loc.chosen.room.room))
      {
        return
      }
      
      
      let assetPoint = [
        assetProps.yco,
        assetProps.xco,
      ]
      let ax = assetPoint[1]
      let ay = assetPoint[0]
      
      assetCurrent.stateName = stateName
      let color = stateDef.color
      
      let ay_poly = convert_poly_y(self.config.mapImg, ay)
      let room_poly = convertRoomPoly(self.config.mapImg, [
          [ay_poly+10,ax],
          [ay_poly-10,ax+10],
          [ay_poly-10,ax-10],
      ])
      
      if('alert' === stateDef.marker) {
        console.log('alert')
        assetCurrent.poly = L.polygon(room_poly, {
          color: color,
        })
      }
      else {
        console.log('circle')
        assetCurrent.poly = L.circle(
          c_asset_coords({x: ax, y: ay}), {
            radius: 0.2,
            color: color,
          })
      }

      assetCurrent.poly.addTo(self.layer.asset)

      assetCurrent.blink = null == blink ? false : blink
      
      setTimeout(()=>{
        let html = $('#plantquest-assetmap-assetinfo').innerHTML
        assetCurrent.label = L.marker(
          c_asset_coords({x: ax+1, y: ay+20 }),
          {icon: L.divIcon({
            className: 'plantquest-assetmap-asset-label plantquest-assetmap-asset-state-'+stateName,
            html
          })
        })

        assetCurrent.label.addTo(self.layer.asset)

        let lem = assetCurrent.label.getElement()
        lem.style.width = ''
        lem.style.height = ''
        lem.style.fontSize = ''
      
        self.zoomEndRender()
      },50)
    }

    
    self.clearRoomAssets = function(roomID) {
      for(let assetID in self.current.asset) {
        let assetCurrent = self.current.asset[assetID]
        if(self.data.deps.cp.asset[assetID].room !== roomID) {
          if(assetCurrent.poly) {
            assetCurrent.poly.remove(self.layer.asset)
          }
          if(assetCurrent.label) {
            assetCurrent.label.remove(self.layer.asset)
          }
        }
      }
    }

    
    self.showRoomAssets = function(roomID) {
      let assets = (self.data.deps.pc.room[roomID] ?
                    self.data.deps.pc.room[roomID].asset : []) || []

      for(let assetID of assets) {
        let assetCurrent = self.current.asset[assetID]
        if(assetCurrent && assetCurrent.alarm) {
          self.showAsset(assetID, assetCurrent.alarm)
        }
      }
    }

    self.getUrl = function(mapIndex) {
      return self.config.tilesEndPoint + '/' + mapIndex + '/{z}/{x}/{y}.png'
    },
    
    self.createTile = function(mapIndex) {
      let tileLyr = 
        L.tileLayer(self.getUrl(mapIndex), {
          // noWrap: true,
          // maxNativeZoom: rc.zoomLevel(),
          bounds: self.rc.getMaxBounds(),
          minZoom: self.config.mapMinZoom,
          maxZoom: self.config.mapMaxZoom,
        })
      return tileLyr
    },
    
    self.showMap = function(mapIndex) {
      self.log('showMap', mapIndex, self.loc)
      if(mapIndex !== self.loc.map) {
        if(self.leaflet.maptile) {
          self.leaflet.maptile.remove(self.map)
        }
        // let mapurl = self.config.map[mapIndex]
        // let bounds = [[0, 0], [...self.config.mapBounds]]
        self.leaflet.maptile = self.createTile(mapIndex+1)
        // self.leaflet.mapimg = L.imageOverlay(mapurl, bounds)
        self.leaflet.maptile.addTo(self.map)
        self.loc.map = mapIndex

        self.unselectRoom()

        if(self.loc.poly) {
          self.loc.poly.remove(self.layer.room)
          self.loc.room = null
        }
        
        self.emit({
          srv:'plantquest',
          part:'assetmap',
          show:'map',
          map: self.loc.map,
          level: self.data.levels[self.loc.map],
        })
      }
    }

    
    self.resolveRoomColor = function(stateDef, hilo) {
      return 'hi' === hilo ? stateDef.color : self.config.room.color
    }
    

    self.roomPopup = function(room, msg) {
      let html = []

      html.push(
        '<h2>',
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

    
    function buildContainer() {
      let html = [
        '<div id="plantquest-assetmap-map" class="plantquest-assetmap-vis"></div>',
      ]      
      return html.join('')
    }

    return self
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
  function convertRoomPoly(img, poly) {
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
  
  function c_asset_coords( {x, y} ) {
    return rc.unproject({x, y})
  }
    
  W.PlantQuestAssetMap = new PlantQuestAssetMap()


  function injectStyle() {
    const head = $('head')
    const style = document.createElement('style')
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

.leaflet-toolbar-0>li>.leaflet-toolbar-icon {
  width: 80px;
}


`
    head.appendChild(style)
  }
  
})(window, document);

