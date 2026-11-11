// Variable global para guardar los costos calculados por matriz
let costosMayorista = [0, 0, 0];

// 1. Cálculo de Determinante 3x3 (Regla de Sarrus)
function calcularDeterminante3x3(m) {
    const diagPrincipal = 
        (m[0][0] * m[1][1] * m[2][2]) +
        (m[0][1] * m[1][2] * m[2][0]) +
        (m[0][2] * m[1][0] * m[2][1]);
    
    const diagSecundaria = 
        (m[0][2] * m[1][1] * m[2][0]) +
        (m[0][0] * m[1][2] * m[2][1]) +
        (m[0][1] * m[1][0] * m[2][2]);

    return diagPrincipal - diagSecundaria;
}

// Reemplazar columna j de una matriz 3x3 por el vector B (para Regla de Cramer)
function reemplazarColumna(matriz, vectorB, colIndex) {
    return matriz.map((fila, i) => 
        fila.map((valor, j) => (j === colIndex ? vectorB[i] : valor))
    );
}

// Multiplicación de Matrices: A_transpuesta (3x3) * C (3x2) = P (3x2)
function multiplicarMatricesCosto(A, C) {
    // Transponer A para que cada fila sea un Producto y cada columna un Insumo
    const AT = [
        [A[0][0], A[1][0], A[2][0]],
        [A[0][1], A[1][1], A[2][1]],
        [A[0][2], A[1][2], A[2][2]]
    ];

    let resultado = [
        [0, 0],
        [0, 0],
        [0, 0]
    ];

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {
            let suma = 0;
            for (let k = 0; k < 3; k++) {
                suma += AT[i][k] * C[k][j];
            }
            resultado[i][j] = suma;
        }
    }
    return resultado;
}

