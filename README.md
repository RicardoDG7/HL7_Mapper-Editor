# HL7 Editor & Mapper

Editor e mapeador de mensagens HL7 leve, construído com Electron.

**Resumo**
- **Projeto**: Editor e mapeador de mensagens HL7 para visualização, edição e testes rápidos.
- **Stack**: Electron, JavaScript.

**Recursos**
- **Visualizar mensagens HL7**: carregar e visualizar a estrutura das mensagens.
- **Editar mensagens**: modificar segmentos e campos diretamente na interface.
- **Parsing HL7**: parser central em [src/hl7Parser.js](src/hl7Parser.js).
- **Aplicação de desktop**: empacotado como uma aplicação Electron para uso local.

**Começando**
- **Pré-requisitos**: Node.js (v16+ recomendado) e npm.
- **Instalar dependências**:

```
git clone <repo-url>
cd HL7
npm install
```

- **Executar a aplicação**:

```
npm start
```

**Estrutura do projeto (resumo)**
- **main.js**: processo principal do Electron responsável por criar a janela.
- **preload.js**: ponte segura entre o processo principal e o renderer.
- **src/hl7Parser.js**: responsabilidade pelo parsing e lógica HL7.
- **src/renderer.js**: lógica da interface (renderer process).
- **src/index.html**: interface principal.
- **style.css**: estilos da interface.

**Uso básico**
- Abra a aplicação com `npm start`.
- Cole ou carregue a mensagem HL7 na interface.
- Use as ferramentas de visualização para navegar por segmentos e campos.

**Contribuição**
- Pull requests são bem-vindos. Abra issues para discutir mudanças maiores.
- Mantenha commits pequenos e focados; descreva claramente o propósito das mudanças.

**Licença**
- Este projeto usa a licença MIT. Veja o arquivo `LICENSE` para detalhes.

**Contato**
- Abra uma issue no repositório para perguntas, sugestões ou relatórios de bugs.
