"use strict";

/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const MUSIC_VOLUME = 0.15;

const MUSIC_STORAGE = {
    muted: "ksn_music_muted",
    playing: "ksn_music_playing",
    time: "ksn_music_time"
};

let musica = null;
let iconeMusica = null;
let barraMusica = null;
let statusMusica = null;

let tempoMusicaCarregado = false;
let retomadaMusicaConfigurada = false;

/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    iniciarMusica();
    iniciarCursor();
});

/* =========================================================
   MÚSICA
========================================================= */

function iniciarMusica() {
    musica = document.getElementById("musica");
    iconeMusica = document.getElementById("img-music");
    barraMusica = document.getElementById("music-progress-bar");
    statusMusica = document.getElementById("music-status");

    if (!musica) {
        return;
    }

    const estadoMutadoSalvo =
        localStorage.getItem(MUSIC_STORAGE.muted);

    const estadoTocandoSalvo =
        localStorage.getItem(MUSIC_STORAGE.playing);

    /*
     * Na primeira visita, começa mutada.
     */
    const estaMutada =
        estadoMutadoSalvo === null
            ? true
            : estadoMutadoSalvo === "true";

    const deveTocar =
        estadoTocandoSalvo === "true";

    musica.volume = MUSIC_VOLUME;
    musica.muted = estaMutada;

    atualizarIconeMusica();

    musica.addEventListener("loadedmetadata", () => {
        restaurarTempoMusica();
        atualizarBarraMusica();

        if (deveTocar && !musica.muted) {
            tentarTocarMusica();
        }
    });

    /*
     * Caso os metadados já estejam disponíveis.
     */
    if (musica.readyState >= 1) {
        restaurarTempoMusica();
        atualizarBarraMusica();

        if (deveTocar && !musica.muted) {
            tentarTocarMusica();
        }
    }

    musica.addEventListener("timeupdate", () => {
        atualizarBarraMusica();

        if (tempoMusicaCarregado) {
            salvarTempoMusica();
        }
    });

    musica.addEventListener("play", () => {
        localStorage.setItem(
            MUSIC_STORAGE.playing,
            "true"
        );

        atualizarIconeMusica();
    });

    musica.addEventListener("pause", () => {
        /*
         * Não salvamos playing=false aqui.
         * O navegador pausa o áudio ao trocar de página.
         */
        atualizarIconeMusica();
    });

    musica.addEventListener("volumechange", () => {
        localStorage.setItem(
            MUSIC_STORAGE.muted,
            String(musica.muted)
        );

        atualizarIconeMusica();
    });

    /*
     * Salva o estado antes de sair da página.
     */
    window.addEventListener("pagehide", salvarEstadoMusica);

    window.addEventListener(
        "beforeunload",
        salvarEstadoMusica
    );

    document.addEventListener(
        "visibilitychange",
        () => {
            if (document.hidden) {
                salvarEstadoMusica();
            }
        }
    );
}

/* =========================================================
   BOTÃO DA MÚSICA
========================================================= */

function toggleMusic() {
    if (!musica) {
        return;
    }

    /*
     * Ativar música.
     */
    if (musica.muted) {
        musica.muted = false;
        musica.volume = MUSIC_VOLUME;

        localStorage.setItem(
            MUSIC_STORAGE.muted,
            "false"
        );

        localStorage.setItem(
            MUSIC_STORAGE.playing,
            "true"
        );

        tentarTocarMusica();
        atualizarIconeMusica();

        return;
    }

    /*
     * Mutar música.
     */
    musica.muted = true;

    localStorage.setItem(
        MUSIC_STORAGE.muted,
        "true"
    );

    localStorage.setItem(
        MUSIC_STORAGE.playing,
        "true"
    );

    salvarTempoMusica();
    atualizarIconeMusica();
}

/* =========================================================
   REPRODUÇÃO DA MÚSICA
========================================================= */

function tentarTocarMusica() {
    if (!musica || musica.muted) {
        return;
    }

    musica.volume = MUSIC_VOLUME;

    const promessa = musica.play();

    if (!promessa) {
        return;
    }

    promessa
        .then(() => {
            retomadaMusicaConfigurada = false;
            atualizarIconeMusica();
        })
        .catch(() => {
            configurarRetomadaMusica();
        });
}

