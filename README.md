# Muestreo-Aleatorio

This project is a web-based simulation tool for random sampling distributions, including Bernoulli, Binomial, Exponential, and Multinomial (with both fixed and variable probabilities). It combines a C++ backend for high-performance sampling, a Node.js server for API endpoints, and a modern frontend for interactive visualization.

## Features
- **Bernoulli, Binomial, Exponential, Multinomial, and Normal sampling**
- Interactive web interface with forms for each distribution
- Dynamic plots using Plotly.js (bar, histogram, and ribbon plots)
- **Download results as CSV:** After each simulation, a "Descargar CSV" button appears to let you download the generated data.
- Fast C++ backend for simulation logic (via FFI)
- Node.js server for API and static file serving

## Project Structure
```
muestreo/
├── libmuestreo.so           # Compiled C++ library for sampling
├── muestreo.cpp             # C++ source code
├── server.js                # Node.js server
├── public/
│   ├── index.html           # Main web page
│   └── js/
│       └── app.js           # Frontend logic (fetch, plotting, CSV download)
└── ...
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- GCC or compatible C++ compiler
- Python 3 (for some scripts, optional)
- npm (for installing dependencies)

### Build the C++ Library
```
g++ -shared -fPIC -o libmuestreo.so muestreo.cpp
```

### Install Node.js Dependencies
```
npm install ffi-napi ref-napi
```

### Run the Server
```
node server.js
```

Visit [http://localhost:8080](http://localhost:8080) in your browser.

## Usage
- Fill out the forms for the desired distribution.
- Click "Simular" to run the simulation.
- Results and plots will appear dynamically without reloading the page.
- **Download CSV:** After each plot is shown, click the "Descargar CSV" button to download the simulation data as a CSV file.

## API Endpoints
- `/api/bernoulli`
- `/api/binomial`
- `/api/exponencial`
- `/api/multinomialf`
- `/api/multinomialv`
- `/api/normale`
- `/api/normalmv`
- `/api/gibbs`

All endpoints expect GET requests with appropriate query parameters.

## Contributing
Pull requests and suggestions are welcome!

## License
MIT License
