import { exec, spawn } from "child_process";
import util from "util";
import "dotenv/config";
import path from "path";
import { EventLogger } from "node-windows";

const run = util.promisify(exec);
const port = process.env.port || 2703;

const spawnServer = () => {
	// Spawn a new index.mjs process for your custom script
	const scriptPath = path.resolve("./index.mjs");
	const newProcess = spawn("node", [scriptPath], { detached: true, stdio: "ignore" });

	// Ensure the nwe index.mjs process continues running after the parent exits
	newProcess.unref();

	// Log it
	console.log(`Spawned new process with PID: ${newProcess.pid}`);

	return newProcess;
};

/**
 * UPDATE GIT REPOSITORY
 */
let gitUpdateResult = "";
try {
	const { stdout } = await run("git pulls", { shell: "powershell.exe" });
	gitUpdateResult = stdout;
	console.log("git pull completed successfully.");
} catch (error) {
	console.log(error);
	// const log = new EventLogger("nayrb Repository Update Failed");
	// log.warn(`Unable to update repository with 'git pull'.\n\n${error}`);
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
		.filter((pid) => pid) // Filter out any empty results
);

// If no server is running, run it
if (pids.size === 0) {
	console.log(`No processes found listening on port ${port}. Starting nayrb server...`);
	spawnServer();
	process.exit();
}

// If there's no update, there's no need to restart the server
if (gitUpdateResult.toLowerCase().includes("up to date")) {
	console.log(`nayrb repository is up to date. Exiting...`);
	process.exit();
}

// If there is a server running, kill it and spawn a new process for the server
for (const pid of pids) {
	console.log(`Killing process with PID: ${pid} on port ${port}`);
	await run(`taskkill /PID ${pid} /F`);
}

console.log(`All processes on port ${port} have been terminated.`);

// Spawn a new index.mjs process for your custom script
spawnServer();
