// Dicionário de categorias para campos HL7
const FIELD_CATEGORIES = {
  MSH: {
    1: "Sistema",
    2: "Sistema",
    3: "Roteamento",
    4: "Roteamento",
    5: "Roteamento",
    6: "Roteamento",
    7: "Temporal",
    8: "Segurança",
    9: "Tipo",
    10: "Controle",
    11: "Controle",
    12: "Versão",
    13: "Controle",
    14: "Controle",
    15: "Confirmação",
    16: "Confirmação",
    17: "Localização",
    18: "Codificação",
    19: "Codificação"
  },
  PID: {
    1: "Identificação",
    2: "Identificação",
    3: "Identificação",
    4: "Identificação",
    5: "Dados Pessoais",
    6: "Dados Pessoais",
    7: "Dados Pessoais",
    8: "Dados Pessoais",
    9: "Dados Pessoais",
    10: "Dados Pessoais",
    11: "Contato",
    12: "Contato",
    13: "Contato",
    14: "Contato",
    15: "Contato",
    16: "Dados Pessoais",
    17: "Dados Pessoais",
    18: "Administrativo",
    19: "Administrativo",
    20: "Administrativo",
    21: "Referências",
    22: "Dados Pessoais",
    23: "Dados Pessoais"
  },
  PV1: {
    1: "Identificação",
    2: "Admissão",
    3: "Localização",
    4: "Admissão",
    5: "Admissão",
    6: "Localização",
    7: "Clínico",
    8: "Clínico",
    9: "Clínico",
    10: "Clínico",
    11: "Localização",
    12: "Admissão",
    13: "Admissão",
    14: "Admissão",
    15: "Status",
    16: "Status",
    17: "Clínico",
    18: "Status",
    19: "Identificação",
    44: "Temporal",
    45: "Temporal"
  },
  ORC: {
    1: "Controle",
    2: "Identificação",
    3: "Identificação",
    4: "Identificação",
    5: "Status",
    6: "Controle",
    7: "Temporalidade",
    9: "Temporal",
    12: "Profissional"
  },
  OBR: {
    1: "Identificação",
    2: "Identificação",
    3: "Identificação",
    4: "Serviço",
    7: "Temporal",
    8: "Temporal",
    16: "Profissional",
    22: "Temporal",
    25: "Resultados"
  },
  OBX: {
    1: "Identificação",
    2: "Identificação",
    3: "Identificação",
    4: "Identificação",
    5: "Resultado",
    6: "Resultado",
    7: "Resultado",
    8: "Resultado",
    11: "Status",
    14: "Temporal"
  }
};

