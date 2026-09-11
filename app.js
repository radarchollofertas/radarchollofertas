let productosGlobales = [];


function obtenerUrlImagen(producto) {

    const foto = producto.foto || "";
    const separador = foto.includes("?") ? "&" : "?";
    const version = producto.message_id || "1";

    return `${foto}${separador}v=${version}`;
}


/* =========================================================
   CARGAR PRODUCTOS
========================================================= */

async function cargarProductos() {

    const contenedor = document.getElementById("productos");

    try {

        const respuesta = await fetch(
            "datos.json?t=" + Date.now()
        );

        productosGlobales = await respuesta.json();

        cargarTiendas();
        const parametros = new URLSearchParams(window.location.search);
        const idEnlaceNuevo = parametros.get("oferta");
        const idEnlaceAntiguo = window.location.hash
            ? decodeURIComponent(window.location.hash.substring(1))
            : "";
        const idCompartido = idEnlaceNuevo || idEnlaceAntiguo;

        const productoCompartido =
            productosGlobales.find(
                producto => producto.id === idCompartido
            );

        if (idCompartido && productoCompartido) {

            document.body.classList.add("vista-compartida");
            document.querySelector(".buscador-filtros").style.display = "none";
            document.querySelector(".destacadas h2").style.display = "none";
            document.getElementById("verTodasOfertas").hidden = false;

            mostrarProductos([productoCompartido]);

        } else {

            aplicarFiltros();

        }

    } catch (error) {

        console.error(error);

        contenedor.innerHTML =
            "<p>No se pudieron cargar las ofertas.</p>";
    }
}


/* =========================================================
   CARGAR TIENDAS EN EL FILTRO
========================================================= */

function cargarTiendas() {

    const selector =
        document.getElementById("filtroTienda");

    selector.innerHTML =
        '<option value="TODAS">Todas las tiendas</option>';

    const tiendas = new Set();


    productosGlobales.forEach(producto => {

        (producto.tiendas || []).forEach(tienda => {

            if (tienda.nombre) {
                tiendas.add(tienda.nombre);
            }

        });

    });


    [...tiendas]
        .sort()
        .forEach(nombre => {

            const opcion =
                document.createElement("option");

            opcion.value = nombre;
            opcion.textContent = nombre;

            selector.appendChild(opcion);

        });
}


/* =========================================================
   CREAR BLOQUES DE TIENDAS
========================================================= */

function crearTiendas(producto) {

    const tiendas = producto.tiendas || [];


    if (tiendas.length === 0) {

        return `
            <div class="bloque-tienda">

                <div class="fila-tienda">

                    <span class="nombre-tienda">
                        Ver publicación
                    </span>

                    <a
                        class="boton-oferta"
                        href="https://t.me/radarchollofertas/${producto.message_id}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        VER OFERTA ↗
                    </a>

                </div>

            </div>
        `;
    }


    return tiendas.map(tienda => {

        const enlace =
            tienda.enlace_afiliado ||
            tienda.enlace ||
            "#";


        const valoracion =
            tienda.valoracion ?? "-";


        const opiniones =
            tienda.opiniones ?? 0;


        const gastos = tienda.gastos_envio;
        let envio = "🚚";

        if (gastos !== null && gastos !== undefined && gastos !== "") {

            const numero = Number(
                String(gastos).replace(",", ".")
            );

            if (Number.isFinite(numero)) {
                envio = numero === 0
                    ? "🚚 Gratis"
                    : `🚚 ${numero.toFixed(2).replace(".", ",")} €`;
            }
        }


        return `
            <div class="bloque-tienda">

                <div class="fila-tienda">

                    <span class="nombre-tienda">
                        ${tienda.nombre}
                    </span>

                    <a
                        class="boton-oferta"
                        href="${enlace}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        VER OFERTA ↗
                    </a>

                </div>


                <div class="datos-tienda">

                    ⭐ ${valoracion}/5
                    💬 ${opiniones} opiniones
                    <span class="envio-tienda">${envio}</span>

                </div>

            </div>
        `;

    }).join("");
}


