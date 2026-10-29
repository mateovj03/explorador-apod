dayjs.locale("es");
console.log(dayjs().format("D [de] MMMM [de] YYYY"));


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