<template>
	<div v-if="blockController.isBLockSelected()" class="flex select-none flex-col pb-16">
		<div class="sticky top-9 z-50 mt-[-15px] flex w-full bg-white py-3 dark:bg-zinc-900">
			<Input
				ref="searchInput"
				class="properties-search-input h-7 w-full rounded-md text-sm text-gray-800 hover:border-gray-400 focus:border-gray-400 focus:bg-gray-50 focus:ring-0 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:focus:border-zinc-200 focus:dark:border-zinc-700"
				type="text"
				placeholder="Search properties"
				inputClass="w-full"
				v-model="store.propertyFilter"
				@input="
					(value: string) => {
						store.propertyFilter = value;
					}
				" />
			<div
				class="absolute right-1 top-[15px] z-20 cursor-pointer p-1 text-gray-700 dark:text-zinc-300"
				@click="store.propertyFilter = ''"
				v-show="store.propertyFilter">
				<CrossIcon />
			</div>
		</div>
		<div class="flex flex-col gap-3">
			<CollapsibleSection :sectionName="section.name" v-for="section in filteredSections">
				<template v-for="property in getFilteredProperties(section)">
					<component :is="property.component" v-bind="property.getProps()" v-on="property.events || {}" />
				</template>
			</CollapsibleSection>
		</div>
	</div>
	<div v-else>
		<p class="text-center text-sm text-gray-600 dark:text-zinc-500">Select a block to edit properties.</p>
	</div>
</template>
<script setup lang="ts">
import { setFont as _setFont, fontListNames, getFontWeightOptions } from "@/utils/fontManager";

import BackgroundHandler from "./BackgroundHandler.vue";
import BLockLayoutHandler from "./BlockLayoutHandler.vue";
import BlockPositionHandler from "./BlockPositionHandler.vue";
import CollapsibleSection from "./CollapsibleSection.vue";
import ColorInput from "./ColorInput.vue";
import InlineInput from "./InlineInput.vue";
import ObjectEditor from "./ObjectEditor.vue";

import CrossIcon from "./Icons/Cross.vue";

import useStore from "@/store";
import blockController from "@/utils/blockController";
import { Ref, computed, ref } from "vue";
import CodeEditor from "./CodeEditor.vue";
import DimensionInput from "./DimensionInput.vue";
import OptionToggle from "./OptionToggle.vue";

const store = useStore();

// command + f should focus on search input
window.addEventListener("keydown", (e) => {
	if (e.key === "f" && (e.metaKey || e.ctrlKey)) {
		e.preventDefault();
		document.querySelector(".properties-search-input")?.querySelector("input")?.focus();
	}
});

type BlockProperty = {
	component: any;
	getProps: () => Record<string, unknown>;
	events?: Record<string, unknown>;
	searchKeyWords: string;
	condition?: () => boolean;
};

type PropertySection = {
	name: string;
	properties: BlockProperty[];
	condition?: () => boolean;
};

const searchInput = ref(null) as Ref<HTMLElement | null>;

const filteredSections = computed(() => {
	return sections.filter((section) => {
		let showSection = true;
		if (section.condition) {
			showSection = section.condition();
		}
		if (showSection && store.propertyFilter) {
			showSection = getFilteredProperties(section).length > 0;
		}
		return showSection;
	});
});

const getFilteredProperties = (section: PropertySection) => {
	return section.properties.filter((property) => {
		let showProperty = true;
		if (property.condition) {
			showProperty = property.condition();
		}
		if (showProperty && store.propertyFilter) {
			showProperty =
				section.name.toLowerCase().includes(store.propertyFilter.toLowerCase()) ||
				property.searchKeyWords.toLowerCase().includes(store.propertyFilter.toLowerCase());
		}
		return showProperty;
	});
};

const setFont = (font: string) => {
	_setFont(font, null).then(() => {
		blockController.setFontFamily(font);
	});
};

const setClasses = (val: string) => {
	const classes = val.split(",").map((c) => c.trim());
	blockController.setClasses(classes);
};

