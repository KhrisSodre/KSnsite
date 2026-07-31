"use strict";

document.addEventListener("DOMContentLoaded", () => {
    prepararBotoesDeCopia();
});

function prepararBotoesDeCopia() {
    const botoes = document.querySelectorAll(".copy-wrapper a");

    botoes.forEach((botao) => {
        botao.addEventListener("keydown", (evento) => {
            if (evento.key === "Enter" || evento.key === " ") {
                evento.preventDefault();

                const riotId = botao.dataset.copy;

                if (riotId) {
                    copiarRiotID(botao, riotId);
                }
            }
        });
    });
}

async function copiarRiotID(elemento, riotId) {
    const texto =
        riotId ||
        elemento?.dataset.copy ||
        elemento?.textContent?.trim();

    if (!texto) {
        console.warn("Nenhum Riot ID foi encontrado para copiar.");
        return;
    }

    const copiado = await copiarParaAreaDeTransferencia(texto);

    if (copiado) {
        mostrarNotificacao(elemento, texto);
    }
}

async function copiarParaAreaDeTransferencia(texto) {
    try {
        await navigator.clipboard.writeText(texto);
        return true;
    } catch (erro) {
        console.warn(
            "Clipboard API indisponível. Usando método alternativo.",
            erro
        );

        return copiarComFallback(texto);
    }
}

function copiarComFallback(texto) {
    const campo = document.createElement("textarea");

    campo.value = texto;
    campo.setAttribute("readonly", "");

    campo.style.position = "fixed";
    campo.style.top = "0";
    campo.style.left = "0";
    campo.style.opacity = "0";
    campo.style.pointerEvents = "none";

    document.body.appendChild(campo);

    campo.focus();
    campo.select();
    campo.setSelectionRange(0, campo.value.length);

    const resultado = document.execCommand("copy");

    campo.remove();

    return resultado;
}

function mostrarNotificacao(elemento, riotId) {
    const wrapper = elemento.closest(".copy-wrapper");

    if (!wrapper) {
        return;
    }

    const notificacaoAnterior = wrapper.querySelector(".copy-notif");

    if (notificacaoAnterior) {
        notificacaoAnterior.remove();
    }

    const notificacao = document.createElement("div");

    notificacao.className = "copy-notif";

    notificacao.innerHTML = `
        <div class="copy-content">
            <i class="fa-solid fa-check"></i>

            <div class="copy-text">
                <strong>Riot ID copiado!</strong>
                <span>${riotId}</span>
            </div>
        </div>
    `;

    wrapper.appendChild(notificacao);

    window.setTimeout(() => {
        notificacao.remove();
    }, 2200);
}