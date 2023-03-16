/**
 * Copyright: AssAssIn
 * Continued By: jbs4bmx
*/

import { DependencyContainer } from "tsyringe";
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/externals/IPostDBLoadMod";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ImporterUtil } from "@spt-aki/utils/ImporterUtil";
import { PreAkiModLoader } from "@spt-aki/loaders/PreAkiModLoader";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { IBotConfig } from "@spt-aki/models/spt/config/IBotConfig";

let zeusdb;

class Olympus implements IPreAkiLoadMod, IPostDBLoadMod
{
    private pkg;
    private path = require('path');
    private modName = this.path.basename(this.path.dirname(__dirname.split('/').pop()));

    public postDBLoad(container: DependencyContainer)
    {
        const logger = container.resolve<ILogger>("WinstonLogger");
        const db = container.resolve<DatabaseServer>("DatabaseServer").getTables();
        const preAkiModLoader = container.resolve<PreAkiModLoader>("PreAkiModLoader");
        const databaseImporter = container.resolve<ImporterUtil>("ImporterUtil");
        const locales = db.locales.global;
        this.pkg = require("../package.json");
        zeusdb = databaseImporter.loadRecursive(`${preAkiModLoader.getModPath(this.modName)}database/`);

        for (const i_item in zeusdb.templates.items) {
            db.templates.items[i_item] = zeusdb.templates.items[i_item];
        }

        for (const h_item of zeusdb.templates.handbook.Items) {
            if (!db.templates.handbook.Items.find(i=>i.Id == h_item.Id)) {
                db.templates.handbook.Items.push(h_item);
            }

        }

        for (const localeID in locales) {
            for (const locale in zeusdb.locales.en) {
                locales[localeID][locale] = zeusdb.locales.en[locale];
            }
        }

        for (const p_item in zeusdb.templates.prices) {
            db.templates.prices[p_item] = zeusdb.templates.prices[p_item];
        }

        for (const tradeName in db.traders) {
            if ( tradeName === "5ac3b934156ae10c4430e83c" ) {
                for (const ri_item of zeusdb.traders.Ragman.items.list) {
                    if (!db.traders[tradeName].assort.items.find(i=>i._id == ri_item._id)) {
                        db.traders[tradeName].assort.items.push(ri_item);
                    }
                }
                for (const rb_item in zeusdb.traders.Ragman.barter_scheme) {
                    db.traders[tradeName].assort.barter_scheme[rb_item] = zeusdb.traders.Ragman.barter_scheme[rb_item];
                }
                for (const rl_item in zeusdb.traders.Ragman.loyal_level_items){
                    db.traders[tradeName].assort.loyal_level_items[rl_item] = zeusdb.traders.Ragman.loyal_level_items[rl_item];
                }
            }
        }

        this.pushItems(container);
        this.checkExclusions(container);

        logger.info(`${this.pkg.author}-${this.pkg.name} v${this.pkg.version}: Cached successfully`);
        logger.log("Zeus grants you access to enhanced gear for your quests.", "yellow");
        logger.log("Hestia's selflessness provides you the courage and power to smite your enemies.", "magenta");
        logger.log("Hera, Poseidon, Demeter, Athena, Apollo, Artemis, Ares, Hephaestus, Aphrodite, ", "cyan");
        logger.log("Hermes, and Dionysus rally you on as you storm into battle.", "cyan");
    }

    public pushItems(container: DependencyContainer): void
    {
        const db = container.resolve<DatabaseServer>("DatabaseServer").getTables();
        const items = db.templates.items;

        items["55d7217a4bdc2d86028b456d"]._props.Slots[5]._props.filters[0].Filter.push("helmetOfHermes");

    }

    public checkExclusions(container: DependencyContainer): void {
        const configServer = container.resolve<ConfigServer>("ConfigServer");
        const botConfig = configServer.getConfig<IBotConfig>(ConfigTypes.BOT);
        const { blacklistGear } = require("./config.json");

        if (typeof blacklistGear === "boolean"){
            if (blacklistGear === true) {
                //botConfig.pmc.dynamicLoot.blacklist.push("armorOfAthena","atlasSatchel","hercRig","hercRig2","helmetOfHermes");
                botConfig.pmc.vestLoot.blacklist.push("armorOfAthena","atlasSatchel","hercRig","hercRig2","helmetOfHermes");
                botConfig.pmc.pocketLoot.blacklist.push("armorOfAthena","atlasSatchel","hercRig","hercRig2","helmetOfHermes");
                botConfig.pmc.backpackLoot.blacklist.push("armorOfAthena","atlasSatchel","hercRig","hercRig2","helmetOfHermes");
            }
        }
    }

}
module.exports = { mod: new Olympus() }