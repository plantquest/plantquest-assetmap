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
import { PlantQuestData } from './PlantQuestData.js'
import { MockData } from './MockData.js'

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
        .use(MockData)
        .use(LeafletSetup)
        .use(PlantQuestData)

      this
        .use(PlantquestGeofenceDisplay, {
          seneca: {
            inbound: {
              'list:geofence,out$:true': 'list'
            }
          },
          outbound: {
            click: (event)=>{
              console.log('GEOFENCE CLICK', event)
            }
          },
          debug: true,
        })



      

      this.seneca
        .message('srv:plantquest,part:assetmap,start:instance', async function(msg) {

          // map setup should really happen inside load:map ??

          await this.post('srv:plantquest,part:assetmap,show:map',{
            // specify map
          })
          
          // should really happen inside a load:map ??
          await this.post('srv:plantquest,part:assetmap,load:frame', {
            project: 'bar',
            plant: 'foo',
            stage: 'dev',
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
          if(plugin.inbound) {
            const events = plugin.inbound()
            console.log('PLUGIN EVENTS', plugin.name, events, options.seneca?.inbound)
            Object.entries(options.seneca?.inbound||{}).map(entry=>{
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

