
module.exports = {
  build: {
    minify: false,
    target: 'es6',
    lib: {
      entry: 'src/pqam.js',
      name: 'PlantQuestAssetMini',
      fileName: 'pqam',
    },
    emptyOutDir: false,
    rollupOptions: {
      treeshake: false,
    },
  },
}
