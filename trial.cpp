#include <iostream>
#include <ginac/ginac.h>
#include <ginac/parser.h>   // include parser

using namespace GiNaC;

int main() {
    
    std::cout << "Enter a mathematical expression involving x and y (e.g., x^2 + 2*x*y + y^2): ";
    std::string input_expression;
    std::getline(std::cin, input_expression);

    try {
        // Create parser and register variables
        parser reader;

        // Parse the string
        ex parsed_expression = reader(input_expression);

        symtab table = reader.get_syms();
        symbol x = table.find("x") != table.end() ?
            ex_to<symbol>(table["x"]) :symbol("x");
        symbol y = table.find("y") != table.end() ?
            ex_to<symbol>(table["y"]) :symbol("y");
        symbol t("t"); symbol u("u"); symbol v("v");


        std::cout << "Parsed expression: " << parsed_expression << std::endl;

        //Marginal 
        integral integral1 = integral(x, 0, 2, parsed_expression);
        integral integral2 = integral(y, 0, 2, parsed_expression);

        ex marginal_x = integral1.eval_integ();
        ex marginal_y = integral2.eval_integ();

        std::cout << "Definite integral with respect to x: " << marginal_x << std::endl;
        std::cout << "Definite integral with respect to y: " << marginal_y << std::endl;


        //Conditional probabilities
        ex xdadoy = parsed_expression / marginal_x;
        ex ydadox = parsed_expression / marginal_y;

        std::cout << "Conditional probability P(x|y): " << xdadoy << std::endl;
        std::cout << "Conditional probability P(y|x): " << ydadox << std::endl;

        //Acumulativa
        
        ex xdadoywitht = xdadoy.subs(x == t);
        ex ydadoxwitht = ydadox.subs(y == t);

        integral intAcumulativa_xy = integral(t, 0, x, xdadoywitht);
        integral intAcumulativa_yx = integral(t, 0, y, ydadoxwitht);


        ex acumulativa_xy = intAcumulativa_xy.eval_integ();
        ex acumulativa_yx = intAcumulativa_yx.eval_integ();

        std::cout << "Acumulativa P(x|y): " << acumulativa_xy.simplify_indexed() << std::endl;
        std::cout << "Acumulativa P(y|x): " << acumulativa_yx.simplify_indexed() << std::endl;

        ex ecuacion1 = acumulativa_xy -u == 0;
        ex ecuacion2 = acumulativa_xy -v == 0;

        ex inversa1 = solve(ecuacion1,x);
        ex inversa2 = solve(ecuacion2,y);

        std::cout << "Inversa P(x|y): " << inversa1 << std::endl;
        std::cout << "Inversa P(y|x): " << inversa2 << std::endl;
    

    } catch (std::exception &e) {
        std::cerr << "Error: " << e.what() << std::endl;
    }

    return 0;
}
