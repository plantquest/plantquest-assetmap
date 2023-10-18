const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

const jsdom = require('jsdom')
const { JSDOM } = jsdom
const jsdomDevtoolsFormatter = require('jsdom-devtools-formatter')
jsdomDevtoolsFormatter.install()

// require('leaflet')
// require('../L.WatermarkControl')

const dom = new JSDOM(``)
const { document } = dom.window
let mapDiv = document.createElement('div')
mapDiv.setAttribute('id', 'map')
console.log('mapDiv type:', mapDiv)
console.log('document type:', document)
console.log('dom.window type:', dom.window)

with (document) {
  require('leaflet')
  require('../L.WatermarkControl')
  let map = L.map('map')
}
// control = L.control.watermark()
// control.addTo(map)
// container = control.getContainer()

// console.log(container.innerHTML)
// expect(container.innerHTML).toBeDefined()
