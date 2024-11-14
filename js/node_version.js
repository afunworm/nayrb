const [major, minor, patch] = process.versions.node.split(".").map(Number);
console.log(`${major}.${minor}.${patch}`);
