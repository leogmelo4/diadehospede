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

let contador = 0;
const MAX = 3;

const admissao = document.getElementById("admissao");
const erro = document.getElementById("erro-admissao");
const lista = document.getElementById("lista-acompanhantes");
const btnAdd = document.getElementById("btn-add-guest");
const form = document.getElementById("hospedeForm");

function verificarAdmissao() {
  if (!admissao.value) return;

  const data = new Date(admissao.value);
  const limite = new Date(data);
  limite.setFullYear(data.getFullYear() + 1);

  if (new Date() < limite) {
    erro.classList.remove("hidden-default");
    return false;
  }

  erro.classList.add("hidden-default");
  return true;
}

admissao.addEventListener("change", verificarAdmissao);

btnAdd.addEventListener("click", () => {
  if (contador >= MAX) return;

  contador++;
  lista.insertAdjacentHTML("beforeend", `
    <div class="guest-item">
      <input type="text" placeholder="Nome acompanhante" required>
      <input type="text" placeholder="Parentesco" required>
    </div>
  `);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!verificarAdmissao()) return;

  // aqui entraria o fetch pro PHP
  window.location.href = "confirmacao.html";
});
