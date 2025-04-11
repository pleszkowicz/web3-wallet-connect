export function shrotenAddress(input: string = '') {
    if (typeof input !== 'string' || input.length === 0) {
        return ''
    }
    return `${input.substring(0, 6)}...${input.substring(input.length - 4)}`
}