/* =========================================================
   MOSTRAR PRODUCTOS
========================================================= */

function mostrarProductos(productos) {

    const contenedor =
        document.getElementById("productos");


    contenedor.innerHTML = "";


    if (productos.length === 0) {

        if (productosGlobales.length === 0) {

            document.body.classList.add("modo-lanzamiento");
            document.querySelector(".buscador-filtros").style.display = "none";
            document.querySelector(".destacadas h2").style.display = "none";

            contenedor.innerHTML = `
                <section class="estado-lanzamiento" aria-labelledby="titulo-lanzamiento">
                    <div class="estado-lanzamiento-icono" aria-hidden="true">📡</div>
                    <p class="estado-lanzamiento-etiqueta">PRÓXIMAMENTE</p>
                    <h2 id="titulo-lanzamiento">Estamos preparando las primeras ofertas</h2>
                    <p class="estado-lanzamiento-texto">
                        Radar ChollOfertas publicará únicamente ofertas reales obtenidas
                        mediante conexiones oficiales con tiendas y programas de afiliación.
                        El catálogo estará disponible cuando podamos comprobar correctamente
                        el precio, la disponibilidad y el enlace de compra.
                    </p>
                    <div class="estado-lanzamiento-garantias">
                        <span>✓ Fuentes autorizadas</span>
                        <span>✓ Precios y disponibilidad comprobados</span>
                        <span>✓ Transparencia en afiliación</span>
                    </div>
                    <div class="estado-lanzamiento-enlaces">
                        <a href="https://t.me/radarchollofertas" target="_blank" rel="noopener noreferrer">
                            Seguir en Telegram
                        </a>
                        <a class="secundario" href="contacto.html">Contactar</a>
                    </div>
                </section>
            `;

        } else {

            contenedor.innerHTML =
                "<p>No hay ofertas que coincidan con la búsqueda.</p>";
        }

        return;
    }


    productos.forEach(producto => {

        const tarjeta =
            document.createElement("article");


        tarjeta.className = "tarjeta";

        const idOferta = producto.id;

        tarjeta.id = idOferta;


        /* -----------------------------------------
           TIPO DE PRODUCTO
        ----------------------------------------- */

        const tipo =
            (producto.tipo || "OFERTA")
                .toUpperCase();


        const claseTipo =
            tipo === "CHOLLO"
                ? "chollo"
                : "oferta";


        const textoTipo =
            tipo === "CHOLLO"
                ? "🔥 Buen chollo"
                : "🛒 Buena oferta";


        /* -----------------------------------------
           PRECIO OFERTA
        ----------------------------------------- */

        const precioOferta =
            Number(
                producto.precio_oferta || 0
            ).toFixed(2);


        /* -----------------------------------------
           TARJETA
        ----------------------------------------- */

        tarjeta.innerHTML = `

            <div class="foto-contenedor">

                <img
                    class="foto-producto"
                    src="${obtenerUrlImagen(producto)}"
                    alt="${producto.nombre}"
                    loading="lazy"
                >

                ${
                    producto.actualizado
                        ? `<div class="marca-actualizado ${
                            producto.empeoramiento
                                ? "marca-actualizado-subida"
                                : ""
                        }">ACTUALIZADO</div>`
                        : ''
                }

                <div class="descuento">
                    -${producto.descuento}%
                </div>

            </div>


            <div class="contenido">


                <!-- NOMBRE + CARACTERÍSTICAS -->

                <div class="nombre">

                    <span class="nombre-producto">
                        ${producto.nombre}
                    </span><span class="caracteristicas">${
                        producto.caracteristicas
                            ? ". " + producto.caracteristicas
                            : ""
                    }</span>

                </div>


                <!-- PRECIO -->

                <div class="precios">

                    <span class="precio-oferta">
                        ${precioOferta} €
                    </span>


                    ${
                        producto.precio_anterior &&
                        Number(producto.precio_anterior) >
                        Number(producto.precio_oferta)

                            ? `
                                <span class="precio-anterior">
                                    ${Number(
                                        producto.precio_anterior
                                    ).toFixed(2)} €
                                </span>
                            `

                            : ""
                    }

                </div>


                <!-- BUEN CHOLLO / BUENA OFERTA -->

                <div class="fila-tipo-compartir">

                    <div class="tipo-producto ${claseTipo}">
                        ${textoTipo}
                    </div>

                    <button
                        class="boton-compartir"
                        type="button"
                        data-oferta="${idOferta}"
                        data-nombre="${producto.nombre}"
                        title="Compartir"
                        aria-label="Compartir oferta"
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                            <circle cx="18" cy="5" r="2.5"></circle>
                            <circle cx="6" cy="12" r="2.5"></circle>
                            <circle cx="18" cy="19" r="2.5"></circle>
                            <path d="M8.2 10.8L15.7 6.3M8.2 13.2L15.7 17.7"></path>
                        </svg>
                    </button>

                </div>


                <!-- TIENDAS -->

                <div class="tiendas-producto">

                    ${crearTiendas(producto)}

                </div>

            </div>
        `;


        const botonCompartir =
            tarjeta.querySelector(".boton-compartir");

        botonCompartir.addEventListener(
            "click",
            async () => {

                const urlOferta =
                    `https://radarchollofertas.es/?oferta=${encodeURIComponent(idOferta)}`;

                const datosCompartir = {
                    title: producto.nombre,
                    text: `🔥 Mira esta oferta en Radar ChollOfertas: ${producto.nombre}`,
                    url: urlOferta
                };

                if (navigator.share) {

                    try {
                        await navigator.share(datosCompartir);
                    } catch (error) {

                        if (error.name !== "AbortError") {
                            console.error(
                                "Error al compartir:",
                                error
                            );
                        }

                    }

                } else {

                    try {

                        await navigator.clipboard.writeText(
                            urlOferta
                        );

                        botonCompartir.title =
                            "Enlace copiado";

                        setTimeout(
                            () => {
                                botonCompartir.title =
                                    "Compartir";
                            },
                            1500
                        );

                    } catch (error) {

                        console.error(
                            "No se pudo copiar el enlace:",
                            error
                        );

                    }

                }

            }
        );

        contenedor.appendChild(tarjeta);

    });


    /*
       Esperamos a que el navegador haya colocado
       las tarjetas antes de calcular alturas.
    */

    requestAnimationFrame(() => {

        igualarTarjetasPorFila();

        if (window.location.hash) {

            const idDestino =
                decodeURIComponent(
                    window.location.hash.substring(1)
                );

            const ofertaDestino =
                document.getElementById(idDestino);

            if (ofertaDestino) {

                ofertaDestino.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }

        }

    });
}


