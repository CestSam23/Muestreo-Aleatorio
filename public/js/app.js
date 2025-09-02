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
        'gibbs_form' : handleGibbs
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
            type: 'bar',
            /* En efecto, Angie le sabe al diseño.*/
            marker: {
                color: ['#ad9664ff', '#222e4e']
            }
        }];

        const layout = {
            title: `Distribución Bernoulli (Éxitos: ${data.success}, Fracasos: ${data.failure})`,
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
            title: "Distribución Binomial",
            xaxis: {title: {text: "Número de éxitos"}},
            yaxis: {title: {text: "Frecuecnia"}},
            bargap: 0.05

            
        };

        Plotly.newPlot('binomial_plot', charData,layout);
        // Count frequency of each result
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
            title: "Distribución Exponencial",
            xaxis: {title: {text: "Valor"}},
            yaxis: {title: {text: "Frecuencia"}},
            bargap: 0.05
        };

        Plotly.newPlot('exponencial_plot', charData,layout);
        // Each value is a sample, so just output as a single column
        createCSVDownloadButton({
            btnId: 'exponencial_csv_btn',
            plotDivId: 'exponencial_plot',
            filename: 'exponencial_data.csv',
            headers: ['Valor'],
            rows: resultados.map(v => [v])
        });
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
        btn.onclick = function() {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'multinomialf_data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
        
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
    try{
        console.log("Manejando formulario Normal Estandar");
        const data = await makeRequest('normale',new FormData(this));
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
            title: "Distribución Normal Estandar",
            xaxis: {title: {text: "Valor"}},
            yaxis: {title: {text: "Frecuencia"}},
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
       /* // --- JSON Download Button Logic ---
        let btn = document.getElementById('normale_json_btn');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'normale_json_btn';
            btn.textContent = 'Descargar JSON';
            btn.style.marginTop = '10px';
            const plotDiv = document.getElementById('normale_plot');
            plotDiv.parentNode.insertBefore(btn, plotDiv.nextSibling);
        }*/
        btn.onclick = function() {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'normale_data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
    } catch (error) {
        console.error("Error en formulario de Normal Estandar:", error);
    }
}

async function handleNormalMV(e) {
    e.preventDefault();
    try{
        console.log("Manejando formulario Normal Multivariante");
        const data = await makeRequest('normalmv',new FormData(this));
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
            title: "Distribución Normal Multivariante",
            xaxis: {title: {text: "Valor"}},
            yaxis: {title: {text: "Frecuencia"}},
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
        /*// --- JSON Download Button Logic ---
        let btn = document.getElementById('normalmv_json_btn');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'normalmv_json_btn';
            btn.textContent = 'Descargar JSON';
            btn.style.marginTop = '10px';
            const plotDiv = document.getElementById('normalmv_plot');
            plotDiv.parentNode.insertBefore(btn, plotDiv.nextSibling);
        }*/
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

async function handleGibbs(e) {
    e.preventDefault();
    try{
        console.log("Manejando formulario de Gibbs");
        const data = await makeRequest('gibbs', new FormData(this));
        const resultadosX = data.resultsX;
        const resultadosY = data.resultsY;

        // Each value is a sample, so just output as a single column
        createCSVDownloadButton({
            btnId: 'gibbs_csv_button',
            plotDivId: 'gibbs_plot',
            filename: 'gibbs_data.csv',
            headers: ['Valor X', 'Valor Y'],
            rows: resultadosX.map((v, i) => [v, resultadosY[i]])
        });

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
        
    } catch(error){
        console.error("Error en formulario de Gibbs:", error);
    }
}