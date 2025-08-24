const http = require("http");
const host = ("localhost");
const port = 8080;
const fs = require('fs').promises

//Para libreria de C
const ffi = require('ffi-napi');
const ref = require('ref-napi');

//Definimos punteros a double
const double = ref.types.double;
const doublePtr = ref.refType(double);
const doublePtrPtr = ref.refType(doublePtr);

const lib = ffi.Library('./libmuestreo.so', {
    muestreoBernulli: ["void", [doublePtr, doublePtr,"double","int"]],
    muestreoBinomial: ["void", [doublePtr,"double","int","int"]],
    muestreoExponencial: ["void", ["double","int",doublePtr]],
    muestreoMultinomialFixedl: ["void",["double","int","int","int",doublePtrPtr]],
    muestreoMultinomialDynamic: ["void", [doublePtr,"int","int",doublePtrPtr]]
});

module.exports = lib;

const requestListener = function (req, res) {
    res.setHeader("Content-Type", "text/html");
    let found = true;
    switch(req.url){
        case "/bernoulli":
            console.log("Request for Bernoulli distribution");
            break;
        case "/binomial":
            console.log("Request for Binomial distribution");
            break;
        case "/exponencial":
            console.log("Request for Exponential distribution");
            break;
        case "/multinomialf":
            console.log("Request for Multinomial Fixed distribution");
            break;
        case "/multinomialv":
            console.log("Request for Multinomial Variable distribution");
            break;
        case "/":
            // Página principal
            break;
        default:
            found = false;
    }
    if (!found) {
        res.writeHead(404);
        res.end("Not Found");
        return;
    }
    fs.readFile(__dirname + '/index.html')
        .then(contents => {
            res.writeHead(200);
            res.end(contents);
        })
        .catch(err => {
            res.writeHead(500);
            res.end(err.toString());
        });
};



const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});