

import { injectStyle } from './style.js'


function LeafletSetup(options) {
  const seneca = this

  let document = options.document
  let $ = document.querySelector.bind(document)
  let $All = document.querySelectorAll.bind(document)
  let $Element = document.createElement.bind(document)
  
  let target = null
  let map = null


  seneca
    .fix('srv:plantquest,part:assetmap')
    .message('show:map', msgShowMap)


  async function msgShowMap(msg) {
    let url = 'https://plantquest-demo01-map01.s3.eu-west-1.amazonaws.com/tiles/pqd-pq01-m01-013/{z}/{x}/{y}.png'
    let tileLayer = L.tileLayer(url)
    tileLayer.addTo(map)

    map.setView([50.154377, 2154.375], 2)
    
    // console.log('LeafletSetup', 'showMap', map, tileLayer)
    
    return {
      ok: true
    }
  }
  
  
  seneca.prepare(async function() {
    // console.log('PREPARE MAP HTML')

    target = $(options.target)
    if(null == target) {
      seneca.fail('plantquest-target-element-missing', {
        target
      })
    }

    injectStyle($)

    let mapElement = $Element('div')
    mapElement.setAttribute('id','plantquest-assetmap-map')
    mapElement.classList.add('plantquest-assetmap-vis')
    
    let rootElement = $Element('div')
    // TODO: move to css
    rootElement.style.boxSizing = 'border-box'
    rootElement.style.width = '100%'
    rootElement.style.height = '100%'
    rootElement.style.backgroundColor = 'rgb(203,211,144)'
    rootElement.style.padding = '0px'
    rootElement.style.textAlign = 'center'
    rootElement.style.position = 'relative'
    rootElement.appendChild(mapElement)
    
    target.appendChild(rootElement)

    map = L.map('plantquest-assetmap-map', {
      // crs: L.CRS.Simple,
      // scrollWheelZoom: false,
      // doubleClickZoom: false,
      // attributionControl: false,
      // editable: true,
      minZoom: 2,
    })

    console.log('LeafletSetup','prepare',map)
  })
  

  return {
    exports: {
      getMap: ()=>map
    }
  }
}


LeafletSetup.defaults = {
  target: '#plantquest-assetmap',
  document: 'undefined' == document ? {} : document,
}



export {
  LeafletSetup
}
