/*
 *      Name: OlympusRigs
 *   Version: 322.0.1
 * Copyright: jbs4bmx
 *    Update: 05.09.2022
*/

import { DependencyContainer } from "tsyringe";
import { IMod } from "@spt-aki/models/external/mod";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { DatabaseImporter } from "@spt-aki/utils/DatabaseImporter";
import { PreAkiModLoader } from "@spt-aki/loaders/PreAkiModLoader";

let rigdb;

class Riggings implements IMod
{
    private pkg;
    private path = require('path');
    private modName = this.path.basename(this.path.dirname(__dirname.split('/').pop()));

    public preAkiLoad(container: DependencyContainer)
    {
        const logger = container.resolve<ILogger>("WinstonLogger");
        this.pkg = require("../package.json")
        logger.info(`Loading: ${this.pkg.author}-${this.pkg.name} v${this.pkg.version}`);
        logger.log("Zeus grants you access to enhanced mags, meds, and gear for your quests.", "yellow");
        logger.log("Hestia's selflessness provides you the courage and power to smite your enemies.", "magenta");
        logger.log("Hera, Poseidon, Demeter, Athena, Apollo, Artemis, Ares, Hephaestus, Aphrodite, ", "cyan");
        logger.log("Hermes, and Dionysus rally you on as you storm into battle.", "cyan");
    }

    public postDBLoad(container: DependencyContainer)
    {
        const logger = container.resolve<ILogger>("WinstonLogger");
        const db = container.resolve<DatabaseServer>("DatabaseServer").getTables();
        const preAkiModLoader = container.resolve<PreAkiModLoader>("PreAkiModLoader");
        const databaseImporter = container.resolve<DatabaseImporter>("DatabaseImporter");
        const locales = db.locales.global;
        this.pkg = require("../package.json");
        rigdb = databaseImporter.loadRecursive(`${preAkiModLoader.getModPath(this.modName)}database/`);

        for (const i_item in rigdb.templates.items.templates) {
            db.templates.items[i_item] = rigdb.templates.items.templates[i_item];
            db.templates.items[i_item]._props.Finallowed = false;
            db.templates.items[i_item]._props.FinAllowed = false;
            db.templates.clientItems[i_item] = rigdb.templates.items.templates[i_item];
            db.templates.clientItems[i_item]._props.Finallowed = false;
            db.templates.clientItems[i_item]._props.FinAllowed = false;
        }

        for (const h_item of rigdb.templates.handbook.Items) {
            if (!db.templates.handbook.Items.find(i=>i.Id == h_item.Id)) {
                db.templates.handbook.Items.push(h_item);
            }
        }

        for (const localeID in locales) {
            for (const locale in rigdb.locales.en.templates) {
                locales[localeID].templates[locale] = rigdb.locales.en.templates[locale];
            }
        }

        for (const p_item in rigdb.templates.prices) {
            db.templates.prices[p_item] = rigdb.templates.prices[p_item];
        }

        for (const tradeName in db.traders) {
            // Ragman
            if ( tradeName === "5ac3b934156ae10c4430e83c" ) {
                logger.log("The gods are supplying Ragman with additional gear...", "yellow");
                for (const ri_item of rigdb.traders.Ragman.items.list) {
                    if (!db.traders[tradeName].assort.items.find(i=>i._id == ri_item._id)) {
                        db.traders[tradeName].assort.items.push(ri_item);
                    }
                }
                for (const rb_item in rigdb.traders.Ragman.barter_scheme) {
                    db.traders[tradeName].assort.barter_scheme[rb_item] = rigdb.traders.Ragman.barter_scheme[rb_item];
                }
                for (const rl_item in rigdb.traders.Ragman.loyal_level_items){
                    db.traders[tradeName].assort.loyal_level_items[rl_item] = rigdb.traders.Ragman.loyal_level_items[rl_item];
                }
            }
        }


        this.pushItems(container);
        this.adjustItems(container);

        logger.info(`${this.pkg.author}-${this.pkg.name} v${this.pkg.version}: Cached successfully`);
    }

    public postAkiLoadMod() {
        return;
    }

    public adjustItems(container: DependencyContainer): void
    {
        const db = container.resolve<DatabaseServer>("DatabaseServer").getTables();
        const items = db.templates.items;
        const { Resize, Sicc, KeyTool, MoneyCase } = require("./config.json");

        if ( Resize ) {
            if ( Sicc.newHSize > 5 ) { items["5d235bb686f77443f4331278"]._props.Grids[0]._props.cellsH = Sicc.newHSize; }
            if ( Sicc.newVSize > 5 ) { items["5d235bb686f77443f4331278"]._props.Grids[0]._props.cellsV = Sicc.newVSize; }
            if ( KeyTool.newHSize > 4 ) { items["59fafd4b86f7745ca07e1232"]._props.Grids[0]._props.cellsH = KeyTool.newHSize; }
            if ( KeyTool.newVSize > 4 ) { items["59fafd4b86f7745ca07e1232"]._props.Grids[0]._props.cellsV = KeyTool.newVSize; }
            if ( MoneyCase.newHSize > 7 ) { items["59fb016586f7746d0d4b423a"]._props.Grids[0]._props.cellsH = MoneyCase.newHSize; }
            if ( MoneyCase.newVSize > 7 ) { items["59fb016586f7746d0d4b423a"]._props.Grids[0]._props.cellsV = MoneyCase.newVSize; }
        }
    }

    public pushItems(container: DependencyContainer): void
    {
        let sectionName = "mod_magazine";
        var i;
        const db = container.resolve<DatabaseServer>("DatabaseServer").getTables();
        const items = db.templates.items;

        // Add 'Helmet of Hermes' to head wear slot (5) in default inventory.
        items["55d7217a4bdc2d86028b456d"]._props.Slots[5]._props.filters[0].Filter.push("helmetOfHermes");
    }

}
module.exports = { mod: new Riggings() }