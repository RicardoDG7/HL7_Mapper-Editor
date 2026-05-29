// Estado global da aplicação
let parsedData = [];
let expandedSegments = new Set(); // Guarda os índices dos segmentos que estão expandidos
let selectedFieldKey = null;

// Elementos do DOM
const rawInput = document.getElementById('hl7-raw-input');
const rawHighlightOverlay = document.getElementById('raw-highlight-overlay');
const emptyState = document.getElementById('empty-state');
const segmentsContainer = document.getElementById('segments-container');
const statSegments = document.getElementById('stat-segments');
const statVersion = document.getElementById('stat-version');
const statusText = document.getElementById('status-text');
const statusDot = document.getElementById('status-dot');
const btnExpandAll = document.getElementById('btn-expand-all');

// Botões de Ação
document.getElementById('btn-example-adt').addEventListener('click', loadExampleADT);
document.getElementById('btn-example-oru').addEventListener('click', loadExampleORU);
document.getElementById('btn-example-orm').addEventListener('click', loadExampleORM);
document.getElementById('btn-clear').addEventListener('click', clearAll);
document.getElementById('btn-download').addEventListener('click', downloadHL7);
btnExpandAll.addEventListener('click', toggleExpandAll);

// Escuta mudanças no textarea do editor bruto
rawInput.addEventListener('input', () => {
  handleRawInputUpdate(rawInput.value);
  updateRawHighlightOverlay();
});

// Sincroniza o overlay de destaque com o scroll do textarea
rawInput.addEventListener('scroll', () => {
  if (rawHighlightOverlay) {
    rawHighlightOverlay.scrollTop = rawInput.scrollTop;
    rawHighlightOverlay.scrollLeft = rawInput.scrollLeft;
  }
});

// Detecta clique no textarea para realçar o campo correspondente no painel direito
rawInput.addEventListener('click', () => {
  if (parsedData.length === 0) return;
  const cursorPos = rawInput.selectionStart;
  const rawText = rawInput.value.replace(/\r/g, '\n');

  let searchFrom = 0;
  for (let segIdx = 0; segIdx < parsedData.length; segIdx++) {
    const segment = parsedData[segIdx];
    const segStart = rawText.indexOf(segment.raw, searchFrom);
    if (segStart === -1) continue;
    const segEnd = segStart + segment.raw.length;
    searchFrom = segEnd + 1;

    if (cursorPos < segStart || cursorPos > segEnd) continue;

    const relPos = cursorPos - segStart;
    for (let fieldIdx = 0; fieldIdx < segment.fields.length; fieldIdx++) {
      const range = getFieldRange(segment, fieldIdx);
      if (range && relPos >= range.start && relPos <= range.end) {
        setSelectedField(segIdx, fieldIdx);
        return;
      }
    }
    break;
  }
});

// Escuta especificamente o evento de colar para forçar renderização imediata
rawInput.addEventListener('paste', () => {
  // Usa setTimeout(0) para que o valor do textarea já tenha sido atualizado com o texto colado
  setTimeout(() => {
    handleRawInputUpdate(rawInput.value, true);
    updateRawHighlightOverlay();
  }, 0);
});

// Mensagens de Exemplo HL7 v2
const EXAMPLE_ADT = 
`MSH|^~\\&|EMR_SYSTEM|HOSPITAL_A|LIS_SYSTEM|LAB_B|20260522132500||ADT^A08|MSG987654|P|2.5
EVN|A08|20260522132500|||OPERATOR_42
PID|1||1002345^^^MRN||SILVA^MARIA^SANTOS||19780815|F|||RUA DAS FLORES, 123^^SAO PAULO^SP^01000-000||(11) 98888-7777||P|||12345678900
PV1|1|I|MED-WARD^QUARTO 202^LEITO A||||23456^MENDES^FABIO^Dr|||||||||||V|||951234`;

