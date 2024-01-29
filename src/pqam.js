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

import { LeafletSetup } from './LeafletSetup.js'

// import { PlantquestGeofenceDisplay } from '@plantquest/geofence-display'
import { PlantquestGeofenceDisplay } from './GeofenceDisplay'


console.log('PQAM INIT 8')

;(function(W, D) {
  W.$L = L

  console.log('PQAM START')
  
  if(W.PlantQuestAssetMap) {
    return
  }

  class PlantQuestAssetMapInstance {
    id = null
    options = {}
    seneca = null
    
    constructor(id) {
      this.id = id

      this.seneca = this.seneca = Seneca({
        tag: 'pqam-'+Pkg.version,

        // TODO: make this work!
        test: true,
        
        log: { logger: 'flat', level: 'warn' },
        plugin: {
          browser: {
            // endpoint,
            headers: {
              // 'Authorization': 'Bearer ' + self.config.apikey,
	    },
          }
        },
        timeout: 44444,
      })

      this.seneca
        .error(console.log)
      // .test('print')
        .test()
        // .ready()
      
      this.seneca
        // .fix({pqamv:Pkg.version})
        .use(SenecaEntity)
        .use(LeafletSetup, {})


        .use(function FakeData(options) {
          const seneca = this
          
          seneca.add('srv:plantquest,part:assetmap,list:geofence', function(msg, reply) {
            let include = msg.include || [true,true,true]
            let i = 0
            reply({ok:true,list:[
              include[i++] && {
                id: 'buildingA',
                title: 'Building A',
                latlngs: [
                  [52.7, 2086],
                  [52.7, 2115.7],
                  [47.4, 2115.7],
                  [47.4, 2086],
                ],
              },
              include[i++] && {
                id: 'buildingB',
                title: 'Building B',
                latlngs: [
                  [60.6, 2235],
                  [60.6, 2255.3],
                  [58.3, 2255.3],
                  [58.3, 2252],
                  [56.1, 2252],
                  [56.1, 2235],
                ],
              },
              include[i++] && {
                id: 'buildingC',
                title: 'Building C',
                latlngs: [
                  [3.4, 2155.6],
                  [3.4, 2172.5],
                  [-3.4, 2172.5],
                  [-3.4, 2155.6],
                ],
              },
              
            ]})
          })
        }, {})

      
      this
        .use(PlantquestGeofenceDisplay, {
          debug: true,
          seneca: {
            events: {
              'list:geofence,out$:true': 'list'
            }
          },
          pqam: { config: { geofence: { click: { active: true }, color: '#f3f' } } },
        })


      this.seneca
        .message('srv:plantquest,part:assetmap,start:instance', async function(msg) {
          // load data etc
          await this.post('srv:plantquest,part:assetmap,show:map',{
            // specify map
          })
        })
      
    }

    start(options, ready) {
      this.options = options
      this.seneca.act('srv:plantquest,part:assetmap,start:instance', (...args) => {
        ready && ready.call(this, ...args)
      })
    }

    use(LeafletPlugin, options) {

      let pluginDefine = function(options) {
        const seneca = this

        seneca.prepare(async function() {
          await new Promise((r)=>setTimeout(r,555))

          // Provide Seneca for custom plugins
          options.seneca = options.seneca || {}
          options.seneca.instance = seneca
          const plugin = new LeafletPlugin(options)

          let map = this.export('LeafletSetup/getMap')()
          if(plugin.addTo) {
            plugin.addTo(map)
          }
          
          // Connect LeafletPlugin events to Seneca messages
          if(plugin.events) {
            const events = plugin.events()
            console.log('PLUGIN EVENTS', plugin.name, events, options.seneca?.events)
            Object.entries(options.seneca?.events||{}).map(entry=>{
              const eventPattern = entry[0]
              const eventName = entry[1]
              
              console.log('PLUGIN MSG SUB', eventPattern, eventName)

              let eventPat = seneca.util.Jsonic(eventPattern)
              seneca.sub(
                'srv:plantquest,part:assetmap',
                eventPat,
                function(msg, out, meta) {
                  const eventCallback = events[eventName]
                  // if(error) return events[eventName]({ok:false,error})
                  try {
                    return eventCallback(eventPat.in$?msg:out)
                  }
                  catch(err) {
                    console.error('EVENT-ERROR',err)
                  }
                }
              )
            })
          }
        })        
      }

      Object.defineProperty(pluginDefine, 'name', {value:LeafletPlugin.name})

      this.seneca.use(pluginDefine, options)
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
  

  // Define our global namespace.
  W.PlantQuestAssetMap = top

  W.PlantQuestAssetMap.prepare()
  
})(window, document);

