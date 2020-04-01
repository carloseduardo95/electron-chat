const { BrowserWindow } = require('electron').remote

// Minimize window
document.getElementById("min-btn").addEventListener("click", (e) => {
    var window = BrowserWindow.getFocusedWindow()
    window.minimize()
});

// Maximize window
document.getElementById("max-btn").addEventListener("click", (e) => {
    var window = BrowserWindow.getFocusedWindow();
    if (window.isMaximized()) {
        window.unmaximize()
    } else {
        window.maximize()
    }
});

function salvaPosicaoJanela() {
    localStorage.setItem('eixoHorizontal', window.screenLeft)
    localStorage.setItem('eixoVertical', window.screenTop)
}

// Close window
document.getElementById("close-btn").addEventListener("click", (e) => {
    e.preventDefault()
    salvaPosicaoJanela()
    var window = BrowserWindow.getFocusedWindow()
    window.close()
});

// Set Window Always on Top
var checkBox = document.getElementById("alwaysontop")

checkBox.addEventListener("click", (e) => {
    var window = BrowserWindow.getFocusedWindow()
    if (checkBox.checked == true) {
        window.setAlwaysOnTop(true)
        localStorage.setItem('checked', true)
    } else {
        window.setAlwaysOnTop(false)
        localStorage.setItem('checked', false)
    }
});