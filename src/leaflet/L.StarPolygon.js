L.Polygon.Star = L.Polygon.extend({
  getLatLngs: function () {
    let lat = getCenter()[0]
    console.log(lat)
    let long = getCenter()[1]
    return [
      [lat, long],
      [lat + 0.001, long + 0.001],
      [lat + 0.002, long + 0.002],
      [lat + 0.003, long + 0.003],
      [lat + 0.004, long + 0.004],
      [lat + 0.005, long + 0.005],
      [lat + 0.006, long + 0.006],
      [lat + 0.007, long + 0.007],
      [lat + 0.008, long + 0.008],
      [lat + 0.009, long + 0.009]
    ]
  }
})

// L.Polygon.star(latlngs, {colour:'yellow'}).addTo(map)

L.Polygon.star = function (latlngs, options) {
  return new L.Polygon.Star(latlngs, options)
}
