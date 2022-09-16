import React from 'react'
import styles from './styles.module.css'

import './pqam.js'

export const PlantQuestAssetMap = ({options}) => {
  window.PlantQuestAssetMap.start(options)
  return (
    <div id="plantquest-assetmap"></div>
  )
}