// Dicionário de descrições para segmentos e campos HL7 v2 comuns para auxiliar no mapeamento.
const HL7_DICTIONARY = {
  MSH: {
    name: "Message Header (Cabeçalho da Mensagem)",
    fields: {
      1: "Field Separator (Separador de Campos)",
      2: "Encoding Characters (Caracteres de Codificação)",
      3: "Sending Application (Aplicação de Envio)",
      4: "Sending Facility (Unidade de Envio)",
      5: "Receiving Application (Aplicação de Recebimento)",
      6: "Receiving Facility (Unidade de Recebimento)",
      7: "Date/Time of Message (Data/Hora da Mensagem)",
      8: "Security (Segurança)",
      9: "Message Type (Tipo de Mensagem)",
      10: "Message Control ID (ID de Controle da Mensagem)",
      11: "Processing ID (ID de Processamento)",
      12: "Version ID (ID da Versão HL7)",
      13: "Sequence Number (Número de Sequência)",
      14: "Continuation Pointer (Ponteiro de Continuação)",
      15: "Accept Acknowledgment Type (Tipo de Confirmação de Aceite)",
      16: "Application Acknowledgment Type (Tipo de Confirmação de Aplicação)",
      17: "Country Code (Código do País)",
      18: "Character Set (Conjunto de Caracteres)",
      19: "Principal Language Of Message (Idioma Principal da Mensagem)"
    }
  },
  PID: {
    name: "Patient Identification (Identificação do Paciente)",
    fields: {
      1: "Set ID - PID (ID do Registro PID)",
      2: "Patient ID (ID Interno do Paciente)",
      3: "Patient Identifier List (Lista de Identificadores do Paciente)",
      4: "Alternate Patient ID (ID Alternativo do Paciente)",
      5: "Patient Name (Nome do Paciente)",
      6: "Mother's Maiden Name (Nome de Solteira da Mãe)",
      7: "Date/Time of Birth (Data/Hora de Nascimento)",
      8: "Administrative Sex (Sexo Administrativo)",
      9: "Patient Alias (Apelido/Outros Nomes)",
      10: "Race (Raça/Cor)",
      11: "Patient Address (Endereço do Paciente)",
      12: "County Code (Código do Município)",
      13: "Phone Number - Home (Telefone Residencial)",
      14: "Phone Number - Business (Telefone Comercial)",
      15: "Primary Language (Idioma Principal)",
      16: "Marital Status (Estado Civil)",
      17: "Religion (Religião)",
      18: "Patient Account Number (Número da Conta do Paciente)",
      19: "SSN Number - Patient (CPF/Documento do Paciente)",
      20: "Driver's License Number - Patient (Número da Habilitação)",
      21: "Mother's Identifier (Identificador da Mãe)",
      22: "Ethnic Group (Grupo Étnico)",
      23: "Birth Place (Local de Nascimento)"
    }
  },
  PV1: {
    name: "Patient Visit (Visita/Internação do Paciente)",
    fields: {
      1: "Set ID - PV1 (ID do Registro PV1)",
      2: "Patient Class (Classe do Paciente - Ambulatorial/Internado)",
      3: "Assigned Patient Location (Localização Atribuída ao Paciente)",
      4: "Admission Type (Tipo de Admissão)",
      5: "Preadmit Number (Número de Pré-Admissão)",
      6: "Prior Patient Location (Localização Anterior do Paciente)",
      7: "Attending Doctor (Médico Responsável)",
      8: "Referring Doctor (Médico Solicitante)",
      9: "Consulting Doctor (Médico Consultor)",
      10: "Hospital Service (Serviço Hospitalar)",
      11: "Temporary Location (Localização Temporária)",
      12: "Pre-admit Test Indicator (Indicador de Testes Pré-Admissão)",
      13: "Readmission Indicator (Indicador de Readmissão)",
      14: "Admit Source (Origem da Admissão)",
      15: "Ambulatory Status (Status Ambulatorial)",
      16: "VIP Indicator (Indicador de VIP)",
      17: "Admitting Doctor (Médico da Admissão)",
      18: "Patient Type (Tipo de Paciente)",
      19: "Visit Number (Número da Visita/Atendimento)",
      44: "Admit Date/Time (Data/Hora de Admissão)",
      45: "Discharge Date/Time (Data/Hora de Alta)"
    }
  },
  EVN: {
    name: "Event Type (Tipo de Evento)",
    fields: {
      1: "Event Type Code (Código do Tipo de Evento)",
      2: "Recorded Date/Time (Data/Hora de Registro)",
      3: "DateTime Planned Event (Data/Hora Planejada para o Evento)",
      4: "Event Reason Code (Código do Motivo do Evento)",
      5: "Operator ID (ID do Operador)",
      6: "Event Occurred (Data/Hora em que o Evento Ocorreu)"
    }
  },
  ORC: {
    name: "Common Order (Dados Comuns do Pedido)",
    fields: {
      1: "Order Control (Controle do Pedido)",
      2: "Placer Order Number (Número do Pedido do Solicitante)",
      3: "Filler Order Number (Número do Pedido do Executante)",
      4: "Placer Group Number (Número do Grupo do Solicitante)",
      5: "Order Status (Status do Pedido)",
      6: "Response Flag (Sinalização de Resposta)",
      7: "Quantity/Timing (Quantidade/Tempo)",
      9: "Date/Time of Transaction (Data/Hora da Transação)",
      12: "Ordering Provider (Profissional Solicitante)"
    }
  },
  OBR: {
    name: "Observation Request (Solicitação de Exame/Observação)",
    fields: {
      1: "Set ID - OBR (ID do Registro OBR)",
      2: "Placer Order Number (Número do Pedido do Solicitante)",
      3: "Filler Order Number (Número do Pedido do Executante)",
      4: "Universal Service Identifier (Identificador Universal do Serviço)",
      7: "Observation Date/Time (Data/Hora da Observação)",
      8: "Observation End Date/Time (Data/Hora de Fim da Observação)",
      16: "Ordering Provider (Profissional Solicitante)",
      22: "Results Rpt/Status Chng - Date/Time (Data/Hora do Resultado)",
      25: "Result Status (Status do Resultado)"
    }
  },
  OBX: {
    name: "Observation/Result (Observação/Resultado de Exame)",
    fields: {
      1: "Set ID - OBX (ID do Registro OBX)",
      2: "Value Type (Tipo de Dado do Valor)",
      3: "Observation Identifier (Identificador da Observação)",
      4: "Observation Sub-ID (Sub-ID da Observação)",
      5: "Observation Value (Valor da Observação)",
      6: "Units (Unidades de Medida)",
      7: "References Range (Intervalo de Referência)",
      8: "Abnormal Flags (Sinalizadores de Anormalidade)",
      11: "Observation Result Status (Status do Resultado da Observação)",
      14: "Date/Time of the Observation (Data/Hora da Observação)"
    }
  },
  DG1: {
    name: "Diagnosis (Diagnóstico)",
    fields: {
      1: "Set ID - DG1 (ID do Registro DG1)",
      2: "Diagnosis Coding Method (Método de Codificação do Diagnóstico)",
      3: "Diagnosis Code - DG1 (Código do Diagnóstico)",
      4: "Diagnosis Description (Descrição do Diagnóstico)",
      5: "Diagnosis Date/Time (Data/Hora do Diagnóstico)",
      6: "Diagnosis Type (Tipo de Diagnóstico)"
    }
  },
  AL1: {
    name: "Allergy Information (Informações de Alergias)",
    fields: {
      1: "Set ID - AL1 (ID do Registro AL1)",
      2: "Allergen Type Code (Código do Tipo de Alérgeno)",
      3: "Allergen Code/Mnemonic/Description (Código/Descrição do Alérgeno)",
      4: "Allergy Severity Code (Código de Gravidade da Alergia)",
      5: "Allergy Reaction Code (Código de Reação Alérgica)",
      6: "Identification Date (Data de Identificação)"
    }
  }
};