/* =========================================================
   IGUALAR TARJETAS POR FILA

   IMPORTANTE:

   - NO corta características.
   - NO reduce el tamaño del texto.
   - Busca la descripción más alta de cada fila.
   - Las demás reservan exactamente ese mismo espacio.
   - Los precios quedan alineados.
   - Buen chollo / Buena oferta quedan alineados.
   - Las tiendas empiezan a la misma altura.
========================================================= */

function igualarTarjetasPorFila() {

    const contenedor =
        document.getElementById("productos");


    if (!contenedor) {
        return;
    }


    const tarjetas =
        Array.from(
            contenedor.querySelectorAll(".tarjeta")
        );


    if (tarjetas.length === 0) {
        return;
    }


    /* -----------------------------------------
       PRIMERO QUITAMOS ALTURAS ANTERIORES
    ----------------------------------------- */

    tarjetas.forEach(tarjeta => {

        const nombre =
            tarjeta.querySelector(".nombre");

        if (nombre) {

            nombre.style.minHeight = "0px";

        }

    });


    /*
       Dejamos que el navegador recalcule
       las alturas naturales.
    */

    requestAnimationFrame(() => {

        const filas = [];


        /* -----------------------------------------
           AGRUPAR TARJETAS SEGÚN SU FILA REAL
        ----------------------------------------- */

        tarjetas.forEach(tarjeta => {

            const posicion =
                tarjeta.getBoundingClientRect();


            const top =
                Math.round(posicion.top);


            let fila =
                filas.find(
                    item =>
                        Math.abs(item.top - top) <= 3
                );


            if (!fila) {

                fila = {
                    top: top,
                    tarjetas: []
                };

                filas.push(fila);
            }


            fila.tarjetas.push(tarjeta);

        });


        /* -----------------------------------------
           IGUALAR NOMBRE + CARACTERÍSTICAS
           DENTRO DE CADA FILA
        ----------------------------------------- */

        filas.forEach(fila => {

            let alturaMaxima = 0;


            fila.tarjetas.forEach(tarjeta => {

                const nombre =
                    tarjeta.querySelector(".nombre");


                if (!nombre) {
                    return;
                }


                const altura =
                    nombre.scrollHeight;


                alturaMaxima =
                    Math.max(
                        alturaMaxima,
                        altura
                    );

            });


            fila.tarjetas.forEach(tarjeta => {

                const nombre =
                    tarjeta.querySelector(".nombre");


                if (!nombre) {
                    return;
                }


                nombre.style.minHeight =
                    `${alturaMaxima}px`;

            });

        });

    });
}


