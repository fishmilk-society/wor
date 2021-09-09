export function formatDate(date: number | Date): string
{
    date = new Date(date)

    const today = new Date()
    if (date.toDateString() == today.toDateString())
        return `Today at ${date.toLocaleTimeString('en-NZ')}`

    return date.toLocaleString('en-NZ').replace(', ', ' at ')
}
