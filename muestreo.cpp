#include <iostream>
#include <vector>
#include <cmath>

//Library CiNaC. Check repository for more info -> https://www.ginac.de/
#include <ginac/ginac.h>
#include <ginac/parser.h>

using namespace std;
using namespace GiNaC;

int belongsTo(double *thetas){
    /*Private function. Called on multinomial.
    Return the position in which a random number is generated in a set of a sample*/

    int position = 0;
    double accumulated = 0;
    double random=double(rand())/RAND_MAX;

    while(true){
        if(random>accumulated &&
            random<thetas[position]+accumulated){
            return position;
        }
        accumulated += thetas[position];
        position++;
    }
    
}

//Funciones internas para Gibbs
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

extern "C" {
    void muestreoBernulli(double *success, double *failure, 
        double theta, int n){
        /*Let x be the number of successes. Where x=1 success, x=0 failure 
        theta = probability of success
        n = size of the sample
        */
       srand(time(NULL));
        for(int i=0;i<n;i++){
            if((double)rand()/(RAND_MAX)<theta){
                (*success)++;
            }else{
                (*failure)++;
            }
        }
    }
    void muestreoBinomial(double *success, double theta, 
        int n, int k){
        /*Let x be the number of successes. Where x=1 success, x=0 failure
        theta = probability of success
        n = size of the samples
        k = number of trials
        */
       srand(time(NULL));
       for (int i = 0; i < k; i++){
           for(int j=0;j<n;j++){
               if((double)rand()/(RAND_MAX)<theta){
                   success[i]++;
               }
           }
       }
    }

    //Muestreo con partes iguales
    void muestreoMultinomialFixedl(int slices, int n, int k,double **results){
        /*Let Slices be the probability of each case in the experiment
        where A1+A2+...+Aslices=1. 1/slices. (Same probability for each one)
        Let n be the size of the samples
        Let k be the number of trials

        Results is a vector of R2, where R2[i] is the number of successes for the i-th slice
        */
       srand(time(NULL));
        vector<double> r(slices,0.0);
        for(int i=0;i<slices;i++){
            r[i] = 1.0/slices;
        }
        
        for(int i=0;i<k;i++){
            for(int j=0;j<n;j++){
                results[i][belongsTo(r.data())]++;
            }
        }
    }

    //Muestreo con n probabilidad
    void muestreoMultinomialDynamic(double *thetas, int n, int k, double **results){
        /*Let thetas be the probability of each case in the experiment
        where A1+A2+...+Aslices=1. (Different probability for each one).
        (Array of double).
        Let n be the size of the samples
        Let k be the number of trials

        Results is a vector of R2, where R2[i] is the number of successes for the i-th slice
        THETAS MUST BE WITH VALUES. Where sum(thetas[i..n]) = 1
        */

        srand(time(NULL));
       for(int i=0;i<k;i++){
           for(int j=0;j<n;j++){
               results[i][belongsTo(thetas)]++;
           }
       }

    }
    void muestreoExponencial(double lambda,int n, double *results){
        /*Let lambda be the rate parameter of the exponential distribution
        Let n be the size of the samples
        Results is a vector of size n, where results[i] is the i-th sample
        */
       srand(time(NULL));
       for(int i=0;i<n;i++){
           double u = (double)rand()/(RAND_MAX);
           results[i] = -log(1-u)/lambda;
       }
    }

    void muestreoNormalEstandar(int n, double *results){
        /*  
        Let n be the size of the samples.
        Let results be a vector of size n, where results[i] is the i-th sample.
        x1 = sqrt(2log(1/u1)) cos (2pi*v1)
        Where u1 and v1 are uniform random variables in (0,1).
        results[i] = xi;
        */
        for(int i=0;i<n;i++){
            double u = (double)rand()/RAND_MAX;
            double v = (double)rand()/RAND_MAX;
            results[i] = sqrt(2*log(1/u))*cos(2*M_PI*v);
        }
    }

    void muestreoNormal(int n, double media, double varianza, double *results){
        /*
        Let n be the size of the samples.
        Let results be a vector of size n, where results[i] is the i-th sample.
        */
       double sigma = sqrt(varianza);
       double x[n];
       muestreoNormalEstandar(n,x);
       for(int i=0;i<n;i++){
           results[i] = media + sigma * x[i];
       }
    }
    
    void muestreoGibbs(int n, const char* fd_cstr, double limitex1, double limitex2,
                        double limitey1, double limitey2, double xp, double yp, 
                        double *resultsX, double *resultsY){
        /*
        Consideramos como parámetros:
            n: Número de muestras
            fd: Función de densidad
            xp: punto arbitrario x
            yp: punto arbitrario y
            resultsX*: arreglo de tamaño n representando x
            resultsY*: arreglo de tamaño n representando y
        */
        srand(time(NULL));
        
        
        try{
            // Create parser and register variables. INITIALIZATION
            parser reader;
            string fd(fd_cstr);
            ex parsed_expression = reader(fd);
            symbol t("t"); symbol u("u"); symbol v("v");

            symtab table = reader.get_syms();
            symbol x = table.find("x") != table.end() ?
                ex_to<symbol>(table["x"]) :symbol("x");
            symbol y = table.find("y") != table.end() ?
                ex_to<symbol>(table["y"]) :symbol("y");
        
            //DEBUG
            std::cout << "Parsed expression: " << parsed_expression << std::endl;

            //1.) Marginal distributions from x and y. (f1(x), f2(y))
            ex marginal_x = integral(x, limitex1, limitex2, parsed_expression).eval_integ();
            ex marginal_y = integral(y, limitey1, limitey2, parsed_expression).eval_integ();

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
                throw std::runtime_error("Inversa P(x|y) no encontrada");
            }

            if (ok2) {
                std::cout << "Inversa P(y|x): " << inversaY << std::endl;
            } else {
                std::cout << "No se pudo encontrar la inversa P(y|x)." << std::endl;
                throw std::runtime_error("Inversa P(y|x) no encontrada");
            }
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


        } catch(const std::exception& e){
            cerr << "Error: " << e.what() << endl;
        }

    }
}