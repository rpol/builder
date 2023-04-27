import fontList from "@/utils/fontList.json";
import WebFont from "webfontloader";

// TODO: Remove limit on font list
const fontListNames = fontList.items.map((font) => font.family).slice(0, 50);
const setFont = (font: string | null) => {
	return new Promise((resolve) => {
		if (!font) return resolve(font);
		const fontObj = fontList.items?.find((f) => f.family === font);
		if (!fontObj) return resolve(font);
		WebFont.load({
			google: {
				families: [font + ":" + fontObj.variants.join(",")],
			},
			active: resolve(font)
		});
	});
};

const getFontWeightOptions = (font: string) => {
	const defaultOptions = [{ value: "400", label: "Regular" }];
	if (!font) return defaultOptions;
	const fontObj = fontList.items.find((f) => f.family === font);
	if (!fontObj) return defaultOptions;
	return fontObj.variants.filter((variant) => !variant.includes("italic")).map((variant) => {
		return {
			value: variant === "regular" ? "400" : variant,
			label: variant,
		};
	});
};

export { fontListNames, setFont, getFontWeightOptions };
