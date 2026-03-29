const soil = new Chart(
document.getElementById("soilChart"),
{
type:"line",
data:{
labels:["Mon","Tue","Wed","Thu","Fri"],
datasets:[{
label:"Soil Moisture %",
data:[45,52,50,60,58]
}]
}
}
)

const yieldChart = new Chart(
document.getElementById("yieldChart"),
{
type:"bar",
data:{
labels:["Tomatoes","Peppers","Beans","Strawberries"],
datasets:[{
label:"Weekly Harvest (kg)",
data:[120,90,70,60]
}]
}
}
)