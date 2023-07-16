import condenseResults from "@/utilities/server/condense-results.js";
import createMatchQuery from "@/utilities/server/create-match-query.js";
import deepSort from "@/utilities/server/deep-sort.js";
import supabase from "@/utilities/shared/supabase.js";
import convertDescription from "@/utilities/server/convert-description.js";

/**
 *
 * @param query
 */
const getDbVariants = async (query = {}) => {
	const matchQuery = createMatchQuery(query, "variant");

	const {
		data: variants,
		error
	} = await supabase
		.from("variants")
		.select(`
			vexillographer:vexillographers!inner(
				name,
				vexillologist:vexillologists!inner(name)
			),
			name,
			score,
			description,
			instances (
				name,
				score,
				flags (
					name,
					score,
					code
				)
			)
		`)
		.match(matchQuery);

	if (error) {
		throw error;
	}

	const refinedVariants = await Promise.all(
		variants
			.map(async ({ description, ...variant }) => ({
				...variant,
				description,
				descriptionHtml: await convertDescription(description)
			}))
	);

	return deepSort(
		condenseResults({
			results: refinedVariants,
			query,
			foreignRootKey: "vexillographer"
		}),
		"name"
	);
};

export default getDbVariants;
