// =======================================================================
// 1. CONFIGURAÇÃO DE DADOS E VARIÁVEIS GLOBAIS
// =======================================================================

const setoresData = {
    "Santíssimo Resort": ["Administrativo", "RH", "Controladoria", "Recepção", "Central de Reservas", "Portaria", "Manutenção", "A&B", "Recreação", "Eventos"],
    "Pousada Mãe D'Água": ["Recepção", "Manutenção", "Governança", "Cozinha"],
    // Empresas sem setores específicos: o campo será ocultado.
    "Escritório": [],
    "Serraria": [],
    "Beta de Prata": []
};

let contadorAcompanhantes = 0;
const MAX_ACOMPANHANTES = 3;

// =======================================================================
// 2. REFERÊNCIAS DOM (Elementos do Formulário)
// =======================================================================

const empresaSelect = document.getElementById("empresa");
const setorDiv = document.getElementById("div-setor");
const setorSelect = document.getElementById("setor");
const admissaoInput = document.getElementById("admissao");
const erroAdmissaoMsg = document.getElementById("erro-admissao");
const beneficioDiv = document.getElementById("div-beneficio");
const listaAcompanhantes = document.getElementById("lista-acompanhantes");
const btnAddGuest = document.getElementById("btn-add-guest");
const hospedeForm = document.getElementById("hospedeForm");
const btnEnviar = document.getElementById("btn-enviar");


// =======================================================================
// 3. LÓGICAS E FUNÇÕES DE VALIDAÇÃO
// =======================================================================

/**
 * Atualiza o dropdown de Setores baseado na Empresa selecionada.
 */
function atualizarSetores() {
    const empresa = empresaSelect.value;
    setorSelect.innerHTML = ""; // Limpa opções anteriores

    if (setoresData[empresa] && setoresData[empresa].length > 0) {
        // Se a empresa tem setores, exibe o campo e preenche as opções
        setorDiv.classList.remove("hidden-default");
        setoresData[empresa].forEach(setor => {
            const option = document.createElement("option");
            option.text = setor;
            option.value = setor;
            setorSelect.add(option);
        });
        setorSelect.required = true;
    } else {
        // Se a empresa não tem setores, oculta o campo
        setorDiv.classList.add("hidden-default");
        setorSelect.required = false;
        // Adiciona um valor "N/A" para o backend saber que não é aplicável
        setorSelect.value = "N/A"; 
    }
}

/**
 * Verifica se o funcionário tem mais de 1 ano de admissão.
 * @returns {boolean} True se tiver 1 ano ou mais.
 */
function verificarAdmissao() {
    const dataAdmissaoStr = admissaoInput.value;
    if (!dataAdmissaoStr) return false;

    const dataAdmissao = new Date(dataAdmissaoStr);
    const hoje = new Date();
    
    // Calcula a data que completa 1 ano (hoje - 1 ano)
    const dataLimite = new Date(dataAdmissao);
    dataLimite.setFullYear(dataAdmissao.getFullYear() + 1);

    const temTempo = (hoje >= dataLimite);
    
    // Atualiza a exibição no frontend
    if (!temTempo) {
        // Menos de 1 ano: Mostra erro e desabilita envio
        erroAdmissaoMsg.classList.remove("hidden-default");
        beneficioDiv.classList.add("hidden-default");
        btnEnviar.disabled = true;
        btnEnviar.textContent = "Requisitos não atendidos";
    } else {
        // Mais de 1 ano: Oculta erro e habilita envio
        erroAdmissaoMsg.classList.add("hidden-default");
        beneficioDiv.classList.remove("hidden-default");
        btnEnviar.disabled = false;
        btnEnviar.textContent = "Enviar Inscrição";
    }
    
    return temTempo;
}

/**
 * Adiciona um novo campo para acompanhante, até o limite de 5.
 */
function adicionarAcompanhante() {
    if (contadorAcompanhantes >= MAX_ACOMPANHANTES) {
        alert(`Máximo de ${MAX_ACOMPANHANTES} acompanhantes atingido.`);
        return;
    }

    contadorAcompanhantes++;
    
    const guestHtml = `
        <div class="guest-item" data-id="${contadorAcompanhantes}">
            <input type="text" class="guest-name" placeholder="Nome Acompanhante ${contadorAcompanhantes}" required>
            <input type="text" class="guest-parentesco" placeholder="Grau de Parentesco" required>
        </div>
    `;
    
    listaAcompanhantes.insertAdjacentHTML('beforeend', guestHtml);

    if (contadorAcompanhantes === MAX_ACOMPANHANTES) {
        btnAddGuest.disabled = true;
        btnAddGuest.textContent = "Limite de Acompanhantes Atingido";
    }
}

/**
 * Coleta os dados dos acompanhantes de todos os campos dinâmicos.
 * @returns {Array<Object>} Lista de acompanhantes.
 */
function coletarDadosAcompanhantes() {
    const guests = [];
    const guestItems = listaAcompanhantes.querySelectorAll('.guest-item');

    guestItems.forEach(item => {
        const nameInput = item.querySelector('.guest-name');
        const parentescoInput = item.querySelector('.guest-parentesco');

        if (nameInput.value && parentescoInput.value) {
            guests.push({
                nome: nameInput.value.trim(),
                parentesco: parentescoInput.value.trim()
            });
        }
    });

    return guests;
}

