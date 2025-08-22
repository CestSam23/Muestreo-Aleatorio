#include <iostream>

extern "C" {
    void muestreoBernulli(double *success, double *failure, 
        double theta, int n){
        /*Let x be the number of successes. Where x=1 success, x=0 failure 
        theta = probability of success
        n = size of the sample
        */
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
       for (int i = 0; i < k; i++){
           for(int j=0;j<n;j++){
               if((double)rand()/(RAND_MAX)<theta){
                   success[i]++;
               }
           }
       }
    }
    
    void muestreoMultinomial(){

    }
    void muestreoExponencial(){

    }
}