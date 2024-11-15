/**
 * IMPORT STANDARD LIBRARIES
 */
import path from "path";
import { spawn } from "child_process";
import fs from "fs/promises";
import crypto from "crypto";
import { exec } from "child_process";
import util from "util";

/**
 * IMPORT .env
 */
import dotenv from "dotenv";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
dotenv.config({ path: __dirname + "/.env" });

/**
 * CONSTANTS & VARIABLES
 */
const base = process.env.base.replace(/\/+$/, "") || "C:/nayrb";
const port = process.env.port || 2703;
const key = process.env.key;

/**
 * CREATE LOG FILES IF NOT EXISTS
 */
async function writeLog(level, log) {
	/**
	 * Get current timestamp
	 */
	const now = new Date();

	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-based
	const day = String(now.getDate()).padStart(2, "0");

	const hours = String(now.getHours()).padStart(2, "0");
	const minutes = String(now.getMinutes()).padStart(2, "0");
	const seconds = String(now.getSeconds()).padStart(2, "0");

	const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

	try {
		await fs.appendFile(base + "/logs.txt", `\n[${timestamp}] [${level}] ${log}`);
	} catch (error) {
		console.log("Unable to write to log file.");
		console.error(error);
	}
}

export function logInfo(log) {
	return writeLog("INFO", log);
}

export function logWarn(log) {
	return writeLog("WARN", log);
}

export function logError(log) {
	return writeLog("ERRO", log);
}

export async function run(command, options = { shell: "powershell.exe" }) {
	const run = util.promisify(exec);
	return run(command, options);
}

export async function spawnServer() {
	// Spawn a new index.mjs process for your custom script
	const scriptPath = path.resolve(base + "/index.mjs");
	const newProcess = spawn("node", [scriptPath], { detached: true, stdio: "ignore" });

	// Ensure the nwe index.mjs process continues running after the parent exits
	newProcess.unref();

	// Log it
	console.log(`Spawned new process with PID: ${newProcess.pid}.`);
	await logInfo(`Started nayrb server on port ${port}. PID: ${newProcess.pid}.`);

	return newProcess;
}

export function hash(input) {
	return crypto
		.createHash("md5")
		.update(key + input)
		.digest("hex");
}

export function fileInfo(filePath) {
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