/**
 * Função para analisar e processar uma mensagem HL7 v2
 * Retorna uma estrutura hierárquica rica
 * @param {string} hl7Text 
 */
function parseHL7(hl7Text) {
  if (!hl7Text) return [];

  // Padroniza as quebras de linha para simplificar a divisão
  const lines = hl7Text.replace(/\r/g, '\n').split('\n').filter(line => line.trim().length > 0);
  
  return lines.map((line, segmentIndex) => {
    // Delimitadores padrão
    let fieldSep = '|';
    let compSep = '^';
    let subCompSep = '&';
    let repSep = '~';

    const segmentName = line.substring(0, 3);
    let fields = [];

    if (segmentName === 'MSH') {
      // O MSH define os delimitadores
      fieldSep = line.charAt(3) || '|';
      compSep = line.charAt(4) || '^';
      repSep = line.charAt(5) || '~';
      subCompSep = line.charAt(7) || '&';

      // No MSH:
      // Campo 1 é o próprio separador de campos (geralmente '|')
      // Campo 2 são os caracteres de codificação (geralmente '^~\&')
      // O restante da linha é dividido normalmente
      fields.push(fieldSep);
      fields.push(line.substring(4, line.indexOf(fieldSep, 8) !== -1 ? line.indexOf(fieldSep, 8) : line.length));
      
      // O restante da string após MSH e os delimitadores
      const remainingStart = 3 + 1 + (fields[1].length);
      const remainingText = line.substring(remainingStart);
      const splitFields = remainingText.split(fieldSep);
      
      // Remove o primeiro elemento vazio decorrente do split do separador inicial
      if (splitFields[0] === '') {
        splitFields.shift();
      }
      
      splitFields.forEach(f => fields.push(f));
    } else {
      // Outros segmentos são divididos normalmente
      // Nota: o primeiro elemento após o split por '|' será o nome do segmento, que pulamos.
      const splitFields = line.split(fieldSep);
      fields = splitFields.slice(1);
    }

    // Processa os campos estruturando-os com componentes e descrições
    const parsedFields = fields.map((fieldContent, index) => {
      const fieldNum = index + 1;
      const dictInfo = HL7_DICTIONARY[segmentName];
      const fieldDescription = dictInfo && dictInfo.fields[fieldNum] 
        ? dictInfo.fields[fieldNum] 
        : `Campo ${fieldNum}`;
      
      // Obtém a categoria do campo
      const categoryMap = FIELD_CATEGORIES[segmentName] || {};
      const fieldCategory = categoryMap[fieldNum] || "Outros";

      // Verifica componentes
      const components = fieldContent.split(compSep).map((compValue, compIndex) => {
        const compNum = compIndex + 1;
        return {
          index: compIndex,
          number: compNum,
          value: compValue,
          id: `${segmentName}.${fieldNum}.${compNum}`
        };
      });

      return {
        index: index,
        number: fieldNum,
        value: fieldContent,
        description: fieldDescription,
        category: fieldCategory,
        components: components.length > 1 ? components : [],
        id: `${segmentName}.${fieldNum}`
      };
    });

    const dictInfo = HL7_DICTIONARY[segmentName];
    const segmentDescription = dictInfo ? dictInfo.name : "Segmento Personalizado";

    return {
      index: segmentIndex,
      name: segmentName,
      description: segmentDescription,
      raw: line,
      fields: parsedFields
    };
  });
}

