let contador = 0;
const MAX = 3;

const lista = document.getElementById("lista-acompanhantes");
const btnAdd = document.getElementById("btn-add-guest");
const admissao = document.getElementById("admissao");
const erro = document.getElementById("erro-admissao");
const form = document.getElementById("hospedeForm");

// ✅ Só roda se existir campo de admissão (página de inscrição)
if (admissao && erro) {
  admissao.addEventListener("change", () => {
    const data = new Date(admissao.value);
    const limite = new Date(data);
    limite.setFullYear(data.getFullYear() + 1);

    if (new Date() < limite) {
      erro.classList.remove("hidden-default");
    } else {
      erro.classList.add("hidden-default");
    }
  });
}

// ✅ Só roda se existir botão de acompanhante
if (btnAdd && lista) {
  btnAdd.addEventListener("click", () => {
    if (contador >= MAX) return;

    contador++;

    lista.insertAdjacentHTML("beforeend", `
      <div class="guest-item">
        <input type="text" placeholder="Nome Acompanhante ${contador}" required>
        <input type="text" placeholder="Grau de Parentesco" required>
      </div>
    `);
  });
}

// ✅ Submissão
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    window.location.href = "confirmacao.html";
  });
}
