dayjs.locale("es");

// AGREGADO: referencias al DOM que usa mostrarImagen
const imagen = document.getElementById("imagenApod");
const enlaceVideo = document.getElementById("enlaceVideo");

// ---------- Mostrar la imagen de la APOD ----------
function mostrarImagen(apod) {
    // hdurl trae la imagen (el campo url NO es la imagen)
    imagen.src = apod.hdurl;

    // El alt es igual al título
    imagen.alt = apod.title;

    // Si es video, hdurl trae una vista previa: se muestra igual
    // y aparece el enlace para ver el video en la NASA
    if (apod.media_type === "video") {
        enlaceVideo.href = apod.permalink;
        enlaceVideo.hidden = false;
    } else {
        enlaceVideo.hidden = true;
    }
}

//funcionalidad 2.
const fechaInput = document.getElementById("fechaInput");
const btnBuscar = document.getElementById("btn-buscar");
const mensaje = document.getElementById("mensaje");

const PRIMERA_APOD = "1995-06-16";

fechaInput.max = dayjs().format("YYYY-MM-DD");

function mostrarMensaje(texto) {
  mensaje.textContent = texto;
  mensaje.hidden = false;
}

function limpiarMensaje() {
  mensaje.textContent = "";
  mensaje.hidden = true;
}

function validarFecha(fecha) {
  if (!fecha) {
    return "Por favor elige una fecha.";
  }
  if (dayjs(fecha).isAfter(dayjs(), "day")) {
    return "Esa fecha es futura: la NASA aún no tiene esa APOD.";
  }
  if (dayjs(fecha).isBefore(dayjs(PRIMERA_APOD), "day")) {
    return "La primera APOD es del 16 de junio de 1995. Elige una fecha posterior.";
  }
  return null;
}

function buscarPorFecha() {
  const fecha = fechaInput.value;
  const error = validarFecha(fecha);

  if (error) {
    mostrarMensaje(error);
    return;
  }

  limpiarMensaje();
  cargarAPOD(dayjs(fecha).format("YYMMDD"));
}

btnBuscar.addEventListener("click", buscarPorFecha);

// ---------- Obtener y mostrar la APOD ----------
let apodActual = null;
let fechaActualId = dayjs().format("YYYY-MM-DD");

async function obtenerApod(url) {
    const contenedorApod = document.querySelector("#contenedor-apod");
    const btnSiguiente = document.querySelector("#btn-siguiente");

    try {
        contenedorApod.innerHTML = "<p>Cargando...</p>";

        const respuesta = await fetch(url);

        if (!respuesta.ok) {
            throw new Error("No hay APOD para esa fecha.");
        }

        const datos = await respuesta.json();
        apodActual = Array.isArray(datos) ? datos[0] : datos;
        fechaActualId = apodActual.date;

        const fechaEspanol = dayjs(fechaActualId).format("D [de] MMMM [de] YYYY");
        let enlaceVideoHTML = "";

        if (apodActual.media_type === "video") {
            enlaceVideoHTML = `<p><a href="${apodActual.permalink}" target="_blank" rel="noopener noreferrer" class="btn-video">📺 Ver el video en NASA</a></p>`;
        }

        contenedorApod.innerHTML = `
            <h2>${apodActual.title}</h2>
            <p class="fecha">${fechaEspanol}</p>
            <div class="media-container">
                <img src="${apodActual.hdurl}" alt="${apodActual.title}" id="apod-img">
            </div>
            ${enlaceVideoHTML}
            <div class="explicacion">${apodActual.explanation}</div>
        `;

        btnSiguiente.disabled =
            dayjs(fechaActualId).isSame(dayjs(), "day") ||
            dayjs(fechaActualId).isAfter(dayjs(), "day");
    } catch (error) {
        contenedorApod.innerHTML = `<p class="error">⚠️ Error: ${error.message}</p>`;
    }
}

//favoritos

const CLAVE_FAVORITOS = "apod-favoritos";
let favoritos = leerFavoritos();
const botonGuardarFavorito = document.querySelector("#btn-favorito");
const listaFavoritos = document.querySelector("#lista-favoritos");
const estadoFavoritos = document.querySelector("#estado-favoritos");

function leerFavoritos() {
    const favoritosGuardados = localStorage.getItem(CLAVE_FAVORITOS);

    if (favoritosGuardados === null) {
        return [];
    }

    try {
        return JSON.parse(favoritosGuardados);
    } catch (error) {
        console.warn("Dato dañado en favoritos; se inicia una lista vacía.", error);
        return [];
    }
}

function guardarFavoritos() {
    localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favoritos));
}

function mostrarFavoritos() {
    listaFavoritos.replaceChildren();

    if (favoritos.length === 0) {
        const vacio = document.createElement("li");
        vacio.textContent = "Aún no tienes APOD favoritas. Toca ❤️ en una imagen para guardarla aquí.";
        listaFavoritos.append(vacio);
        return;
    }

    for (let i = favoritos.length - 1; i >= 0; i--) {
        const favorito = favoritos[i];
        const elemento = document.createElement("li");
        const titulo = document.createElement("span");
        const quitar = document.createElement("button");

        titulo.textContent = `${favorito.title} — ${dayjs(favorito.date).format("D [de] MMMM [de] YYYY")}`;
        quitar.type = "button";
        quitar.className = "btn btn-outline-danger btn-sm ms-2";
        quitar.textContent = "Quitar";
        quitar.setAttribute("aria-label", `Quitar ${favorito.title} de favoritos`);
        quitar.addEventListener("click", function () {
            const nuevosFavoritos = favoritos.filter(
                function (apod) {
                    return apod.date !== favorito.date;
                }
            );
            favoritos = nuevosFavoritos;
            guardarFavoritos();
            mostrarFavoritos();
            actualizarBotonFavorito();
        });

        elemento.append(titulo, quitar);
        listaFavoritos.append(elemento);
    }
}

function actualizarBotonFavorito() {
    const guardado = apodActual !== null &&
        favoritos.some(function (favorito) {
            return favorito.date === apodActual.date;
        });

    botonGuardarFavorito.setAttribute("aria-pressed", String(guardado));
    if (guardado) {
        botonGuardarFavorito.setAttribute("aria-label", "Quitar APOD de favoritos");
    } else {
        botonGuardarFavorito.setAttribute("aria-label", "Guardar APOD en favoritos");
    }
}

botonGuardarFavorito.addEventListener("click", function () {
    if (!apodActual) {
        estadoFavoritos.textContent = "Espera a que cargue una APOD antes de guardarla.";
        return;
    }

    const yaEsFavorito = favoritos.some(function (favorito) {
        return favorito.date === apodActual.date;
    });
    let nuevosFavoritos;
    if (yaEsFavorito) {
        nuevosFavoritos = favoritos.filter(function (favorito) {
            return favorito.date !== apodActual.date;
        });
    } else {
        nuevosFavoritos = [];
        for (const favorito of favoritos) {
            nuevosFavoritos.push(favorito);
        }
        nuevosFavoritos.push(apodActual);
    }

    favoritos = nuevosFavoritos;
    guardarFavoritos();
    mostrarFavoritos();
    actualizarBotonFavorito();
});

mostrarFavoritos();