const EXAMPLE_ORU = 
`MSH|^~\\&|LIS_SYSTEM|LAB_B|EMR_SYSTEM|HOSPITAL_A|20260522132600||ORU^R01|MSG123456|P|2.5
PID|1||1002345^^^MRN||SILVA^MARIA^SANTOS||19780815|F
PV1|1|I|MED-WARD^QUARTO 202^LEITO A
ORC|RE|882233^LIS|995566^EMR||CM||||20260522132000|||12345^SOUZA^CARLOS
OBR|1|882233^LIS|995566^EMR|883-9^HEMOGRAMA COMPLETO|||20260522132200|||||||||12345^SOUZA^CARLOS
OBX|1|NM|718-7^HEMOGLOBINA^LN||14.2|g/dL|12.0-16.0|N|||F|||20260522132400
OBX|2|NM|770-8^LEUCOCITOS^LN||7500|/uL|4000-11000|N|||F|||20260522132400`;

const EXAMPLE_ORM = 
`MSH|^~\\&|RIS|HOSPITAL|MODALIDADE|LOCAL|202605221330||ORM^O01|MSGID12345|P|2.3
PID|1||1234567||SOBRENOME^NOME||19800101|M|||ENDERECO^^CIDADE^UF|||||||
PV1|1|O|URGENTE||||1234^MEDICO^REFERENTE|||||||||||||
OBR|1|ORD12345|ACC12345|RAD001^RX TORAX AP E PERFIL|||202605221330|||||||||MEDICO_SOLICITANTE||||||||||||||||||||`;

/**
 * Carrega o exemplo ADT
 */
function loadExampleADT() {
  rawInput.value = EXAMPLE_ADT;
  handleRawInputUpdate(EXAMPLE_ADT, true);
  // Expande por padrão os dois primeiros segmentos para mostrar a funcionalidade
  expandedSegments.clear();
  expandedSegments.add(0);
  expandedSegments.add(2);
  renderViewer();
}

/**
 * Carrega o exemplo ORU
 */
function loadExampleORU() {
  rawInput.value = EXAMPLE_ORU;
  handleRawInputUpdate(EXAMPLE_ORU, true);
  expandedSegments.clear();
  expandedSegments.add(0);
  expandedSegments.add(4);
  renderViewer();
}

/**
 * Carrega o exemplo ORM (Mensagem de teste do usuário)
 */
function loadExampleORM() {
  rawInput.value = EXAMPLE_ORM;
  handleRawInputUpdate(EXAMPLE_ORM, true);
  expandedSegments.clear();
  expandedSegments.add(0); // MSH
  expandedSegments.add(1); // PID
  expandedSegments.add(3); // OBR
  renderViewer();
}

/**
 * Limpa o editor e a árvore
 */
function clearAll() {
  rawInput.value = '';
  parsedData = [];
  expandedSegments.clear();
  renderViewer();
  updateStatus('Editor limpo', 'inactive');
}

/**
 * Processa a atualização do editor de texto bruto
 * @param {string} text 
 * @param {boolean} forceRender 
 */
function handleRawInputUpdate(text, forceRender = false) {
  if (!text.trim()) {
    parsedData = [];
    renderViewer();
    updateStats();
    return;
  }

  try {
    // Se o parser estiver no escopo global
    const parser = window.hl7Parser || { parseHL7 };
    parsedData = parser.parseHL7(text);
    
    updateStats();
    
    // Sempre renderiza quando forçado (ex: carregar exemplo) ou quando é uma colagem/edição
    // Usa debounce apenas quando o usuário está digitando ativamente tecla por tecla
    if (forceRender) {
      renderViewer();
    } else {
      // Debounce de 300ms para não travar em mensagens grandes enquanto o usuário digita
      debounceRender();
    }
    
    updateStatus('Mensagem HL7 analisada com sucesso', 'success');
  } catch (error) {
    console.error(error);
    updateStatus('Erro ao processar mensagem: ' + error.message, 'warning');
  }
}

let debounceTimer;
function debounceRender() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    renderViewer();
  }, 150);
}

/**
 * Atualiza o rodapé de estatísticas
 */
function updateStats() {
  statSegments.textContent = parsedData.length;
  
  // A versão do HL7 fica no MSH.12 (índice 11 do MSH)
  const mshSegment = parsedData.find(seg => seg.name === 'MSH');
  if (mshSegment && mshSegment.fields[11]) {
    statVersion.textContent = mshSegment.fields[11].value || 'Desconhecida';
  } else {
    statVersion.textContent = '-';
  }
}

/**
 * Renderiza a árvore estruturada HL7 no painel da direita
 */
