#include <iostream>
#include <vector>
using namespace std;
int belongsTo(double *thetas){
    /*Private function. Called on multinomial.
    Return the position in which a random number is generated in a set of a sample*/

    int position = 0, accumulated = 0;
    while(true){
        if((double)rand()/RAND_MAX>accumulated &&
            (double)rand()/RAND_MAX<thetas[position]+accumulated){
            return position;
        }
        accumulated += thetas[position];
        position++;
    }
    
}
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

    //Muestreo con partes iguales
    void muestreoMultinomial(int slices, int n, int k,double **results){
        /*Let Slices be the probability of each case in the experiment
        where A1+A2+...+Aslices=1. 1/slices. (Same probability for each one)
        Let n be the size of the samples
        Let k be the number of trials

        Results is a vector of R2, where R2[i] is the number of successes for the i-th slice
        */
       
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
    void muestreoMultinomial(double *thetas, int n, int k, double **results){
        /*Let thetas be the probability of each case in the experiment
        where A1+A2+...+Aslices=1. (Different probability for each one).
        (Array of double).
        Let n be the size of the samples
        Let k be the number of trials

        Results is a vector of R2, where R2[i] is the number of successes for the i-th slice
        THETAS MUST BE WITH VALUES. Where sum(thetas[i..n]) = 1
        */

       for(int i=0;i<k;i++){
           for(int j=0;j<n;j++){
               results[i][belongsTo(thetas)]++;
           }
       }

    }
    void muestreoExponencial(){

    }
}