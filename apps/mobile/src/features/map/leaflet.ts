// Stable document: React sends all changing data through the bridge after "ready".
export const LEAFLET_HTML = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>html,body,#map{height:100%;width:100%;margin:0;background:#FFF8F0} .pin{border-radius:50%;border:3px solid white;box-shadow:0 2px 8px #0004;display:flex;align-items:center;justify-content:center;color:white;font:20px sans-serif;box-sizing:border-box}.logo-pin{position:relative;filter:drop-shadow(0 2px 4px #0004)}.logo-circle{position:absolute;top:4px;left:6px;border:3px solid;box-sizing:border-box;border-radius:50%;background:white;overflow:hidden}.logo-circle img{width:100%;height:100%;object-fit:cover;display:block}.logo-tip{position:absolute;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:9px solid}.logo-star{position:absolute;right:0;top:0;width:22px;height:22px;box-sizing:border-box;border-radius:50%;border:2px solid white;background:#FFC857;color:#1E1B18;display:flex;align-items:center;justify-content:center;font:14px sans-serif}.user{border:3px solid white;background:#2B7FFF;border-radius:50%;box-shadow:0 0 0 5px #2B7FFF30}.leaflet-control-attribution{font-size:9px}#error{display:none;position:absolute;z-index:1000;inset:auto 12px 12px;background:white;padding:12px;border-radius:12px;font:14px sans-serif}</style></head>
<body><div id="map" role="application" aria-label="Mapa de lojas EasyPet"></div><div id="error">Mapa indisponível. Confira sua conexão e tente novamente.</div>
<script>
(function(){
  var map, layers, picker, user, previousView, currentMode, lastRegion, pickerDragging=false;
  function send(message){if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(JSON.stringify(message));}
  function fail(){document.getElementById('error').style.display='block';send({type:'error'});}
  function icon(color, featured){var size=featured?46:34;var node=document.createElement('div');node.className='pin';node.style.backgroundColor=/^#[0-9a-f]{6}$/i.test(color)?color:'#FF6B35';node.style.width=size+'px';node.style.height=size+'px';node.textContent=featured?'★':'🐾';return L.divIcon({className:'',html:node,iconSize:[size,size],iconAnchor:[size/2,size/2]});}
  function storeIcon(marker){
    if(!marker.logo_url)return icon(marker.cor,marker.destaque);
    var size=marker.destaque?52:44;var color=/^#[0-9a-f]{6}$/i.test(marker.cor)?marker.cor:'#FF6B35';
    var node=document.createElement('div');node.className='logo-pin';node.style.width=(size+12)+'px';node.style.height=(size+14)+'px';
    var tip=document.createElement('div');tip.className='logo-tip';tip.style.borderTopColor=color;tip.style.top=(size+3)+'px';tip.style.left=(size/2)+'px';node.appendChild(tip);
    var circle=document.createElement('div');circle.className='logo-circle';circle.style.width=size+'px';circle.style.height=size+'px';circle.style.borderColor=color;node.appendChild(circle);
    var image=document.createElement('img');image.alt='Logo da loja';image.src=marker.logo_url;image.draggable=false;circle.appendChild(image);
    if(marker.destaque){var star=document.createElement('div');star.className='logo-star';star.textContent='★';node.appendChild(star);}
    var result=L.divIcon({className:'',html:node,iconSize:[size+12,size+14],iconAnchor:[(size+12)/2,size+14]});
    return result;
  }
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
    (data.markers||[]).forEach(function(m){var markerIcon=storeIcon(m);var pin=L.marker([m.lat,m.lng],{icon:markerIcon,bubblingMouseEvents:false,keyboard:true}).on('click',function(){send({type:'marker',id:m.id});}).addTo(layers);var image=pin.getElement().querySelector('img');if(image)image.onerror=function(){pin.setIcon(icon(m.cor,m.destaque));};});
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
