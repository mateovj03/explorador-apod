dayjs.locale("es");
console.log(dayjs().format("D [de] MMMM [de] YYYY"));


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

//funcionalidad 2
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