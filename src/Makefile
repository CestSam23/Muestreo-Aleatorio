# Nombre de la librería
TARGET = libmuestreo.so
SRC    = muestreo.cpp
OBJ    = $(SRC:.cpp=.o)

# Flags de compilación y linkeo
CXX      = g++
CXXFLAGS = -std=c++17 -O2 -fPIC $(shell pkg-config --cflags ginac)
LDFLAGS  = -shared
LIBS     = $(shell pkg-config --libs ginac)

# Regla por defecto
all: $(TARGET)

# Construcción de la .so
$(TARGET): $(OBJ)
	$(CXX) $(LDFLAGS) -o $@ $^ $(LIBS)

# Compilación del .o
%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

# Limpieza
clean:
	rm -f $(OBJ) $(TARGET)
