
module.exports = {
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
    },
  },
}



