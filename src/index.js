import React from 'react'
import styles from './styles.module.css'

import './pqam.js'


class PlantQuestAssetMap extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      asset: null
    }
  }

  componentDidMount() {
    console.log('PQ DIDM')
    
    window.PlantQuestAssetMap.start(this.props.options)
  
    window.PlantQuestAssetMap.listen((msg)=>{
      if('asset' === msg.show && msg.before) {
        this.setState({asset:msg.asset})
      }
    })
  }

  render() {
    console.log('PQ RENDER')
    let AIC = this.props.assetinfo
  
    return (
      <div>
        <div id="plantquest-assetmap-assetinfo">
          { this.state.asset ? <AIC asset={this.state.asset}/> : <div></div> }
        </div>
        <div id="plantquest-assetmap"></div>
      </div>
    )
  }
}

export {
  PlantQuestAssetMap
}


