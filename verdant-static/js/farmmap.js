const map = L.map("farmMap").setView([40.1,-74.5],15)

L.tileLayer(
"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
).addTo(map)

const zones = [

{
name:"Autonomous Orchard",
coords:[40.101,-74.501]
},

{
name:"Greenhouse Robotics Lab",
coords:[40.102,-74.503]
},

{
name:"Livestock Monitoring Field",
coords:[40.100,-74.498]
},

{
name:"Soil Sensor Network",
coords:[40.104,-74.500]
}

]

zones.forEach(z=>{

L.marker(z.coords)
.addTo(map)
.bindPopup(z.name)

})