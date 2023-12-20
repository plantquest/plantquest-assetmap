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
    
    constructor(id) {
      this.id = id

      const seneca = this.seneca = Seneca({
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

      seneca
        .fix({pqamv:Pkg.version})
        .test()
        .use(SenecaEntity)
        .use(LeafletSetup, {})


      // this
      //  .use(EtageControl, {})
    }

    start(options, ready) {
      this.options = options
      ready()
    }

    use(plugin, options) {
      // wrap leaflet plugin as seneca plugin, somehow
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

