"use strict";

document.addEventListener("DOMContentLoaded", () => {
    prepararCardsDoSetup();
});

function prepararCardsDoSetup() {
    const cards = document.querySelectorAll(
        ".setup-card[onclick], .hardware-card[onclick]"
    );

    cards.forEach((card) => {
        card.addEventListener("keydown", (evento) => {
            if (evento.key === "Enter" || evento.key === " ") {
                evento.preventDefault();
                copiarTexto(card);
            }
        });
    });
}

async function copiarTexto(card) {
    if (!card) {
        return;
    }

    const paragrafo = card.querySelector("p");
    const valor = card.querySelector(".card-value");
    const titulo = card.querySelector("h3");

    const texto =
        card.dataset.copy ||
        paragrafo?.textContent?.trim() ||
        valor?.textContent?.trim() ||
        titulo?.textContent?.trim();

    if (!texto) {
        console.warn("Nenhum texto foi encontrado neste card.");
        return;
    }

    const copiado = await copiarParaAreaDeTransferencia(texto);

    if (copiado) {
        mostrarConfirmacaoCopia(card, texto);
    }
}

async function copiarParaAreaDeTransferencia(texto) {
    try {
        await navigator.clipboard.writeText(texto);
        return true;
    } catch {
        return copiarComFallback(texto);
    }
}

function copiarComFallback(texto) {
    const campo = document.createElement("textarea");

    campo.value = texto;
    campo.setAttribute("readonly", "");
    campo.style.position = "fixed";
    campo.style.opacity = "0";

    document.body.appendChild(campo);
    campo.select();

    const resultado = document.execCommand("copy");
    campo.remove();

    return resultado;
}

function mostrarConfirmacaoCopia(card, texto) {
    document.querySelectorAll(".copy-mini").forEach((elemento) => {
        elemento.remove();
    });

    const aviso = document.createElement("span");
    aviso.className = "copy-mini";
    aviso.textContent = "Copiado!";

    card.appendChild(aviso);
    card.classList.add("copied");

    window.setTimeout(() => {
        aviso.classList.add("hide");
        card.classList.remove("copied");
    }, 1300);

    window.setTimeout(() => {
        aviso.remove();
    }, 1700);

    console.info(`Copiado: ${texto}`);
}