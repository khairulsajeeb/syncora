const menu = document.getElementById('menu')
const closeMenu = document.getElementById('closemenu')
const openMenu = document.getElementById('openmenu')
closeMenu.addEventListener('click', () => {
  menu.style.right = '-300px'
})
openMenu.addEventListener('click', () => {
  menu.style.right = '0'
})


let chosen = document.getElementById('chosen')
let fileInput = document.getElementById('fileInput')

fileInput.addEventListener('change', fileSelected)

function fileSelected() {
  let path = fileInput.value.split('\\')
  let fileName = path[path.length - 1]
  
  chosen.textContent = fileName
}

let inputArea = document.getElementById('inputArea')
inputArea.addEventListener('dragover', (e) => e.preventDefault())
inputArea.addEventListener('drop', (e)=>{
  e.preventDefault()
  fileInput.files = e.dataTransfer.files
  fileSelected()
})