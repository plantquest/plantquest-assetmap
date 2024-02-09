



function PlantQuestData(options) {
  const seneca = this

  let entNames = [
    // 'asset',
    // 'building',
    'geofence',
    // 'level',
    // 'room',
  ]

  let frame
  let data = {}
  
  
  seneca
    .fix('srv:plantquest,part:assetmap')
    .message('load:frame', msgLoadFrame)

  

  // Load all data needed for a map "frame" -
  // the set of choices that determine a full set of map data -
  // Example: Plant+Stage
  async function msgLoadFrame(msg) {
    // Example: {project:bar,plant:foo,stage:dev}
    frame = msg.frame

    // Clear previous data.
    for(let entName of entNames) {
      data[entName] = (data[entName] || [])
      data[entName].length = 0

      let query = { ...frame }
      
      try {
        let res = await seneca.post(
          'srv:plantquest,part:assetmap',
          { list: entName, query, }
        )

        if(res && res.ok) {
          data[entName] = res.list
        }
      }
      catch(e) {
        // TODO: handle debug logging properly
        console.log('ERROR', 'list-ent', e)
      }
    }
  }

  
  seneca.prepare(async function() {
    console.log('Plantquestdata prepare')

  })
  

  return {
    exports: {
    }
  }
}


PlantQuestData.defaults = {
  
}



export {
  PlantQuestData
}
