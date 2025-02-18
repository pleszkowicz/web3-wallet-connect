export function shrotenAddress(input: string) {
    return `${input.substring(0, 6)}...${input.substring(input.length - 4)}`
}
