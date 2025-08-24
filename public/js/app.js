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

async function makeRequest(endpoint,formData, plotElementId){
    
}

async function handleBernoulli(e){
    e.preventDefault();
    await makeRequest('/bernoulli', new FormData(this), 'bernoulli_plot');
}

async function handleBinomial(e){
    e.preventDefault();
    await makeRequest('/binomial', new FormData(this), 'binomial_plot');
}

async function handleExponencial(e){
    e.preventDefault();
    await makeRequest('/exponencial', new FormData(this), 'exponencial_plot');
}

async function handleMultinomialF(e){
    e.preventDefault();
    await makeRequest('/multinomialf', new FormData(this), 'multinomialf_plot');
}

async function handleMultinomialV(e){
    e.preventDefault();
    await makeRequest('/multinomialv', new FormData(this), 'multinomialv_plot');
}