import { expect } from './assertions'

export async function renderPartial(form: Application, sectionSelector: string)
{
    // Find the specified section:
    const section = form.element.find(sectionSelector)
    expect(section.length === 1)

    // Re-render the form (but to a string):
    const fullHtml = await renderTemplate(form.template, form.getData())

    // Parse that as HTML and then extract the relevant section:
    const sectionHtml = $(fullHtml).find(sectionSelector)
    expect(sectionHtml.length == 1)

    // Find that section in the *current* form and swap it out:
    section.replaceWith(sectionHtml)
}
