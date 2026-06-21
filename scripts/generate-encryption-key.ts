import crypto from "crypto";

const key = crypto.randomBytes(32).toString("hex");
console.log("Generated PROVIDER_ENCRYPTION_KEY:");
console.log(key);
console.log("\nPlease add the following line to your .env file:");
console.log(`PROVIDER_ENCRYPTION_KEY=${key}`);
