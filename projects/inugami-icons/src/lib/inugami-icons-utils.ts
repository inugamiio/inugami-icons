import { IconDefinition } from "./inugami-icons.model";

const ICONS: any = {};

export class InugamiIconsUtils {

    public static getIcon(name?: string|null): string | undefined {
        if(!name){
            return undefined;
        }
        const rawData = ICONS[name] as any;

        return rawData ? rawData : undefined;
    }

    public static register(icons: IconDefinition[]) {
        for (let icon of icons) {
            ICONS[icon.name] = icon.content;
        }
    }

    public static getAllIcons(): string[] {
        const result =Object.keys(ICONS);
        return result;
    }
}