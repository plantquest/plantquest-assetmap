<script setup>
  
  import '@plantquest/assetmap'

const ENDPOINT = import.meta.env.VITE_PLANTQUEST_ASSETMAP_ENDPOINT || 'http://127.0.0.1:8888'
const APIKEY = import.meta.env.VITE_PLANTQUEST_ASSETMAP_APIKEY || 'NONE'
const TILES = import.meta.env.VITE_PLANTQUEST_ASSETMAP_TILES || 'NONE'

  
  console.log('window:: ', window.PlantQuestAssetMap)

  window.PLANTQUEST_ASSETMAP_LOG = false
  
  const options = {
  debug: {
    click: false,
    coords: false,
  },
  
  // data: 'https://demo.plantquest.app/sample-data.js',
  
  showAllAssets: true,
  
  width: '100%',
  height: '100%',
  mapImg: [6140, 4602],
  mapMinZoom: 2,
  mapStartZoom: 1.5,
  // mode: 'demo',
  mode: 'live',

  plant_id: 'newbridge',
  project_id: 'm71044',
  stage: 'dev',

  endpoint: ENDPOINT,
  apikey: APIKEY,
  tilesEndPoint: TILES,
  
  states: {
    up: { color: '#696', name: 'Up', marker: 'standard' },
    down: { color: '#666', name: 'Down', marker: 'standard' },
    missing: { color: '#f3f', name: 'Missing', marker: 'alert' },
  alarm: { color: '#f33', name: 'Alarm', marker: 'alert' },
  'In Use': { color: '#f33', name: 'In Use', marker: 'alert' },
  },
  
  start: {
    map: 0,
    level: 0,
  },
  
  levels: [
    { name: 'Ground Floor', index: 0 },
    { name: 'First Floor', index: 1  }
  ],

  asset: {
    label: {
      field: 'name',
    },
    cluster: true,
  },

  room: {
    color: '#33f',
    click: {
      active: true
    },
    outline: {
      active: true
    }
  },

  geofence: {
    show: {
      all: true
    }
  },

  update: {
    active: false,
    interval: 30000
  }
  }

  let pqam = window.PlantQuestAssetMap.make('demo')
  
  pqam.start({}, function () {
    console.log('READY', this)
    this.seneca.post('srv:plantquest,part:assetmap,show:map')
  })
</script>

<template>
<div >
  <div
    style="height:500px;width:800px; background-color:red;"
    id="plantquest-assetmap"
    ></div>  
</div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
