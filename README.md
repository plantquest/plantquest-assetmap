# @plantquest/assetmap

> PlantQuest Asset Map

## Install

```bash
npm install --save @plantquest/assetmap
```

## Usage



## Debug Log

Set `window.PLANTQUEST_ASSETMAP_LOG` to `true` to enable logging.


## Messages

  <h2>SEND MESSAGES</h2>

  <h3>GET RELATION</h3>
  <pre>
    {
      srv: 'plantquest',
      part: 'visnav',
      relate: 'room-asset',
    }
  </pre>
  <p>Listen: <a href="#listen-relation">RELATION</a><br>
  </p>


  <h3>SHOW ROOM</h3>
  <pre>
    {
      srv: 'plantquest',
      part: 'visnav',
      show: 'room',
      room: &lt;ROOM-ID&gt;,     
    }
  </pre>
  <p>Where:<br>
    <i>&lt;ROOM-ID&gt;</i>: Room Identifier String<br>
  </p>


  <h3>SET ALARM ASSET</h3>
  <pre>
    {
      srv: 'plantquest',
      part: 'visnav',
      alarm: &lt;ALARM&gt;,
      asset: &lt;ASSET-ID&gt;,     
    }
  </pre>
  <p>Where:<br>
    <i>&lt;ALARM&gt;</i>: Alarm State String ('red', 'green')<br>
    <i>&lt;ASSET-ID&gt;</i>: Asset Identifier String<br>
  </p>


  <h3>SET ALARM ROOM</h3>
  <pre>
    {
      srv: 'plantquest',
      part: 'visnav',
      room: &lt;ROOM-ID&gt;,
      assets: [
        {
          alarm: &lt;ALARM&gt;,
          asset: &lt;ASSET-ID&gt;,     
        },
        ...
      ]
    }
  </pre>
  <p>Where:<br>
    <i>&lt;ALARM&gt;</i>: Alarm State String ('red', 'green')<br>
    <i>&lt;ROOM-ID&gt;</i>: Room Identifier String<br>
    <i>&lt;ASSET-ID&gt;</i>: Asset Identifier String<br>
  </p>

  
  
  <h2>LISTEN MESSAGES</h2>
   
  <h3>STATE</h3>
  <pre>
    {
      srv: 'plantquest',
      part: 'visnav',
      state: &lt;STATE&gt;,
    }
  </pre>
  <p>Where:<br>
    <i>&lt;STATE&gt;</i>: 'ready'<br>
  </p>


  <a name="listen-relation"></a>
  <h3>RELATION</h3>
  <pre>
    {
      srv: 'plantquest',
      part: 'visnav',
      relate: 'room-asset',
      relation: &lt;RELATION&gt;,
    }
  </pre>
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
      part: 'visnav',
      select: 'room',
      room: &lt;ROOM-ID&gt;,     
    }
  </pre>
  <p>Where:<br>
    <i>&lt;ROOM-ID&gt;</i>: Room Identifier String<br>
  </p>



## Licenses

[MIT](LICENSE) © [Plantquest Ltd](https://plantquest.com)
[BSD 2-Clause](LEAFLET-LICENSE) © [Vladimir Agafonkin, Cloudmade](https://leafletjs.com/)
[MIT](LICENSE) © [Justin Manley](https://github.com/Leaflet/Leaflet.toolbar)
