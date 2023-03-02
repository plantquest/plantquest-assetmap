# @plantquest/assetmap

[![npm version](https://img.shields.io/npm/v/@plantquest/assetmap.svg)](https://www.npmjs.com/package/@plantquest/assetmap)

> PlantQuest Asset Map

## Install

```bash
npm install --save @plantquest/assetmap
```

## Usage



## Debug Log

Set `window.PLANTQUEST_ASSETMAP_LOG` to `true` to enable logging.


## Options

* `width`: Pixel width of map
* `height`: Pixel height of map
* `mapBounds`: Pixel bounds of map
* `mapStart`: Pixel start position of map
* `mapStartZoom`: Starting zoom level
* `mapRoomFocusZoom`: Zoom level for room focus
* `mapMaxZoom`: Maximum zoom
* `mapMinZoom`: Minimum zoom
* `states`: State definitions
  * `{ [stateName]: { color: COLOR, name: STRING, marker: 'standard'|'alert'}, ...}`
* `start.map`: Starting map
* `start.level`: Starting level
* `room.color`: Room highlight color

## Quick Example

```js

import { PlantQuestAssetMap } from '@plantquest/assetmap'

window.PLANTQUEST_ASSETMAP_LOG = true

const options = {
  data: 'https://demo.plantquest.app/sample-data.js',
  map: [
    'https://demo.plantquest.app/pqd-pq01-m01-011.png',
    'https://demo.plantquest.app/pqd-pq01-m02-011.png',
  ],
  width: '1000px',
  height: '1000px',
  states: {
    up: { color: '#696', name: 'Up', marker: 'standard' },
    down: { color: '#666', name: 'Down', marker: 'standard' },
    missing: { color: '#f3f', name: 'Missing', marker: 'alert' },
    alarm: { color: '#f33', name: 'Alarm', marker: 'alert' },
  },
}

class App extends React.Component {
  
  constructor(props) {
    super(props)
    
    // to keep track of map's state
    // using listeners so we can reuse these in our app
    this.state = {
      map: -1,
      level: '',
      rooms: [],
      showRoom: null,
    }
    

  }
  
  componentDidMount() {
    const PQAM = window.PlantQuestAssetMap
    
    
    PQAM.listen((msg) => {
      // put 'ready' listener to use
      if('ready' === msg.state) {
        // set 'rooms' for reuse
        this.setState({
          rooms: PQAM.data.rooms
        })
      }
      // when a user selects a room
      // "USER SELECT ROOM" example
      else if ('room' === msg.select) {
        // pick a room
        let item = PQAM.data.roomMap[msg.room]
        this.setState({ showRoom: item })
        this.selectRoom(item)
      }
      // "USER SELECT MAP" example
      else if('map' === msg.show) {
        this.setState({ level: msg.level })
        this.setState({ map: msg.map })
      }
      
    })
    
  
  }
  
  selectRoom(item) {
    const PQAM = window.PlantQuestAssetMap
    
    // "SEND A MESSAGE" example
    // "SHOW ROOM"
    PQAM.send({
      srv: 'plantquest',
      part: 'assetmap',
      show: 'room',
      room: item.room,
      focus: true,
    })
  
  }
  

  render() {
    return (
      <div className="App">
        <PlantQuestAssetMap
          options={options}
        />
      </div>
    )
  }
  
}

```

## Messages

  <h2>SEND MESSAGES</h2>

  <h3>ZOOM</h3>
  <pre>
{
  srv: 'plantquest',
  part: 'assetmap',
  ZOOM: &lt;INTEGER&gt;,     
}</pre>
  <p>Where:<br>
    <i>&lt;INTEGER&gt;</i>: Zoom level (default: 2 to 6)<br>
  </p>


  <h3>GET RELATION</h3>
  <pre>
{
  srv: 'plantquest',
  part: 'assetmap',
  relate: 'room-asset',
}</pre>
  <p>Listen: <a href="#listen-relation">RELATION</a><br>
  </p>


  <h3>SHOW ROOM</h3>
  <pre>
{
  srv: 'plantquest',
  part: 'assetmap',
  show: 'room',
  room: &lt;ROOM-ID&gt;,
  focus: &lt;Boolean&gt;,   
}</pre>
  <p>Where:<br>
    <i>&lt;ROOM-ID&gt;</i>: Room Identifier String<br>
    <i>&lt;Boolean&gt;</i>: either true or false - enable focus when a room is shown<br>
  </p>

  <h3>SHOW ASSET</h3>
  <pre>
{
  srv: 'plantquest',
  part: 'assetmap',
  show: 'asset',
  asset: &lt;ASSET-ID&gt;,     
}</pre>
  <p>Where:<br>
    <i>&lt;ASSET-ID&gt;</i>: Asset Identifier String<br>
  </p>
  
  <h3>HIDE ASSET</h3>
  <pre>
{
  srv: 'plantquest',
  part: 'assetmap',
  hide: 'asset',
  asset: &lt;ASSET-ID&gt;,     
}</pre>
  <p>Where:<br>
    <i>&lt;ASSET-ID&gt;</i>: Asset Identifier String<br>
  </p>

  <h3>SET ASSET STATUS</h3>
  <pre>
{
  srv: 'plantquest',
  part: 'assetmap',
  status: &lt;STATUS&gt;,
  asset: &lt;ASSET-ID&gt;,     
}</pre>
  <p>Where:<br>
    <i>&lt;STATUS&gt;</i>: Status String ('red', 'green')<br>
    <i>&lt;ASSET-ID&gt;</i>: Asset Identifier String<br>
  </p>

  <h3>SHOW MAP</h3>
  <pre>
{
  srv: 'plantquest',
  part: 'assetmap',
  show: 'map',
  map: &lt;INTEGER&gt;,     
}</pre>
  <p>Where:<br>
    <i>&lt;INTEGER&gt;</i>: Number of the map<br>
  </p>
  
  
  <h2>LISTEN MESSAGES</h2>
   
  <h3>STATE</h3>
  <pre>
{
  srv: 'plantquest',
  part: 'assetmap',
  state: &lt;STATE&gt;,
}</pre>
  <p>Where:<br>
    <i>&lt;STATE&gt;</i>: 'ready' - triggered when the map is fully rendered <br>
  </p>


  <a name="listen-relation"></a>
  <h3>RELATION</h3>
  <pre>
{
  srv: 'plantquest',
  part: 'assetmap',
  relate: 'room-asset',
  relation: &lt;RELATION&gt;,
}</pre>
  <p>Where:<br>
    <i>&lt;RELATION&gt;</i>:
    <pre>
      { '&lt;ROOM-ID&gt;': [ '&lt;ASSET-ID&gt;', ... ] }
    </pre>
    <br>
  </p>


  <h3>USER SELECT ROOM</h3>
  <pre>
{
  srv: 'plantquest',
  part: 'assetmap',
  select: 'room',
  room: &lt;ROOM-ID&gt;,     
}</pre>
  <p>Where:<br>
    <i>&lt;ROOM-ID&gt;</i>: Room Identifier String<br>
  </p>

  <h3>USER SELECT MAP</h3>
  <pre>
{
  srv: 'plantquest',
  part: 'assetmap',
  show: 'map'
  map: &lt;INTEGER&gt;,
  level: &lt;STRING&gt;,
}</pre>
  <p>Where:<br>
    <i>&lt;INTEGER&gt;</i>: Number of the map user just selected <br>
    <i>&lt;STRING&gt;</i>: Name of the level of that map <br>
  </p>

## Licenses

[MIT](LICENSE) © [Plantquest Ltd](https://plantquest.com)
[BSD 2-Clause](LEAFLET-LICENSE) © [Vladimir Agafonkin, Cloudmade](https://leafletjs.com/)
[MIT](LICENSE) © [Justin Manley](https://github.com/Leaflet/Leaflet.toolbar)