const typographySectionProperties = [
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Family",
				type: "autocomplete",
				options: fontListNames,
				modelValue: blockController.getFontFamily(),
			};
		},
		searchKeyWords: "Font, Family, FontFamily",
		events: {
			"update:modelValue": (val: string) => setFont(val),
		},
		condition: () => blockController.isText() || blockController.isContainer(),
	},
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Weight",
				modelValue: blockController.getStyle("fontWeight"),
				type: "autocomplete",
				options: getFontWeightOptions((blockController.getStyle("fontFamily") || "Inter") as string),
			};
		},
		searchKeyWords: "Font, Weight, FontWeight",
		events: {
			"update:modelValue": (val: StyleValue) => blockController.setStyle("fontWeight", val),
		},
	},
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Size",
				modelValue: blockController.getStyle("fontSize"),
				enableSlider: true,
				minValue: 1,
			};
		},
		searchKeyWords: "Font, Size, FontSize",
		events: {
			"update:modelValue": (val: StyleValue) => blockController.setStyle("fontSize", val),
		},
		condition: () => blockController.isText() || blockController.isInput(),
	},
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Height",
				modelValue: blockController.getStyle("lineHeight"),
			};
		},
		searchKeyWords: "Font, Height, LineHeight, Line Height",
		events: {
			"update:modelValue": (val: StyleValue) => blockController.setStyle("lineHeight", val),
		},
		condition: () => blockController.isText(),
	},
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Letter",
				modelValue: blockController.getStyle("letterSpacing"),
			};
		},
		events: {
			"update:modelValue": (val: StyleValue) => blockController.setStyle("letterSpacing", val),
		},
		searchKeyWords: "Font, Letter, LetterSpacing, Letter Spacing",
		condition: () => blockController.isText(),
	},
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Transform",
				modelValue: blockController.getStyle("textTransform"),
				type: "select",
				options: [
					{
						value: null,
						label: "None",
					},
					{
						value: "uppercase",
						label: "Uppercase",
					},
					{
						value: "lowercase",
						label: "Lowercase",
					},
					{
						value: "capitalize",
						label: "Capitalize",
					},
				],
			};
		},
		searchKeyWords: "Font, Transform, TextTransform, Text Transform, Capitalize, Uppercase, Lowercase",
		events: {
			"update:modelValue": (val: StyleValue) => blockController.setStyle("textTransform", val),
		},
		condition: () => blockController.isText(),
	},
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Align",
				modelValue: blockController.getStyle("textAlign") || "left",
				type: "select",
				options: ["left", "center", "right", "justify"],
			};
		},
		searchKeyWords: "Font, Align, TextAlign, Text Align, Left, Center, Right, Justify",
		events: {
			"update:modelValue": (val: StyleValue) => blockController.setStyle("textAlign", val),
		},
		condition: () => blockController.isText(),
	},
];

const layoutSectionProperties = [
	{
		component: BLockLayoutHandler,
		getProps: () => {},
		searchKeyWords:
			"Layout, Flex, Flexbox, Flex Box, FlexBox, Justify, Space Between, Flex Grow, Flex Shrink, Flex Basis, Align Items, Align Content, Align Self, Flex Direction, Flex Wrap, Flex Flow, Flex Grow, Flex Shrink, Flex Basis, Gap",
	},
];

