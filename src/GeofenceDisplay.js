import L from 'leaflet'
import { Gubu } from 'gubu'
// import './geofence-display.css'

const { Any } = Gubu

// TODO: implement Gubu with interfaces
// interface GeofenceDef {
//   id: string
//   title: string
//   latlngs: Array<Array<string>>
// }

// interface PlantquestGeofenceDisplayOptions extends L.ControlOptions {
//   debug: boolean
//   geofences: GeofenceDef[]
// }

const PluginName = 'GeofenceDisplay'

const OptionsShape = Gubu({
  debug: false,
  zIndex: 230,
  pqam: Any(),
  seneca: Any(),
})

const PlantquestGeofenceDisplay = L.Layer.extend({
  initialize: function (
    // this,
    rawOptions//: PlantquestGeofenceDisplayOptions
  ) {
    const self = this
    self.debug = rawOptions.debug ? (...args)=>console.log(PluginName, ...args): null
    
    const options = OptionsShape(rawOptions)

    L.Util.setOptions(self, options)
    
    self._state = {
      zindex: 0,
      geofences: [],
    }
  },

  
  onAdd: function (map) {
    let self = this
    self.debug && self.debug('onAdd')

    self._state.map = map
    
    const zIndex = this.options.zIndex
    
    map.createPane('geofence')
    self._state.geofencePane = map.getPane('geofence')
    self._state.geofencePane.style.zIndex = zIndex
    
    map.createPane('geofenceLabel')
    self._state.geofenceLabelPane = map.getPane('geofenceLabel')
    self._state.geofenceLabelPane.style.zIndex = zIndex + 5
  },

  
  onRemove: function (_map) {
    let self = this
    self.debug && self.debug('onRemove')
    self.clearGeofences()
    map.removeLayer(self._state.geofencePane)
    map.removeLayer(self._state.geofenceLabelPane)
  },


  events() {
    let self = this
    
    return {
      list: (event)=>{
        self.debug && self.debug('EVENT:list event', event)

        self.clearGeofences()
        let geofences = self._state.geofences
        
        let list = event.list || []
        
        list = list
          .filter(gfd=>!!gfd)
          .map(gfd=>new Geofence(gfd, {
            map: self._state.map,

            // TODO: only pass in config that we need
            cfg: self.options.pqam.config,
          }))
          .map(gf=>(gf.show(),gf))

        geofences.push(...list)

        self.debug && self.debug('EVENT:list geofences', geofences)
      }
    }
  },

  
  clearGeofences: function () {
    const self = this
    let geofences = self._state.geofences
    geofences.map(gf=>gf.hide())
    geofences.length = 0
  }
})


class Geofence {
  ent = null
  ctx = null
  poly = null

  constructor(ent, ctx) {
    this.ent = ent
    this.ctx = ctx
    this.poly = L.polygon(ent.latlngs, {
      pane: 'geofence',
      color: this.ctx.cfg.geofence.colour,
    })
  }

  show() {
    let self = this

    if (self.ctx.cfg.geofence.click.active) {
      self.poly.on('click', self.onClick.bind(self))
    }

    // TODO: tooltip options passed into plugin
    let tooltip = L.tooltip({
      pane: 'geofenceLabel',
      permanent: true,
      direction: 'bottom',
      opacity: 0.8,
      className: 'polygon-labels',
    })

    self.poly.bindTooltip(tooltip)

    tooltip.setContent(
      '<div class="' +
        'leaflet-zoom-animated ' +
        'plantquest-geofence-label ' +
        `">${self.ent.title}</div>`
    )

    self.poly.addTo(self.ctx.map)
  }

  hide() {
    let self = this
    self.poly && self.poly.remove()
  }

  onClick(event) {
    console.log('onClick', event)
  }
}

Object.defineProperty(PlantquestGeofenceDisplay, 'name', {value:'PlantquestGeofenceDisplay'})



export { PlantquestGeofenceDisplay }
