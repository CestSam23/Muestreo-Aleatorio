// Helper to create and trigger CSV download
function createCSVDownloadButton({btnId, plotDivId, filename, headers, rows}) {
    let btn = document.getElementById(btnId);
    if (!btn) {
        btn = document.createElement('button');
        btn.id = btnId;
        btn.textContent = 'Descargar CSV';
        btn.style.marginTop = '10px';
        const plotDiv = document.getElementById(plotDivId);
        plotDiv.parentNode.insertBefore(btn, plotDiv.nextSibling);
    }
    btn.onclick = function() {
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
}
/*--------------LÓGICA PARA BOTÓN SECUENCIA BERNOULLI----*/
let bernoulliResults = null;

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('bernoulli_array_btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (!Array.isArray(bernoulliResults)) {
      alert('Primero ejecuta la simulación.');
      return;
    }
    const CHUNK = 50;
    const lines = [];
    for (let i = 0; i < bernoulliResults.length; i += CHUNK) {
      lines.push(bernoulliResults.slice(i, i + CHUNK).join(', '));
    }
    alert(`Secuencia de Resultados (${bernoulliResults.length}):\n\n${lines.join('\n')}`);
  });
});


console.log("App.js cargado correctamente");
document.addEventListener('DOMContentLoaded', () => {
    
    /*-----------LÓGICA PARA FORMULARIOS-----------------*/
    const forms ={
        'bernoulli_form' : handleBernoulli,
        'binomial_form' : handleBinomial,
        'exponencial_form' : handleExponencial,
        'multinomialf_form' : handleMultinomialF,
        'multinomialv_form' : handleMultinomialV,
        'normale_form' : handleNormale,
        'normalmv_form' : handleNormalMV,
        'gibbs_form' : handleGibbs,
        'normalbiv_form' : handleNormalBiv
    };

    //Asignar event listeners a cada formulario
    for(const [formId, handler] of Object.entries(forms)){
        const form = document.getElementById(formId);
        if(form){
            form.addEventListener('submit',handler);
        }
    }
});

/*---------------FUNCIÓN PARA REALIZAR PETICIONES --------------------*/
async function makeRequest(endpoint, formData) {
    try {
        const params = new URLSearchParams();
        for (const [key, value] of formData.entries()) {
            params.append(key, value);
        }

        const response = await fetch(`/api/${endpoint}?${params}`);

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    }
}


//---------------------MANEJADOR DE PETICIONES------------------------
async function handleBernoulli(e){
    e.preventDefault();
    try{
        console.log("Manejando formulario de Bernoulli");
        const data = await makeRequest('bernoulli', new FormData(this));
        
        const charData = [{
            x: ['Exitos', 'Fracasos'],
            y: [data.success, data.failure],
            text: [data.success, data.failure], 
            textposition: 'auto',
            type: 'bar',
            textfont: {
                size: 30,   // tamaño de los textos sobre las barras
                color: 'white'
            },
            /* En efecto, Angie le sabe al diseño.*/
            marker: {
                color: ['#ad9664ff', '#222e4e'],
                line:{
                    color: '#88764fff',
                    width: 1.5
                    }
                }
        }];

        const layout = {
            title: {
                text: `Distribución Bernoulli`,
                font: { size: 22, color: '#222e4e' }
            },
            xaxis: {
                title: {
                    text: 'Resultado',
                    font: { size: 20, color: '#222e4e'}
                },
                tickfont: { size: 20, color: '#222e4e' }
            },

            yaxis: {
                title: {
                    text: 'Frecuencia',
                    font: { size: 20, color: '#222e4e' }
                },
                tickfont: { size: 20, color: '#222e4e' },
                gridcolor: '#e0e0e0'
            },
            plot_bgcolor: '#fff',
            paper_bgcolor: '#fff',
            margin: { t: 80, l: 60, r: 40, b: 60 }
        };
        
        Plotly.newPlot('bernoulli_plot', charData,layout);
        createCSVDownloadButton({
            btnId: 'bernoulli_csv_btn',
            plotDivId: 'bernoulli_plot',
            filename: 'bernoulli_data.csv',
            headers: ['Resultado', 'Frecuencia'],
            rows: [
                ['Exitos', data.success],
                ['Fracasos', data.failure]
            ]
        });

        //Guardar el arreglo y llamar al botón
        bernoulliResults=data.sequence;
        const btn=document.getElementById('bernoulli_array_btn');
        if(btn) btn.disabled = !Array.isArray(bernoulliResults);

    } catch (error) {
        console.error("Error en formulario de Bernoulli:", error);
    }
}
async function handleBinomial(e){
    e.preventDefault();
    try {
        console.log("Manejando formulario de Binomial");
        const data = await makeRequest('binomial', new FormData(this));
        const resultados = data.results;

        // Histograma
        const charData = [{
            x: resultados,
            type: 'histogram',
            marker: {
                color: '#ad9664ff',
                line: {
                    color: '#88764fff',
                    width: 1.5
                }
            }
        }];

        const layout = {
            title: {
                text: "Distribución Binomial",
                font: { size: 26, color: '#222e4e' },
                x: 0.5,   // centrar título
                xanchor: 'center'
            },
            xaxis: {
                title: { text: "Número de éxitos", font: { size: 22, color: '#222e4e' } },
                tickfont: { size: 18, color: '#222e4e' },
                gridcolor: 'rgba(200,200,200,0.3)',
                zeroline: false
            },
            yaxis: {
                title: { text: "Frecuencia", font: { size: 22, color: '#222e4e' } },
                tickfont: { size: 18, color: '#222e4e' },
                gridcolor: 'rgba(200,200,200,0.3)',
                zeroline: false
            },
            bargap: 0.05,
            plot_bgcolor: '#fafafa',
            paper_bgcolor: '#fafafa',
            margin: { t: 80, l: 70, r: 50, b: 70 }
        };

        const config = {
            responsive: true,
            displaylogo: false
        };

        Plotly.newPlot('binomial_plot', charData, layout, config);

        // --- CSV Export ---
        const freq = {};
        resultados.forEach(val => { freq[val] = (freq[val] || 0) + 1; });
        const rows = Object.keys(freq).sort((a,b)=>a-b).map(k => [k, freq[k]]);
        createCSVDownloadButton({
            btnId: 'binomial_csv_btn',
            plotDivId: 'binomial_plot',
            filename: 'binomial_data.csv',
            headers: ['Número de éxitos', 'Frecuencia'],
            rows
        });

    } catch (error) {
        console.error("Error en formulario de Binomial:", error);
    }
}

