import express from 'express';
import { ethers } from 'ethers';
import useNftLoanContractListener from "./useNftLoanContractListener";


const app = express();
const port = 3000;

useNftLoanContractListener()

app.get('/', (req, res) => {
	res.json({status: "ok"}).send();
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
