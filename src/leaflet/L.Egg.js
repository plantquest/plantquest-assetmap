L.Control.Egg = L.Control.extend({
  onAdd: function (map) {
    let x = this.options.position[0]
    let y = this.options.position[1]

    L.circle([x, y], {
      radius: 300,
      color: '#ffffff',
      fillColor: '#ffffff',
      fillOpacity: 1
    }).addTo(map)

    L.circle([x - 0.0005, y - 0.003], {
      radius: 225,
      color: '#ffffff',
      fillColor: '#ffffff',
      fillOpacity: 1
    }).addTo(map)

    L.circle([x, y], {
      radius: 150,
      color: '#ffbf00',
      fillColor: '#ffd500',
      fillOpacity: 1
    })
      .addTo(map)
      .bindPopup(this.options.message)
      .openPopup()
  }
})

L.egg = function (options) {
  return new L.Control.Egg(options)
}
