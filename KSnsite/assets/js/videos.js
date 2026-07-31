"use strict";

let carrosselAtivo = null;

document.addEventListener("DOMContentLoaded", () => {
    iniciarCarrosseis();
});

function iniciarCarrosseis() {
    const carrosseis = document.querySelectorAll(".carousel-grid");

    carrosseis.forEach((carrossel) => {
        configurarCarrossel(carrossel);
        atualizarTimeline(carrossel);
    });

    window.addEventListener("resize", () => {
        carrosseis.forEach(atualizarTimeline);
    });

    document.addEventListener("keydown", controlarCarrosselPeloTeclado);
}

function configurarCarrossel(carrossel) {
    let arrastando = false;
    let posicaoInicialX = 0;
    let scrollInicial = 0;
    let movimentoTotal = 0;

    carrossel.addEventListener("mouseenter", () => {
        carrosselAtivo = carrossel;
    });

    carrossel.addEventListener("focusin", () => {
        carrosselAtivo = carrossel;
    });

    carrossel.addEventListener("scroll", () => {
        atualizarTimeline(carrossel);
        atualizarSetas(carrossel);
    });

    carrossel.addEventListener("pointerdown", (evento) => {
        if (evento.button !== 0) {
            return;
        }

        arrastando = true;
        movimentoTotal = 0;
        posicaoInicialX = evento.clientX;
        scrollInicial = carrossel.scrollLeft;

        carrossel.classList.add("dragging");
        carrossel.setPointerCapture(evento.pointerId);
    });

    carrossel.addEventListener("pointermove", (evento) => {
        if (!arrastando) {
            return;
        }

        const deslocamento = evento.clientX - posicaoInicialX;
        movimentoTotal = Math.max(movimentoTotal, Math.abs(deslocamento));

        carrossel.scrollLeft = scrollInicial - deslocamento;
    });

    carrossel.addEventListener("pointerup", (evento) => {
        encerrarArraste(carrossel, evento.pointerId);
    });

    carrossel.addEventListener("pointercancel", (evento) => {
        encerrarArraste(carrossel, evento.pointerId);
    });

    carrossel.addEventListener(
        "click",
        (evento) => {
            if (movimentoTotal > 8) {
                evento.preventDefault();
                evento.stopPropagation();
            }
        },
        true
    );

    prepararOverlaysDeVideo(carrossel);
    atualizarSetas(carrossel);
}

function encerrarArraste(carrossel, pointerId) {
    carrossel.classList.remove("dragging");

    if (carrossel.hasPointerCapture(pointerId)) {
        carrossel.releasePointerCapture(pointerId);
    }
}

function prepararOverlaysDeVideo(carrossel) {
    const overlays = carrossel.querySelectorAll(".video-overlay");

    overlays.forEach((overlay) => {
        overlay.setAttribute(
            "title",
            "Clique para interagir com o vídeo"
        );

        overlay.addEventListener("click", () => {
            overlay.classList.add("video-overlay-disabled");

            window.setTimeout(() => {
                overlay.classList.remove("video-overlay-disabled");
            }, 5000);
        });
    });
}

function scrollClick(botao, direcao) {
    const wrapper = botao?.closest(".carousel-wrapper");
    const carrossel = wrapper?.querySelector(".carousel-grid");

    if (!carrossel) {
        return;
    }

    carrosselAtivo = carrossel;

    const distancia = calcularDistanciaDoCard(carrossel);

    carrossel.scrollBy({
        left: distancia * direcao,
        behavior: "smooth"
    });
}

function calcularDistanciaDoCard(carrossel) {
    const primeiroCard = carrossel.querySelector(".setup-card");

    if (!primeiroCard) {
        return carrossel.clientWidth * 0.8;
    }

    const estilos = window.getComputedStyle(carrossel);
    const gap = Number.parseFloat(estilos.columnGap || estilos.gap) || 0;

    return primeiroCard.getBoundingClientRect().width + gap;
}

function atualizarTimeline(carrossel) {
    const wrapper = carrossel.closest(".setup-group");
    const progresso = wrapper?.querySelector(".timeline-progress");

    if (!progresso) {
        return;
    }

    const scrollMaximo = carrossel.scrollWidth - carrossel.clientWidth;

    if (scrollMaximo <= 0) {
        progresso.style.width = "100%";
        progresso.style.transform = "translateX(0)";
        return;
    }

    const larguraVisivel =
        (carrossel.clientWidth / carrossel.scrollWidth) * 100;

    const larguraLimitada = Math.max(12, Math.min(larguraVisivel, 100));

    const progressoScroll =
        Math.min(Math.max(carrossel.scrollLeft / scrollMaximo, 0), 1);

    const deslocamentoMaximo = 100 - larguraLimitada;
    const deslocamento = progressoScroll * deslocamentoMaximo;

    progresso.style.width = `${larguraLimitada}%`;
    progresso.style.transform = `translateX(${deslocamento}%)`;
}

function atualizarSetas(carrossel) {
    const wrapper = carrossel.closest(".carousel-wrapper");

    if (!wrapper) {
        return;
    }

    const botaoAnterior = wrapper.querySelector(".arrow-btn.prev");
    const botaoProximo = wrapper.querySelector(".arrow-btn.next");

    const scrollMaximo = carrossel.scrollWidth - carrossel.clientWidth;
    const tolerancia = 3;

    if (botaoAnterior) {
        botaoAnterior.disabled = carrossel.scrollLeft <= tolerancia;
    }

    if (botaoProximo) {
        botaoProximo.disabled =
            carrossel.scrollLeft >= scrollMaximo - tolerancia;
    }
}

function controlarCarrosselPeloTeclado(evento) {
    if (!carrosselAtivo) {
        return;
    }

    if (evento.key !== "ArrowLeft" && evento.key !== "ArrowRight") {
        return;
    }

    const elementoAtivo = document.activeElement;
    const tag = elementoAtivo?.tagName?.toLowerCase();

    if (tag === "input" || tag === "textarea") {
        return;
    }

    evento.preventDefault();

    const direcao = evento.key === "ArrowRight" ? 1 : -1;
    const distancia = calcularDistanciaDoCard(carrosselAtivo);

    carrosselAtivo.scrollBy({
        left: distancia * direcao,
        behavior: "smooth"
    });
}