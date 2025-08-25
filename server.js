const http = require("http");
const host = ("localhost");
const port = 8080;
const fs = require('fs').promises

const {URL} = require('url');
const parseQueryParams = (url) => {
  const parsedUrl = new URL(url, `http://${host}:${port}`);
  const params = {};
  parsedUrl.searchParams.forEach((value, key) => {
    params[key] = isNaN(value) ? value : Number(value);
  });
  return params;
};

//Para libreria de C
const ffi = require('ffi-napi');
const ref = require('ref-napi');

//Definimos punteros a double
const double = ref.types.double;
const doublePtr = ref.refType(double);

const lib = ffi.Library('./libmuestreo.so', {
    muestreoBernulli: ["void", [doublePtr, doublePtr,"double","int"]],
    muestreoBinomial: ["void", ['pointer',"double","int","int"]],
    muestreoExponencial: ["void", ["double","int","pointer"]],
    muestreoMultinomialFixedl: ["void",["int","int","int","pointer"]],
    muestreoMultinomialDynamic: ["void", ["pointer","int","int","pointer"]],
    muestreoNormalEstandar: ["void", ["int","pointer"]],
    muestreoNormal: ["void", ["int", "double","double","pointer"]]
});

//Para crear arrays de double
function createDoubleArray(size, initialValue = 0) {
    const buffer = Buffer.alloc(size * 8); // 8 bytes por double
    for (let i = 0; i < size; i++) {
        buffer.writeDoubleLE(initialValue, i * 8);
    }
    return buffer;
}

//Devolver tipo js
function readDoubleArray(buffer, size) {
    const results = [];
    for (let i = 0; i < size; i++) {
        results.push(buffer.readDoubleLE(i * 8));
    }
    return results;
}

//Crear matriz 2d
function create2DArray(rows, cols, initialValue = 0) {
    // Crear buffers para cada fila
    const rowBuffers = [];
    for (let i = 0; i < rows; i++) {
        rowBuffers.push(createDoubleArray(cols, initialValue));
    }
    
    // Crear buffer de punteros a las filas
    const pointersBuffer = Buffer.alloc(rows * 8); // 8 bytes por puntero
    for (let i = 0; i < rows; i++) {
        pointersBuffer.writePointer(rowBuffers[i], i * 8);
    }
    
    return { pointersBuffer, rowBuffers };
}

//Devolver tipo js
function read2DArray(pointersBuffer, rowBuffers, rows, cols) {
    const results = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            row.push(rowBuffers[i].readDoubleLE(j * 8));
        }
        results.push(row);
    }
    return results;
}


module.exports = lib;

//Server
const getContentType = (filePath) => {
  const ext = filePath.split('.').pop();
  const contentTypes = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml'
  };
  return contentTypes[ext] || 'text/plain';
};

const requestListener = function (req, res) {
    //Servir archivos estáticos
    if(req.url.startsWith('/public/')){
        const filePath = __dirname + req.url;
        fs.readFile(filePath)
        .then(contents => {
            res.setHeader('Content-Type',getContentType(filePath));
            res.writeHead(200);
            res.end(contents);
        })
        .catch(err => {
            res.writeHead(404);
            res.end("File not found");
        });
        return;
    }

    if(req.url.startsWith('/api/')){
        if(req.url.startsWith('/api/bernoulli')){
            console.log("url: " + req.url);
            const params = parseQueryParams(req.url);
            const theta = params.prob_exito;
            const n = params.num_experimentos;
            const succes = ref.alloc(double,0);
            const failure = ref.alloc(double,0);

            lib.muestreoBernulli(succes,failure,theta,n);
            console.log(params);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: succes.deref(), failure: failure.deref() }));
            console.log("\n");
            return;
        } else if(req.url.startsWith('/api/binomial')){
            const params = parseQueryParams(req.url);
            const succes = createDoubleArray(params.num_experimentos);
            const theta = params.prob_exito
            const n = params.num_muestra;
            const k = params.num_experimentos;
            
            lib.muestreoBinomial(succes,theta,n,k);
            
            const resultados = readDoubleArray(succes,k);
            console.log(params);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ results: resultados}));
            console.log("\n");
            return;
        } else if(req.url.startsWith('/api/exponencial')){
            const params = parseQueryParams(req.url);
            const results = createDoubleArray(params.num_experimentos);
            const lambda = params.prob_exito;
            const n = params.num_experimentos;

            lib.muestreoExponencial(lambda,n,results);
            console.log(params);

            const resultados = readDoubleArray(results, n);

            res.setHeader('Content-Type','application/json');
            res.end(JSON.stringify({ results: resultados }));
            console.log("\n");
            return;
        } else if(req.url.startsWith('/api/multinomialf')){
            const params = parseQueryParams(req.url);
            const slices = params.cant_prob;
            const n = params.num_muestra;
            const k = params.num_experimentos;
            //Creación de buffer
            const{pointersBuffer,rowBuffers} = create2DArray(k,slices);

            //Llamar libreria
            lib.muestreoMultinomialFixedl(slices,n,k,pointersBuffer);
            console.log(params);

            //leer resultados
            const resultados = read2DArray(pointersBuffer,rowBuffers,k,slices);

            res.setHeader('Content-Type','application/json');
            res.end(JSON.stringify({ results: resultados }));
            console.log("\n");
            return;
        } else if(req.url.startsWith('/api/multinomialv')){
            const params = parseQueryParams(req.url);
            const n = params.num_muestra;
            const k = params.num_experimentos;
            
            //Obtener thetas
            let thetas;
            if(params.probs_dyn){
                if (params.probs_dyn.startsWith('[')) {
                    thetas = JSON.parse(params.probs_dyn);
                } else {
                    thetas = params.probs_dyn.split(',').map(Number);
                }
            }

            //Creación de buffer
            const{pointersBuffer,rowBuffers} = create2DArray(k,thetas.length);
            const thetasBuffer = createDoubleArray(thetas.length);
            for (let i = 0; i < thetas.length; i++) {
                thetasBuffer.writeDoubleLE(thetas[i], i * 8);
            }

            //Llamar libreria
            lib.muestreoMultinomialDynamic(thetasBuffer,n,k,pointersBuffer);
            console.log(params);

            //Leer resultados
            const resultados = read2DArray(pointersBuffer,rowBuffers,k,thetas.length);

            res.setHeader('Content-Type','application/json');
            res.end(JSON.stringify({ results: resultados }));
            console.log("\n");
            return;
        } else if(req.url.startsWith('/api/normale')){
            const params = parseQueryParams(req.url);
            const n = params.num_muestra;
            const results = createDoubleArray(n);

            console.log(params)
            lib.muestreoNormalEstandar(n,results);

            const resultados = readDoubleArray(results, n);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ results: resultados }));
            return;
        } else if(req.url.startsWith('/api/normalmv')){
            const params = parseQueryParams(req.url);
            const n = params.num_muestra;
            const media = params.media;
            const varianza = params.varianza; 
            const results = createDoubleArray(n);
            console.log(params);
            lib.muestreoNormal(n,media,varianza,results);

            const resultados = readDoubleArray(results,n);


            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ results: resultados }));
            return;

        } else{
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Endpoint API no encontrado' }));
            return;
        }


    }

    // Servir página principal
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(__dirname + '/public/index.html')
        .then(contents => {
            res.setHeader('Content-Type', 'text/html');
            res.writeHead(200);
            res.end(contents);
        })
        .catch(err => {
            res.writeHead(500);
            res.end(err.toString());
        });
        return;
    }
      // Si no es ninguna ruta conocida
    res.writeHead(404);
    res.end('Página no encontrada');
};



const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});