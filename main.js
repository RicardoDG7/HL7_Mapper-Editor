const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // Cria a janela do navegador
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'HL7 Studio',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    // Define um visual elegante sem a barra de menu padrão (opcional)
    autoHideMenuBar: true
  });

  // Carrega o arquivo HTML principal
  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  // Abre o console de desenvolvedor se estiver em desenvolvimento (opcional)
  // mainWindow.webContents.openDevTools();
}

// Quando o Electron estiver pronto, cria a janela
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Fecha o aplicativo quando todas as janelas forem fechadas (exceto no macOS)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
