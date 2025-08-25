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

async function makeRequest(endpoint, formData, plotElementId) {
    try {
        const params = new URLSearchParams();
        for (const [key, value] of formData.entries()) {
            params.append(key, value);
        }

        // Hacer petición - ¡USAR BACKTICKS!
        console.log(`Haciendo solicitud a ${endpoint} con parámetros: ${params.toString()}`);
        console.log('URL completa:', `/api/${endpoint}?${params}`);
        const response = await fetch(`/api/${endpoint}?${params}`);

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Respuesta de ${endpoint}:`, data);

        // Mostrar resultados (aquí va tu lógica de visualización)
        alert(`Datos recibidos: ${JSON.stringify(data)}`);
        
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    }
}

async function handleBernoulli(e){
    e.preventDefault();
    console.log("Manejando formulario de Bernoulli");
    await makeRequest('bernoulli', new FormData(this), 'bernoulli_plot');
}

async function handleBinomial(e){
    e.preventDefault();
    await makeRequest('binomial', new FormData(this), 'binomial_plot');
}

async function handleExponencial(e){
    e.preventDefault();
    await makeRequest('exponencial', new FormData(this), 'exponencial_plot');
}

async function handleMultinomialF(e){
    e.preventDefault();
    await makeRequest('multinomialf', new FormData(this), 'multinomialf_plot');
}

async function handleMultinomialV(e){
    e.preventDefault();
    await makeRequest('multinomialv', new FormData(this), 'multinomialv_plot');
}