const styleSectionProperties = [
	{
		component: ColorInput,
		getProps: () => {
			return {
				label: "BG Color",
				value: blockController.getStyle("background"),
			};
		},
		searchKeyWords: "Background, BackgroundColor, Background Color, BG, BGColor, BG Color",
		events: {
			change: (val: StyleValue) => blockController.setStyle("background", val),
		},
	},
	{
		component: ColorInput,
		getProps: () => {
			return {
				label: "Text Color",
				value: blockController.getTextColor(),
			};
		},
		searchKeyWords: "Text, Color, TextColor, Text Color",
		events: {
			change: (val: string) => blockController.setTextColor(val),
		},
	},
	{
		component: ColorInput,
		getProps: () => {
			return {
				label: "Border Color",
				value: blockController.getStyle("borderColor"),
			};
		},
		searchKeyWords: "Border, Color, BorderColor, Border Color",
		events: {
			change: (val: StyleValue) => {
				blockController.setStyle("borderColor", val);
				if (val) {
					if (!blockController.getStyle("borderWidth")) {
						blockController.setStyle("borderWidth", "1px");
						blockController.setStyle("borderStyle", "solid");
					}
				} else {
					blockController.setStyle("borderWidth", null);
					blockController.setStyle("borderStyle", null);
				}
			},
		},
	},
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Border Width",
				modelValue: blockController.getStyle("borderWidth"),
				enableSlider: true,
				unitOptions: ["px", "%", "em", "rem"],
				minValue: 0,
			};
		},
		searchKeyWords: "Border, Width, BorderWidth, Border Width",
		events: {
			"update:modelValue": (val: StyleValue) => blockController.setStyle("borderWidth", val),
		},
		condition: () => blockController.getStyle("borderColor") || blockController.getStyle("borderWidth"),
	},
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Border Style",
				modelValue: blockController.getStyle("borderStyle"),
				type: "select",
				options: ["solid", "dashed", "dotted"],
			};
		},
		searchKeyWords: "Border, Style, BorderStyle, Border Style, Solid, Dashed, Dotted",
		events: {
			"update:modelValue": (val: StyleValue) => blockController.setStyle("borderStyle", val),
		},
		condition: () => blockController.getStyle("borderColor"),
	},
	{
		component: BackgroundHandler,
		getProps: () => {},
		searchKeyWords:
			"Background, BackgroundImage, Background Image, Background Position, Background Repeat, Background Size, BG, BGImage, BG Image, BGPosition, BG Position, BGRepeat, BG Repeat, BGSize, BG Size",
	},
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Shadow",
				type: "select",
				options: [
					{
						value: null,
						label: "None",
					},
					{
						label: "Small",
						value:
							"rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px, rgba(0, 0, 0, 0.05) 0px 1px 3px 0px",
					},
					{
						label: "Medium",
						value:
							"rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px",
					},
					{
						label: "Large",
						value:
							"rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 10px 10px -5px",
					},
				],
				modelValue: blockController.getStyle("boxShadow"),
			};
		},
		searchKeyWords: "Shadow, BoxShadow, Box Shadow",
		events: {
			"update:modelValue": (val: StyleValue) => blockController.setStyle("boxShadow", val),
		},
	},
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Border Radius",
				modelValue: blockController.getStyle("borderRadius"),
				enableSlider: true,
				unitOptions: ["px", "%"],
				minValue: 0,
			};
		},
		searchKeyWords: "Border, Radius, BorderRadius, Border Radius",
		events: {
			"update:modelValue": (val: StyleValue) => blockController.setStyle("borderRadius", val),
		},
	},
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Z-Index",
				modelValue: blockController.getStyle("zIndex"),
			};
		},
		searchKeyWords: "Z, Index, ZIndex, Z Index",
		events: {
			"update:modelValue": (val: StyleValue) => blockController.setStyle("zIndex", val),
		},
		condition: () =>
			!blockController.multipleBlocksSelected() &&
			!blockController.isRoot() &&
			blockController.getStyle("position") !== "static",
	},
];

const dimensionSectionProperties = [
	{
		component: DimensionInput,
		searchKeyWords: "Width",
		getProps: () => {
			return {
				label: "Width",
				property: "width",
			};
		},
	},
	{
		component: DimensionInput,
		searchKeyWords: "Min, Width, MinWidth, Min Width",
		getProps: () => {
			return {
				label: "Min Width",
				property: "minWidth",
			};
		},
	},
	{
		component: DimensionInput,
		searchKeyWords: "Max, Width, MaxWidth, Max Width",
		getProps: () => {
			return {
				label: "Max Width",
				property: "maxWidth",
			};
		},
	},
	{
		component: "hr",
		getProps: () => {
			return {
				class: "dark:border-zinc-700",
			};
		},
		searchKeyWords: "",
	},
	{
		component: DimensionInput,
		searchKeyWords: "Height",
		getProps: () => {
			return {
				label: "Height",
				property: "height",
			};
		},
	},
	{
		component: DimensionInput,
		searchKeyWords: "Min, Height, MinHeight, Min Height",
		getProps: () => {
			return {
				label: "Min Height",
				property: "minHeight",
			};
		},
	},
	{
		component: DimensionInput,
		searchKeyWords: "Max, Height, MaxHeight, Max Height",
		getProps: () => {
			return {
				label: "Max Height",
				property: "maxHeight",
			};
		},
	},
];

const positionSectionProperties = [
	{
		component: BlockPositionHandler,
		searchKeyWords:
			"Position, Top, Right, Bottom, Left, PositionTop, Position Top, PositionRight, Position Right, PositionBottom, Position Bottom, PositionLeft, Position Left, Free, Fixed, Absolute, Relative, Sticky",
		getProps: () => {},
	},
];

