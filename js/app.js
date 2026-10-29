dayjs.locale("es");

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
       
        if (Array.isArray(datos)) {
            apodActual = datos[0]; 
        } else {
            apodActual = datos;    
        }

       
        fechaActualId = apodActual.date;

       
        const fechaEspanol = dayjs(fechaActualId).format("D [de] MMMM [de] YYYY");

        
        let enlaceVideoHTML = "";
        
        if (apodActual.media_type === "video") {
            
            enlaceVideoHTML = `<p><a href="${apodActual.permalink}" target="_blank" class="btn-video">📺 Ver el video en NASA</a></p>`;
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

       
        if (dayjs(fechaActualId).isSame(dayjs(), "day") || dayjs(fechaActualId).isAfter(dayjs(), "day")) {
            btnSiguiente.disabled = true;
        } else {
            btnSiguiente.disabled = false;
        }

    } catch (error) {
       
        contenedorApod.innerHTML = `<p class="error">⚠️ Error: ${error.message}</p>`;
    }
}