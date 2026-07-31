"use strict";

let ultimoCardMiraSelecionado = null;

document.addEventListener("DOMContentLoaded", () => {
    iniciarCardsDeMira();
    iniciarModalDeMira();
});

function iniciarCardsDeMira() {
    const cards = document.querySelectorAll(".mira-card");

    cards.forEach((card) => {
        card.addEventListener("click", () => {
            selecionarMira(card);
        });

        card.addEventListener("keydown", (evento) => {
            if (evento.key === "Enter" || evento.key === " ") {
                evento.preventDefault();
                selecionarMira(card);
            }
        });
    });
}

async function selecionarMira(card) {
    if (!card) {
        return;
    }

    ultimoCardMiraSelecionado = card;

    const codigoMira = card.dataset.copy;
    const imagemMira = card.dataset.image;

    if (codigoMira) {
        const copiado = await copiarCodigoMira(codigoMira);

        if (copiado) {
            mostrarConfirmacaoMira(card);
        }
    }

    if (imagemMira) {
        abrirModalMira(imagemMira);
    }
}

async function copiarCodigoMira(codigo) {
    try {
        await navigator.clipboard.writeText(codigo);
        return true;
    } catch {
        return copiarCodigoComFallback(codigo);
    }
}

function copiarCodigoComFallback(codigo) {
    const campo = document.createElement("textarea");

    campo.value = codigo;
    campo.setAttribute("readonly", "");
    campo.style.position = "fixed";
    campo.style.opacity = "0";

    document.body.appendChild(campo);
    campo.select();

    const resultado = document.execCommand("copy");
    campo.remove();

    return resultado;
}

function mostrarConfirmacaoMira(card) {
    document.querySelectorAll(".copy-mini").forEach((elemento) => {
        elemento.remove();
    });

    const aviso = document.createElement("span");
    aviso.className = "copy-mini";
    aviso.textContent = "Código copiado!";

    card.appendChild(aviso);
    card.classList.add("copied");

    window.setTimeout(() => {
        aviso.classList.add("hide");
        card.classList.remove("copied");
    }, 1400);

    window.setTimeout(() => {
        aviso.remove();
    }, 1800);
}

function abrirModalMira(imagemSrc) {
    const modal = document.getElementById("mira-modal");
    const imagem = document.getElementById("mira-modal-target");

    if (!modal || !imagem) {
        console.warn("O modal da mira não foi encontrado.");
        return;
    }

    imagem.src = imagemSrc;
    modal.classList.add("active");
    document.body.classList.add("modal-open");

    const botaoFechar = modal.querySelector(".mira-modal-close");
    botaoFechar?.focus();
}

function fecharModalMira() {
    const modal = document.getElementById("mira-modal");
    const imagem = document.getElementById("mira-modal-target");

    if (!modal) {
        return;
    }

    modal.classList.remove("active");
    document.body.classList.remove("modal-open");

    window.setTimeout(() => {
        if (imagem) {
            imagem.src = "";
        }
    }, 250);

    ultimoCardMiraSelecionado?.focus();
}

function iniciarModalDeMira() {
    const modal = document.getElementById("mira-modal");

    if (!modal) {
        return;
    }

    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) {
            fecharModalMira();
        }
    });

    document.addEventListener("keydown", (evento) => {
        if (
            evento.key === "Escape" &&
            modal.classList.contains("active")
        ) {
            fecharModalMira();
        }
    });
}