const spacingSectionProperties = [
	{
		component: InlineInput,
		searchKeyWords: "Margin, Top, MarginTop, Margin Top",
		getProps: () => {
			return {
				label: "Margin",
				modelValue: blockController.getMargin(),
			};
		},
		events: {
			"update:modelValue": (val: string) => blockController.setMargin(val),
		},
		condition: () => !blockController.multipleBlocksSelected() && !blockController.isRoot(),
	},
	{
		component: InlineInput,
		searchKeyWords: "Padding, Top, PaddingTop, Padding Top",
		getProps: () => {
			return {
				label: "Padding",
				modelValue: blockController.getPadding(),
			};
		},
		events: {
			"update:modelValue": (val: string) => blockController.setPadding(val),
		},
		condition: () => !blockController.multipleBlocksSelected(),
	},
];

const optionsSectionProperties = [
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Tag",
				type: "select",
				options: [
					"span",
					"div",
					"section",
					"button",
					"p",
					"a",
					"input",
					"hr",
					"form",
					"textarea",
					"nav",
					"header",
					"footer",
				],
				modelValue: blockController.getKeyValue("element"),
			};
		},
		searchKeyWords: "Tag, Element, TagName, Tag Name, ElementName, Element Name, header, footer, nav, input",
		events: {
			"update:modelValue": (val: string) => blockController.setKeyValue("element", val),
		},
	},
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Link",
				modelValue: blockController.getAttribute("href"),
			};
		},
		searchKeyWords: "Link, Href, URL",
		events: {
			"update:modelValue": (val: string) => blockController.setAttribute("href", val),
		},
		condition: () => blockController.isLink(),
	},
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Opens in",
				type: "select",
				options: [
					{
						value: "_self",
						label: "Same Tab",
					},
					{
						value: "_blank",
						label: "New Tab",
					},
				],
				modelValue: blockController.getAttribute("target"),
			};
		},
		searchKeyWords: "Link, Target, Opens in, OpensIn, Opens In, New Tab",
		events: {
			"update:modelValue": (val: string) => blockController.setAttribute("target", val),
		},
		condition: () => blockController.isLink(),
	},
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Image URL",
				modelValue: blockController.getAttribute("src"),
			};
		},
		searchKeyWords: "Image, URL, Src",
		events: {
			"update:modelValue": (val: string) => blockController.setAttribute("src", val),
		},
		condition: () => blockController.isImage(),
	},
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Image Fit",
				type: "select",
				options: ["fill", "contain", "cover", "none"],
				modelValue: blockController.getStyle("objectFit"),
			};
		},
		searchKeyWords: "Image, Fit, ObjectFit, Object Fit, Fill, Contain, Cover, None",
		events: {
			"update:modelValue": (val: StyleValue) => blockController.setStyle("objectFit", val),
		},
		condition: () => blockController.isImage(),
	},
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Input Type",
				type: "select",
				options: ["text", "number", "email", "password", "date", "time", "search", "tel", "url", "color"],
				modelValue: blockController.getAttribute("type") || "text",
			};
		},
		searchKeyWords:
			"Input, Type, InputType, Input Type, Text, Number, Email, Password, Date, Time, Search, Tel, Url, Color",
		events: {
			"update:modelValue": (val: string) => blockController.setAttribute("type", val),
		},
		condition: () => blockController.isInput(),
	},
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Placeholder",
				modelValue: blockController.getAttribute("placeholder"),
			};
		},
		searchKeyWords: "Placeholder, Input, PlaceholderText, Placeholder Text",
		events: {
			"update:modelValue": (val: string) => blockController.setAttribute("placeholder", val),
		},
		condition: () => blockController.isInput(),
	},
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Content",
				modelValue: blockController.getTextContent(),
			};
		},
		searchKeyWords: "Content, Text, ContentText, Content Text",
		events: {
			"update:modelValue": (val: string) => blockController.setKeyValue("innerHTML", val),
		},
		condition: () => blockController.isText() || blockController.isButton(),
	},
	{
		component: OptionToggle,
		getProps: () => {
			return {
				label: "Visibility",
				options: [
					{
						label: "Visible",
						value: "flex",
					},
					{
						label: "Hidden",
						value: "none",
					},
				],
				modelValue: blockController.getStyle("display") || "flex",
			};
		},
		searchKeyWords: "Visibility, Display, Visible, Hidden, Flex, None, hide, show",
		events: {
			"update:modelValue": (val: StyleValue) => blockController.setStyle("display", val),
		},
	},
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Condition",
				modelValue: blockController.getKeyValue("visibilityCondition"),
			};
		},
		searchKeyWords:
			"Condition, Visibility, VisibilityCondition, Visibility Condition, show, hide, display, hideIf, showIf",
		events: {
			"update:modelValue": (val: string) => blockController.setKeyValue("visibilityCondition", val),
		},
	},
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Overflow X",
				type: "select",
				options: ["auto", "visible", "hidden", "scroll"],
				modelValue: blockController.getStyle("overflowX"),
			};
		},
		searchKeyWords:
			"Overflow, X, OverflowX, Overflow X, Auto, Visible, Hide, Scroll, horizontal scroll, horizontalScroll",
		events: {
			"update:modelValue": (val: StyleValue) => blockController.setStyle("overflowX", val),
		},
	},
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Overflow Y",
				type: "select",
				options: ["auto", "visible", "hidden", "scroll"],
				modelValue: blockController.getStyle("overflowY"),
			};
		},
		searchKeyWords:
			"Overflow, Y, OverflowY, Overflow Y, Auto, Visible, Hide, Scroll, vertical scroll, verticalScroll",
		events: {
			"update:modelValue": (val: StyleValue) => blockController.setStyle("overflowY", val),
		},
	},
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Alt Text",
				modelValue: blockController.getAttribute("alt"),
			};
		},
		searchKeyWords: "Alt, Text, AltText, Alternate Text",
		events: {
			"update:modelValue": (val: string) => blockController.setAttribute("alt", val),
		},
		condition: () => blockController.isImage(),
	},
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Class",
				modelValue: blockController.getClasses().join(", "),
			};
		},
		searchKeyWords: "Class, ClassName, Class Name",
		events: {
			"update:modelValue": (val: string) => setClasses(val || ""),
		},
		condition: () => !blockController.multipleBlocksSelected(),
	},
	{
		component: CodeEditor,
		getProps: () => {
			return {
				label: "HTML",
				type: "HTML",
				autofocus: false,
				class: "mb-5",
				modelValue: blockController.getInnerHTML() || "",
			};
		},
		searchKeyWords: "HTML, InnerHTML, Inner HTML",
		events: {
			"update:modelValue": (val: string) => {
				blockController.setInnerHTML(val);
			},
		},
		condition: () => blockController.isHTML(),
	},
];

