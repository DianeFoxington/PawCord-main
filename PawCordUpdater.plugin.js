/**
 * @name PawCordUpdater
 * @version 1.0
 * @description Handles updating the PawCord plugin.
 * @author Diane Foxington
 */

const fs = require("fs");
const path = require("path");

module.exports = class PawCordUpdater {
    constructor() {
        this.pluginName = "PawCord";
        this.pluginFile = "PawCord.plugin.js";
        this.pluginPath = path.join(BdApi.Plugins.folder, this.pluginFile);
        this.rawGithubUrl = "https://raw.githubusercontent.com/DianeFoxingtonn/PawCord/main/PawCord.plugin.js";
    }

    async start() {
        console.log(`[PawCordUpdater] Started, updating PawCord...`);
        await this.updatePawCord();
    }

    async updatePawCord() {
        try {
            console.log(`[PawCordUpdater] Fetching latest PawCord version...`);
            const response = await BdApi.Net.fetch(this.rawGithubUrl);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

            const newPawCordCode = await response.text();

            // Disable the old PawCord plugin
            BdApi.Plugins.disable(this.pluginFile);
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 sec

            // Remove the old PawCord file
            if (fs.existsSync(this.pluginPath)) {
                fs.unlinkSync(this.pluginPath);
                console.log(`[PawCordUpdater] Old PawCord removed.`);
            }

            // Save the new PawCord plugin
            fs.writeFileSync(this.pluginPath, newPawCordCode);
            console.log(`[PawCordUpdater] New PawCord installed.`);

            // Enable the new PawCord
            BdApi.Plugins.enable(this.pluginFile);

            // Disable and remove itself
            setTimeout(() => {
                BdApi.Plugins.disable("PawCordUpdater.plugin.js");
                if (fs.existsSync(__filename)) {
                    fs.unlinkSync(__filename);
                    console.log(`[PawCordUpdater] Updater removed.`);
                }
            }, 2000);
        } catch (error) {
            console.error(`[PawCordUpdater] Update failed:`, error);
        }
    }

    stop() {
        console.log(`[PawCordUpdater] Stopped!`);
    }
};