/* =========================================================
   FILTROS
========================================================= */

function aplicarFiltros() {

    /* Si usamos buscador o filtros, salimos del mosaico */
    const contenedorProductos =
        document.getElementById("productos");

    if (contenedorProductos) {
        contenedorProductos.classList.remove("modo-mosaico");
    }

    const tituloOfertas =
        document.querySelector(".destacadas h2");

    if (tituloOfertas) {
        tituloOfertas.innerHTML =
            '<span class="fuego">🔥</span> OFERTAS DESTACADAS';
    }
if (window.location.hash) {

        history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search
        );

    }

    const texto =
        document
            .getElementById("buscar")
            .value
            .trim()
            .toLowerCase();


    const categoria =
    document
        .getElementById("filtroCategoria")
        .value;


const tipo =
        document
            .getElementById("filtroTipo")
            .value;


    const tienda =
        document
            .getElementById("filtroTienda")
            .value;


    const orden =
        document
            .getElementById("ordenar")
            .value;


    let productos =
        productosGlobales.filter(producto => {

            const nombre =
                (producto.nombre || "")
                    .toLowerCase();


            const caracteristicas =
                (producto.caracteristicas || "")
                    .toLowerCase();


            const coincideTexto =
                !texto ||
                nombre.includes(texto) ||
                caracteristicas.includes(texto);


            const coincideCategoria =
            categoria === "TODAS" ||
            (producto.categoria || "OTROS") === categoria;


        const coincideTipo =
                tipo === "TODOS" ||
                producto.tipo === tipo;


            const nombresTiendas =
                (producto.tiendas || [])
                    .map(t => t.nombre);


            const coincideTienda =
                tienda === "TODAS" ||
                nombresTiendas.includes(tienda);


            return (
                coincideTexto &&
                coincideCategoria &&
            coincideTipo &&
                coincideTienda
            );

        });


    /* -----------------------------------------
       ORDENAR POR DESCUENTO
    ----------------------------------------- */

    if (orden === "descuento") {

        productos.sort(
            (a, b) =>
                Number(b.descuento) -
                Number(a.descuento)
        );

    }


    /* -----------------------------------------
       ORDENAR POR PRECIO
    ----------------------------------------- */

    if (orden === "precio") {

        productos.sort(
            (a, b) =>
                Number(a.precio_oferta) -
                Number(b.precio_oferta)
        );

    }


    mostrarProductos(productos);
}


