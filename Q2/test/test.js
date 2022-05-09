const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        // Call the full prove function, set input signals a,b to 1,2
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");
        // Print output signal c
        console.log('1x2 =',publicSignals[0]);

        const editedPublicSignals = unstringifyBigInts(publicSignals); // Transform the string into JS valid value 
        const editedProof = unstringifyBigInts(proof); // Transform the proof into JS valid value 
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals); // Call proof and public signals to export
    
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString()); // Replace characters  with empty string splitted by ','
        // It also create a array with elments of x into Big Int type and to string
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]]; // Setting a,b,c from argv elements
        const Input = argv.slice(8); 

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true; // Check whether output of .verifyProof is true.
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2","c":"3"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey");
        // Print output signal c
        console.log('1x2x3 =',publicSignals[0]);

        const editedPublicSignals = unstringifyBigInts(publicSignals); // Transform the string into JS valid value 
        const editedProof = unstringifyBigInts(proof); // Transform the proof into JS valid value 
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals); // Call proof and public signals to export
    
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString()); // Replace characters  with empty string splitted by ','
        // It also create a array with elments of x into Big Int type and to string
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]]; // Setting a,b,c from argv elements
        const Input = argv.slice(8); 

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with PLONK", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("PlonkVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here

        const { proof, publicSignals } = await plonk.prove("contracts/circuits/Multiplier3_plonk/circuit_final.zkey", "contracts/circuits/Multiplier3_plonk/witness.wtns");
        // Print output signal c
        const calldata = await plonk.exportSolidityCallData(unstringifyBigInts(proof), unstringifyBigInts(publicSignals))
        console.log('1x2x3 =',publicSignals[0]);
        const calldataSplit = calldata.split(',')
        const proofFormatted = calldataSplit[0]
        const publicSignalsFormatted = JSON.parse(calldataSplit[1]).map(x => BigInt(x).toString())
        
        // It also create a array with elments of x into Big Int type and to string

        expect(await verifier.verifyProof(proofFormatted, publicSignalsFormatted)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = '0x00';
        let b = ['0'];
        expect(await verifier.verifyProof(a, b)).to.be.false;
    });
});