// Ejecutar sección de Matrices y Determinantes
function resolverSeccionMatrices() {
    const nombres = [
        document.getElementById('prod1_name').value || 'Servicio 1',
        document.getElementById('prod2_name').value || 'Servicio 2',
        document.getElementById('prod3_name').value || 'Servicio 3'
    ];

    // Actualizar nombres en el selector de Funciones
    const selectProd = document.getElementById('select-product');
    selectProd.options[0].text = `${nombres[0]} (Mayorista)`;
    selectProd.options[1].text = `${nombres[1]} (Mayorista)`;
    selectProd.options[2].text = `${nombres[2]} (Mayorista)`;

    // Leer Matriz A (3x3)
    const A = [
        [parseFloat(document.getElementById('a00').value) || 0, parseFloat(document.getElementById('a01').value) || 0, parseFloat(document.getElementById('a02').value) || 0],
        [parseFloat(document.getElementById('a10').value) || 0, parseFloat(document.getElementById('a11').value) || 0, parseFloat(document.getElementById('a12').value) || 0],
        [parseFloat(document.getElementById('a20').value) || 0, parseFloat(document.getElementById('a21').value) || 0, parseFloat(document.getElementById('a22').value) || 0]
    ];

    // Leer Vector B (3x1)
    const B = [
        parseFloat(document.getElementById('b0').value) || 0,
        parseFloat(document.getElementById('b1').value) || 0,
        parseFloat(document.getElementById('b2').value) || 0
    ];

    // Leer Matriz C (3x2)
    const C = [
        [parseFloat(document.getElementById('c00').value) || 0, parseFloat(document.getElementById('c01').value) || 0],
        [parseFloat(document.getElementById('c10').value) || 0, parseFloat(document.getElementById('c11').value) || 0],
        [parseFloat(document.getElementById('c20').value) || 0, parseFloat(document.getElementById('c21').value) || 0]
    ];

    // 1. Determinantes y Cramer
    const detA = calcularDeterminante3x3(A);
    const cramerDiv = document.getElementById('cramer-output');

    if (Math.abs(detA) < 1e-9) {
        cramerDiv.innerHTML = `
            <div class="math-step status-warn">
                <strong>Determinante Principal $|A| = 0$</strong><br>
                El sistema es <em>Compatible Indeterminado</em> o <em>Incompatible</em>. Las proporciones de insumos entre servicios son linealmente dependientes y no existe una solución única exacta.
            </div>`;
    } else {
        const detX1 = calcularDeterminante3x3(reemplazarColumna(A, B, 0));
        const detX2 = calcularDeterminante3x3(reemplazarColumna(A, B, 1));
        const detX3 = calcularDeterminante3x3(reemplazarColumna(A, B, 2));

        const x1 = detX1 / detA;
        const x2 = detX2 / detA;
        const x3 = detX3 / detA;

        const esViable = x1 >= 0 && x2 >= 0 && x3 >= 0;

        cramerDiv.innerHTML = `
            <div class="math-step">
                <strong>1. Determinante del Sistema (Sarrus):</strong> $|A| = ${detA.toFixed(2)}$ (Como $|A| \\neq 0$, es un Sistema Compatible Determinado).
            </div>
            <div class="math-step">
                <strong>2. Determinantes Sustituidos:</strong> $|A_1| = ${detX1.toFixed(2)}$ &nbsp;|&nbsp; $|A_2| = ${detX2.toFixed(2)}$ &nbsp;|&nbsp; $|A_3| = ${detX3.toFixed(2)}$
            </div>
            <div class="math-step ${esViable ? 'status-ok' : 'status-warn'}">
                <strong>3. Cupo Óptimo para Agotar Stock ($x_i = |A_i| / |A|$):</strong><br>
                • <strong>${nombres[0]} ($x_1$):</strong> ${x1.toFixed(2)} trabajos<br>
                • <strong>${nombres[1]} ($x_2$):</strong> ${x2.toFixed(2)} trabajos<br>
                • <strong>${nombres[2]} ($x_3$):</strong> ${x3.toFixed(2)} trabajos
                ${!esViable ? '<br><em>Nota: Un valor negativo indica que el stock actual está desbalanceado para agotarse exactamente a cero al mismo tiempo.</em>' : ''}
            </div>
        `;
    }

    // 2. Multiplicación de matrices para costos
    const matrizCostos = multiplicarMatricesCosto(A, C);
    costosMayorista = [matrizCostos[0][0], matrizCostos[1][0], matrizCostos[2][0]];

    const costDiv = document.getElementById('cost-matrix-output');
    costDiv.innerHTML = `
        <p style="margin-bottom:0.5rem;">Cálculo de fila por columna ($P_{i,j} = \\sum A^T_{i,k} \\cdot C_{k,j}$):</p>
        <table class="matrix-table">
            <thead>
                <tr>
                    <th>Servicio / Producto</th>
                    <th>Costo Mayorista ($)</th>
                    <th>Costo Local ($)</th>
                    <th>Ahorro Unitario</th>
                </tr>
            </thead>
            <tbody>
                ${nombres.map((nombre, i) => {
                    const may = matrizCostos[i][0];
                    const loc = matrizCostos[i][1];
                    const dif = loc - may;
                    return `
                    <tr>
                        <td><strong>${nombre}</strong></td>
                        <td>$${may.toLocaleString('es-AR')}</td>
                        <td>$${loc.toLocaleString('es-AR')}</td>
                        <td style="color: ${dif >= 0 ? '#22c55e' : '#eab308'};">
                            $${Math.abs(dif).toLocaleString('es-AR')} (${dif >= 0 ? 'Mayorista' : 'Local'})
                        </td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
    `;

    // Actualizar el input de costo variable según el servicio seleccionado
    actualizarCostoVariableDesdeSelector();
}

function actualizarCostoVariableDesdeSelector() {
    const idx = parseInt(document.getElementById('select-product').value) || 0;
    if (costosMayorista[idx] > 0) {
        document.getElementById('costo-variable').value = costosMayorista[idx];
    }
    resolverSeccionFunciones();
}

// 2. Sección de Funciones Lineales, Cuadráticas y Gráfico en Canvas
function resolverSeccionFunciones() {
    const b = parseFloat(document.getElementById('costo-fijo').value) || 0;
    const mc = parseFloat(document.getElementById('costo-variable').value) || 0;
    const mi = parseFloat(document.getElementById('precio-venta').value) || 0;
    const a = parseFloat(document.getElementById('coef-cuadratico').value) || 1;

    const margenCont = mi - mc;
    const outDiv = document.getElementById('functions-output');

    // Punto de equilibrio lineal: I(x) = C(x) => mi * x = mc * x + b
    let xEquilibrio = margenCont > 0 ? b / margenCont : null;
    let yEquilibrio = xEquilibrio !== null ? mi * xEquilibrio : null;

    // Función Cuadrática de Utilidad: U(x) = -a*x^2 + (mi - mc)*x - b
    // Vértice Xv = -B / (2A) donde A = -a, B = margenCont
    const xv = margenCont / (2 * a);
    const yv = (-a * Math.pow(xv, 2)) + (margenCont * xv) - b;

    // Raíces cuadráticas (Bhaskara): Discriminante = B^2 - 4*A*C = margenCont^2 - 4*(-a)*(-b)
    const discriminante = Math.pow(margenCont, 2) - (4 * a * b);
    let textoRaices = '';
    if (discriminante > 0) {
        const x1 = (margenCont - Math.sqrt(discriminante)) / (2 * a);
        const x2 = (margenCont + Math.sqrt(discriminante)) / (2 * a);
        textoRaices = `Raíces reales ($\Delta > 0$): $x_1 = ${x1.toFixed(1)}$ y $x_2 = ${x2.toFixed(1)}$ unidades (Zona de ganancia positiva entre $x_1$ y $x_2$).`;
    } else if (discriminante === 0) {
        textoRaices = `Raíz doble ($\Delta = 0$): $x = ${xv.toFixed(1)}$ unidades.`;
    } else {
        textoRaices = `Sin raíces reales ($\Delta < 0$): Con este sobrecosto cuadrático ($a=${a}$), los costos fijos superan la utilidad máxima.`;
    }

    outDiv.innerHTML = `
        <div class="math-step">
            <strong>1. Modelos Lineales:</strong><br>
            • Costo: $C(x) = ${mc}x + ${b}$<br>
            • Ingreso: $I(x) = ${mi}x$<br>
            • Dominio restringido al problema: $Dom = [0, +\\infty)$
        </div>
        <div class="math-step ${xEquilibrio ? 'status-ok' : 'status-warn'}">
            <strong>2. Intersección / Punto de Equilibrio ($I(x) = C(x)$):</strong><br>
            ${xEquilibrio 
                ? `Se alcanza a las <strong>${xEquilibrio.toFixed(1)} unidades</strong> (${Math.ceil(xEquilibrio)} trabajos reales), facturando <strong>$${ Math.round(yEquilibrio).toLocaleString('es-AR') }</strong>.` 
                : 'Pendiente negativa ($m_i \\le m_c$): El precio de venta no cubre el costo variable.'}
        </div>
        <div class="math-step">
            <strong>3. Optimización Cuadrática $U(x) = -${a}x^2 + ${margenCont}x - ${b}$:</strong><br>
            • <strong>Vértice (Máximo):</strong> $V(${xv.toFixed(1)};\\; $${Math.round(yv).toLocaleString('es-AR')})$<br>
            • <strong>Imagen:</strong> $Im = (-\\infty;\\; ${Math.round(yv).toLocaleString('es-AR')}]$<br>
            • ${textoRaices}
        </div>
    `;

    dibujarGrafico(b, mc, mi, a, xEquilibrio, xv);
}

function dibujarGrafico(b, mc, mi, a, xEq, xv) {
    const canvas = document.getElementById('functionsChart');
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    const padLeft = 65;
    const padBottom = 35;
    const padTop = 25;
    const padRight = 25;

    // Determinar rango máximo del eje X y eje Y
    const maxX = Math.max(xEq ? xEq * 2 : 50, xv > 0 ? xv * 2.2 : 50, 30);
    const maxY = Math.max(mi * maxX, (mc * maxX) + b, b * 1.5, 10000);

    const toCanvasX = (x) => padLeft + (x / maxX) * (W - padLeft - padRight);
    const toCanvasY = (y) => (H - padBottom) - (y / maxY) * (H - padBottom - padTop);

    // Cuadrícula y Ejes
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Segoe UI';

    for (let i = 0; i <= 5; i++) {
        let valY = (maxY / 5) * i;
        let cy = toCanvasY(valY);
        ctx.beginPath();
        ctx.moveTo(padLeft, cy);
        ctx.lineTo(W - padRight, cy);
        ctx.stroke();
        ctx.fillText('$' + Math.round(valY / 1000) + 'k', 12, cy + 4);

        let valX = (maxX / 5) * i;
        let cx = toCanvasX(valX);
        ctx.beginPath();
        ctx.moveTo(cx, padTop);
        ctx.lineTo(cx, H - padBottom);
        ctx.stroke();
        ctx.fillText(Math.round(valX) + ' u.', cx - 12, H - 12);
    }

    // Recta de Costo C(x) = mc*x + b
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), toCanvasY(b));
    ctx.lineTo(toCanvasX(maxX), toCanvasY(mc * maxX + b));
    ctx.stroke();

    // Recta de Ingreso I(x) = mi*x
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), toCanvasY(0));
    ctx.lineTo(toCanvasX(maxX), toCanvasY(mi * maxX));
    ctx.stroke();

    // Parábola de Utilidad U(x) desplazada o graficada en escala positiva
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px <= maxX; px += maxX / 100) {
        let py = (-a * px * px) + ((mi - mc) * px) - b;
        let cy = toCanvasY(Math.max(0, py));
        if (px === 0) ctx.moveTo(toCanvasX(px), cy);
        else ctx.lineTo(toCanvasX(px), cy);
    }
    ctx.stroke();

    // Marcar Punto de Equilibrio si existe dentro del gráfico
    if (xEq && xEq > 0 && xEq <= maxX) {
        const eqX = toCanvasX(xEq);
        const eqY = toCanvasY(mi * xEq);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(eqX, eqY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(`P. Equilibrio (${xEq.toFixed(1)} u.)`, eqX + 8, eqY - 8);
    }
}

// Eventos
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-calcular-matrices').addEventListener('click', resolverSeccionMatrices);
    document.getElementById('btn-calcular-funciones').addEventListener('click', resolverSeccionFunciones);
    document.getElementById('select-product').addEventListener('change', actualizarCostoVariableDesdeSelector);

    // Ejecución inicial al abrir la página
    resolverSeccionMatrices();
});
      
