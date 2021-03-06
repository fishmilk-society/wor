import { CharacterSheet } from "./templates/character-sheet.js";

Hooks.once("init", async function () {
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("wor", CharacterSheet, {
        label: "Character Sheet",
        types: ["character"],
        makeDefault: true
    });

    console.log("WOR | Initialized");
});
