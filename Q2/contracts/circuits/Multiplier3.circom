pragma circom 2.0.0;
// https://docs.circom.io/more-circuits/more-basic-circuits/#extending-our-multiplier-to-n-inputs
// [assignment] Modify the circuit below to perform a multiplication of three signals
template Multiplier2(){
   //Declaration of signals.
   signal input in1;
   signal input in2;
   signal output out;

   //Statements.
   out <== in1 * in2;
}
template Multiplier3 () {  

   // Declaration of signals.  
   signal input a;  
   signal input b;
   signal input c;
   signal output d;
   component m1 = Multiplier2();
   component m2 = Multiplier2();
   // Constraints.  
   m1.in1 <== a;
   m1.in2 <== b;
   m2.in1 <== m1.out;
   m2.in2 <== c;
   d <== m2.out;
}

component main = Multiplier3();