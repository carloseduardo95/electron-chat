// Modules to control application life and create native browser window
const { app, BrowserView, BrowserWindow } = require('electron')
const path = require('path')

let mainWindow
let plinxView

// Initialize the storageWindow
function createWindow() {

  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    frame: false,
    show: false, // cria a janela escondida e só exibe depois que terminar de calcular a posição
    webPreferences: {
      nodeIntegration: true,
      // preload: path.join(__dirname, '../preload.js')
    }
  })

  function setJanelaAlwaysOnTop() {
    let status = null
    return new Promise((resolve, reject) => {
      try {
        checked = mainWindow.webContents.executeJavaScript('localStorage.getItem("checked");', true)
        if (checked) {
          resolve(checked)
        } else {
          reject(new Error("Não foi possível pegar o valor 'checked' do LocalStorage"))
        }
      } catch (error) {
        console.log(err.message)
      }
    })
  }

  setJanelaAlwaysOnTop()
    .then((checked) => {
      switch (checked) {
        case "true":
          mainWindow.webContents.executeJavaScript(
            `var checkBox = document.getElementById("alwaysontop");
            checkBox.checked = true;`, true)
          mainWindow.setAlwaysOnTop(true)
          break;
        case "false":
          mainWindow.webContents.executeJavaScript(
            `var checkBox = document.getElementById("alwaysontop");
            checkBox.checked = false;`, true)
          mainWindow.setAlwaysOnTop(false)
          break;
        default:
          console.log("O valor do always on top esta vazio no localStorage")
          break;
      }
    })

  function getPositionX() {
    let x = null
    return new Promise((resolve, reject) => {
      try {
        x = mainWindow.webContents.executeJavaScript('localStorage.getItem("eixoHorizontal");', true)
        if (x) {
          resolve(x);
        } else {
          reject(new Error("Não foi possível pegar o valor X do LocalStorage"))
        }
      } catch (err) {
        console.log(err.message)
      }
    })
  }

  function getPositionY() {
    let y = null
    return new Promise((resolve, reject) => {
      try {
        y = mainWindow.webContents.executeJavaScript('localStorage.getItem("eixoVertical");', true);
        if (y) {
          resolve(y);
        } else {
          reject(new Error("Não foi possível pegar o valor Y do LocalStorage"))
        }
      } catch (err) {
        console.log(err.message)
      }
    })
  }

  let position = [];

  async function calculaPosicaoJanela() {
    position[0] = await getPositionX();
    position[1] = await getPositionY();

    position = position.map((elem) => parseInt(elem))
    return position;
  }

  calculaPosicaoJanela()
    .then(() => {
      mainWindow.setBounds({
        x: position[0],
        y: position[1]
      })
    })

  // and load the index.html of the app.
  mainWindow.loadFile(__dirname + '/index.html')

  // Open the DevTools.window.minimize();
  // mainWindow.webContents.openDevTools()
}

var theWindow = BrowserWindow.getFocusedWindow();
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

app.on('ready', () => {
  /*
  * Cria uma WebView para exibir uma URL externa 
  * dentro da mainWindows, semelhante ao comportamento 
  * de um iframe.
  */
  plinxView = new BrowserView()
  mainWindow.setBrowserView(plinxView)
  plinxView.setBounds({ x: 0, y: 40, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height })
  plinxView.setAutoResize({ width: true, height: true, horizontal: true, vertical: true })
  plinxView.webContents.loadURL('https://app.plinx.com.br/painel/login')

  /* 
  * Só exibe a janela do App depois que terminar as funções assíncronas
  * usadas para calcular a posição da janela que foram armazenadas no 
  * localStorage.
  */
  mainWindow.show()

  // plinxView.webContents.openDevTools()

  plinxView.webContents.executeJavaScript(`
  var email = document.getElementById("email");
  email.setAttribute("value", "leandro@eox.com.br");

  var password = document.getElementById("password");
  password.setAttribute("value", "1234");
  `, true)

  plinxView.webContents.executeJavaScript(`
  var checkbox = document.createElement("input");
  checkbox.setAttribute("type", "checkbox");
  checkbox.setAttribute("id", "manterLogado");
  
  var element = document.getElementsByTagName("section")[1];
  element.appendChild(checkbox);

  var label = document.createElement("label");
  label.setAttribute("id", "logado_label");
  label.setAttribute("for", "manterLogado");
  
  var text = document.createTextNode("Manter Logado");
  label.appendChild(text);
  
  var element = document.getElementsByTagName("section")[1];
  element.appendChild(label);

  var style = document.createElement("style");
  document.head.appendChild(style);
  style.sheet.insertRule("#manterLogado {margin-top: 10px}");
  style.sheet.insertRule("#logado_label {padding-left: 5px; color: #fff}");
  `, true)

  plinxView.webContents.executeJavaScript(`
  var form = document.getElementsByTagName("form").item(0);
  var status = false;
  var checkboxManterLogado = document.getElementById("manterLogado");

  checkboxManterLogado.addEventListener("click", (e) => {
    if (checkboxManterLogado.checked == true) {
      status = true;
      // localStorage.setItem("manterLogado", true);
    } else {
      status = false;
      // localStorage.setItem("manterLogado", false);
    }
  });

  form.addEventListener("submit", function(e){
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    if (email !== "" && password !== ""){
      localStorage.setItem("email", email);
      localStorage.setItem("password", password);
      localStorage.setItem("manterLogado", status);
    } else {
      console.log("os campos estao vazios");
    }
  })
  `, true)
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separadocument.parentWe files and require them here.// Create an empty BrowserWindow to access browser storage