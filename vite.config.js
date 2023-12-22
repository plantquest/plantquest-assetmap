import Path from 'path'
import { defineConfig } from 'vite'

const geofenceDisplayPath = Path.resolve(__dirname, '../leaflet-plugins/GeofenceDisplay/')
// console.log(geofenceDisplayPath)

//module.exports = {
export default defineConfig({
  build: {
    minify: false,
    target: 'es6',
    lib: {
      entry: 'src/pqam.js',
      name: 'PlantQuestAssetMap',
      fileName: 'pqam',
    },
    emptyOutDir: false,
    rollupOptions: {
      treeshake: false,
      logLevel: 'debug',
    },
    // resolve: {
    //   alias: {
    //     '@plantquest/geofence-display': geofenceDisplayPath,
    //   }
    // },
  },
})