// =======================================================================
// 4. SUBMISSÃO DO FORMULÁRIO (ENVIO PARA O BACKEND PHP)
// =======================================================================

/**
 * Manipula o envio do formulário, coleta todos os dados e envia ao PHP.
 * @param {Event} event 
 */
async function handleSubmit(event) {
    event.preventDefault();

    // Revalida a regra de admissão antes de enviar
    if (!verificarAdmissao()) {
        alert("Por favor, verifique a data de admissão. É necessário 1 ano de casa.");
        return;
    }

    // Cria o objeto FormData para enviar dados no formato que o PHP espera
    const formData = new FormData();
    
    // 4.1. Coleta dados do funcionário
    formData.append('nome', document.getElementById('nome').value);
    formData.append('empresa', empresaSelect.value);
    formData.append('nascimento', document.getElementById('nascimento').value);
    formData.append('admissao', admissaoInput.value);
    
    // Setor: Pega o valor real, ou 'N/A' se o campo estava oculto
    formData.append('setor', setorSelect.classList.contains('hidden-default') ? 'N/A' : setorSelect.value);

    // Data do benefício: Só coleta se o campo estiver visível
    if (!beneficioDiv.classList.contains('hidden-default')) {
        formData.append('data_beneficio', document.getElementById('data-beneficio').value);
    } else {
        formData.append('data_beneficio', '');
    }

    // 4.2. Coleta dados dos acompanhantes e os converte para JSON string
    const acompanhantes = coletarDadosAcompanhantes();
    formData.append('acompanhantes', JSON.stringify(acompanhantes));


    // 4.3. Envia os dados via Fetch API
    try {
        btnEnviar.disabled = true;
        btnEnviar.textContent = "Enviando...";
        
        const response = await fetch('processa_cadastro.php', {
            method: 'POST',
            body: formData // Envia o objeto FormData
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`✅ Sucesso! ${result.message}`);
            hospedeForm.reset(); // Limpa o formulário após o sucesso
            // Restaura o estado inicial do frontend
            window.location.reload(); 
        } else {
            alert(`❌ Erro ao enviar: ${result.message}`);
        }

    } catch (error) {
        alert("Ocorreu um erro de conexão. Tente novamente mais tarde.");
        console.error('Erro na submissão:', error);
    } finally {
        btnEnviar.disabled = false;
        btnEnviar.textContent = "Enviar Inscrição";
    }
}


// =======================================================================
// 5. INICIALIZAÇÃO (Event Listeners)
// =======================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 5.1. Evento para o filtro de Setor
    empresaSelect.addEventListener('change', atualizarSetores);
    
    // 5.2. Evento para a validação de 1 ano
    admissaoInput.addEventListener('change', verificarAdmissao);
    
    // 5.3. Evento para adicionar acompanhantes
    btnAddGuest.addEventListener('click', adicionarAcompanhante);

    // 5.4. Evento de submissão do formulário
    hospedeForm.addEventListener('submit', handleSubmit);

    // Garante que o estado inicial (oculto) seja aplicado no carregamento
    verificarAdmissao();
    atualizarSetores();
});

// ... (Código anterior de configuração e referências DOM) ...

// NOVAS REFERÊNCIAS DOM
const pageRegras = document.getElementById("page-regras");
const pageCadastro = document.getElementById("page-cadastro");
const aceiteRegras = document.getElementById("aceite-regras");
const btnAvancar = document.getElementById("btn-avancar-cadastro");


// =======================================================================
// 6. LÓGICA DE NAVEGAÇÃO ENTRE PÁGINAS
// =======================================================================

/**
 * Habilita o botão 'Avançar' se o checkbox for marcado.
 */
function checkAceite() {
    btnAvancar.disabled = !aceiteRegras.checked;
    if (aceiteRegras.checked) {
        btnAvancar.textContent = "Avançar para o Cadastro";
    } else {
        btnAvancar.textContent = "Aceite as regras para continuar";
    }
}

/**
 * Troca da página de Regras para a página de Cadastro.
 */
function avancarParaCadastro() {
    if (aceiteRegras.checked) {
        pageRegras.classList.add("hidden-default");
        pageCadastro.classList.remove("hidden-default");
        
        // Garante que o estado inicial do formulário seja carregado
        verificarAdmissao();
        atualizarSetores();
    } else {
        alert("Você deve aceitar as regras para prosseguir com a inscrição.");
    }
}


// =======================================================================
// 7. ATUALIZAÇÃO DA INICIALIZAÇÃO (Event Listeners)
// =======================================================================

document.addEventListener('DOMContentLoaded', () => {
    // ... (Outros event listeners) ...
    
    // NOVOS EVENT LISTENERS PARA A PÁGINA DE REGRAS
    aceiteRegras.addEventListener('change', checkAceite);
    btnAvancar.addEventListener('click', avancarParaCadastro);
    
    // Garante o estado inicial (botão desabilitado)
    checkAceite(); 
    
    // Garante que o estado inicial do formulário seja aplicado, 
    // mesmo que ele esteja oculto inicialmente.
    // (Pode ser removido daqui e colocado apenas no 'avancarParaCadastro' se preferir)
    // verificarAdmissao(); 
    // atualizarSetores();
});