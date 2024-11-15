/**
 * IMPORT STANDARD LIBRARIES
 */
import express from "express";
import path from "path";
import { logError, fileInfo, hash, run } from "./functions.mjs";

/**
 * IMPORT .env
 */
import { fileURLToPath } from "url";
import dotenv from "dotenv";
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
dotenv.config({ path: __dirname + "/.env" });

/**
 * CONSTANTS AND VARIABLES
 */
const base = process.env.base.replace(/\/+$/, "") || "C:/nayrb";

// Express server
const app = express();
const port = process.env.port || 2703;

app.get("/", (req, res) => {
	res.setHeader("Content-Type", "text/plain");
	res.status(200).send("OK");
});

app.get("/:command(*)", async (req, res) => {
	const command = req.params.command;
	const challenge = req.query.challenge;
	const verify = req.query.verify;
	const fullPath = path.resolve(base + "/" + command);
	const { extension } = fileInfo(fullPath);

	res.setHeader("Content-Type", "text/plain");

	if (!challenge || !verify || hash(challenge) !== verify) {
		return res.status(400).send(`Unauthorized.`);
	}

	if (!["ps1", "js", "mjs"].includes(extension.toLowerCase())) {
		return res.status(400).send(`Invalid extension ${extension}`);
	}

	try {
		// Execute the command
		if (extension.toLowerCase() === "js" || extension.toLowerCase() === "mjs") {
			let { stdout } = await run(`node ${fullPath}`, { shell: "powershell.exe" });

			console.log(stdout);
			return res.status(200).send(`${fullPath} ran successfully.\n---\n${stdout}`);
		}

		if (extension.toLowerCase() === "ps1") {
			let { stdout } = await run(`powershell -File ${fullPath}`, { shell: "powershell.exe" });

			console.log(stdout);
			return res.status(200).send(`${fullPath} ran successfully.\n---\n${stdout}`);
		}
	} catch (error) {
		console.error(error);
		await logError(`Unable to complete the task at ${fullPath}.\n${error}`);
		return res.status(500).send(`Unable to execute ${fullPath}.\n---\n${error}`);
	}
});

app.listen(port, "0.0.0.0", () => {
	console.log(`nayrb is listening at 0.0.0.0:${port}`);
});
