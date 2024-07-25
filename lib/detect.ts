export default function DetectVariables(text: string) {
	const regex = /{([^}]*)}/g;
	const matches = text.match(regex);
	return matches ? matches.map((match) => match.replace(/{|}/g, "").trim()) : [];
}
