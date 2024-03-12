import express from 'express';
import {configDotenv} from "dotenv";
configDotenv()

import useNftLoanContractListener from "./useNftLoanContractListener";


const app = express();
const port = process.env.PORT || 3000;

useNftLoanContractListener()

app.get('/', (req, res) => {
	res.json({status: "ok"}).send();
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
