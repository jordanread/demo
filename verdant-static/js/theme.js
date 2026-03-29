const toggle = document.getElementById("themeToggle")

toggle.onclick = () => {

document.body.classList.toggle("dark")

localStorage.setItem(
"theme",
document.body.classList.contains("dark")
)

}

if(localStorage.getItem("theme") === "true"){
document.body.classList.add("dark")
}