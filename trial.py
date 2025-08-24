import ctypes
import numpy as np
import matplotlib.pyplot as plt


def plot_results(data, title):
    # Crear histograma con bins automáticos
    plt.figure(figsize=(14,6))
    plt.hist(data, bins='auto', color='skyblue', edgecolor='black')
    plt.title(title)
    plt.xlabel("Valor")
    plt.ylabel("Número de ocurrencias")
    plt.tight_layout()
    plt.show()

#cargamos la libreria
lib = ctypes.CDLL("/home/samuel/Documents/Universidad/mineria/muestreo/libmuestreo.so")

#Definir prototipo
#void muestreoBernulli(double *success, double *failure, double theta, int n)
lib.muestreoBernulli.argtypes = [ctypes.POINTER(ctypes.c_double), ctypes.POINTER(ctypes.c_double), ctypes.c_double, ctypes.c_int]
lib.muestreoBernulli.restype = None

#void muestreoBinomial(double *success, double theta, int n, int k)
lib.muestreoBinomial.argtypes = [ctypes.POINTER(ctypes.c_double), ctypes.c_double, ctypes.c_int, ctypes.c_int]
lib.muestreoBinomial.restype = None

#void muestreoMultinomialFixedl(int slices, int n, int k, double **results)
lib.muestreoMultinomialFixedl.argtypes = [ctypes.c_int, ctypes.c_int, ctypes.c_int, ctypes.POINTER(ctypes.POINTER(ctypes.c_double))]
lib.muestreoMultinomialFixedl.restype = None

#void muestreoMultinomialDynamic(double *thetas, int n, int k, double **results)
lib.muestreoMultinomialDynamic.argtypes = [ctypes.POINTER(ctypes.c_double), ctypes.c_int, ctypes.c_int, ctypes.POINTER(ctypes.POINTER(ctypes.c_double))]
lib.muestreoMultinomialDynamic.restype = None

#void muestreoExponencial(double lambda, int n, double *results)
lib.muestreoExponencial.argtypes = [ctypes.c_double, ctypes.c_int, ctypes.POINTER(ctypes.c_double)]
lib.muestreoExponencial.restype = None


theta = 0.5
n = 100000
k = 1000
success = (ctypes.c_double * k)()  # Allocate array of k doubles

lib.muestreoBinomial(success, theta, n, k)

# Convert to numpy array for easy slicing/printing
success_np = np.ctypeslib.as_array(success, shape=(k,))

print("Sample Completed. Generating Plots...")
plot_results(success_np, "Muestreo Binomial")


