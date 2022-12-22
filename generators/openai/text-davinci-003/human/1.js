import "std/dotenv/load";

import { fromFileUrl, join } from "std/path";
import { loopOverCountries } from "@ai-flags/utilities";

const {
	cwd,
	readTextFile
} = Deno;

const moduleFilePath = fromFileUrl(import.meta.url);

const setupName = moduleFilePath.replace(cwd(), "").replace(/^\/generators\//, "").replace(/\.js$/, "");

const generator = async ({ countryCode }) => {
	const folderPath = join(cwd(), "static", "setups", setupName, countryCode);

	const descriptionFilePath = join(folderPath, "description.txt");
	const svgFlagFilePath = join(folderPath, "flag.svg");

	const description = await readTextFile(descriptionFilePath);
	const svg = await readTextFile(svgFlagFilePath);

	return { description, svg };
};

await loopOverCountries(setupName, generator);