/* =========================================================
   EVENTOS
========================================================= */

document
    .getElementById("buscar")
    .addEventListener(
        "input",
        aplicarFiltros
    );


document
    .getElementById("filtroCategoria")
    .addEventListener(
        "change",
        aplicarFiltros
    );


document
    .getElementById("filtroTipo")
    .addEventListener(
        "change",
        aplicarFiltros
    );


document
    .getElementById("filtroTienda")
    .addEventListener(
        "change",
        aplicarFiltros
    );


document
    .getElementById("ordenar")
    .addEventListener(
        "change",
        aplicarFiltros
    );


/* =========================================================
   RECALCULAR AL CAMBIAR EL TAMAÑO DE LA VENTANA

   Esto es importante porque pasamos:
   6 -> 5 -> 3 -> 2 -> 1 tarjetas por fila.
========================================================= */

let temporizadorResize;


window.addEventListener(
    "resize",
    () => {

        clearTimeout(
            temporizadorResize
        );


        temporizadorResize =
            setTimeout(
                igualarTarjetasPorFila,
                150
            );

    }
);


/* =========================================================
   INICIAR
========================================================= */

cargarProductos();












/* =========================================================
   VER TODAS LAS OFERTAS DESDE OFERTA COMPARTIDA
========================================================= */

document.getElementById("verTodasOfertas")
    .addEventListener("click", () => {

        window.location.assign(
            window.location.origin + window.location.pathname
        );

    });


/* =========================================================
   IR AL INICIO DESDE LOGO / MARCA
========================================================= */

function irAlInicio() {

    if (document.body.classList.contains("vista-compartida")) {
        window.location.assign(
            window.location.origin + window.location.pathname
        );
        return;
    }

    const urlCompleta = new URL(window.location.href);
    urlCompleta.searchParams.delete("oferta");
    urlCompleta.hash = "";
    history.replaceState(null, "", urlCompleta.pathname + urlCompleta.search);

    const buscar = document.getElementById("buscar");
    const filtroCategoria = document.getElementById("filtroCategoria");
    const filtroTipo = document.getElementById("filtroTipo");
    const filtroTienda = document.getElementById("filtroTienda");
    const ordenar = document.getElementById("ordenar");
    const verTodas = document.getElementById("verTodasOfertas");

    if (buscar) buscar.value = "";
    if (filtroCategoria) filtroCategoria.value = "TODAS";
    if (filtroTipo) filtroTipo.value = "TODOS";
    if (filtroTienda) filtroTienda.value = "TODAS";
    if (ordenar) ordenar.value = "recientes";

    if (verTodas) {
        verTodas.hidden = true;
    }

    document.body.classList.remove("vista-compartida");
    document.querySelector(".buscador-filtros").style.display = "";
    document.querySelector(".destacadas h2").style.display = "";

    
const contenedorProductos =
    document.getElementById("productos");

if (contenedorProductos) {
    contenedorProductos.classList.remove("modo-mosaico");
}

const tituloOfertas =
    document.querySelector(".destacadas h2");

if (tituloOfertas) {
    tituloOfertas.innerHTML =
        '<span class="fuego">🔥</span> OFERTAS DESTACADAS';
}

aplicarFiltros();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

const irInicio = document.getElementById("irInicio");

if (irInicio) {

    irInicio.addEventListener("click", irAlInicio);

    irInicio.addEventListener("keydown", event => {

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            irAlInicio();
        }

    });
}









/* =========================================================
   MOSAICO WEB
========================================================= */

