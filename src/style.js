
// TODO: maybe vite does this for us?

function injectStyle($) {
  const head = $('head')
  const style = document.createElement('style')
  style.setAttribute('data-plantquest-style','injected')
  style.innerHTML = `

/* 
 * Leaflet 1.8.0, a JS library for interactive maps. https://leafletjs.com
 * (c) 2010-2022 Vladimir Agafonkin, (c) 2010-2011 CloudMade
 * BSD 2-Clause License, See https://leafletjs.com/
 */

.leaflet-tile,.leaflet-zoom-anim .leaflet-zoom-hide{visibility:hidden}.leaflet-image-layer,.leaflet-layer,.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-pane,.leaflet-pane>canvas,.leaflet-pane>svg,.leaflet-tile,.leaflet-tile-container,.leaflet-zoom-box{position:absolute;left:0;top:0}.leaflet-container{overflow:hidden;-webkit-tap-highlight-color:transparent;background:#ddd;outline:0;font:12px/1.5 "Helvetica Neue",Arial,Helvetica,sans-serif}.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-tile{-webkit-user-select:none;-moz-user-select:none;user-select:none;-webkit-user-drag:none}.leaflet-overlay-pane svg,.leaflet-tooltip{-moz-user-select:none}.leaflet-tile::selection{background:0 0}.leaflet-safari .leaflet-tile{image-rendering:-webkit-optimize-contrast}.leaflet-safari .leaflet-tile-container{width:1600px;height:1600px;-webkit-transform-origin:0 0}.leaflet-control-layers label,.leaflet-marker-icon,.leaflet-marker-shadow{display:block}.leaflet-container .leaflet-marker-pane img,.leaflet-container .leaflet-overlay-pane svg,.leaflet-container .leaflet-shadow-pane img,.leaflet-container .leaflet-tile,.leaflet-container .leaflet-tile-pane img,.leaflet-container img.leaflet-image-layer{max-width:none!important;max-height:none!important}.leaflet-container.leaflet-touch-zoom{-ms-touch-action:pan-x pan-y;touch-action:pan-x pan-y}.leaflet-container.leaflet-touch-drag{-ms-touch-action:pinch-zoom;touch-action:none;touch-action:pinch-zoom}.leaflet-container.leaflet-touch-drag.leaflet-touch-zoom{-ms-touch-action:none;touch-action:none}.leaflet-container a{-webkit-tap-highlight-color:rgba(51,181,229,0.4);color:#0078a8}.leaflet-tile{filter:inherit}.leaflet-tile-loaded{visibility:inherit}.leaflet-zoom-box{width:0;height:0;-moz-box-sizing:border-box;box-sizing:border-box;z-index:800}.leaflet-overlay-pane,.leaflet-pane{z-index:400}.leaflet-map-pane svg,.leaflet-tile-pane{z-index:200}.leaflet-shadow-pane{z-index:500}.leaflet-marker-pane{z-index:600}.leaflet-tooltip-pane{z-index:650}.leaflet-popup-pane{z-index:700}.leaflet-map-pane canvas{z-index:100}.leaflet-vml-shape{width:1px;height:1px}.lvml{behavior:url(#default#VML);display:inline-block;position:absolute}.leaflet-control{position:relative;z-index:800;pointer-events:visiblePainted;pointer-events:auto;float:left;clear:both}.leaflet-bottom,.leaflet-top{position:absolute;z-index:1000;pointer-events:none}.leaflet-top{top:0}.leaflet-right{right:0}.leaflet-bottom{bottom:0}.leaflet-left{left:0}.leaflet-right .leaflet-control{float:right;margin-right:10px}.leaflet-top .leaflet-control{margin-top:10px}.leaflet-bottom .leaflet-control{margin-bottom:10px}.leaflet-left .leaflet-control{margin-left:10px}.leaflet-fade-anim .leaflet-tile{will-change:opacity}.leaflet-fade-anim .leaflet-popup{opacity:0;-webkit-transition:opacity .2s linear;-moz-transition:opacity .2s linear;transition:opacity .2s linear}.leaflet-fade-anim .leaflet-map-pane .leaflet-popup{opacity:1}.leaflet-zoom-animated{-webkit-transform-origin:0 0;-ms-transform-origin:0 0;transform-origin:0 0}.leaflet-zoom-anim .leaflet-zoom-animated{will-change:transform;-webkit-transition:-webkit-transform .25s cubic-bezier(0,0,.25,1);-moz-transition:-moz-transform .25s cubic-bezier(0,0,.25,1);transition:transform .25s cubic-bezier(0,0,.25,1)}.leaflet-pan-anim .leaflet-tile,.leaflet-zoom-anim .leaflet-tile{-webkit-transition:none;-moz-transition:none;transition:none}.leaflet-interactive{cursor:pointer}.leaflet-grab{cursor:-webkit-grab;cursor:-moz-grab;cursor:grab}.leaflet-crosshair,.leaflet-crosshair .leaflet-interactive{cursor:crosshair}.leaflet-control,.leaflet-popup-pane{cursor:auto}.leaflet-dragging .leaflet-grab,.leaflet-dragging .leaflet-grab .leaflet-interactive,.leaflet-dragging .leaflet-marker-draggable{cursor:move;cursor:-webkit-grabbing;cursor:-moz-grabbing;cursor:grabbing}.leaflet-image-layer,.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-pane>svg path,.leaflet-tile-container{pointer-events:none}.leaflet-image-layer.leaflet-interactive,.leaflet-marker-icon.leaflet-interactive,.leaflet-pane>svg path.leaflet-interactive,svg.leaflet-image-layer.leaflet-interactive path{pointer-events:visiblePainted;pointer-events:auto}.leaflet-container a.leaflet-active{outline:orange solid 2px}.leaflet-zoom-box{border:2px dotted #38f;background:rgba(255,255,255,.5)}.leaflet-bar{box-shadow:0 1px 5px rgba(0,0,0,.65);border-radius:4px}.leaflet-bar a,.leaflet-bar a:hover{background-color:#fff;border-bottom:1px solid #ccc;width:26px;height:26px;line-height:26px;display:block;text-align:center;text-decoration:none;color:#000}.leaflet-bar a,.leaflet-control-layers-toggle{background-position:50% 50%;background-repeat:no-repeat;display:block}.leaflet-bar a:hover{background-color:#f4f4f4}.leaflet-bar a:first-child{border-top-left-radius:4px;border-top-right-radius:4px}.leaflet-bar a:last-child{border-bottom-left-radius:4px;border-bottom-right-radius:4px;border-bottom:none}.leaflet-bar a.leaflet-disabled{cursor:default;background-color:#f4f4f4;color:#bbb}.leaflet-touch .leaflet-bar a{width:30px;height:30px;line-height:30px}.leaflet-touch .leaflet-bar a:first-child{border-top-left-radius:2px;border-top-right-radius:2px}.leaflet-touch .leaflet-bar a:last-child{border-bottom-left-radius:2px;border-bottom-right-radius:2px}.leaflet-control-zoom-in,.leaflet-control-zoom-out{font:bold 18px 'Lucida Console',Monaco,monospace;text-indent:1px}.leaflet-touch .leaflet-control-zoom-in,.leaflet-touch .leaflet-control-zoom-out{font-size:22px}.leaflet-control-layers{box-shadow:0 1px 5px rgba(0,0,0,.4);background:#fff;border-radius:5px}.leaflet-control-layers-toggle{background-image:url(images/layers.png);width:36px;height:36px}.leaflet-retina .leaflet-control-layers-toggle{background-image:url(images/layers-2x.png);background-size:26px 26px}.leaflet-touch .leaflet-control-layers-toggle{width:44px;height:44px}.leaflet-control-layers .leaflet-control-layers-list,.leaflet-control-layers-expanded .leaflet-control-layers-toggle{display:none}.leaflet-control-layers-expanded .leaflet-control-layers-list{display:block;position:relative}.leaflet-control-layers-expanded{padding:6px 10px 6px 6px;color:#333;background:#fff}.leaflet-control-layers-scrollbar{overflow-y:scroll;overflow-x:hidden;padding-right:5px}.leaflet-control-layers-selector{margin-top:2px;position:relative;top:1px}.leaflet-control-layers-separator{height:0;border-top:1px solid #ddd;margin:5px -10px 5px -6px}.leaflet-default-icon-path{background-image:url(images/marker-icon.png)}.leaflet-container .leaflet-control-attribution{background:rgba(255,255,255,.7);margin:0}.leaflet-control-attribution,.leaflet-control-scale-line{padding:0 5px;color:#333}.leaflet-control-attribution a{text-decoration:none}.leaflet-control-attribution a:hover{text-decoration:underline}.leaflet-container .leaflet-control-attribution,.leaflet-container .leaflet-control-scale{font-size:11px}.leaflet-left .leaflet-control-scale{margin-left:5px}.leaflet-bottom .leaflet-control-scale{margin-bottom:5px}.leaflet-control-scale-line{border:2px solid #777;border-top:none;line-height:1.1;padding:2px 5px 1px;font-size:11px;white-space:nowrap;overflow:hidden;-moz-box-sizing:border-box;box-sizing:border-box;background:rgba(255,255,255,.5)}.leaflet-control-scale-line:not(:first-child){border-top:2px solid #777;border-bottom:none;margin-top:-2px}.leaflet-control-scale-line:not(:first-child):not(:last-child){border-bottom:2px solid #777}.leaflet-touch .leaflet-bar,.leaflet-touch .leaflet-control-attribution,.leaflet-touch .leaflet-control-layers{box-shadow:none}.leaflet-touch .leaflet-bar,.leaflet-touch .leaflet-control-layers{border:2px solid rgba(0,0,0,.2);background-clip:padding-box}.leaflet-popup{position:absolute;text-align:center;margin-bottom:20px}.leaflet-popup-content-wrapper{padding:1px;text-align:left;border-radius:12px}.leaflet-popup-content{margin:13px 19px;line-height:1.4}.leaflet-popup-content p{margin:18px 0}.leaflet-popup-tip-container{width:40px;height:20px;position:absolute;left:50%;margin-left:-20px;overflow:hidden;pointer-events:none}.leaflet-popup-tip{width:17px;height:17px;padding:1px;margin:-10px auto 0;-webkit-transform:rotate(45deg);-moz-transform:rotate(45deg);-ms-transform:rotate(45deg);transform:rotate(45deg)}.leaflet-popup-content-wrapper,.leaflet-popup-tip{background:#fff;color:#333;box-shadow:0 3px 14px rgba(0,0,0,.4)}.leaflet-container a.leaflet-popup-close-button{position:absolute;top:0;right:0;padding:4px 4px 0 0;border:none;text-align:center;width:18px;height:14px;font:700 16px/14px Tahoma,Verdana,sans-serif;color:#c3c3c3;text-decoration:none;background:0 0}.leaflet-container a.leaflet-popup-close-button:hover{color:#999}.leaflet-popup-scrolled{overflow:auto;border-bottom:1px solid #ddd;border-top:1px solid #ddd}.leaflet-oldie .leaflet-popup-content-wrapper{-ms-zoom:1}.leaflet-oldie .leaflet-popup-tip{width:24px;margin:0 auto}.leaflet-oldie .leaflet-popup-tip-container{margin-top:-1px}.leaflet-oldie .leaflet-control-layers,.leaflet-oldie .leaflet-control-zoom,.leaflet-oldie .leaflet-popup-content-wrapper,.leaflet-oldie .leaflet-popup-tip{border:1px solid #999}.leaflet-div-icon{background:#fff;border:1px solid #666}.leaflet-tooltip{position:absolute;padding:6px;background-color:#fff;border:1px solid #fff;border-radius:3px;color:#222;white-space:nowrap;-webkit-user-select:none;-ms-user-select:none;user-select:none;pointer-events:none;box-shadow:0 1px 3px rgba(0,0,0,.4)}.leaflet-tooltip.leaflet-clickable{cursor:pointer;pointer-events:auto}.leaflet-tooltip-bottom:before,.leaflet-tooltip-left:before,.leaflet-tooltip-right:before,.leaflet-tooltip-top:before{position:absolute;pointer-events:none;border:6px solid transparent;background:0 0;content:""}.leaflet-tooltip-bottom{margin-top:6px}.leaflet-tooltip-top{margin-top:-6px}.leaflet-tooltip-bottom:before,.leaflet-tooltip-top:before{left:50%;margin-left:-6px}.leaflet-tooltip-top:before{bottom:0;margin-bottom:-12px;border-top-color:#fff}.leaflet-tooltip-bottom:before{top:0;margin-top:-12px;margin-left:-6px;border-bottom-color:#fff}.leaflet-tooltip-left{margin-left:-6px}.leaflet-tooltip-right{margin-left:6px}.leaflet-tooltip-left:before,.leaflet-tooltip-right:before{top:50%;margin-top:-6px}.leaflet-tooltip-left:before{right:0;margin-right:-12px;border-left-color:#fff}.leaflet-tooltip-right:before{left:0;margin-left:-12px;border-right-color:#fff}

/* MIT LICENSE, Copyright (c) 2014-2015, Justin Manley */
.leaflet-toolbar-0{list-style:none;padding-left:0;border:2px solid rgba(0,0,0,.2);border-radius:4px}.leaflet-toolbar-0>li{position:relative}.leaflet-toolbar-0>li>.leaflet-toolbar-icon{display:block;width:30px;height:30px;line-height:30px;margin-right:0;padding-right:0;border-right:0;text-align:center;text-decoration:none;background-color:#fff}.leaflet-toolbar-0>li>.leaflet-toolbar-icon:hover{background-color:#f4f4f4}.leaflet-toolbar-0 .leaflet-toolbar-1{display:none;list-style:none}.leaflet-toolbar-tip-container{margin:-16px auto 0;height:16px;position:relative;overflow:hidden}.leaflet-toolbar-tip{width:16px;height:16px;margin:-8px auto 0;background-color:#fff;border:2px solid rgba(0,0,0,.2);background-clip:content-box;-webkit-transform:rotate(45deg);-ms-transform:rotate(45deg);transform:rotate(45deg);border-radius:4px}.leaflet-control-toolbar .leaflet-toolbar-1>li:last-child>.leaflet-toolbar-icon,.leaflet-popup-toolbar>li:last-child>.leaflet-toolbar-icon{border-top-right-radius:4px;border-bottom-right-radius:4px}.leaflet-control-toolbar>li>.leaflet-toolbar-icon{border-bottom:1px solid #ccc}.leaflet-control-toolbar>li:first-child>.leaflet-toolbar-icon{border-top-left-radius:4px;border-top-right-radius:4px}.leaflet-control-toolbar>li:last-child>.leaflet-toolbar-icon{border-bottom-left-radius:4px;border-bottom-right-radius:4px;border-bottom-width:0}.leaflet-control-toolbar .leaflet-toolbar-1{margin:0;padding:0;position:absolute;left:30px;top:0;white-space:nowrap;height:30px}.leaflet-control-toolbar .leaflet-toolbar-1>li{display:inline-block}.leaflet-control-toolbar .leaflet-toolbar-1>li>.leaflet-toolbar-icon{display:block;background-color:#919187;border-left:1px solid #aaa;color:#fff;font:11px/19px "Helvetica Neue",Arial,Helvetica,sans-serif;line-height:30px;text-decoration:none;padding-left:10px;padding-right:10px;height:30px}.leaflet-control-toolbar .leaflet-toolbar-1>li>.leaflet-toolbar-icon:hover{background-color:#a0a098}.leaflet-popup-toolbar{position:relative;box-sizing:content-box}.leaflet-popup-toolbar>li{float:left}.leaflet-popup-toolbar>li>.leaflet-toolbar-icon{border-right:1px solid #ccc}.leaflet-popup-toolbar>li:first-child>.leaflet-toolbar-icon{border-top-left-radius:4px;border-bottom-left-radius:4px}.leaflet-popup-toolbar>li:last-child>.leaflet-toolbar-icon{border-bottom-width:0;border-right:none}.leaflet-popup-toolbar .leaflet-toolbar-1{position:absolute;top:30px;left:0;padding-left:0}.leaflet-popup-toolbar .leaflet-toolbar-1>li>.leaflet-toolbar-icon{position:relative;float:left;width:30px;height:30px}
.marker-cluster-small {
	background-color: rgba(181, 226, 140, 0.6);
	}
.marker-cluster-small div {
	background-color: rgba(110, 204, 57, 0.6);
	}

.marker-cluster-medium {
	background-color: rgba(241, 211, 87, 0.6);
	}
.marker-cluster-medium div {
	background-color: rgba(240, 194, 12, 0.6);
	}

.marker-cluster-large {
	background-color: rgba(253, 156, 115, 0.6);
	}
.marker-cluster-large div {
	background-color: rgba(241, 128, 23, 0.6);
	}

	/* IE 6-8 fallback colors */
.leaflet-oldie .marker-cluster-small {
	background-color: rgb(181, 226, 140);
	}
.leaflet-oldie .marker-cluster-small div {
	background-color: rgb(110, 204, 57);
	}

.leaflet-oldie .marker-cluster-medium {
	background-color: rgb(241, 211, 87);
	}
.leaflet-oldie .marker-cluster-medium div {
	background-color: rgb(240, 194, 12);
	}

.leaflet-oldie .marker-cluster-large {
	background-color: rgb(253, 156, 115);
	}
.leaflet-oldie .marker-cluster-large div {
	background-color: rgb(241, 128, 23);
}

.marker-cluster {
	background-clip: padding-box;
	border-radius: 20px;
	}
.marker-cluster div {
	width: 30px;
	height: 30px;
	margin-left: 5px;
	margin-top: 5px;

	text-align: center;
	border-radius: 15px;
	font: 12px "Helvetica Neue", Arial, Helvetica, sans-serif;
	}
.marker-cluster span {
	line-height: 30px;
	}
.leaflet-cluster-anim .leaflet-marker-icon, .leaflet-cluster-anim .leaflet-marker-shadow {
	-webkit-transition: -webkit-transform 0.3s ease-out, opacity 0.3s ease-in;
	-moz-transition: -moz-transform 0.3s ease-out, opacity 0.3s ease-in;
	-o-transition: -o-transform 0.3s ease-out, opacity 0.3s ease-in;
	transition: transform 0.3s ease-out, opacity 0.3s ease-in;
}

.leaflet-cluster-spider-leg {
	/* stroke-dashoffset (duration and function) should match with leaflet-marker-icon transform in order to track it exactly */
	-webkit-transition: -webkit-stroke-dashoffset 0.3s ease-out, -webkit-stroke-opacity 0.3s ease-in;
	-moz-transition: -moz-stroke-dashoffset 0.3s ease-out, -moz-stroke-opacity 0.3s ease-in;
	-o-transition: -o-stroke-dashoffset 0.3s ease-out, -o-stroke-opacity 0.3s ease-in;
	transition: stroke-dashoffset 0.3s ease-out, stroke-opacity 0.3s ease-in;
}


.leaflet-toolbar-0>li>.leaflet-toolbar-icon {
  width: 80px;
}

ul.leaflet-control-toolbar > li {
  margin: 0px;
}


.control-panel {
  position: absolute;
  top: 0em;
  left: 5em;
  background-color: white;
  border: 1px solid black;
  width: 10em;
  height: 6em;
  padding: 10px;
  font-size: 14px;
  font-family: Arial, sans-serif;
  word-wrap: break-word;
  height: fit-content;
  width: fit-content;
  opacity: 0.5;
  /*block-size: fit-content;*/
}


.class1 {
    background-color: transparent;
    border: 0;
    box-shadow: none;
} 

.polygon-labels {
  background-color: transparent;
  font-weight: bold;
  color: #000000;
  border: 0;
  box-shadow: none;
  font-size: 1em;
}


#plantquest-assetmap {
    background-color: rgb(203,211,144);
}

#plantquest-assetmap-map {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    background-color: rgb(203,211,144);
}


div.plantquest-assetmap-vis {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1000;
}


img.plantquest-assetmap-logo {
    cursor: pointer;
}



div.plantquest-assetmap-asset-cluster {
    xwidth: 96px;
    xheight: 48px;
    font-size: 16px;
    xoverflow: hidden;
    z-index: 1000;
}



.plantquest-asset-history-label {
  color: #CCC;
  font-size: 4pt;
  width: min-content;
  overflow: visible;
}

div.plantquest-assetmap-asset-marker {
   width: min-content;
   overflow: visible;
}


div.plantquest-assetmap-asset-state-up {
    color: white;
    border: 2px solid #696;
    border-radius: 4px;
    background-color: #696;
    opacity: 0;
}

div.plantquest-assetmap-asset-state-down {
    color: white;
    border: 2px solid #666;
    border-radius: 4px;
    background-color: #666;
    opacity: 0.9;
}

div.plantquest-assetmap-asset-state-missing {
    color: white;
    border: 2px solid #f3f;
    border-radius: 4px;
    background-color: #f3f;
    opacity: 0.9;
}

div.plantquest-assetmap-asset-state-alarm {
    color: white;
    border: 2px solid #f33;
    border-radius: 4px;
    background-color: #f33;
    opacity: 0.9;
}

.leaflet-pane svg {
    width: unset !important;
    height: unset !important;
    min-width: unset !important;
    min-height: unset !important;
    max-width: unset !important;
    max-height: unset !important;
}

.plantquest-room-over-label {}

.plantquest-room-popup {
}


.plantquest-font-normal {
  font-weight: normal;
  font-size: 12pt;
  color: black;
}

.plantquest-font-asset-label {
  font-weight: normal;
  font-size: 8pt;
  color: #666;
}

.plantquest-room-label {
  font-weight: normal;
  font-size: 12pt;
  color: #333;
}

.plantquest-geofence-label {
  font-weight: normal;
  font-size: 12pt;
  font-style: italic;
  color: #333;
}


.plantquest-tool-level {
  box-sizing: border-box;
  width: 100px;
}

.plantquest-tool-level .leaflet-toolbar-icon {
  width: 100% !important;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  padding: 0px 4px;
  box-sizing: border-box;
}


.plantquest-tool-building {
  box-sizing: border-box;
  width: 100px;
}

.plantquest-tool-building .leaflet-toolbar-icon {
  width: 100% !important;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  padding: 0px 4px;
  box-sizing: border-box;
}

.plantquest-tool-select-building {
}
.plantquest-tool-select-building-active a {
  background-color:#CCC !important;
}

.plantquest-tool-select-level-active a {
  background-color:#CCC !important;
}


.plantquest-font-s0 {
  font-size: 4pt;
}
.plantquest-font-s1 {
  font-size: 8pt;
}
.plantquest-font-s2 {
  font-size: 12pt;
}
.plantquest-font-s3 {
  font-size: 16pt;
}
.plantquest-font-s4 {
  font-size: 20pt;
}
.plantquest-font-s5 {
  font-size: 24pt;
}

`
    head.appendChild(style)
  }


export {
  injectStyle
}
