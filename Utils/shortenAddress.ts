export function shrotenAddress(input: string = '') {
    if (typeof input !== 'string') {
        console.warn('shrotenAddress expects a string as input')
        return ''
    }
    return `${input.substring(0, 6)}...${input.substring(input.length - 4)}`
}
