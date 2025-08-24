import ctypes
import numpy as np
import matplotlib.pyplot as plt


def plot_results(data, title):
    # data debe ser un array 1D con las ocurrencias de cada slice
    plt.figure(figsize=(8,6))
    slices = len(data)
    x = np.arange(slices)
    plt.bar(x, data, color='skyblue', edgecolor='black')
    plt.xlabel('Slice')
    plt.ylabel('Número de ocurrencias')
    plt.title(title)
    plt.xticks(x)
    plt.tight_layout()
    plt.show()

#cargamos la libreria
lib = ctypes.CDLL("/home/samuel/Documents/Universidad/mineria/muestreo/libmuestreo.so")

#Definir prototipo

#void muestreoMultinomialFixedl(int slices, int n, int k, double **results)
lib.muestreoMultinomialFixedl.argtypes = [ctypes.c_int, ctypes.c_int, ctypes.c_int, ctypes.POINTER(ctypes.POINTER(ctypes.c_double))]
lib.muestreoMultinomialFixedl.restype = None

slices = 6
n=1000
k=20
results = (ctypes.POINTER(ctypes.c_double) * k)()
for i in range(k):
    results[i] = (ctypes.c_double * slices)()  # Allocate array of n doubles


lib.muestreoMultinomialFixedl(slices, n, k, results)

# Convert C double** results to numpy array manually
output = np.zeros((k, slices))
for i in range(k):
    output[i, :] = np.ctypeslib.as_array(results[i], shape=(slices,))

print("Sample Completed. Generating Plots...")
print(output)
plot_results(output[0], "Muestreo Multinomial Fijo")

