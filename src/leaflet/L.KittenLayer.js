L.TileLayer.Kitten = L.TileLayer.extend({
  getTileUrl: function (coords) {
    var i = Math.ceil(Math.random() * 4)
    return 'https://placekitten.com/256/256?image=' + i
  },
  getAttribution: function () {
    return "<a href='https://placekitten.com/attribution.html'>PlaceKitten</a>"
  }
})

L.tileLayer.kitten = function () {
  return new L.TileLayer.Kitten()
}
