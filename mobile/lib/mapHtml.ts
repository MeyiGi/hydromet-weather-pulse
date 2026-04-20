export type MapMarker = {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  overdue: boolean;
};

export function buildMapHtml(
  markers: MapMarker[],
  dark: boolean,
  opts: { interactive?: boolean; zoom?: number; lat?: number; lng?: number } = {},
): string {
  const { interactive = true, zoom = 6, lat = 41.2, lng = 74.7 } = opts;

  const tiles = dark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const bg = dark ? "#030712" : "#f9fafb";
  const popupBg = dark ? "#1f2937" : "#ffffff";
  const popupText = dark ? "#f9fafb" : "#111827";
  const popupSub = dark ? "#9ca3af" : "#6b7280";
  const border = dark ? "#374151" : "#ffffff";

  const data = JSON.stringify(markers);

  return `<!DOCTYPE html><html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
html,body,#map{height:100%;margin:0;padding:0;background:${bg};}
.leaflet-popup-content-wrapper{
  border-radius:12px;
  background:${popupBg};
  color:${popupText};
  box-shadow:0 4px 16px rgba(0,0,0,.3);
  padding:0;
}
.leaflet-popup-content{
  margin:12px 16px;
  cursor:pointer;
  min-width:140px;
}
.leaflet-popup-tip{background:${popupBg};}
.leaflet-control-zoom a{
  background:${popupBg}!important;
  color:${popupText}!important;
  border-color:${dark?"#374151":"#e5e7eb"}!important;
}
.leaflet-bar{border-color:${dark?"#374151":"#e5e7eb"}!important;}
</style>
</head><body><div id="map"></div><script>
var map=L.map('map',{
  zoomControl:${interactive},
  scrollWheelZoom:${interactive},
  dragging:${interactive},
  touchZoom:${interactive},
  doubleClickZoom:${interactive},
  tap:${interactive}
}).setView([${lat},${lng}],${zoom});
L.tileLayer('${tiles}',{maxZoom:18,attribution:''}).addTo(map);
var stations=${data};
stations.forEach(function(s){
  var dot=document.createElement('div');
  dot.style.cssText='width:14px;height:14px;border-radius:50%;background:'+(s.overdue?'#EF4444':'#22C55E')+';border:2px solid ${border};box-shadow:0 1px 4px rgba(0,0,0,.5)';
  var icon=L.divIcon({className:'',html:dot.outerHTML,iconSize:[14,14],iconAnchor:[7,7],popupAnchor:[0,-9]});
  var m=L.marker([s.lat,s.lng],{icon:icon}).addTo(map);
  m._stationId=s.id;
  ${interactive ? `
  m.bindPopup(
    '<div style="font-size:13px;font-weight:600;color:${popupText}">'+s.name+'</div>'+
    '<div style="font-size:11px;color:${popupSub};margin-top:2px">'+s.location+'</div>'+
    '<div style="font-size:11px;color:#3b82f6;margin-top:6px">Открыть →</div>'
  );
  m.on('click',function(){m.openPopup();});` : ''}
});
${interactive ? `
map.on('popupopen',function(e){
  var src=e.popup._source;
  e.popup._contentNode.onclick=function(){
    if(window.ReactNativeWebView){
      window.ReactNativeWebView.postMessage(JSON.stringify({type:'navigate',id:src._stationId}));
    }
  };
});` : ''}
</script></body></html>`;
}
