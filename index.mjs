import { exec } from "child_process";
import util from "util";
import express from "express";
import path from "path";
import "dotenv/config";

// Convert exec to a promise-based function
const run = util.promisify(exec);

// Express server
const app = express();
const port = process.env.port || 2703;

function fileInfo(filePath) {
	const basename = path.basename(filePath);
	const extension = path.extname(filePath).replace(".", "");
	const name = path.basename(filePath, extension).replace(/\.(?=[^.]*$)/, "");
	const dir = path.dirname(filePath);
	const fullPath = path.resolve(filePath);

	return {
		basename,
		extension,
		name,
		path: filePath,
		dir,
		fullPath,
	};
}

app.get("/:command(*)", async (req, res) => {
	const command = req.params.command;
	const fullPath = path.resolve(command);
	const { extension } = fileInfo(fullPath);

	if (!["ps1", "js", "mjs"].includes(extension.toLowerCase())) {
		return res.status(400).send(`Invalid extension ${extension}`);
	}

	try {
		// Execute the command
		if (extension.toLowerCase() === "js" || extension.toLowerCase() === "mjs") {
			let { stdout, stderr } = await run(`node ${fullPath}`, { shell: "powershell.exe" });

			console.log(stdout);
		}

		if (extension.toLowerCase() === "ps1") {
			let { stdout, stderr } = await run(`powershell -File ${fullPath}`, { shell: "powershell.exe" });

			console.log(stdout);
		}

		return res.status(200).send(`${fullPath} ran successfully.`);
	} catch (error) {
		console.error(error);
		return res.status(500).send(`Unable to execute ${fullPath}.`);
	}
});

app.listen(port, "0.0.0.0", () => {
	console.log(`nayrb is listening at 0.0.0.0:${port}`);
});
