#include <iostream>
#include <ginac/ginac.h>
#include <ginac/parser.h>


using namespace GiNaC;


// Solve a*z + b = 0  ->  z = -b/a   (symbolic)
static ex solve_linear_symbolic(const ex& poly, const symbol& z) {
    ex a = poly.coeff(z, 1);
    ex b = poly.coeff(z, 0);
    return expand(-b/a);
}


static ex solve_quadratic_select_branch(const ex& poly, const symbol& z, const symbol& p) {
    ex a = poly.coeff(z, 2);
    ex b = poly.coeff(z, 1);
    ex c = poly.coeff(z, 0);
    ex disc = expand(pow(b, 2) - 4*a*c);

    ex r1 = expand((-b + sqrt(disc)) / (2*a));
    ex r2 = expand((-b - sqrt(disc)) / (2*a));

    if (r1.subs(p==0).expand().is_zero()) return r1;
    if (r2.subs(p==0).expand().is_zero()) return r2;
    return r1; // fallback simbólico
}

// Intenta invertir F(var|·) resolviendo F - p = 0 (solo lineal/cuadrática).
static bool invert_symbolically(const ex& F, const symbol& var, const symbol& p, ex& out_inverse) {
    // Tomar numerador y denominador de F - p
    ex num = numer(F - p);
    // ex den = denom(F - p); // no lo usamos, pero si quisieras verificar dominio está aquí

    if (!is_polynomial(num, var))
        return false;

    int deg = degree(num, var);      // grado en 'var'
    ex poly = expand(num);           // trabajar con el polinomio expandido

    if (deg == 1) {
        out_inverse = solve_linear_symbolic(poly, var);
        return true;
    } else if (deg == 2) {
        out_inverse = solve_quadratic_select_branch(poly, var, p);
        return true;
    }
    return false; // grado > 2 -> no aplicamos este método
}

int main() {
    
    std::cout << "Enter a mathematical expression involving x and y (e.g., x^2 + 2*x*y + y^2): ";
    std::string input_expression;
    std::getline(std::cin, input_expression);

    try {
        /*
        Consideramos como parámetros:
            n: Número de muestras
            fd: Función de densidad
            xp: punto arbitrario x
            yp: punto arbitrario y
            resultsX*: arreglo de tamaño n representando x
            resultsY*: arreglo de tamaño n representando y
        */

        // Create parser and register variables. INITIALIZATION
        parser reader;
        ex parsed_expression = reader(input_expression);
        symbol t("t"); symbol u("u"); symbol v("v");

        symtab table = reader.get_syms();
        symbol x = table.find("x") != table.end() ?
            ex_to<symbol>(table["x"]) :symbol("x");
        symbol y = table.find("y") != table.end() ?
            ex_to<symbol>(table["y"]) :symbol("y");
        
        //DEBUG
        std::cout << "Parsed expression: " << parsed_expression << std::endl;

        //1.) Marginal distributions from x and y. (f1(x), f2(y))
        ex marginal_x = integral(x, 0, 2, parsed_expression).eval_integ();
        ex marginal_y = integral(y, 0, 2, parsed_expression).eval_integ();

        //DEBUG
        std::cout << "Marginal with respect to x: " << marginal_x << std::endl;
        std::cout << "Marginal with respect to y: " << marginal_y << std::endl;


        //2.) Conditional probabilities. f(x|y) = f(x) / f1(x). f(y|x) f(x) / f2(y)
        ex xGivenY = parsed_expression / marginal_x;
        ex yGivenX = parsed_expression / marginal_y;

        //DEBUG
        std::cout << "Conditional probability P(x|y): " << xGivenY << std::endl;
        std::cout << "Conditional probability P(y|x): " << yGivenX << std::endl;

        //3.) Acumulativa
        //3.1) P(x|y) con t
        ex xGivenYwitht = xGivenY.subs(x == t);
        ex yGivenXwitht = yGivenX.subs(y == t);

        //3.2) Evaluate the integral in t,0.
        ex acumulativa_xy = integral(t, 0, x, xGivenYwitht).eval_integ();
        ex acumulativa_yx = integral(t, 0, y, yGivenXwitht).eval_integ();

        //DEBUG
        std::cout << "Acumulativa P(x|y): " << acumulativa_xy.simplify_indexed() << std::endl;
        std::cout << "Acumulativa P(y|x): " << acumulativa_yx.simplify_indexed() << std::endl;

        //Inversas Simbólicas. //Expresion almacenada en inversa1 e inversa2
        ex inversaX, inversaY;

        bool ok1 = invert_symbolically(acumulativa_xy, x, u, inversaX);
        bool ok2 = invert_symbolically(acumulativa_yx, y, v, inversaY);

        if (ok1) {
            std::cout << "Inversa P(x|y): " << inversaX << std::endl;
        } else {
            std::cout << "No se pudo encontrar la inversa P(x|y)." << std::endl;
            return 1;
        }

        if (ok2) {
            std::cout << "Inversa P(y|x): " << inversaY << std::endl;
        } else {
            std::cout << "No se pudo encontrar la inversa P(y|x)." << std::endl;
            return 1;
        }


        //En inversa1 e inversa2 realizamos el algoritmo.
        float xp = 4;
        float yp = 5;
        int n = 1000;
        float resultsX[n];
        float resultsY[n];
        srand(time(NULL));
        ex calX, calY;

        calX = inversaX.subs(lst{y==yp, u==numeric(rand()/(float)RAND_MAX)});
        calY = inversaY.subs(lst{x==xp, v==numeric(rand()/(float)RAND_MAX)});

        resultsX[0] = ex_to<numeric>(calX.evalf()).to_double();
        resultsY[0] = ex_to<numeric>(calY.evalf()).to_double();

        for(int i=1;i<n;i++){
            calX = inversaX.subs(lst{y==resultsY[i-1], u==numeric(rand()/(float)RAND_MAX)});
            calY = inversaY.subs(lst{x==resultsX[i-1], v==numeric(rand()/(float)RAND_MAX)});

            resultsX[i] = ex_to<numeric>(calX.evalf()).to_double();
            resultsY[i] = ex_to<numeric>(calY.evalf()).to_double();
        }
        
        //En resultsX y resultsY se almacenan los puntos. (resultsX[i],resultsY[i])

    } catch (std::exception &e) {
        std::cerr << "Error: " << e.what() << std::endl;
    }

    return 0;
}
