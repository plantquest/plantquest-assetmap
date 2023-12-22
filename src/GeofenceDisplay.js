import L from 'leaflet'
import { Gubu } from 'gubu'
// import './geofence-display.css'

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

const PlantquestGeofenceDisplay = L.Layer.extend({
  initialize: function (
    // this,
    rawOptions//: PlantquestGeofenceDisplayOptions
  ) {

    
    
    console.log('rawOptions IN', rawOptions)
    
    // const PlantquestGeofenceDisplayOptionsShape = Gubu({})
    // let options = rawOptions // PlantquestGeofenceDisplayOptionsShape(rawOptions)
    // options.debug && console.log('GeofenceDisplay init function called.')

    
    // L.Util.setOptions(options)
    L.Util.setOptions(this, rawOptions)

    console.log('rawOptions SET', this.options)
    
    this._state = {
      zindex: 0,
      geofenceByID: {},
    }
  },

  onAdd: function (map) {
    let self = this


    map.createPane('geofence')
    let geofencePane = map.getPane('geofence')
    geofencePane.style.zIndex = 230
    
    map.createPane('geofenceLabel')
    let geofenceLabelPane = map.getPane('geofenceLabel')
    geofenceLabelPane.style.zIndex = 235
    

    
    self.options.debug && console.log('GeofenceDisplay onAdd function called.')
    self.options.debug &&
      console.log(
        'Local geofence variable before add:',
        self._state.geofenceByID
      )

    self.options.geofences.forEach((geo) => {
      let geofence = new Geofence(geo, {
        map: map,
        cfg: self.options.pqam.config,
      })
      self._state.geofenceByID[geo.id] = geofence
      self.showGeofence(geofence, true)
    })

    self.options.debug &&
      console.log(
        'Local geofence variable after add:',
        self._state.geofenceByID
      )
  },

  onRemove: function (_map) {
    let self = this
    self.options.debug &&
      console.log('GeofenceDisplay onRemove function called.')
    self.options.debug &&
      console.log(
        'Local geofence variable before remove:',
        self._state.geofenceByID
      )

    self.clearGeofences()

    self.options.debug &&
      console.log(
        'Local geofence variable after remove:',
        self._state.geofenceByID
      )
  },


  events() {
    return {
      setGeofences: ()=>{
        
      }
    }
  },

  
  showGeofence: function (geofence, show) {
    if (null == geofence) {
      return
    }
    show = !!show
    if (true === show) {
      geofence.show()
    } else if (false === show) {
      geofence.hide()
    }
  },

  clearGeofences: function () {
    let self = this
    for (let geofenceID in self._state.geofenceByID) {
      let geofence = self._state.geofenceByID[geofenceID]
      delete self._state.geofenceByID[geofenceID]
      if (geofence && geofence.hide) {
        geofence.hide()
      }
    }
  },
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
