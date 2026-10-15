// Stable document: React sends all changing data through the bridge after "ready".
export const LEAFLET_HTML = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>html,body,#map{height:100%;width:100%;margin:0;background:#FFF8F0} .pin{border-radius:50%;border:3px solid white;box-shadow:0 2px 8px #0004;display:flex;align-items:center;justify-content:center;color:white;font:20px sans-serif;box-sizing:border-box}.user{border:3px solid white;background:#2B7FFF;border-radius:50%;box-shadow:0 0 0 5px #2B7FFF30}.leaflet-control-attribution{font-size:9px}#error{display:none;position:absolute;z-index:1000;inset:auto 12px 12px;background:white;padding:12px;border-radius:12px;font:14px sans-serif}</style></head>
<body><div id="map" role="application" aria-label="Mapa de lojas EasyPet"></div><div id="error">Mapa indisponível. Confira sua conexão e tente novamente.</div>
<script>
(function(){
  var map, layers, picker, user, previousView, currentMode, lastRegion, pickerDragging=false;
  function send(message){if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(JSON.stringify(message));}
  function fail(){document.getElementById('error').style.display='block';send({type:'error'});}
  function icon(color, featured){var size=featured?46:34;var node=document.createElement('div');node.className='pin';node.style.backgroundColor=/^#[0-9a-f]{6}$/i.test(color)?color:'#FF6B35';node.style.width=size+'px';node.style.height=size+'px';node.textContent=featured?'★':'🐾';return L.divIcon({className:'',html:node,iconSize:[size,size],iconAnchor:[size/2,size/2]});}
  function viewKey(region){return [region.latitude,region.longitude,region.latitudeDelta,region.longitudeDelta].join(',');}
  window.easyMapUpdate=function(data){
    if(!map)return;
    var region=data.region;lastRegion=region;
    if(previousView!==viewKey(region)){
      var bounds=L.latLngBounds([region.latitude-region.latitudeDelta/2,region.longitude-region.longitudeDelta/2],[region.latitude+region.latitudeDelta/2,region.longitude+region.longitudeDelta/2]);
      map.fitBounds(bounds,{animate:previousView!==undefined,duration:0.35,padding:[8,8]});
      previousView=viewKey(region);
    }
    ['dragging','touchZoom','doubleClickZoom','scrollWheelZoom','boxZoom','keyboard'].forEach(function(name){if(map[name])map[name][data.interactive?'enable':'disable']();});
    if(map.zoomControl){if(data.interactive)map.zoomControl.addTo(map);else map.zoomControl.remove();}
    layers.clearLayers();
    (data.markers||[]).forEach(function(m){L.marker([m.lat,m.lng],{icon:icon(m.cor,m.destaque),bubblingMouseEvents:false,keyboard:true}).on('click',function(){send({type:'marker',id:m.id});}).addTo(layers);});
    if(data.userLocation){var point=[data.userLocation.lat,data.userLocation.lng];if(user)user.setLatLng(point);else user=L.marker(point,{icon:L.divIcon({className:'user',iconSize:[18,18]}),interactive:false}).addTo(map);}else if(user){map.removeLayer(user);user=null;}
    if(data.mode==='picker'){
      if(!picker){picker=L.marker([region.latitude,region.longitude],{draggable:true,icon:icon('#FF6B35',false),bubblingMouseEvents:false}).addTo(map);picker.on('dragstart',function(){pickerDragging=true;});picker.on('dragend',function(){pickerDragging=false;var point=picker.getLatLng();previousView=viewKey({latitude:point.lat,longitude:point.lng,latitudeDelta:lastRegion.latitudeDelta,longitudeDelta:lastRegion.longitudeDelta});send({type:'picker',lat:point.lat,lng:point.lng});});}
      else if(!pickerDragging)picker.setLatLng([region.latitude,region.longitude]);
    }else if(picker){map.removeLayer(picker);picker=null;}
    currentMode=data.mode;
  };
  function boot(){
    if(!window.L){fail();return;}
    map=L.map('map',{zoomControl:true,attributionControl:true});
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
    layers=L.layerGroup().addTo(map);
    map.on('click',function(){if(currentMode!=='picker')send({type:'map'});});
    new ResizeObserver(function(){map.invalidateSize({pan:false});}).observe(document.getElementById('map'));
    send({type:'ready'});
  }
  var script=document.createElement('script');script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';script.onload=boot;script.onerror=fail;document.head.appendChild(script);
})();
</script></body></html>`;
