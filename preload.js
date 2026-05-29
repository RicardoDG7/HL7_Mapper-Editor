const { contextBridge, ipcRenderer } = require('electron');

// Expõe APIs seguras para o processo de renderização (renderer.js)
contextBridge.exposeInMainWorld('electronAPI', {
  // Exemplo de versão da plataforma ou do node se o renderizador precisar
  nodeVersion: () => process.versions.node,
  chromeVersion: () => process.versions.chrome,
  electronVersion: () => process.versions.electron,
  
  // Aqui você pode adicionar canais IPC para salvar e abrir arquivos nativamente no futuro:
  // saveFile: (content) => ipcRenderer.invoke('save-file-dialog', content),
  // openFile: () => ipcRenderer.invoke('open-file-dialog')
});

// Listener padrão de eventos de ciclo de vida
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ['chrome', 'node', 'electron']) {
    console.log(`HL7 Studio rodando com ${type}: v${process.versions[type]}`);
  }
});
