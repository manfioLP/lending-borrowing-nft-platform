"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const useNftLoanContractListener_1 = __importDefault(require("./useNftLoanContractListener"));
const app = (0, express_1.default)();
const port = 3000;
(0, useNftLoanContractListener_1.default)();
app.get('/', (req, res) => {
    res.json({ status: "ok" }).send();
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
