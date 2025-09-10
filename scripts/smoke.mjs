#!/usr/bin/env node
/**
 * Minimal deployment smoke test script.
 * Assumes BASE_URL env (e.g. https://your-app.vercel.app) or defaults to http://localhost:3000
 * Exits non‑zero on first failure. Prints a compact summary.
 */
import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";

const BASE =
	process.env.BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
const RUN_LOCAL = process.env.RUN_LOCAL === "1";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "dev-admin";

const results = [];
let failures = 0;

async function step(name, fn) {
	const started = Date.now();
	try {
		const value = await fn();
		const dur = Date.now() - started;
		results.push({ name, ok: true, ms: dur });
		return value;
	} catch (err) {
		const dur = Date.now() - started;
		failures++;
		results.push({ name, ok: false, ms: dur, error: err.message });
		console.error(`✖ ${name}:`, err.message);
		process.exitCode = 1;
		throw err; // stop chain
	}
}

async function jsonFetch(path, init = {}) {
	const res = await fetch(BASE + path, {
		...init,
		headers: {
			"content-type": "application/json",
			...(init.headers || {}),
		},
	});
	let data = null;
	const text = await res.text();
	try {
		data = text ? JSON.parse(text) : null;
	} catch {
		/* ignore */
	}
	return { res, data, text };
}

(async () => {
	let serverProc;
	if (RUN_LOCAL) {
		const { spawn } = await import("node:child_process");
		// Probe if already running
		let preExisting = false;
		try {
			const r = await fetch(BASE + "/api/health");
			if (r.ok) preExisting = true;
		} catch {}
		if (!preExisting) {
			console.log("Starting local production server...");
			serverProc = spawn("npm", ["run", "start"], { stdio: "inherit" });
			process.on("exit", () => serverProc && serverProc.kill());
			const startedAt = Date.now();
			let ready = false;
			while (!ready && Date.now() - startedAt < 30000) {
				try {
					const r = await fetch(BASE + "/api/health");
					if (r.ok) ready = true;
					else await delay(500);
				} catch {
					await delay(500);
				}
			}
			if (!ready) {
				console.error("Server failed to become ready within 30s");
				process.exit(1);
			}
		} else {
			console.log("Detected existing server on port, reusing.");
		}
	}
	console.log("Running smoke against", BASE);

	await step("health", async () => {
		const { res, data } = await jsonFetch("/api/health");
		assert.equal(res.status, 200, "health status");
		assert.equal(data?.status, "ok");
	});

	// Signup unique user (timestamp email)
	const email = `smoke_${Date.now()}@example.com`;
	const password = "Test1234!";
	let cookieJar = "";

	await step("signup", async () => {
		const { res, data } = await jsonFetch("/api/auth/signup", {
			method: "POST",
			body: JSON.stringify({ email, name: "Smoke", password }),
		});
		assert.equal(res.status, 200, "signup 200");
		assert.equal(data?.ok, true, "signup ok");
		const setCookie = res.headers.get("set-cookie");
		assert.ok(setCookie?.includes("userEmail="), "userEmail cookie");
		cookieJar = setCookie.split(";")[0];
	});

	await step("dashboard authed", async () => {
		const res = await fetch(BASE + "/dashboard", {
			headers: { cookie: cookieJar },
		});
		assert.equal(res.status, 200, "dashboard 200");
		const html = await res.text();
		assert.ok(html.includes("Welcome,"), "dashboard welcome text");
	});

	// Create deposit (minimal valid payload)
	await step("create deposit", async () => {
		const body = {
			asset: "BTC",
			network: "BTC",
			amount: 0.0001,
			sent_to_address: "addr-demo",
			tx_proof: "proof",
		};
		const { res, data } = await jsonFetch("/api/deposits", {
			method: "POST",
			body: JSON.stringify(body),
			headers: { cookie: cookieJar },
		});
		assert.equal(res.status, 200, "deposit 200");
		assert.ok(data?.id, "deposit id");
	});

	// Fetch balances
	await step("balances", async () => {
		const { res, data } = await jsonFetch(
			"/api/balances?asset=BTC&network=BTC",
			{ headers: { cookie: cookieJar } },
		);
		assert.equal(res.status, 200, "balances 200");
		assert.ok(typeof data?.available === "number", "has available");
	});

	// Attempt withdrawal with insufficient funds (should 400 or 500 depending on error handling)
	await step("withdraw insufficient", async () => {
		const body = {
			asset: "BTC",
			network: "BTC",
			amount: 10,
			destination_address: "dest-demo",
		};
		const { res } = await jsonFetch("/api/withdrawals", {
			method: "POST",
			body: JSON.stringify(body),
			headers: { cookie: cookieJar },
		});
		assert.ok(
			[400, 500].includes(res.status),
			"withdraw expected failure status",
		);
	});

	// Signout
	await step("signout", async () => {
		const { res, data } = await jsonFetch("/api/auth/signout", {
			method: "POST",
			headers: { cookie: cookieJar },
		});
		assert.equal(res.status, 200, "signout 200");
		assert.equal(data?.ok, true, "signout ok");
	});

	// Admin login
	await step("admin login", async () => {
		const { res, data } = await jsonFetch("/api/admin/login", {
			method: "POST",
			body: JSON.stringify({ secret: ADMIN_SECRET }),
		});
		if (res.status === 401) {
			console.warn(
				"⚠ admin login unauthorized (check ADMIN_SECRET). Continuing.",
			);
			return;
		}
		assert.equal(res.status, 200, "admin login 200");
		assert.equal(data?.ok, true, "admin login ok");
	});

	// Placeholder card request route (if present)
	await step("card request route", async () => {
		const { res } = await jsonFetch("/api/cards/request", {
			method: "POST",
			body: JSON.stringify({}),
		});
		assert.equal(res.status, 200, "card request 200");
	});

	// Optional: allow a brief pause for any async DB writes to settle
	await delay(100);

	console.log("\nSummary:");
	for (const r of results) {
		console.log(
			`${r.ok ? "✔" : "✖"} ${r.name} (${r.ms}ms)` +
				(r.error ? ` - ${r.error}` : ""),
		);
	}
	console.log(`Failures: ${failures}`);
	if (serverProc) serverProc.kill();
	if (failures > 0) process.exit(1);
})();