async function handleExponencial(e){
    e.preventDefault();
    try {
        console.log("Manejando formulario de Exponencial");
        const data = await makeRequest('exponencial', new FormData(this));
        const resultados = data.results;

        const charData = [{
            x: resultados,
            type: 'histogram',
            marker: {
                color:'#ad9664ff',
                line:{
                    color: '#88764fff',
                    width: 1
                }
            }
        }];

        const layout = {
            title: {
                text: "Distribución Exponencial",
                font: { size: 24, color: '#222e4e' }
            },
            xaxis: {
                title: {
                    text: "Valor",
                    font: { size: 22, color: '#222e4e' }
                },
                tickfont: { size: 18, color: '#222e4e' }
            },
            yaxis: {
                title: {
                    text: "Frecuencia",
                    font: { size: 22, color: '#222e4e' }
                },
                tickfont: { size: 18, color: '#222e4e' }
            },
            bargap: 0.05
        };

        Plotly.newPlot('exponencial_plot', charData, layout);

        // Generar CSV con los valores
        createCSVDownloadButton({
            btnId: 'exponencial_csv_btn',
            plotDivId: 'exponencial_plot',
            filename: 'exponencial_data.csv',
            headers: ['Valor'],
            rows: resultados.map(v => [v])
        });

        // Descargar JSON
        const btn = document.getElementById('exponencial_json_btn'); 
        if (btn) {
            btn.onclick = function() {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'exponencial_data.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            };
        }
    } catch (error) {
        console.error("Error en formulario de Exponencial:", error);
    }
}

async function handleMultinomialF(e) {
    e.preventDefault();
    try {
        const data = await makeRequest('multinomialf', new FormData(this));
        
        // Crear el 3D Surface Plot
        const resultados = data.results;
        const experimentos = resultados.length;
        const probabilidades = resultados[0].length;
        
        
        // Preparar datos para surface plot
        const zData = resultados;
        
        // Coordenadas para los ejes
        const xValues = Array.from({length: experimentos}, (_, i) => i + 1);
        const yValues = Array.from({length: probabilidades}, (_, i) => i + 1);
        console.log(xValues,yValues)
        
        const trace = {             //Datos de la gráfica
            x: xValues,             // Experimentos: [1, 2, 3, ...] K
            y: yValues,             // Probabilidades: [1, 2, 3, ...] Theta's
            z: zData,               // Resultado de muestreos
            type: 'surface',
            colorscale: 'Viridis',
            colorbar: {
                title: 'Frecuencia',
                thickness: 15,
                len: 0.75
            },
            opacity: 0.9,
            lighting: {
                ambient: 0.7,
                diffuse: 0.8,
                roughness: 0.9,
                fresnel: 0.2
            },
            contours: {
                x: {
                    show: true,
                    color: 'white',
                    width: 1,
                    highlight: false
                },
                y: {
                    show: true,
                    color: 'white', 
                    width: 1,
                    highlight: false
                },
                z: {
                    show: true,
                    usecolormap: true,
                    width: 2,
                    highlightcolor: '#42f462'
                }
            }
        };
        
        const layout = {
            title: {
                text: `Distribución Multinomial<br>${experimentos} experimentos × ${probabilidades} probabilidades`,
                font: { size: 16 }
            },
            scene: {
                xaxis: {
                    title: 'Número de Experimento',
                    type: 'category',
                    tickmode: 'array',
                    tickvals: xValues,
                    ticktext: xValues.map(val => `Exp ${val}`)
                },
                yaxis: {
                    title: 'Probabilidad',
                    type: 'category',
                    tickmode: 'array',
                    tickvals: yValues,
                    ticktext: yValues.map(val => `Cat ${val}`)
                },
                zaxis: {
                    title: 'Frecuencia de Éxitos',
                    gridcolor: 'rgb(255, 255, 255)',
                    gridwidth: 2
                },
                camera: {
                    eye: { x: -1.5, y: -1.5, z: 1.2 }
                },
                aspectmode: 'manual',
                aspectratio: {
                    x: experimentos * 0.3,
                    y: probabilidades * 0.5,
                    z: 0.8
                }
            },
            margin: {
                l: 50,
                r: 50,
                b: 50,
                t: 80
            },
            paper_bgcolor: 'rgb(243, 243, 243)',
            plot_bgcolor: 'rgb(243, 243, 243)'
        };
        
        const config = {
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToAdd: ['resetCameraDefault3d']
        };
        
        // Limpiar y crear la gráfica
        const plotDiv = document.getElementById('multinomialf_plot');
        plotDiv.innerHTML = '';
        
        Plotly.newPlot(plotDiv, [trace], layout, config);

        // Each row is an experiment, columns are probabilidades
        const headers = ['Experimento', ...Array.from({length: probabilidades}, (_, i) => `Prob${i+1}`)];
        const rows = resultados.map((row, i) => [i+1, ...row]);
        createCSVDownloadButton({
            btnId: 'multinomialf_csv_btn',
            plotDivId: 'multinomialf_plot',
            filename: 'multinomialf_data.csv',
            headers,
            rows
        });

       /* // --- JSON Download Button Logic ---
        let btn = document.getElementById('multinomialf_json_btn');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'multinomialf_json_btn';
            btn.textContent = 'Descargar JSON';
            btn.style.marginTop = '10px';
            plotDiv.parentNode.insertBefore(btn, plotDiv.nextSibling);
        }*/
        /*btn.onclick = function() {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'multinomialf_data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };*/
        
    } catch (error) {
        console.error("Error en formulario de Multinomial F:", error);
        alert("Error al crear la gráfica: " + error.message);
    }
}

async function handleMultinomialV(e) {
    e.preventDefault();
    try {
        const formData = new FormData(this);
        const data = await makeRequest('multinomialv', formData);
        
        // Obtener las probabilidades del formulario
        const probsDyn = formData.get('probs_dyn');
        let probabilidades = [];
        if (probsDyn) {
            probabilidades = probsDyn.split(',').map(Number);
        }
        
        // Crear el 3D Surface Plot
        const resultados = data.results;
        const experimentos = resultados.length;
        const categorias = resultados[0].length;
        
        // Preparar datos para surface plot
        const zData = resultados;
        
        // Coordenadas para los ejes
        const xValues = Array.from({length: experimentos}, (_, i) => i + 1);
        const yValues = Array.from({length: categorias}, (_, i) => i + 1);
        
        // Crear labels para las categorías con sus probabilidades
        const yLabels = yValues.map((cat, index) => {
            if (probabilidades[index] !== undefined) {
                return `Cat ${cat} (θ=${probabilidades[index]})`;
            }
            return `Cat ${cat}`;
        });
        
        const trace = {
            x: xValues,  // Experimentos: [1, 2, 3, ...]
            y: yValues,  // Categorías: [1, 2, 3, ...] 
            z: zData,    // Matriz 2D de frecuencias
            type: 'surface',
            colorscale: 'Plasma', // Diferente colorscale para distinguir
            colorbar: {
                title: 'Frecuencia',
                thickness: 15,
                len: 0.75
            },
            opacity: 0.9,
            lighting: {
                ambient: 0.7,
                diffuse: 0.8,
                roughness: 0.9,
                fresnel: 0.2
            },
            contours: {
                x: {
                    show: true,
                    color: 'white',
                    width: 1,
                    highlight: false
                },
                y: {
                    show: true,
                    color: 'white', 
                    width: 1,
                    highlight: false
                },
                z: {
                    show: true,
                    usecolormap: true,
                    width: 2,
                    highlightcolor: '#ff6b6b'
                }
            },
            hoverinfo: 'x+y+z',
            hovertemplate: 
                '<b>Experimento:</b> %{x}<br>' +
                '<b>Categoría:</b> %{customdata}<br>' +
                '<b>Frecuencia:</b> %{z}<br>' +
                '<extra></extra>',
            customdata: Array(experimentos).fill(yLabels) // Datos para tooltips
        };
        
        const layout = {
            title: {
                text: `Distribución Multinomial Variable<br>${experimentos} experimentos × ${categorias} categorías`,
                font: { size: 16 }
            },
            scene: {
                xaxis: {
                    title: 'Número de Experimento',
                    type: 'category',
                    tickmode: 'array',
                    tickvals: xValues,
                    ticktext: xValues.map(val => `Exp ${val}`)
                },
                yaxis: {
                    title: 'Categoría',
                    type: 'category',
                    tickmode: 'array',
                    tickvals: yValues,
                    ticktext: yLabels,
                    tickangle: -45
                },
                zaxis: {
                    title: 'Frecuencia de Éxitos',
                    gridcolor: 'rgb(255, 255, 255)',
                    gridwidth: 2
                },
                camera: {
                    eye: { x: -1.8, y: -1.8, z: 1.5 }
                },
                aspectmode: 'manual',
                aspectratio: {
                    x: experimentos * 0.4,
                    y: categorias * 0.6,
                    z: 0.8
                }
            },
            margin: {
                l: 80, // Más margen izquierdo para labels largos
                r: 50,
                b: 80, // Más margen inferior
                t: 100
            },
            paper_bgcolor: 'rgb(248, 249, 250)',
            plot_bgcolor: 'rgb(248, 249, 250)'
        };
        
        const config = {
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToAdd: ['resetCameraDefault3d']
        };
        
        // Limpiar y crear la gráfica
        const plotDiv = document.getElementById('multinomialv_plot');
        plotDiv.innerHTML = '';
        
        Plotly.newPlot(plotDiv, [trace], layout, config);

        // Each row is an experiment, columns are categorias
        const headers = ['Experimento', ...Array.from({length: categorias}, (_, i) => `Cat${i+1}`)];
        const rows = resultados.map((row, i) => [i+1, ...row]);
        createCSVDownloadButton({
            btnId: 'multinomialv_csv_btn',
            plotDivId: 'multinomialv_plot',
            filename: 'multinomialv_data.csv',
            headers,
            rows
        });

       /* // --- JSON Download Button Logic ---
        let btn = document.getElementById('multinomialv_json_btn');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'multinomialv_json_btn';
            btn.textContent = 'Descargar JSON';
            btn.style.marginTop = '10px';
            plotDiv.parentNode.insertBefore(btn, plotDiv.nextSibling);
        }*/
       /* btn.onclick = function() {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'multinomialv_data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };*/
        
    } catch (error) {
        console.error("Error en formulario de Multinomial V:", error);
        alert("Error al crear la gráfica: " + error.message);
    }
}

async function handleNormale(e) {
    e.preventDefault();
    try {
        console.log("Manejando formulario Normal Estandar");
        const data = await makeRequest('normale', new FormData(this));
        const resultados = data.results;

        const charData = [{
            x: resultados,
            type: 'histogram',
            marker: {
                color: '#ad9664ff',
                line: {
                    color: '#88764fff',
                    width: 1
                }
            }
        }];

        const layout = {
            title: {
                text: "Distribución Normal Estándar",
                font: { size: 24, color: '#222e4e' }
            },
            xaxis: {
                title: {
                    text: "Valor",
                    font: { size: 22, color: '#222e4e' }
                },
                tickfont: { size: 18, color: '#222e4e' }
            },
            yaxis: {
                title: {
                    text: "Frecuencia",
                    font: { size: 22, color: '#222e4e' }
                },
                tickfont: { size: 18, color: '#222e4e' }
            },
            bargap: 0.05
        };

        Plotly.newPlot('normale_plot', charData, layout);

        createCSVDownloadButton({
            btnId: 'normale_csv_btn',
            plotDivId: 'normale_plot',
            filename: 'normale_data.csv',
            headers: ['Valor'],
            rows: resultados.map(v => [v])
        });
    } catch (error) {
        console.error("Error en formulario de Normal Estandar:", error);
    }
}

async function handleNormalMV(e) {
    e.preventDefault();
    try {
        console.log("Manejando formulario Normal Multivariante");
        const data = await makeRequest('normalmv', new FormData(this));
        const resultados = data.results;

        const charData = [{
            x: resultados,
            type: 'histogram',
            marker: {
                color:'#ad9664ff',
                line:{
                    color: '#88764fff',
                    width: 1
                }
            }
        }];

        const layout = {
            title: {
                text: "Distribución Normal Multivariante",
                font: { size: 24, color: '#222e4e' }
            },
            xaxis: {
                title: { text: "Valor", font: { size: 22, color: '#222e4e' } },
                tickfont: { size: 18, color: '#222e4e' }
            },
            yaxis: {
                title: { text: "Frecuencia", font: { size: 22, color: '#222e4e' } },
                tickfont: { size: 18, color: '#222e4e' }
            },
            bargap: 0.05
        };

        Plotly.newPlot('normalmv_plot', charData, layout);

        createCSVDownloadButton({
            btnId: 'normalmv_csv_btn',
            plotDivId: 'normalmv_plot',
            filename: 'normalmv_data.csv',
            headers: ['Valor'],
            rows: resultados.map(v => [v])
        });

        btn.onclick = function() {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'normalmv_data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

    } catch (error) {
        console.error("Error en formulario de Normal Multivariante:", error);
    }
}

async function handleNormalBiv(e) {
    e.preventDefault();
    try {
        console.log("Manejando formulario Normal Bivariada");
        const data = await makeRequest('normalbiv', new FormData(this));

        const resultadosX = Array.isArray(data.resultsX) ? data.resultsX : [];
        const resultadosY = Array.isArray(data.resultsY) ? data.resultsY : [];

        // ---- Configuración de límites y bins (igual que Gibbs) ----
        const arrMinMax = (arr) => {
            let min = Infinity, max = -Infinity;
            for (const v of arr) { if (v < min) min = v; if (v > max) max = v; }
            return [min, max];
        };

        const [xDataMin, xDataMax] = arrMinMax(resultadosX);
        const [yDataMin, yDataMax] = arrMinMax(resultadosY);

        const xMin = data?.limits?.xMin ?? xDataMin;
        const xMax = data?.limits?.xMax ?? xDataMax;
        const yMin = data?.limits?.yMin ?? yDataMin;
        const yMax = data?.limits?.yMax ?? yDataMax;

        const binsX = Number(data?.bins?.x ?? data?.binsX ?? 50);
        const binsY = Number(data?.bins?.y ?? data?.binsY ?? 50);

        if (!Number.isFinite(xMin) || !Number.isFinite(xMax) || !Number.isFinite(yMin) || !Number.isFinite(yMax)) {
            throw new Error("Límites inválidos para el histograma 3D.");
        }
        if (xMax <= xMin || yMax <= yMin) {
            throw new Error("Rangos inválidos: xMax > xMin y yMax > yMin.");
        }

        const dx = (xMax - xMin) / binsX;
        const dy = (yMax - yMin) / binsY;

        // ---- Histograma 2D ----
        const hist = Array.from({ length: binsX }, () => Array(binsY).fill(0));
        let inRangeCount = 0;
        for (let i = 0; i < resultadosX.length; i++) {
            const x = resultadosX[i];
            const y = resultadosY[i];
            if (x >= xMin && x <= xMax && y >= yMin && y <= yMax) {
                let ix = Math.floor((x - xMin) / dx);
                let iy = Math.floor((y - yMin) / dy);
                if (ix === binsX) ix = binsX - 1;
                if (iy === binsY) iy = binsY - 1;
                if (ix >= 0 && ix < binsX && iy >= 0 && iy < binsY) {
                    hist[ix][iy] += 1;
                    inRangeCount++;
                }
            }
        }

        // CSV (pares en rango)
        createCSVDownloadButton({
            btnId: 'normalbiv_csv_btn',
            plotDivId: 'normalbiv_plot',
            filename: 'normalbiv_data.csv',
            headers: ['X', 'Y'],
            rows: resultadosX
                .map((vx, i) => [vx, resultadosY[i]])
                .filter(([x,y]) => x >= xMin && x <= xMax && y >= yMin && y <= yMax)
        });

        if (inRangeCount === 0) {
            Plotly.newPlot('normalbiv_plot', [], {
                title: { text: 'Histograma 3D (Normal Bivariada)', font: { size: 24 } },
                annotations: [{
                    text: 'No hay puntos dentro del límite especificado.',
                    x: 0.5, y: 0.5, xref: 'paper', yref: 'paper', showarrow: false, font: { size: 18 }
                }]
            });
            return;
        }

        // ---- Construcción de cubos estilo Gibbs ----
        const X = [], Y = [], Z = [], I = [], J = [], K = [], intensity = [], hovertext = [];
        const baseI = [0,0,0,7,4,5,1,2,3,6,6,6];
        const baseJ = [1,2,3,4,5,6,7,3,0,5,4,7];
        const baseK = [2,3,1,0,6,1,2,7,4,2,7,5];

        let vCount = 0;
        for (let ix = 0; ix < binsX; ix++) {
            for (let iy = 0; iy < binsY; iy++) {
                const freq = hist[ix][iy];
                if (freq <= 0) continue;

                const x0 = xMin + ix * dx;
                const y0 = yMin + iy * dy;
                const z0 = 0;
                const h  = freq;

                const vx = [x0, x0+dx, x0+dx, x0,   x0,    x0+dx, x0+dx, x0   ];
                const vy = [y0, y0,    y0+dy, y0+dy, y0,   y0,    y0+dy, y0+dy];
                const vz = [z0, z0,    z0,    z0,    z0+h, z0+h,  z0+h,  z0+h ];

                X.push(...vx); Y.push(...vy); Z.push(...vz);

                for (let t = 0; t < baseI.length; t++) {
                    I.push(vCount + baseI[t]);
                    J.push(vCount + baseJ[t]);
                    K.push(vCount + baseK[t]);
                }

                for (let k = 0; k < 8; k++) intensity.push(freq);

                const ht = `X: [${x0.toFixed(3)}, ${(x0+dx).toFixed(3)})` +
                           `<br>Y: [${y0.toFixed(3)}, ${(y0+dy).toFixed(3)})` +
                           `<br>Frecuencia: ${freq}`;
                for (let k = 0; k < 8; k++) hovertext.push(ht);

                vCount += 8;
            }
        }

        const trace = {
            type: 'mesh3d',
            x: X, y: Y, z: Z,
            i: I, j: J, k: K,
            intensity: intensity,
            colorscale: 'Viridis',
            showscale: true,
            colorbar: {
                title: { text: 'Frecuencia', side: 'right', font: { size: 14 } }
            },
            flatshading: true,
            hoverinfo: 'text',
            text: hovertext,
            opacity: 0.95
        };

        const layout = {
            title: { text: 'Histograma 3D (Normal Bivariada)', font: { size: 24, color: '#222e4e' } },
            scene: {
                xaxis: {
                    title: { text: 'X', font: { size: 22, color: '#222e4e' } },
                    tickfont: { size: 14, color: '#222e4e' }
                },
                yaxis: {
                    title: { text: 'Y', font: { size: 22, color: '#222e4e' } },
                    tickfont: { size: 14, color: '#222e4e' }
                },
                zaxis: {
                    title: { text: 'Frecuencia', font: { size: 22, color: '#222e4e' } },
                    tickfont: { size: 14, color: '#222e4e' }
                },
                camera: { eye: { x: 1.6, y: 1.6, z: 0.9 } },
                aspectmode: 'cube'
            },
            margin: { l: 0, r: 0, b: 10, t: 50 }
        };

        Plotly.newPlot('normalbiv_plot', [trace], layout, { responsive: true });

    } catch (error) {
        console.error("Error en formulario de Normal Bivariada:", error);
        Plotly.purge('normalbiv_plot');
        Plotly.newPlot('normalbiv_plot', [], {
            title: { text: 'Histograma 3D (Normal Bivariada)', font: { size: 24 } },
            annotations: [{
                text: 'Ocurrió un error generando la gráfica.',
                x: 0.5, y: 0.5, xref: 'paper', yref: 'paper', showarrow: false, font: { size: 16 }
            }]
        });
    }
}





async function handleGibbs(e) {
    e.preventDefault();
    try{
        console.log("Manejando formulario de Gibbs");
        const data = await makeRequest('gibbs', new FormData(this));

        const resultadosX = Array.isArray(data.resultsX) ? data.resultsX : [];
        const resultadosY = Array.isArray(data.resultsY) ? data.resultsY : [];

        // ---- Configuración de límites y bins (con fallback) ----
        const arrMinMax = (arr) => {
            let min = Infinity, max = -Infinity;
            for (const v of arr) { if (v < min) min = v; if (v > max) max = v; }
            return [min, max];
        };

        const [xDataMin, xDataMax] = arrMinMax(resultadosX);
        const [yDataMin, yDataMax] = arrMinMax(resultadosY);

        const xMin = data?.limits?.xMin ?? xDataMin;
        const xMax = data?.limits?.xMax ?? xDataMax;
        const yMin = data?.limits?.yMin ?? yDataMin;
        const yMax = data?.limits?.yMax ?? yDataMax;

        const binsX = Number(data?.bins?.x ?? data?.binsX ?? 12);
        const binsY = Number(data?.bins?.y ?? data?.binsY ?? 12);

        if (!Number.isFinite(xMin) || !Number.isFinite(xMax) || !Number.isFinite(yMin) || !Number.isFinite(yMax)) {
            throw new Error("Límites inválidos para el histograma 3D.");
        }
        if (xMax <= xMin || yMax <= yMin) {
            throw new Error("Rangos inválidos: xMax > xMin y yMax > yMin.");
        }

        const dx = (xMax - xMin) / binsX;
        const dy = (yMax - yMin) / binsY;

        // ---- Histograma 2D (solo puntos dentro del límite) ----
        const hist = Array.from({ length: binsX }, () => Array(binsY).fill(0));
        let inRangeCount = 0;
        for (let i = 0; i < resultadosX.length; i++) {
            const x = resultadosX[i];
            const y = resultadosY[i];
            if (x >= xMin && x <= xMax && y >= yMin && y <= yMax) {
                // índice de bin (incluir borde superior en el último bin)
                let ix = Math.floor((x - xMin) / dx);
                let iy = Math.floor((y - yMin) / dy);
                if (ix === binsX) ix = binsX - 1;
                if (iy === binsY) iy = binsY - 1;
                if (ix >= 0 && ix < binsX && iy >= 0 && iy < binsY) {
                    hist[ix][iy] += 1;
                    inRangeCount++;
                }
            }
        }

        // CSV (pares en rango)
        createCSVDownloadButton({
            btnId: 'gibbs_csv_button',
            plotDivId: 'gibbs_plot',
            filename: 'gibbs_data.csv',
            headers: ['Valor X', 'Valor Y'],
            rows: resultadosX
                .map((vx, i) => [vx, resultadosY[i]])
                .filter(([x,y]) => x >= xMin && x <= xMax && y >= yMin && y <= yMax)
        });

        if (inRangeCount === 0) {
            Plotly.newPlot('gibbs_plot', [], {
                title: { text: 'Histograma 3D (Gibbs)', font: { size: 24 } },
                annotations: [{
                    text: 'No hay puntos dentro del límite especificado.',
                    x: 0.5, y: 0.5, xref: 'paper', yref: 'paper', showarrow: false, font: { size: 18 }
                }]
            });
            return;
        }

        // ---- Construcción de cubos en un solo mesh3d ----
        const X = [], Y = [], Z = [], I = [], J = [], K = [], intensity = [], hovertext = [];
        const baseI = [0,0,0,7,4,5,1,2,3,6,6,6];
        const baseJ = [1,2,3,4,5,6,7,3,0,5,4,7];
        const baseK = [2,3,1,0,6,1,2,7,4,2,7,5];

        let vCount = 0; // contador de vértices
        let maxFreq = 0;
        for (let ix = 0; ix < binsX; ix++) {
            for (let iy = 0; iy < binsY; iy++) {
                if (hist[ix][iy] > maxFreq) maxFreq = hist[ix][iy];
            }
        }

        for (let ix = 0; ix < binsX; ix++) {
            for (let iy = 0; iy < binsY; iy++) {
                const freq = hist[ix][iy];
                if (freq <= 0) continue;

                const x0 = xMin + ix * dx;
                const y0 = yMin + iy * dy;
                const z0 = 0;
                const h  = freq; // altura = frecuencia

                // 8 vértices del cubo
                const vx = [x0, x0+dx, x0+dx, x0,   x0,    x0+dx, x0+dx, x0   ];
                const vy = [y0, y0,    y0+dy, y0+dy, y0,   y0,    y0+dy, y0+dy];
                const vz = [z0, z0,    z0,    z0,    z0+h, z0+h,  z0+h,  z0+h ];

                X.push(...vx); Y.push(...vy); Z.push(...vz);

                // indices de triángulos (12) con offset
                for (let t = 0; t < baseI.length; t++) {
                    I.push(vCount + baseI[t]);
                    J.push(vCount + baseJ[t]);
                    K.push(vCount + baseK[t]);
                }

                // intensidad por vértice (para colorscale)
                // usamos la frecuencia directa (Plotly escala automáticamente)
                for (let k = 0; k < 8; k++) intensity.push(freq);

                // hover text (mismo para los 8 vértices)
                const ht = `X: [${x0.toFixed(3)}, ${(x0+dx).toFixed(3)})` +
                           `<br>Y: [${y0.toFixed(3)}, ${(y0+dy).toFixed(3)})` +
                           `<br>Frecuencia: ${freq}`;
                for (let k = 0; k < 8; k++) hovertext.push(ht);

                vCount += 8;
            }
        }

        /*Graficado de todos los puntos */
        const scatter2D={
            type: 'scattergl',
            mode: 'markers',
            x:resultadosX,
            y:resultadosY,
            marker: {size: 4, opacity: 0.7},
            name: 'Muestras (X,Y)'
        }

        const layout2D = {
            title: { text: 'Histograma completo 2D (muestras sin filtrar)', font: { size: 24, color: '#222e4e' } },
            xaxis: { title: { text: 'X' } },
            yaxis: { title: { text: 'Y' } },
            paper_bgcolor: '#ffffff',
            margin: { l: 50, r: 10, b: 40, t: 60 }
        };

        const trace = {
            type: 'mesh3d',
            x: X, y: Y, z: Z,
            i: I, j: J, k: K,
            intensity: intensity,
            colorscale: 'YlGnBu',
            showscale: true,
            colorbar: {
                title: { text: 'Frecuencia', side: 'right', font: { size: 14 } }
            },
            flatshading: true,
            lighting: { ambient: 0.5, diffuse: 0.8, specular: 0.2, roughness: 0.9 },
            hoverinfo: 'text',
            text: hovertext,
            opacity: 0.95
        };

        const layout = {
            title: { text: 'Histograma 3D (Gibbs)', font: { size: 24, color: '#222e4e' } },
            scene: {
                xaxis: {
                    title: { text: 'X', font: { size: 22, color: '#222e4e' } },
                    tickfont: { size: 14, color: '#222e4e' },
                    backgroundcolor: '#f8f9fb',
                    gridcolor: '#e8ecf3',
                    zerolinecolor: '#ccd6e0'
                },
                yaxis: {
                    title: { text: 'Y', font: { size: 22, color: '#222e4e' } },
                    tickfont: { size: 14, color: '#222e4e' },
                    backgroundcolor: '#f8f9fb',
                    gridcolor: '#e8ecf3',
                    zerolinecolor: '#ccd6e0'
                },
                zaxis: {
                    title: { text: 'Frecuencia', font: { size: 22, color: '#222e4e' } },
                    tickfont: { size: 14, color: '#222e4e' },
                    gridcolor: '#e8ecf3',
                    zerolinecolor: '#ccd6e0'
                },
                camera: { eye: { x: 1.6, y: 1.6, z: 0.9 } }, // vista agradable
                aspectmode: 'cube'
            },
            paper_bgcolor: '#ffffff',
            margin: { l: 0, r: 0, b: 10, t: 50 }
        };

        Plotly.newPlot('gibbs_plot', [trace], layout, {responsive: true});

        /*Botones para alternar */
        const btn2D = document.getElementById('btn_2d');
        const btn3D = document.getElementById('btn_3d');

        if (btn2D) {
            btn2D.onclick = () => {
                Plotly.newPlot('gibbs_plot', [scatter2D], layout2D, { responsive: true });
            };
        }
        if (btn3D) {
            btn3D.onclick = () => {
                Plotly.newPlot('gibbs_plot', [trace], layout, { responsive: true });
            };
        }


    } catch(error){
        console.error("Error en formulario de Gibbs:", error);
        Plotly.purge('gibbs_plot');
        Plotly.newPlot('gibbs_plot', [], {
            title: { text: 'Histograma 3D (Gibbs)', font: { size: 24 } },
            annotations: [{
                text: 'Ocurrió un error generando la gráfica.',
                x: 0.5, y: 0.5, xref: 'paper', yref: 'paper', showarrow: false, font: { size: 16 }
            }]
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('funcion');
  const preview = document.getElementById('funcion_preview');
  if (!input || !preview || typeof katex === 'undefined') return;

  const exprToLatex = (s) => {
    if (!s) return '';
    let t = s.trim();

    // Quita espacios
    t = t.replace(/\s+/g, '');

    // Fracciones simples a \frac{a}{b}
    t = t.replace(/(?<![a-zA-Z0-9_])(\d+)\s*\/\s*(\d+)(?![a-zA-Z0-9_])/g, '\\frac{$1}{$2}');

    // Quitar * entre número y variable: 2*x -> 2x, x*y -> x\cdot y
    t = t.replace(/(\d+)\*([a-zA-Z])/g, '$1$2');     // 2*x -> 2x
    t = t.replace(/([a-zA-Z])\*(\d+)/g, '$1$2');     // x*2 -> x2 (raro pero común en input)
    t = t.replace(/([a-zA-Z])\*([a-zA-Z])/g, '$1\\cdot $2'); // x*y -> x·y

    // Potencias: x^2, (x+y)^3
    t = t.replace(/\^\(/g, '^{('); // por si escriben ^(…
    t = t.replace(/\^([a-zA-Z0-9]+)/g, '^{$1}');

    // Paréntesis bonitos
    t = t.replace(/\(/g, '\\left(').replace(/\)/g, '\\right)');

    // Multiplicaciones restantes con * a \cdot
    t = t.replace(/\*/g, '\\cdot ');

    return t;
  };

  const render = () => {
    const raw = input.value || '';
    const latex = exprToLatex(raw);
    try {
      // Puedes cambiar el prefijo por p(x,y)= si quieres
      katex.render(`f(x,y)= ${latex}`, preview, { throwOnError: false });
    } catch {
      preview.textContent = ''; // si hay error, limpia
    }
  };

  render();                 // render inicial con el valor por defecto
  input.addEventListener('input', render);
});
