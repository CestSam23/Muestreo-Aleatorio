document.addEventListener('DOMContentLoaded', () => {
    const forms ={
        'bernoulli_form' : handleBernoulli,
        'binomial_form' : handleBinomial,
        'exponencial_form' : handleExponencial,
        'multinomialf_form' : handleMultinomialF,
        'multinomialv_form' : handleMultinomialV
    };

    //Asignar event listeners a cada formulario
    for(const [formId, handler] of Object.entries(forms)){
        const form = document.getElementById(formId);
        if(form){
            form.addEventListener('submit',handler);
        }
    }
});

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

async function handleBernoulli(e){
    e.preventDefault();
    try{
        console.log("Manejando formulario de Bernoulli");
        const data = await makeRequest('bernoulli', new FormData(this));
        
        const charData = [{
            x: ['Exitos', 'Fracasos'],
            y: [data.success, data.failure],
            type: 'bar',
            marker: {
                color: ['#2ecc71', '#e74c3c']
            }
        }];

        const layout = {
            title: `Distribución Bernoulli (Éxitos: ${data.success}, Fracasos: ${data.failure})`,
        };
        
        Plotly.newPlot('bernoulli_plot', charData,layout);

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
            type: 'histogram'
        }];

        const layout = {
            title: "Distribución Binomial",
            xaxis: {title: {text: "Número de éxitos"}},
            yaxis: {title: {text: "Frecuecnia"}}

            
        };

        Plotly.newPlot('binomial_plot', charData,layout);
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
            type: 'histogram'
        }];

        const layout = {
            title: "Distribución Exponencial",
            xaxis: {title: {text: "Valor"}},
            yaxis: {title: {text: "Frecuencia"}}
        };

        Plotly.newPlot('exponencial_plot', charData,layout);
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
        const categorias = resultados[0].length;
        
        
        // Preparar datos para surface plot
        const zData = resultados;
        
        // Coordenadas para los ejes
        const xValues = Array.from({length: experimentos}, (_, i) => i + 1);
        const yValues = Array.from({length: categorias}, (_, i) => i + 1);
        
        const trace = {
            x: xValues,  // Experimentos: [1, 2, 3, ...]
            y: yValues,  // Categorías: [1, 2, 3, ...]
            z: zData,    // Matriz 2D de frecuencias
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
                text: `Distribución Multinomial Fixed<br>${experimentos} experimentos × ${categorias} categorías`,
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
                    y: categorias * 0.5,
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
        
    } catch (error) {
        console.error("Error en formulario de Multinomial F:", error);
        alert("Error al crear la gráfica: " + error.message);
    }
}

async function handleMultinomialV(e) {
    e.preventDefault();
    try {
        console.log("Manejando formulario de Multinomial V");
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
        
    } catch (error) {
        console.error("Error en formulario de Multinomial V:", error);
        alert("Error al crear la gráfica: " + error.message);
    }
}