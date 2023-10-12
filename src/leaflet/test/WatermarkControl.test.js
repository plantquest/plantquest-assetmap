/**
 * @jest-environment jsdom
 */

const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

const jsdom = require('jsdom')
const { JSDOM } = jsdom
const jsdomDevtoolsFormatter = require('jsdom-devtools-formatter')
jsdomDevtoolsFormatter.install()

require('leaflet')
require('../L.WatermarkControl')

describe('Control.Watermark', function () {
  it('happy', function () {
    const { document } = new JSDOM(``).window
    let mapDiv = document.getElementById(document.createElement('div'))
    console.log('mapDiv type:', typeof mapDiv)

    // let map = L.map(mapDiv)
    // control = L.control.watermark()
    // control.addTo(map)
    // container = control.getContainer()

    // console.log(container.innerHTML)
    // expect(container.innerHTML).toBeDefined()
  })
})