function abrirMosaicoWeb() {

    const contenedor = document.getElementById("productos");

    if (!contenedor) {
        return;
    }

    const productosOrdenados = [...productosGlobales]
        .sort((a, b) => {
            return String(b.fecha || "").localeCompare(
                String(a.fecha || "")
            );
        })
        ;

    const productosMosaico = [];
    const productosIncluidos = new Set();

    productosOrdenados.forEach(producto => {

        const idProducto =
            producto.id_producto || producto.id;

        if (productosIncluidos.has(idProducto)) {
            return;
        }

        productosIncluidos.add(idProducto);
        productosMosaico.push(producto);

    });


    contenedor.classList.add("modo-mosaico");

    contenedor.innerHTML = "";


    productosMosaico.forEach(producto => {

        const enlace = document.createElement("a");

        enlace.className = "mosaico-item";

        enlace.href =
            "#" + encodeURIComponent(producto.id);


        const esChollo =
            String(producto.tipo || "").toUpperCase() === "CHOLLO";


        enlace.innerHTML = `
            <img
                src="${obtenerUrlImagen(producto)}"
                alt="${producto.nombre || "Oferta"}"
                loading="lazy"
            >

            <span class="mosaico-descuento">
                -${producto.descuento || 0}%
            </span>

            ${
                esChollo
                    ? '<span class="mosaico-fuego">🔥</span>'
                    : ''
            }

        <span class="mosaico-precio">
            ${Number(producto.precio_oferta || 0).toFixed(2)} €
        </span>



            <span class="mosaico-rco">
                RCO
            </span>
        `;


        enlace.addEventListener("click", event => {

        event.preventDefault();

        scrollMosaicoActual = window.scrollY;

        history.replaceState(
            {
                vista: "mosaico",
                scroll: scrollMosaicoActual
            },
            "",
            window.location.pathname +
            window.location.search +
            "#mosaico"
        );

        history.pushState(
            {
                vista: "producto",
                id: producto.id
            },
            "",
            "#" + encodeURIComponent(producto.id)
        );

        contenedor.classList.remove("modo-mosaico");

        mostrarProductos([producto]);

        window.scrollTo({
            top: 0,
            behavior: "auto"
        });

    });


        contenedor.appendChild(enlace);

    });


    const titulo =
        document.querySelector(".destacadas h2");

    if (titulo) {
        titulo.innerHTML = "ÚLTIMAS OFERTAS";
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


const botonMosaico =
    document.getElementById("abrirMosaico");


if (botonMosaico) {

    botonMosaico.addEventListener(
        "click",
        abrirMosaicoWeb
    );

}



/* =========================================================
   HISTORIAL MOSAICO
   Al pulsar ATRAS vuelve al punto anterior de las ofertas
========================================================= */

let scrollAntesMosaico = 0;
let scrollMosaicoActual = 0;


const botonMosaicoHistorial =
    document.getElementById("abrirMosaico");


if (botonMosaicoHistorial) {

    botonMosaicoHistorial.addEventListener(
        "click",
        () => {

            scrollAntesMosaico = window.scrollY;

            history.pushState(
                {
                    vista: "mosaico"
                },
                "",
                window.location.pathname +
                window.location.search +
                "#mosaico"
            );

        },
        true
    );

}


window.addEventListener("popstate", event => {

    const estado = event.state;
    const contenedor =
        document.getElementById("productos");

    if (!contenedor) {
        return;
    }


    /* VOLVER AL MOSAICO */

    if (
        estado &&
        estado.vista === "mosaico"
    ) {

        abrirMosaicoWeb();

        requestAnimationFrame(() => {

            window.scrollTo({
                top: estado.scroll || 0,
                behavior: "auto"
            });

        });

        return;
    }


    /* VOLVER A LAS OFERTAS NORMALES */

    contenedor.classList.remove("modo-mosaico");

    const titulo =
        document.querySelector(".destacadas h2");

    if (titulo) {
        titulo.innerHTML =
            '<span class="fuego">🔥</span> OFERTAS DESTACADAS';
    }

    aplicarFiltros();

    requestAnimationFrame(() => {

        window.scrollTo({
            top: scrollAntesMosaico,
            behavior: "auto"
        });

    });

});






