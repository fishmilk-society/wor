export function truncateArray<T>(array: Array<T>, downTo: number): void
{
    const purgeCount = array.length - downTo
    if (purgeCount > 0)
        array.splice(0, purgeCount)
}
