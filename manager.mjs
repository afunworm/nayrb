/**
 * IMPORT STANDARD LIBRARIES
 */
import path from "path";
import { spawnServer, logWarn, logError, logInfo, run } from "./functions.mjs";

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
const port = process.env.port || 2703;
const base = process.env.base.replace(/\/+$/, "") || "C:/nayrb";
const isProduction = process.env.production == "1" ? true : false;

/**
 * MARK GIT DIRECTORY AS SAFE SO ALL USERS CAN EXECUTE IT
 */
try {
	await run(`git config --global --add safe.directory ${base}`);
	console.log(`Added ${base} to git safe directory.`);
} catch (error) {
	console.log(error);
	await logError(`Unable to add ${base} to git safe directory.\n${error}`);
}

/**
 * UPDATE GIT REPOSITORY
 */
let gitUpdateResult = "";
try {
	const command = isProduction ? `cd "${base}"; git reset --hard HEAD; git pull` : `cd "${base}"; git pull`;
	const { stdout } = await run(command);
	gitUpdateResult = stdout;
	console.log("git pull completed successfully.");
	await logInfo(`'${command}' completed successfully: ${stdout}`);
} catch (error) {
	console.log(error);
	await logWarn(`Unable to update repository with 'git pull'.\n${error}`);
}

/**
 * FIND ANY PIDS THAT IS LISTENING ON PORT ${port}
 */
let PIDResult = "";

try {
	// Find the process ID(s) of any process listening on the specified port
	const { stdout } = await run(`netstat -ano | findstr :${port}`);

	PIDResult = stdout;
} catch (error) {
	console.error(error);
}

/**
 * MAIN PROCESS
 */
// Parse output to extract PID(s) associated with the port
const pids = new Set(
	PIDResult.split("\n")
		.map((line) => line.trim().split(/\s+/).pop()) // Get the last part, which is the PID
		.filter((pid) => pid && pid != 0) // Filter out any empty results, also PID must not be 0
);

// If no server is running, run it
if (pids.size === 0) {
	console.log(`No processes found listening on port ${port}. Starting nayrb server...`);
	await logInfo(`No processes found listening on port ${port}. Starting nayrb server...`);
	await spawnServer();
	process.exit();
}

// If there's no update and there is already a server running,
// there's no need to restart the server
if (gitUpdateResult.toLowerCase().includes("up to date")) {
	console.log(`nayrb repository is up to date. Exiting...`);
	await logInfo(`nayrb repository is up to date. Exiting...`);
	process.exit();
}

// If there is a server running, kill it and spawn a new process for the server
await logInfo(`Found ${pids.size} process(es) listening on port ${port}.`);
for (const pid of pids) {
	console.log(`Killing process with PID: ${pid} on port ${port}`);

	await run(`taskkill /PID ${pid} /F`);
}

console.log(`All processes on port ${port} have been terminated.`);
await logInfo(`All processes on port ${port} have been terminated.`);

// Spawn a new index.mjs process
await spawnServer();