/**
 * Reconstrói a mensagem HL7 a partir de uma estrutura de árvore analisada
 * @param {Array} parsedSegments 
 * @param {string} fieldSep 
 * @param {string} compSep 
 */
function serializeHL7(parsedSegments, fieldSep = '|', compSep = '^') {
  return parsedSegments.map(seg => {
    if (seg.name === 'MSH') {
      // Reconstrói o MSH com cuidado especial aos delimitadores
      // O MSH.1 é o fieldSep, MSH.2 é o compSep + repSep + esc + subCompSep
      const msh1 = seg.fields[0]?.value || fieldSep;
      const msh2 = seg.fields[1]?.value || `${compSep}~\\&`;
      
      const otherFields = seg.fields.slice(2).map(f => {
        if (f.components && f.components.length > 0) {
          return f.components.map(c => c.value).join(compSep);
        }
        return f.value;
      });
      
      return `${seg.name}${msh1}${msh2}${msh1}${otherFields.join(msh1)}`.trim();
    } else {
      const fieldStrings = seg.fields.map(f => {
        if (f.components && f.components.length > 0) {
          return f.components.map(c => c.value).join(compSep);
        }
        return f.value;
      });
      return `${seg.name}${fieldSep}${fieldStrings.join(fieldSep)}`.trim();
    }
  }).join('\n');
}

// Exporta as funções para compatibilidade com o Electron (Node) ou Navegador
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = { parseHL7, serializeHL7, HL7_DICTIONARY, FIELD_CATEGORIES };
} else {
  window.hl7Parser = { parseHL7, serializeHL7, HL7_DICTIONARY, FIELD_CATEGORIES };
}