function configurarRetomadaMusica() {
    if (retomadaMusicaConfigurada) {
        return;
    }

    retomadaMusicaConfigurada = true;

    const eventos = [
        "pointerdown",
        "keydown",
        "touchstart"
    ];

    function tentarRetomar() {
        if (!musica || musica.muted) {
            removerEventos();
            return;
        }

        musica.play()
            .then(() => {
                removerEventos();
                atualizarIconeMusica();
            })
            .catch(() => {
                /*
                 * Mantém os eventos caso o navegador
                 * ainda bloqueie o áudio.
                 */
            });
    }

    function removerEventos() {
        eventos.forEach((evento) => {
            document.removeEventListener(
                evento,
                tentarRetomar
            );
        });

        retomadaMusicaConfigurada = false;
    }

    eventos.forEach((evento) => {
        document.addEventListener(
            evento,
            tentarRetomar
        );
    });
}

/* =========================================================
   TEMPO DA MÚSICA
========================================================= */

function restaurarTempoMusica() {
    if (!musica) {
        return;
    }

    if (
        !Number.isFinite(musica.duration) ||
        musica.duration <= 0
    ) {
        return;
    }

    const tempoSalvo = Number(
        localStorage.getItem(MUSIC_STORAGE.time)
    );

    if (
        !Number.isFinite(tempoSalvo) ||
        tempoSalvo < 0
    ) {
        tempoMusicaCarregado = true;
        return;
    }

    const tempoValido =
        tempoSalvo % musica.duration;

    musica.currentTime = tempoValido;
    tempoMusicaCarregado = true;
}

function salvarTempoMusica() {
    if (
        !musica ||
        !tempoMusicaCarregado ||
        !Number.isFinite(musica.currentTime)
    ) {
        return;
    }

    localStorage.setItem(
        MUSIC_STORAGE.time,
        String(musica.currentTime)
    );
}

function salvarEstadoMusica() {
    if (!musica) {
        return;
    }

    localStorage.setItem(
        MUSIC_STORAGE.muted,
        String(musica.muted)
    );

    /*
     * Mantém a intenção de tocar mesmo que o navegador
     * pause automaticamente ao sair da página.
     */
    const deveContinuarTocando =
        localStorage.getItem(
            MUSIC_STORAGE.playing
        ) === "true";

    localStorage.setItem(
        MUSIC_STORAGE.playing,
        String(deveContinuarTocando)
    );

    salvarTempoMusica();
}

/* =========================================================
   ÍCONE DA MÚSICA
========================================================= */

function atualizarIconeMusica() {
    if (!musica || !iconeMusica) {
        return;
    }

    const estaMutada = musica.muted;

    iconeMusica.classList.toggle(
        "fa-volume-xmark",
        estaMutada
    );

    iconeMusica.classList.toggle(
        "fa-volume-high",
        !estaMutada
    );

    const botao =
        iconeMusica.closest("button");

    if (botao) {
        botao.setAttribute(
            "aria-label",
            estaMutada
                ? "Ativar música"
                : "Desativar música"
        );
    }

    if (statusMusica) {
        statusMusica.classList.toggle(
            "music-paused",
            estaMutada
        );
    }
}

/* =========================================================
   BARRA DE PROGRESSO
========================================================= */

function atualizarBarraMusica() {
    if (
        !musica ||
        !barraMusica ||
        !Number.isFinite(musica.duration) ||
        musica.duration <= 0
    ) {
        return;
    }

    const porcentagem =
        (musica.currentTime / musica.duration) * 100;

    barraMusica.style.width =
        `${porcentagem}%`;
}

/* =========================================================
   CURSOR PERSONALIZADO
========================================================= */