const dataKeySectionProperties = [
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Key",
				modelValue: blockController.getDataKey("key"),
			};
		},
		searchKeyWords: "Key, DataKey, Data Key",
		events: {
			"update:modelValue": (val: string) => blockController.setDataKey("key", val),
		},
	},
	{
		component: InlineInput,
		condition: () => !blockController.isRepeater(),
		getProps: () => {
			return {
				label: "Type",
				modelValue: blockController.getDataKey("type"),
			};
		},
		searchKeyWords: "Type, DataType, Data Type",
		events: {
			"update:modelValue": (val: string) => blockController.setDataKey("type", val),
		},
	},
	{
		component: InlineInput,
		condition: () => !blockController.isRepeater(),
		getProps: () => {
			return {
				label: "Property",
				modelValue: blockController.getDataKey("property"),
			};
		},
		searchKeyWords: "Property, DataProperty, Data Property",
		events: {
			"update:modelValue": (val: string) => blockController.setDataKey("property", val),
		},
	},
];

const customAttributesSectionProperties = [
	{
		component: ObjectEditor,
		getProps: () => {
			return {
				obj: blockController.getCustomAttributes() as Record<string, string>,
			};
		},
		searchKeyWords: "Attributes, CustomAttributes, Custom Attributes, HTML Attributes, Data Attributes",
		events: {
			"update:obj": (obj: Record<string, string>) => blockController.setCustomAttributes(obj),
		},
	},
];

