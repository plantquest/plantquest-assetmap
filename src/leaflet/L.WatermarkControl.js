L.Control.Watermark = L.Control.extend({
  onAdd: function (map) {
    var img = L.DomUtil.create('img')

    img.src =
      'https://www.trashedgraphics.com/wp-content/uploads/2013/10/pin_transparent_red.png'
    img.style.width = this.options.width

    return img
  },

  onRemove: function (map) {}
})

L.control.watermark = function (options) {
  return new L.Control.Watermark(options)
}
