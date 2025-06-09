export class Utils {
    static truncate(str, maxLength) {
        if (str.length <= maxLength) {
            return str;
        }
        
        const halfLength = Math.floor((maxLength - 3) / 2);
        const start = str.slice(0, halfLength);
        const end = str.slice(-halfLength);
        
        return `${start}...${end}`;
    }
}