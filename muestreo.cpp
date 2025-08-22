#include <iostream>

extern "C" {
    void muestreoBernulli(double *success, double *failure, 
        double probabilitySuccess, int sizeOfSample){
        for(int i=0;i<sizeOfSample;i++){
            if((double)rand()/(RAND_MAX)<probabilitySuccess){
                (*success)++;
            }else{
                (*failure)++;
            }
        }
    }
    void muestreoBinomial(){

    }
    void muestreoMultinomial(){

    }
    void muestreoExponencial(){

    }
}