const rawStyleSectionProperties = [
	{
		component: ObjectEditor,
		getProps: () => {
			return {
				obj: blockController.getRawStyles() as Record<string, string>,
				description: `
					<b>Note:</b>
					<br />
					<br />
					- Raw styles get applied across all devices
					<br />
					- State based styles are supported (e.g. hover, focus, visited)
					<br />
					Syntax: hover:color, focus:color, etc.
					<br />
					- State styles are only activated in preview mode
				`,
			};
		},
		searchKeyWords: "Raw, RawStyle, Raw Style, CSS, Style, Styles",
		events: {
			"update:obj": (obj: Record<string, string>) => blockController.setRawStyles(obj),
		},
	},
];

const videoOptionsSectionProperties = [
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Video URL",
				modelValue: blockController.getAttribute("src"),
			};
		},
		searchKeyWords: "Video, URL, Src",
		events: {
			"update:modelValue": (val: string) => blockController.setAttribute("src", val),
		},
	},
	{
		component: InlineInput,
		getProps: () => {
			return {
				label: "Poster",
				modelValue: blockController.getAttribute("poster"),
			};
		},
		searchKeyWords: "Poster",
		events: {
			"update:modelValue": (val: string) => blockController.setAttribute("poster", val),
		},
	},
	{
		component: OptionToggle,
		getProps: () => {
			return {
				label: "Controls",
				options: [
					{
						label: "Show",
						value: "true",
					},
					{
						label: "Hide",
						value: "false",
					},
				],
				modelValue: blockController.getAttribute("controls") === "" ? "true" : "false",
			};
		},
		searchKeyWords: "Controls, volume, play, pause, stop, mute, unmute, fullscreen, full screen",
		events: {
			"update:modelValue": (val: boolean) => blockController.toggleAttribute("controls"),
		},
	},
	{
		component: OptionToggle,
		getProps: () => {
			return {
				label: "Autoplay",
				options: [
					{
						label: "Yes",
						value: "true",
					},
					{
						label: "No",
						value: "false",
					},
				],
				modelValue: blockController.getAttribute("autoplay") === "" ? "true" : "false",
			};
		},
		searchKeyWords: "Autoplay, Auto Play",
		events: {
			"update:modelValue": (val: boolean) => blockController.toggleAttribute("autoplay"),
		},
	},
	{
		component: OptionToggle,
		getProps: () => {
			return {
				label: "Muted",
				options: [
					{
						label: "Yes",
						value: "true",
					},
					{
						label: "No",
						value: "false",
					},
				],
				modelValue: blockController.getAttribute("muted") === "" ? "true" : "false",
			};
		},
		searchKeyWords: "Muted",
		events: {
			"update:modelValue": (val: boolean) => blockController.toggleAttribute("muted"),
		},
	},
	{
		component: OptionToggle,
		getProps: () => {
			return {
				label: "Loop",
				options: [
					{
						label: "Yes",
						value: "true",
					},
					{
						label: "No",
						value: "false",
					},
				],
				modelValue: blockController.getAttribute("loop") === "" ? "true" : "false",
			};
		},
		searchKeyWords: "Loop",
		events: {
			"update:modelValue": (val: boolean) => blockController.toggleAttribute("loop"),
		},
	},
];

const sections = [
	{
		name: "Layout",
		properties: layoutSectionProperties,
		condition: () => !blockController.multipleBlocksSelected(),
	},
	{
		name: "Style",
		properties: styleSectionProperties,
	},
	{
		name: "Video Options",
		properties: videoOptionsSectionProperties,
		condition: () => blockController.isVideo(),
	},
	{
		name: "Typography",
		properties: typographySectionProperties,
		condition: () => blockController.isText() || blockController.isContainer() || blockController.isInput(),
	},
	{
		name: "Dimension",
		properties: dimensionSectionProperties,
	},
	{
		name: "Position",
		properties: positionSectionProperties,
		condition: () => !blockController.multipleBlocksSelected(),
	},
	{
		name: "Spacing",
		properties: spacingSectionProperties,
		condition: () => !blockController.multipleBlocksSelected(),
	},
	{
		name: "Options",
		properties: optionsSectionProperties,
	},
	{
		name: "Data Key",
		properties: dataKeySectionProperties,
		condition: () => blockController.isBLockSelected(),
	},
	{
		name: "HTML Attributes",
		properties: customAttributesSectionProperties,
	},
	{
		name: "Raw Style",
		properties: rawStyleSectionProperties,
	},
] as PropertySection[];
</script>
