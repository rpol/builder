import useStore from "@/store";
import { CSSProperties } from "vue";
import Block, { BlockDataKey } from "./block";

const store = useStore();

type styleProperty = keyof CSSProperties;

const blockController = {
	clearSelection: () => {
		store.activeCanvas?.clearSelection();
	},
	getFirstSelectedBlock: () => {
		return store.activeCanvas?.selectedBlocks[0] as Block;
	},
	getSelectedBlocks: () => {
		return store.activeCanvas?.selectedBlocks || [];
	},
	isRoot() {
		return blockController.isBLockSelected() && blockController.getFirstSelectedBlock().isRoot();
	},
	setStyle: (style: styleProperty, value: StyleValue) => {
		store.activeCanvas?.selectedBlocks.forEach((block) => {
			block.setStyle(style, value);
		});
	},
	setBaseStyle: (style: styleProperty, value: StyleValue) => {
		store.activeCanvas?.selectedBlocks.forEach((block) => {
			block.setBaseStyle(style, value);
		});
	},
	getStyle: (style: styleProperty) => {
		let styleValue = "__initial__" as StyleValue;
		store.activeCanvas?.selectedBlocks.forEach((block) => {
			if (styleValue === "__initial__") {
				styleValue = block.getStyle(style);
			} else if (styleValue !== block.getStyle(style)) {
				styleValue = "Mixed";
			}
		});
		return styleValue;
	},
	isBLockSelected: () => {
		return store.activeCanvas?.selectedBlocks.length || 0 > 0;
	},
	multipleBlocksSelected: () => {
		return store.activeCanvas?.selectedBlocks && store.activeCanvas?.selectedBlocks.length > 1;
	},
	isText: () => {
		return blockController.isBLockSelected() && blockController.getFirstSelectedBlock().isText();
	},
	isContainer: () => {
		return blockController.isBLockSelected() && blockController.getFirstSelectedBlock().isContainer();
	},
	isImage: () => {
		return blockController.isBLockSelected() && blockController.getFirstSelectedBlock().isImage();
	},
	isVideo: () => {
		return blockController.isBLockSelected() && blockController.getFirstSelectedBlock().isVideo();
	},
	isButton: () => {
		return blockController.isBLockSelected() && blockController.getFirstSelectedBlock().isButton();
	},
	isLink: () => {
		return blockController.isBLockSelected() && blockController.getFirstSelectedBlock().isLink();
	},
	isInput: () => {
		return blockController.isBLockSelected() && blockController.getFirstSelectedBlock().isInput();
	},
	getAttribute: (attribute: string) => {
		let attributeValue = "__initial__" as StyleValue;
		store.activeCanvas?.selectedBlocks.forEach((block) => {
			if (attributeValue === "__initial__") {
				attributeValue = block.getAttribute(attribute);
			} else if (attributeValue !== block.getAttribute(attribute)) {
				attributeValue = "Mixed";
			}
		});
		return attributeValue;
	},
	setAttribute: (attribute: string, value: string) => {
		store.activeCanvas?.selectedBlocks.forEach((block) => {
			block.setAttribute(attribute, value);
		});
	},
	getKeyValue: (key: "element" | "innerHTML" | "visibilityCondition") => {
		let keyValue = "__initial__" as StyleValue | undefined;
		store.activeCanvas?.selectedBlocks.forEach((block) => {
			if (keyValue === "__initial__") {
				keyValue = block[key];
			} else if (keyValue !== block[key]) {
				keyValue = "Mixed";
			}
		});
		return keyValue;
	},
	setKeyValue: (key: "element" | "innerHTML" | "visibilityCondition", value: string) => {
		store.activeCanvas?.selectedBlocks.forEach((block) => {
			if (key === "element" && block.blockName === "container") {
				// reset blockName since it will not be a container anymore
				delete block.blockName;
			}
			block[key] = value;
		});
	},
	getClasses: () => {
		let classes = [] as string[];
		if (blockController.isBLockSelected()) {
			classes = blockController.getFirstSelectedBlock().getClasses() || [];
		}
		return classes;
	},
	setClasses: (classes: string[]) => {
		const block = store.activeCanvas?.selectedBlocks[0];
		if (!block) return;
		block.classes = classes;
	},
	getRawStyles: () => {
		return blockController.isBLockSelected() && blockController.getFirstSelectedBlock().rawStyles;
	},
	setRawStyles: (rawStyles: BlockStyleMap) => {
		store.activeCanvas?.selectedBlocks.forEach((block) => {
			Object.keys(block.rawStyles).forEach((key) => {
				if (!rawStyles[key]) {
					delete block.rawStyles[key];
				}
			});
			Object.assign(block.rawStyles, rawStyles);
		});
	},
	getCustomAttributes: () => {
		return blockController.isBLockSelected() && blockController.getFirstSelectedBlock().customAttributes;
	},
	setCustomAttributes: (customAttributes: BlockAttributeMap) => {
		store.activeCanvas?.selectedBlocks.forEach((block) => {
			Object.keys(block.customAttributes).forEach((key) => {
				if (!customAttributes[key]) {
					delete block.customAttributes[key];
				}
			});
			Object.assign(block.customAttributes, customAttributes);
		});
	},
	getParentBlock: () => {
		return store.activeCanvas?.selectedBlocks[0]?.getParentBlock() || store.activeCanvas?.getFirstBlock();
	},
	setTextColor: (color: string) => {
		store.activeCanvas?.selectedBlocks.forEach((block) => {
			block.setTextColor(color);
		});
	},
	getTextColor: () => {
		let color = "__initial__" as StyleValue;
		store.activeCanvas?.selectedBlocks.forEach((block) => {
			if (color === "__initial__") {
				color = block.getTextColor();
			} else if (color !== block.getTextColor()) {
				color = "Mixed";
			}
		});
		return color;
	},
	setFontFamily: (value: string) => {
		store.activeCanvas?.selectedBlocks.forEach((block) => {
			block.setFontFamily(value);
		});
	},
	getFontFamily: () => {
		let fontFamily = "__initial__" as StyleValue;
		store.activeCanvas?.selectedBlocks.forEach((block) => {
			if (fontFamily === "__initial__") {
				fontFamily = block.getFontFamily();
			} else if (fontFamily !== block.getFontFamily()) {
				fontFamily = "Mixed";
			}
		});
		return fontFamily;
	},
	isHTML: () => {
		return blockController.isBLockSelected() && blockController.getFirstSelectedBlock().isHTML();
	},
	getInnerHTML: () => {
		return blockController.isBLockSelected() && blockController.getFirstSelectedBlock().getInnerHTML();
	},
	setInnerHTML: (value: string) => {
		store.activeCanvas?.selectedBlocks.forEach((block) => {
			block.setInnerHTML(value);
		});
	},
	getTextContent: () => {
		return blockController.isBLockSelected() && blockController.getFirstSelectedBlock().getTextContent();
	},
	setDataKey: (key: keyof BlockDataKey, value: string) => {
		store.activeCanvas?.selectedBlocks.forEach((block) => {
			block.setDataKey(key, value);
		});
	},
	getDataKey: (key: keyof BlockDataKey) => {
		return blockController.isBLockSelected() && blockController.getFirstSelectedBlock().getDataKey(key);
	},
	isRepeater: () => {
		return blockController.isBLockSelected() && blockController.getFirstSelectedBlock().isRepeater();
	},
	getPadding: () => {
		return blockController.isBLockSelected() && blockController.getFirstSelectedBlock().getPadding();
	},
	setPadding: (value: string) => {
		blockController.getFirstSelectedBlock().setPadding(value);
	},
	getMargin: () => {
		return blockController.isBLockSelected() && blockController.getFirstSelectedBlock().getMargin();
	},
	setMargin: (value: string) => {
		blockController.getFirstSelectedBlock().setMargin(value);
	},
	toggleAttribute: (attribute: string) => {
		store.activeCanvas?.selectedBlocks.forEach((block) => {
			if (block.getAttribute(attribute) !== undefined) {
				block.removeAttribute(attribute);
			} else {
				block.setAttribute(attribute, "");
			}
		});
	},
};

export default blockController;
