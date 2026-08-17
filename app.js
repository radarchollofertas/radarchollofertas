let productosGlobales = [];


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
        aplicarFiltros();

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

        contenedor.innerHTML =
            "<p>No hay ofertas que coincidan con la búsqueda.</p>";

        return;
    }


    productos.forEach(producto => {

        const tarjeta =
            document.createElement("article");


        tarjeta.className = "tarjeta";


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
                    src="${producto.foto}"
                    alt="${producto.nombre}"
                    loading="lazy"
                >

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

                <div class="tipo-producto ${claseTipo}">
                    ${textoTipo}
                </div>


                <!-- TIENDAS -->

                <div class="tiendas-producto">

                    ${crearTiendas(producto)}

                </div>

            </div>
        `;


        contenedor.appendChild(tarjeta);

    });


    /*
       Esperamos a que el navegador haya colocado
       las tarjetas antes de calcular alturas.
    */

    requestAnimationFrame(() => {

        igualarTarjetasPorFila();

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

    const texto =
        document
            .getElementById("buscar")
            .value
            .trim()
            .toLowerCase();


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