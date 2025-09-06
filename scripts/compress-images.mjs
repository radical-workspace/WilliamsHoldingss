import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";

const root = path.resolve(process.cwd());
const pub = path.join(root, "public");

const targets = ["card-front.png", "card-back.png"];

async function fileSize(p) {
	try {
		const s = await fs.stat(p);
		return s.size;
	} catch {
		return 0;
	}
}

async function compressPng(file) {
	const src = path.join(pub, file);
	const tmp = src + ".tmp";

	// Skip missing
	try {
		await fs.access(src);
	} catch {
		console.log("skip missing", file);
		return;
	}

	const before = await fileSize(src);
	const img = sharp(src, { failOn: "none" });
	const meta = await img.metadata();
	const width = meta.width && meta.width > 1200 ? 1200 : meta.width;

	await img
		.resize({ width, withoutEnlargement: true })
		.png({ compressionLevel: 9, palette: true, quality: 80 })
		.toFile(tmp);

	await fs.rename(tmp, src);
	const after = await fileSize(src);
	const saved = before - after;
	console.log(
		`${file}: ${before} -> ${after} bytes ${
			saved > 0 ? `(saved ${saved})` : ""
		}`,
	);
}

async function main() {
	for (const f of targets) {
		await compressPng(f);
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
