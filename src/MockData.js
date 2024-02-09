



function MockData(options) {
  const seneca = this

  seneca.message('srv:plantquest,part:assetmap,list:geofence', async function(msg) {
    await new Promise((r)=>setTimeout(r,111))
    
    let include = msg.include || [true,true,true]
    let i = 0

    return {ok:true,list:[
      include[i++] && {
        id: 'buildingA',
        title: 'Building A',
        latlngs: [
          [52.7, 2086],
          [52.7, 2115.7],
          [47.4, 2115.7],
          [47.4, 2086],
        ],
      },
      include[i++] && {
        id: 'buildingB',
        title: 'Building B',
        latlngs: [
          [60.6, 2235],
          [60.6, 2255.3],
          [58.3, 2255.3],
          [58.3, 2252],
          [56.1, 2252],
          [56.1, 2235],
        ],
      },
      include[i++] && {
        id: 'buildingC',
        title: 'Building C',
        latlngs: [
          [3.4, 2155.6],
          [3.4, 2172.5],
          [-3.4, 2172.5],
          [-3.4, 2155.6],
        ],
      },
    ]}
  })

}


MockData.defaults = {
  
}



export {
  MockData
}
