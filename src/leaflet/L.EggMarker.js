L.[MarkerPlugin].Egg = L.[MarkerPlugin].extend({
  getTileUrl: function (coords) {
    var i = Math.ceil(Math.random() * 4)
    return 'https://placekitten.com/256/256?image=' + i
  },
  getAttribution: function () {
    return "<a href='https://placekitten.com/attribution.html'>PlaceKitten</a>"
  }
})

L.[MarkerPlugin].egg = function () {
  return new L.[MarkerPlugin].Kitten()
}

L.circle([51.495, -0.08], {
  radius: 300,
  color: '#ffffff',
  fillColor: '#ffffff',
  fillOpacity: 1
}).addTo(map)

L.circle([51.4945, -0.077], {
  radius: 225,
  color: '#ffffff',
  fillColor: '#ffffff',
  fillOpacity: 1
}).addTo(map)

L.circle([51.495, -0.08], {
  radius: 150,
  color: '#ffbf00',
  fillColor: '#ffd500',
  fillOpacity: 1
})
  .addTo(map)
  .bindPopup('Get egged lol')
  .openPopup()