function renderViewer() {
  if (parsedData.length === 0) {
    emptyState.style.display = 'flex';
    segmentsContainer.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  segmentsContainer.style.display = 'flex';
  segmentsContainer.style.flexDirection = 'column';
  segmentsContainer.style.gap = '12px';
  segmentsContainer.style.width = '100%';
  
  // Salva o foco atual para restaurar após a renderização
  const activeElementId = document.activeElement ? document.activeElement.id : null;
  const cursorSelectionStart = document.activeElement ? document.activeElement.selectionStart : null;

  segmentsContainer.innerHTML = '';

  parsedData.forEach((segment, segIndex) => {
    const card = document.createElement('div');
    card.className = `segment-card ${expandedSegments.has(segIndex) ? 'expanded' : ''}`;
    card.dataset.index = segIndex;

    const segmentClass = segment.name.toLowerCase();
    const isCommon = ['msh', 'pid', 'pv1', 'orc', 'obx'].includes(segmentClass);
    const badgeClass = isCommon ? segmentClass : 'other';

    // Cria cabeçalho do Segmento
    const headerHtml = `
      <div class="segment-header">
        <div class="segment-info">
          <span class="segment-badge ${badgeClass}">${segment.name}</span>
          <span class="segment-desc">${segment.description}</span>
        </div>
        <div class="segment-actions">
          <span class="segment-index">Seg #${segIndex + 1}</span>
          <i data-lucide="chevron-down" class="toggle-icon"></i>
        </div>
      </div>
    `;

    card.innerHTML = headerHtml;

    // Cria área de detalhes do Segmento
    const details = document.createElement('div');
    details.className = 'segment-details';
    
    // Lista os campos diretamente dentro do segmento
    const fieldsList = document.createElement('div');
    fieldsList.className = 'fields-list';

    segment.fields.forEach(field => {
      const hasValue = field.value && field.value.trim() !== '';
      const isHeaderConfig = segment.name === 'MSH' && (field.number === 1 || field.number === 2);
      const isGeneric = field.description.startsWith('Campo ');

      if (!hasValue && isGeneric) return;

      const fieldRow = document.createElement('div');
      fieldRow.className = 'field-row';
      fieldRow.dataset.seg = segIndex;
      fieldRow.dataset.field = field.index;

      const fieldIdText = `${segment.name}.${field.number}`;

      let contentHtml = `
        <div class="field-meta">
          <span class="field-id">${fieldIdText}</span>
          <span class="field-name">${field.description}</span>
        </div>
        <div class="field-value-container">
      `;

      if (isHeaderConfig) {
        contentHtml += `<input type="text" class="field-input" value="${escapeHtml(field.value)}" readonly disabled style="opacity: 0.7; cursor: not-allowed;">`;
      } else {
        contentHtml += `
          <input
            type="text"
            class="field-input main-field-input"
            id="input-${segIndex}-${field.index}"
            data-seg="${segIndex}"
            data-field="${field.index}"
            value="${escapeHtml(field.value)}"
            placeholder="Vazio"
          >
        `;
      }

      contentHtml += `</div>`;

      if (field.components && field.components.length > 0) {
        contentHtml += `<div class="components-grid">`;
        field.components.forEach(comp => {
          contentHtml += `
            <div class="comp-box">
              <span class="comp-label">${fieldIdText}.${comp.number}</span>
              <input
                type="text"
                class="comp-input"
                id="input-${segIndex}-${field.index}-${comp.index}"
                data-seg="${segIndex}"
                data-field="${field.index}"
                data-comp="${comp.index}"
                value="${escapeHtml(comp.value)}"
                placeholder="Nulo"
              >
            </div>
          `;
        });
        contentHtml += `</div>`;
      }

      fieldRow.innerHTML = contentHtml;
      fieldRow.addEventListener('click', () => setSelectedField(segIndex, field.index));
      fieldsList.appendChild(fieldRow);
    });

    details.appendChild(fieldsList);

    card.appendChild(details);
    segmentsContainer.appendChild(card);

    // Evento de clique para expandir/recolher segmento
    card.querySelector('.segment-header').addEventListener('click', (e) => {
      // Evita disparar se clicar em alguma ação (se houvesse)
      if (e.target.closest('input') || e.target.closest('button')) return;
      
      const isExpanded = card.classList.toggle('expanded');
      if (isExpanded) {
        expandedSegments.add(segIndex);
      } else {
        expandedSegments.delete(segIndex);
      }
    });
  });

  // Recria os ícones do Lucide nos novos elementos
  lucide.createIcons();

  // Registra eventos de input para sincronização bidirecional nos campos estruturados
  registerSyncEvents();
  updateRawHighlightOverlay();

  // Re-aplica a classe selected após re-renderização
  if (selectedFieldKey) {
    const [selSeg, selField] = selectedFieldKey.split(':').map(Number);
    const selRow = document.querySelector(`.field-row[data-seg="${selSeg}"][data-field="${selField}"]`);
    if (selRow) selRow.classList.add('selected');
  }

  // Restaura o foco se o elemento ainda existir
  if (activeElementId) {
    const activeEl = document.getElementById(activeElementId);
    if (activeEl) {
      activeEl.focus();
      if (cursorSelectionStart !== null && (activeEl.type === 'text' || activeEl.type === 'textarea')) {
        activeEl.setSelectionRange(cursorSelectionStart, cursorSelectionStart);
      }
    }
  }
}

function insertHighlightHtml(rawText, highlightStart, highlightEnd) {
  const safeBefore = escapeHtml(rawText.slice(0, highlightStart));
  const safeMatch = escapeHtml(rawText.slice(highlightStart, highlightEnd));
  const safeAfter = escapeHtml(rawText.slice(highlightEnd));
  return `${safeBefore}<span class="highlight">${safeMatch}</span>${safeAfter}`;
}

function updateRawHighlightOverlay() {
  if (!rawHighlightOverlay) return;
  const rawText = rawInput.value.replace(/\r/g, '\n');
  if (!selectedFieldKey) {
    rawHighlightOverlay.innerHTML = escapeHtml(rawText);
    return;
  }

  const [segIndex, fieldIndex] = selectedFieldKey.split(':').map(Number);
  const segment = parsedData[segIndex];
  if (!segment) {
    rawHighlightOverlay.innerHTML = escapeHtml(rawText);
    return;
  }

  const segmentStart = rawText.indexOf(segment.raw);
  const range = getFieldRange(segment, fieldIndex);
  if (segmentStart === -1 || !range) {
    rawHighlightOverlay.innerHTML = escapeHtml(rawText);
    return;
  }

  let highlightStart = segmentStart + range.start;
  let highlightEnd = segmentStart + range.end;
  if (highlightStart === highlightEnd) {
    highlightEnd = Math.min(rawText.length, highlightStart + 1);
  }

  rawHighlightOverlay.innerHTML = insertHighlightHtml(rawText, highlightStart, highlightEnd);
}

function clearSelectedField() {
  const previous = document.querySelector('.field-row.selected');
  if (previous) {
    previous.classList.remove('selected');
  }
  selectedFieldKey = null;
}

function setSelectedField(segIndex, fieldIndex) {
  const key = `${segIndex}:${fieldIndex}`;
  if (selectedFieldKey === key) return;

  clearSelectedField();
  selectedFieldKey = key;

  // Auto-expande o segmento se estiver recolhido
  if (!expandedSegments.has(segIndex)) {
    expandedSegments.add(segIndex);
    const segCard = document.querySelector(`.segment-card[data-index="${segIndex}"]`);
    if (segCard) segCard.classList.add('expanded');
  }

  const fieldRow = document.querySelector(`.field-row[data-seg="${segIndex}"][data-field="${fieldIndex}"]`);
  if (fieldRow) {
    fieldRow.classList.add('selected');
    setTimeout(() => fieldRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  }

  highlightRawField(segIndex, fieldIndex);
  updateRawHighlightOverlay();
}

function highlightRawField(segIndex, fieldIndex) {
  if (!parsedData[segIndex]) return;
  const segment = parsedData[segIndex];
  const rawText = rawInput.value.replace(/\r/g, '\n');
  const segmentStart = rawText.indexOf(segment.raw);
  if (segmentStart === -1) return;

  const range = getFieldRange(segment, fieldIndex);
  if (!range) return;

  const start = segmentStart + range.start;
  const lineIndex = rawText.slice(0, start).split('\n').length - 1;
  rawInput.scrollTop = Math.max(0, lineIndex * 22);
}

function getFieldRange(segment, fieldIndex) {
  const line = segment.raw || '';
  if (!line) return null;

  const fieldSep = segment.name === 'MSH' ? (line.charAt(3) || '|') : '|';
  const ranges = [];

  if (segment.name === 'MSH') {
    ranges.push({ start: 3, end: 4 });
    let position = 4;
    const remaining = line.substring(position);
    const parts = remaining.split(fieldSep);

    parts.forEach(part => {
      const start = position;
      const end = position + part.length;
      ranges.push({ start, end });
      position = end + 1;
    });
  } else {
    const firstSep = line.indexOf(fieldSep);
    if (firstSep === -1) return null;

    let position = firstSep + 1;
    const remaining = line.substring(position);
    const parts = remaining.split(fieldSep);

    parts.forEach(part => {
      const start = position;
      const end = position + part.length;
      ranges.push({ start, end });
      position = end + 1;
    });
  }

  return ranges[fieldIndex] || null;
}


/**
 * Registra os listeners nos inputs estruturados para atualizar o modelo de dados e o Raw Text
 */
function registerSyncEvents() {
  // Inputs de campos principais
  document.querySelectorAll('.main-field-input').forEach(input => {
    input.addEventListener('focus', (e) => {
      const segIndex = parseInt(e.target.dataset.seg);
      const fieldIndex = parseInt(e.target.dataset.field);
      setSelectedField(segIndex, fieldIndex);
    });

    input.addEventListener('click', (e) => {
      const segIndex = parseInt(e.target.dataset.seg);
      const fieldIndex = parseInt(e.target.dataset.field);
      setSelectedField(segIndex, fieldIndex);
    });

    input.addEventListener('input', (e) => {
      const segIndex = parseInt(e.target.dataset.seg);
      const fieldIndex = parseInt(e.target.dataset.field);
      const newValue = e.target.value;

      // Atualiza o valor no modelo de dados
      const segment = parsedData[segIndex];
      const field = segment.fields[fieldIndex];
      field.value = newValue;

      // Se tiver componentes, reconstrói ou limpa os componentes conforme a alteração global
      if (field.components && field.components.length > 0) {
        // Se mudou o campo principal, podemos tentar recalcular os componentes de volta
        const parts = newValue.split('^');
        field.components.forEach((comp, cIdx) => {
          comp.value = parts[cIdx] || '';
          const compInput = document.getElementById(`input-${segIndex}-${fieldIndex}-${cIdx}`);
          if (compInput) compInput.value = comp.value;
        });
      }

      serializeAndSyncRaw();
    });
  });

  // Inputs de componentes individuais
  document.querySelectorAll('.comp-input').forEach(input => {
    input.addEventListener('focus', (e) => {
      const segIndex = parseInt(e.target.dataset.seg);
      const fieldIndex = parseInt(e.target.dataset.field);
      setSelectedField(segIndex, fieldIndex);
    });

    input.addEventListener('click', (e) => {
      const segIndex = parseInt(e.target.dataset.seg);
      const fieldIndex = parseInt(e.target.dataset.field);
      setSelectedField(segIndex, fieldIndex);
    });

    input.addEventListener('input', (e) => {
      const segIndex = parseInt(e.target.dataset.seg);
      const fieldIndex = parseInt(e.target.dataset.field);
      const compIndex = parseInt(e.target.dataset.comp);
      const newValue = e.target.value;

      // Atualiza o componente no modelo de dados
      const segment = parsedData[segIndex];
      const field = segment.fields[fieldIndex];
      field.components[compIndex].value = newValue;

      // Reconstrói o valor do campo pai combinando os componentes
      const compValues = field.components.map(c => c.value);
      
      // Remove elementos vazios do final para manter limpo, mas preserva delimitadores intermediários
      while (compValues.length > 0 && compValues[compValues.length - 1] === '') {
        compValues.pop();
      }
      
      field.value = compValues.join('^');

      // Atualiza o input principal na interface
      const mainInput = document.getElementById(`input-${segIndex}-${fieldIndex}`);
      if (mainInput) {
        mainInput.value = field.value;
      }

      serializeAndSyncRaw();
    });
  });
}

/**
 * Serializa os dados da árvore atual e atualiza a caixa de texto bruta sem perder o cursor
 */
function serializeAndSyncRaw() {
  try {
    const parser = window.hl7Parser || { serializeHL7 };
    const newHL7Text = parser.serializeHL7(parsedData);
    
    // Salva a seleção/posição atual do cursor no editor bruto se estiver focado
    const isRawFocused = document.activeElement === rawInput;
    const start = rawInput.selectionStart;
    const end = rawInput.selectionEnd;

    rawInput.value = newHL7Text;
    const rawLines = newHL7Text.split('\n');
    parsedData.forEach((seg, idx) => {
      seg.raw = rawLines[idx] || seg.raw;
    });

    if (isRawFocused) {
      rawInput.setSelectionRange(start, end);
    }
    
    updateStatus('Mensagem atualizada', 'success');
  } catch (error) {
    updateStatus('Erro ao sincronizar texto: ' + error.message, 'warning');
  }
}

/**
 * Expande ou recolhe todos os segmentos de uma vez
 */
function toggleExpandAll() {
  if (parsedData.length === 0) return;

  const allExpanded = expandedSegments.size === parsedData.length;
  
  if (allExpanded) {
    expandedSegments.clear();
    btnExpandAll.textContent = 'Expandir Todos';
  } else {
    parsedData.forEach((_, idx) => expandedSegments.add(idx));
    btnExpandAll.textContent = 'Recolher Todos';
  }

  renderViewer();
}

/**
 * Faz o download da mensagem HL7 atual como arquivo de texto
 */
function downloadHL7() {
  const text = rawInput.value;
  if (!text.trim()) {
    updateStatus('Nada para exportar!', 'warning');
    return;
  }

  // Define um nome padrão baseado no tipo de mensagem (ex: ADT_A08_20260522.hl7)
  let filename = 'mensagem_hl7.hl7';
  const mshSegment = parsedData.find(seg => seg.name === 'MSH');
  if (mshSegment && mshSegment.fields[8]) {
    const msgType = mshSegment.fields[8].value.replace('^', '_');
    filename = `${msgType}_export.hl7`;
  }

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  
  // Método padrão do navegador para download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  updateStatus(`Mensagem exportada como ${filename}`, 'success');
}

/**
 * Atualiza o indicador de status no rodapé
 * @param {string} message 
 * @param {'success'|'warning'|'inactive'} type 
 */
function updateStatus(message, type = 'inactive') {
  statusText.textContent = message;
  statusDot.className = 'status-dot';
  
  if (type === 'success') {
    statusDot.style.backgroundColor = 'var(--success)';
    statusDot.style.boxShadow = '0 0 8px var(--success-glow)';
  } else if (type === 'warning') {
    statusDot.style.backgroundColor = 'var(--warning)';
    statusDot.style.boxShadow = '0 0 8px rgba(255, 152, 0, 0.4)';
  } else {
    statusDot.style.backgroundColor = 'var(--text-muted)';
    statusDot.style.boxShadow = 'none';
  }
}

/**
 * Escapa caracteres HTML para exibição segura nos inputs
 * @param {string} string 
 */
function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function initPaneResizer() {
  const resizer = document.getElementById('resize-handle');
  const leftPane = document.getElementById('left-pane');
  const rightPane = document.getElementById('right-pane');
  if (!resizer || !leftPane || !rightPane) return;

  let isDragging = false;
  let startX = 0;
  let startWidth = 0;

  const minLeft = 260;
  const maxLeft = window.innerWidth * 0.7;

  const onMouseMove = (event) => {
    if (!isDragging) return;
    const delta = event.clientX - startX;
    const newWidth = Math.min(Math.max(startWidth + delta, minLeft), maxLeft);
    leftPane.style.width = `${newWidth}px`;
  };

  const stopDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    resizer.classList.remove('active');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', stopDrag);
  };

  resizer.addEventListener('mousedown', (event) => {
    isDragging = true;
    startX = event.clientX;
    startWidth = leftPane.getBoundingClientRect().width;
    resizer.classList.add('active');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stopDrag);
  });
}

// Inicializa a aplicação com o exemplo ORM (mensagem de teste do usuário)
window.addEventListener('DOMContentLoaded', () => {
  initPaneResizer();
  loadExampleORM();
});