function iniciarCursor() {
    const cursor =
        document.querySelector(".cursor");

    if (!cursor) {
        return;
    }

    const possuiMouse =
        window.matchMedia(
            "(hover: hover) and (pointer: fine)"
        ).matches;

    if (!possuiMouse) {
        cursor.style.display = "none";
        return;
    }

    let mouseX = -200;
    let mouseY = -200;

    let cursorX = -200;
    let cursorY = -200;

    let cursorAtivo = false;
    let animationFrameId = null;

    const elementosInterativos = [
        "a",
        "button",
        "input",
        "textarea",
        "select",
        "label",
        "[role='button']",
        ".social-btn",
        ".setup-card",
        ".hardware-card",
        ".mira-card",
        ".arrow-btn"
    ].join(",");

    function moverCursorParaFora() {
        mouseX = -200;
        mouseY = -200;

        cursorX = -200;
        cursorY = -200;

        cursor.style.transform =
            "translate3d(-200px, -200px, 0) translate(-50%, -50%)";
    }

    function esconderCursor() {
        cursorAtivo = false;

        cursor.classList.add("cursor-hidden");
        cursor.classList.remove("cursor-hover");
        cursor.classList.remove("cursor-click");

        moverCursorParaFora();
    }

    function mostrarCursor() {
        if (cursorAtivo) {
            return;
        }

        cursorAtivo = true;
        cursor.classList.remove("cursor-hidden");
    }

    function animarCursor() {
        if (cursorAtivo) {
            cursorX +=
                (mouseX - cursorX) * 0.3;

            cursorY +=
                (mouseY - cursorY) * 0.3;

            cursor.style.transform =
                `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
        }

        animationFrameId =
            requestAnimationFrame(animarCursor);
    }

    document.addEventListener(
        "mousemove",
        (evento) => {
            const margem = 10;

            const estaNaBorda =
                evento.clientX <= margem ||
                evento.clientY <= margem ||
                evento.clientX >=
                    window.innerWidth - margem ||
                evento.clientY >=
                    window.innerHeight - margem;

            if (estaNaBorda) {
                esconderCursor();
                return;
            }

            /*
             * Ao voltar para a página, posiciona o cursor
             * diretamente no mouse. Evita rastro atravessando
             * a tela desde o canto.
             */
            if (!cursorAtivo) {
                cursorX = evento.clientX;
                cursorY = evento.clientY;

                cursor.style.transform =
                    `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
            }

            mouseX = evento.clientX;
            mouseY = evento.clientY;

            mostrarCursor();
        }
    );

    document.addEventListener(
        "mouseover",
        (evento) => {
            if (!(evento.target instanceof Element)) {
                return;
            }

            if (
                evento.target.closest(
                    "iframe, video"
                )
            ) {
                esconderCursor();
                return;
            }

            const interativo =
                evento.target.closest(
                    elementosInterativos
                );

            cursor.classList.toggle(
                "cursor-hover",
                Boolean(interativo)
            );
        }
    );

    document.addEventListener(
        "mouseout",
        (evento) => {
            /*
             * relatedTarget nulo significa que o mouse
             * saiu completamente da janela do navegador.
             */
            if (
                evento.relatedTarget === null &&
                evento.toElement === null
            ) {
                esconderCursor();
                return;
            }

            if (!(evento.target instanceof Element)) {
                return;
            }

            const destino = evento.relatedTarget;

            if (
                !(destino instanceof Element) ||
                !destino.closest(
                    elementosInterativos
                )
            ) {
                cursor.classList.remove(
                    "cursor-hover"
                );
            }
        }
    );

    document.addEventListener(
        "mousedown",
        () => {
            if (cursorAtivo) {
                cursor.classList.add(
                    "cursor-click"
                );
            }
        }
    );

    document.addEventListener(
        "mouseup",
        () => {
            cursor.classList.remove(
                "cursor-click"
            );
        }
    );

    document.addEventListener(
        "mouseleave",
        esconderCursor
    );

    window.addEventListener(
        "blur",
        esconderCursor
    );

    window.addEventListener(
        "focus",
        esconderCursor
    );

    window.addEventListener(
        "pagehide",
        esconderCursor
    );

    document.addEventListener(
        "visibilitychange",
        () => {
            if (document.hidden) {
                esconderCursor();
            }
        }
    );

    /*
     * Começa escondido.
     * Só aparece no primeiro movimento real do mouse.
     */
    esconderCursor();
    animarCursor();

    window.addEventListener(
        "pagehide",
        () => {
            if (animationFrameId) {
                cancelAnimationFrame(
                    animationFrameId
                );
            }
        }
    );
}