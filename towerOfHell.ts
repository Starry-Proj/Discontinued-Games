/**
 * 
 *  Discontinued from Starry as of April 28th, 2025.
 * 
 *  Officially the second ever game of Starry, support and updates
 *  will no longer be provided.
 * 
 *  Issues about the script will be ignored.
 *
 *  --
 *
 *  Please ignore the bad Roblox-TypeScript code, this was made really early
 *  into learning Roblox-TypeScript..
 * 
 *  discord.gg/luau
 * 
 */

import { CoreGui, Lighting, MarketplaceService, ReplicatedStorage, RunService, TeleportService, VirtualUser, Workspace } from "services";
import { Dropdown } from "fluentts/types/dropdown";
import { Input } from "fluentts/types/input";
import { Slider } from "fluentts/types/slider";
import { Toggle } from "fluentts/types/toggle";
import { emojis, gameId, localPlayer, name, path, playerGui, slaves, staticDivider, updated, version } from "shared/constants";
import { betterMobile, chat, findPlayer, hasGetConnections, notify } from "shared/tools";

// Constants

const gameScriptLastUpdated = "February 1st, 2025";

const towerOfHellFolder = `${path}//TOH`;

const teleportMethod = "Teleport_Method.Starry";
const winMethod = "Win_Method.Starry";
const time = "Time.Starry";

export function towerOfHell() {
    const globalConnection: RBXScriptConnection[] = (getgenv().allStarryConnections as RBXScriptConnection[]);
    const tower: Model = (Workspace.FindFirstChild("tower") as Model) ?? (Workspace.WaitForChild("tower") as Model);
    const sections: Model = (tower && tower.FindFirstChild("sections") as Model) ?? (tower && tower.WaitForChild("sections") as Model);
    const timeLabel: ScreenGui = playerGui.FindFirstChild("timer") as ScreenGui;
    const timer: TextLabel = timeLabel.FindFirstChild("timeLeft") as TextLabel;

    // Interfaces and stuff

    interface Stage {
        n: number;
        p2: Part;
    }

    let extraJumps: Input;
    let savedTeleportMethod = readfile(`${towerOfHellFolder}//${teleportMethod}`);
    let savedWinMethod = readfile(`${towerOfHellFolder}//${winMethod}`);
    let savedFarmOnTime = tonumber(readfile(`${towerOfHellFolder}//${time}`));
    let stages: Stage[] = [];
    let presentableStages: string[] = [];
    let alreadyWon: boolean = false;
    let currentlyFarming: boolean = false;
    let alreadyFarmingPatch: boolean = false;
    let promoteAfterWin: boolean = false;
    let godmode: boolean = false;
    let locations: Dropdown;
    let stackerAutoPlay: boolean = false;
    let walkSpeedSlider: Slider;
    let jumpPowerSlider: Slider;
    let autoPlayer: Toggle;
    let autoWinLastTime: number = 0;
    let experience: number = 0;
    let levels: number = 0;
    let coins: number = 0;
    let maxTime: number;

    // Main script

    const window = fluent.CreateWindow({
        Title: emojis.star + `<b>${name}</b> @ ${MarketplaceService.GetProductInfo(gameId).Name}`,
        SubTitle: version,
        TabWidth: 160,
        Size: UDim2.fromOffset(570, 625 / staticDivider),
        Acrylic: false,
        Theme: "Darker",
        MinimizeKey: Enum.KeyCode.LeftAlt
    });

    function isProServer(): boolean {
        return gameId === 3582763398;
    }

    if (gameId === 1962086868 || gameId === 3582763398) {
        const lobby: Model = (sections && sections.FindFirstChild("lobby") as Model) ?? (sections && sections.WaitForChild("lobby") as Model);
        const gate: Instance = lobby && lobby.FindFirstChild("gate")?.FindFirstChild("gate") as Instance;

        const tabs = {
            main: window.AddTab({
                Title: "Main",
                Icon: ""
            }),
    
            info: window.AddTab({
                Title: "Information",
                Icon: "info"
            }),
    
            game: window.AddTab({
                Title: "Game",
                Icon: "gamepad-2"
            }),
    
            farming: window.AddTab({
                Title: "Farming",
                Icon: "leaf"
            }),
    
            minigames: window.AddTab({
                Title: "Mini Games",
                Icon: "joystick"
            }),
    
            settings: window.AddTab({
                Title: "Settings",
                Icon: "settings"
            })
        }
    
        // Rename our UI
    
        for (const object of CoreGui.GetDescendants()) {
            if (object.IsA("TextLabel")) {
                const [text] = string.find(object.Text, version);
    
                if (text) {
                    let parent = object.Parent;
    
                    while (parent) {
                        if (parent.IsA("ScreenGui")) {
                            parent.Name = name;
    
                            break;
                        }
    
                        parent = parent.Parent;
                    }
                }
            }
        }
    
        const ui: Instance = CoreGui.FindFirstChild(name) as Instance;
    
        // Anti Cheat
    
        if (hasGetConnections()) {
            pcall(() => {
                const playerScripts: Folder = localPlayer.FindFirstChild("PlayerScripts") as Folder;
        
                const script_: LocalScript = playerScripts?.FindFirstChild("LocalScript") as LocalScript;
                const signal_: RBXScriptSignal = script_?.Changed as RBXScriptSignal;
        
                const _script: LocalScript = playerScripts?.FindFirstChild("LocalScript2") as LocalScript;
                const _signal: RBXScriptSignal = _script?.Changed as RBXScriptSignal;
        
                for (const connection of getconnections(signal_)) {
                    connection.Disable();
                }
        
                for (const connection of getconnections(_signal)) {
                    connection.Disable();
                }
        
                _script.Destroy();
                script_.Destroy();
        
                notify(2, emojis.check + "Bypassed", "Feel free to do anything you'd like now!");
            });
        } else {
            window.Dialog({
                Title: emojis.warn + "Unsupported Feature",
                Content: "The executor you're using doesn't support <b>getconnections</b>, which is essential for disabling the Anti-Cheat\n\nModules marked with a warning sign have a higher risk of getting you banned.",
                Buttons: [
                    {
                        Title: "Understood"
                    }
                ]
            });
        }
    
        // Functions
    
        function getCharacter(): Model {
            const _character: Model = localPlayer.Character ?? localPlayer.CharacterAdded.Wait()[0] as Model;
    
            return _character;
        }
    
        function getRootPart(): BasePart {
            const _character = getCharacter();
            const rootPart: BasePart = (_character.FindFirstChild("HumanoidRootPart") as BasePart) ?? (_character.WaitForChild("HumanoidRootPart") as BasePart);
    
            return rootPart;
        }
    
        function teleport(location: CFrame) {
            // const delay = (math.random() * os.clock() * tick() / 10^12) * 1.1;
    
            // print(delay);
            // task.wait(delay);
    
            task.wait(math.random() / 10)
    
            return getRootPart().CFrame = location;
        }
    
        function hasWon(): boolean {
            const timeLabel: ScreenGui = playerGui.FindFirstChild("timer") as ScreenGui;
            const timer: TextLabel = timeLabel.FindFirstChild("timeLeft") as TextLabel;
    
            if (timeLabel && timer.TextColor3 === new Color3(0, 1, 0)) {
                alreadyWon = true;
            } else {
                alreadyWon = false;
            }
    
            return alreadyWon;
        }
    
        function getTime(excludeSeconds: boolean): number | string {
            const timeLabel: ScreenGui = playerGui.FindFirstChild("timer") as ScreenGui;
            const timer: TextLabel = timeLabel.FindFirstChild("timeLeft") as TextLabel;
    
            if (timeLabel && timer) {
                if (excludeSeconds) {
                    const [time] = timer.Text.match("(%d+):")
    
                    if (time) {
                        const numeric = tonumber(time);
    
                        if (numeric) {
                            return numeric;
                        }
                    }
                } else {
                    return timer.Text;
                }
            }
    
            return timer.Text;
        }
    
        function getLevel(): number | undefined {
            const leaderstats: Folder = localPlayer.FindFirstChild("leaderstats") as Folder;
            const level: IntValue = leaderstats.FindFirstChild("Level") as IntValue;
    
            // return level.Value;
    
            if (level) return level.Value;
    
            return undefined;
        }
    
        function getExperience(): number | undefined {
            const levelsFrame: Frame = (playerGui.FindFirstChild("levels") as Frame);
            const frame: Frame = (levelsFrame && levelsFrame.FindFirstChild("Frame") as Frame);
            const lastExperience: NumberValue = (frame.FindFirstChild("lastXp") as NumberValue);
    
            // return lastExperience.Value;
    
            if (lastExperience) return lastExperience.Value;
    
            return undefined;
        }
    
        function getCoins(): number | undefined {
            const shop: ScreenGui = (playerGui.FindFirstChild("shop2") as ScreenGui);
            const background: Frame = (shop && shop.FindFirstChild("shop") as Frame);
            const yxle: Instance = (background && background.FindFirstChild("yxle") as Instance);
            const frame: Frame = (yxle && yxle.FindFirstChild("Frame") as Frame);
            const text: TextLabel = (frame && frame.FindFirstChild("yxles") as TextLabel);
    
            if (text) {
                const numbered: number | undefined = tonumber(text.Text);
    
                return numbered;
            }
    
            return undefined;
        }
    
        const startingLevel: number | undefined = getLevel();
        const startingExperience: number | undefined = getExperience();
        const startingCoins: number | undefined = getCoins();
    
        function levelsEarnt(): number {
            if (getLevel() === undefined) return 0;
    
            levels = (getLevel() as number) - (startingLevel as number);
    
            return levels;
        }
    
        function experienceEarnt(): number {
            if (getExperience() === undefined) return 0;
    
            experience = (getExperience() as number) - (startingExperience as number);
    
            return experience;
        }
    
        function coinsEarnt(): number {
            if (getCoins() === undefined) return 0;
    
            coins = (getCoins() as number) - (startingCoins as number);
    
            return coins;
        }
    
        function countStats() {
            coroutine.wrap(function () {
                do {
                    for (const object of ui.GetDescendants()) {
                        if (object.IsA("TextLabel")) {
                            const [coinsEarned] = string.find(object.Text, "Coins Earned");
                            const [experienceEarned] = string.find(object.Text, "Experience Earned");
                            const [levelsEarned] = string.find(object.Text, "Levels Earned");
    
                            if (coinsEarned) {
                                const [negative] = string.find(tostring(coinsEarnt()), "-");
    
                                if (negative) {
                                    object.Text = "Coins Earned: 0";
                                } else {
                                    object.Text = `Coins Earned: ${tostring(coinsEarnt())}`;
                                }
                            } else if (experienceEarned) {
                                object.Text = `Experience Earned: ${tostring(experienceEarnt())}`;
                            } else if (levelsEarned) {
                                object.Text = `Levels Earned: ${tostring(levelsEarnt())}`;
                            }
                        }
                    }
    
                    task.wait(1);
                } while (!getgenv().starryClosed);
            })();
        }
    
        function gotoPart(part: Part) {
            const rotation = new Vector3(part.Orientation.X, part.Orientation.Y, 0);
            const orientation = part.Orientation;
    
            part.Orientation = rotation;
    
            // const newPart = new Instance("Part");
            // newPart.Size = new Vector3(5, 1, 5);
            // newPart.Anchored = true;
            // newPart.CFrame = part.CFrame.mul(new CFrame(0, -750, 0));
            // newPart.Transparency = 1;
    
            // teleport(newPart.CFrame.mul(new CFrame(0, 3, 0)));
    
            task.wait(0.25);
            teleport(part.CFrame.add(new Vector3(0, 3, 0)));
    
            task.wait(0.005);
            part.Orientation = orientation;
    
            // task.wait(0.5);
            // newPart.Destroy();
        }
    
        function getActiveEffects() {
            const remote: RemoteFunction = ReplicatedStorage.FindFirstChild("getMutators") as RemoteFunction;
            const output: string[] = [];
    
            for (const [key, value] of pairs(remote.InvokeServer())) {
                output.push(value);
            }
    
            return output;
        }
    
        function gotoEnd() {
            const fakePart = new Instance("Part");
            const tower: Model = (Workspace.FindFirstChild("tower") as Model);
            const sections: Model = (tower && tower.FindFirstChild("sections") as Model);
            const finish: Model = (sections && sections.FindFirstChild("finish") as Model);
            const exit: Model = (finish && finish.FindFirstChild("exit") as Model);
            const carpet: Part = (exit && exit.FindFirstChild("carpet") as Part);
    
            if (carpet) {
                fakePart.Parent = Workspace;
                fakePart.CFrame = (carpet.CFrame.add(new Vector3(0, 5, 0))).mul(new CFrame(0, 20.5, 0));
                fakePart.Anchored = true;
                fakePart.CanCollide = false;
                fakePart.Orientation = new Vector3(0, 90, 0);
    
                teleport(fakePart.CFrame);
    
                task.wait(0.5);
    
                fakePart.Destroy();
            }
        }
    
        function updateStages() {
            let _stages: Stage[] = [];
    
            const tower: Model = (Workspace.FindFirstChild("tower") as Model);
            const sections: Model = (tower && tower.FindFirstChild("sections") as Model);
    
            for (const stage of sections?.GetChildren()) {
                if (stage.Name !== "finish" && stage.Name !== "lobby") {
                    const index = stage.FindFirstChild("i") as IntValue | undefined;
                    const posisiton = stage.FindFirstChild("start") as Part | undefined;
    
                    if (index && posisiton) {
                        const newIndex = index.Value;
    
                        if (newIndex !== undefined) {
                            _stages.push({ n: newIndex - 1, p2: posisiton });
                        }
                    } else {
                        notify(2, emojis.x + "Error", `Stage ${stage.Name} was not registered`);
                    }
                }
            }
    
            table.sort(_stages, function (a, b) { return a.n < b.n });
    
            stages = _stages;
        }
    
        function win(method: string) {
            if (!alreadyFarmingPatch) {
                alreadyFarmingPatch = true;
    
                if (!alreadyWon) {
                    const tower: Model = (Workspace.FindFirstChild("tower") as Model);
                    const sections: Model = (tower && tower.FindFirstChild("sections") as Model);
                    const finish: Model = (sections && sections.FindFirstChild("finish") as Model);
                    const zone: Part = (finish && finish.FindFirstChild("FinishGlow") as Part);
    
                    print(method);
    
                    if (method === "Instant") {
                        //           Instantly teleport up to the final zone
                        // Problems: If teleported too soon, it will just loop kill you
    
                        notify(5, emojis.warn + "Loop Death", "If the game detects you, you will be loop killed. If this happens, just rejoin", "This doesn't mean you're banned");
    
                        currentlyFarming = true;
    
                        const originalPosition = getRootPart().CFrame;
    
                        if (zone) {
                            zone.CanCollide = false;
    
                            const fromPart = new Instance("Part");
    
                            fromPart.Size = new Vector3(5, 1, 5);
                            fromPart.Anchored = true;
                            fromPart.CFrame = zone.CFrame.mul(new CFrame(0, -750, 0));
                            fromPart.Transparency = 1;
    
                            teleport(fromPart.CFrame.mul(new CFrame(0, 3, 0)));
    
                            task.wait(0.5);
    
                            gotoEnd();
    
                            task.wait(1);
    
                            do {
                                teleport(zone.CFrame.mul(new CFrame(math.random(0, 3), 0, math.random(0, 3))));
    
                                task.wait(0.15);
                            } while (!hasWon());
    
                            getRootPart().CFrame = originalPosition;
    
                            task.wait(1);
    
                            fromPart.Destroy();
                            zone.CanCollide = true;
    
                            alreadyFarmingPatch = false;
    
                            notify(2, emojis.check + "Finished Round", "Thanks for using Suno's Auto Win");
    
                            task.wait(0.5);
    
                            currentlyFarming = false;
                        }
                    } else {
                        // Teleports you to the finish stage by stage,
                        // this one is preferred, but is a lot slower than just teleporting
    
                        currentlyFarming = true;
    
                        const originalPosition = getRootPart().CFrame;
    
                        updateStages();
    
                        for (const stage of stages) {
                            gotoPart(stage.p2);
    
                            task.wait(1);
                        }
    
                        gotoEnd();
    
                        task.wait(1.5);
    
                        do {
                            teleport(zone.CFrame.mul(new CFrame(math.random(0, 3), 0, math.random(0, 3))));
    
                            task.wait(0.15);
                        } while (!hasWon());
    
                        task.wait(1);
    
                        getRootPart().CFrame = originalPosition;
    
                        alreadyFarmingPatch = false;
    
                        notify(2, emojis.check + "Finished Round", "Thanks for using Suno's Auto Win");
    
                        task.wait(0.5);
    
                        currentlyFarming = false;
                    }
                }
            }
        }

        // Initialize

        if (gate) {
            gate.Clone().Parent = gate.Parent;
            gate.Destroy();
        }

        // Load tabs

        /* Main Tab */ {
            tabs.main.AddParagraph({
                Title: `<b>Script Updated</b>: ${gameScriptLastUpdated}`
            });
    
            tabs.main.AddParagraph({
                Title: emojis.setting + `${name} Information`,
                Content: `<b>Last Updated</b>: ${updated}\n<b>${name} Developers</b>: ${slaves}`
            });

            tabs.main.AddParagraph({
                Title: "Script Developer for this Game",
                Content: "* <b>Suno</b> - Scripter, vuln researcher"
            });

            // Socials

            tabs.main.AddSection(emojis.heart + "Socials");

            tabs.main.AddButton({
                Title: "Starry's GitHub Project",
                Description: "Press me to copy the GitHub link to the open-sourced area to your clipboard",
                Callback: () => {
                    setclipboard("https://github.com/Starry-Proj");

                    notify(2, emojis.check + "Success!", "Copied Starry's GitHub page to your clipboard, check it out!");
                }
            });

            tabs.main.AddButton({
                Title: "Our Official Discord",
                Description: "Click me to copy the Discord invite link to your clipboard",
                Callback: () => {
                    setclipboard("https://discord.gg/luau");

                    notify(2, emojis.check + "Success!", "Feel free to join our Discord server");
                }
            });

            // Script Uploaders

            tabs.main.AddSection(emojis.script + "Script Sites");

            tabs.main.AddButton({
                Title: "View Our Rscripts Profile",
                Callback: () => {
                    setclipboard("https://rscripts.net/@Starry");

                    notify(2, emojis.check + "Success!", "Copied our Rscripts profile to your clipboard, check it out!");
                }
            });

            tabs.main.AddButton({
                Title: "& Our ScriptBlox Profile",
                Callback: () => {
                    setclipboard("https://scriptblox.com/u/starry");

                    notify(2, emojis.check + "Success!", "Copied our ScriptBlox profile to your clipboard, check it out!");
                }
            });
        }

        /* Info Tab */ {
            tabs.info.AddParagraph({
                Title: "Status Information",
                Content: emojis.warn + "Unsafe, this feature could get you banned\n" + emojis.setting + "This feature is being worked on\n" + emojis.info + "This feature means only you can see it"
            });

            for (const object of CoreGui.GetDescendants()) {
                if (object.IsA("TextLabel")) {
                    const [text] = string.find(object.Text, "being worked on");

                    if (text) {
                        object.LineHeight = 1.5;

                        if (object.Parent?.FindFirstChild("UIListLayout")) {
                            object.Parent.FindFirstChild("UIListLayout")?.Destroy();
                        }

                        object.Position = UDim2.fromOffset(0, 22);
                    }
                }
            }

            tabs.info.AddToggle("Auto Promote", {
                Title: "Auto Promote after Win",
                Default: false,
                Callback: (value: boolean) => {
                    promoteAfterWin = value;
                }
            });

            // Stats

            tabs.info.AddSection(emojis.megaphone + "Stats");

            tabs.info.AddParagraph({ Title: "Experience Earned: ..." });
            tabs.info.AddParagraph({ Title: "Levels Earned: ..." });
            tabs.info.AddParagraph({ Title: "Coins Earned: ..." });
        }

        /* Game Tab */ {
            tabs.game.AddToggle("Godmode", {
                Title: "Godmode",
                Default: false,
                Callback: (value: boolean) => {
                    godmode = value;

                    const _script: LocalScript = getCharacter().FindFirstChild("KillScript") as LocalScript;

                    _script.Disabled = value;

                    if (value) {
                        notify(2, emojis.check + "Success", "You are immune to all kill parts");
                    }
                }
            });

            extraJumps = tabs.game.AddInput("Jump Changer", {
                Title: "Extra Jumps",
                Description: "Give yourself extra jumps",
                Default: 0,
                Numeric: true,
                Finished: true,
                Callback: (value: string | number) => {
                    pcall(() => {
                        const jumps = value as number;
                        const changer = ReplicatedStorage.FindFirstChild("globalJumps") as NumberValue;

                        if (changer) {
                            changer.Value = jumps;

                            if (jumps > 0) {
                                if (jumps !== 1) {
                                    notify(2, emojis.check + "Extra Jumps", `You now have ${jumps} extra jumps`);
                                } else {
                                    notify(2, emojis.check + "Extra Jumps", `You now have ${jumps} extra jump`);
                                }
                            }
                        } else {
                            notify(2, emojis.x + "Extra Jumps", "Could not modify jumps because a required object is missing")
                        }
                    });
                }
            }) as Input;

            // Stages

            tabs.game.AddSection(emojis.brick + "Stages");

            /* Stage locations */

            locations = tabs.game.AddDropdown("Teleport to Stage", {
                Title: emojis.warn + "Goto Stage",
                Values: presentableStages,
                Multi: false,
                Default: "Choose One",
                Callback: (value: string | number) => {
                    const tower: Model = (Workspace.FindFirstChild("tower") as Model) ?? (Workspace.WaitForChild("tower") as Model);
                    const sections: Model = (tower && tower.FindFirstChild("sections") as Model) ?? (tower && tower.WaitForChild("sections") as Model);
                    const finish: Model = (sections && sections.FindFirstChild("finish") as Model) ?? (sections && sections.WaitForChild("finish") as Model);
                    const lobby: Model = (sections && sections.FindFirstChild("lobby") as Model) ?? (sections && sections.WaitForChild("lobby") as Model);
                    const floor: Model = (lobby && lobby.FindFirstChild("floor") as Model) ?? (lobby && lobby.WaitForChild("floor") as Model);
                    const exit: Model = (finish && finish.FindFirstChild("exit") as Model) ?? (finish && finish.WaitForChild("exit") as Model);

                    if (value === "Spawn") {
                        gotoPart((floor.FindFirstChild("Meshes/yxY") as Part));
                    } else if (value === "Ending Zone") {
                        gotoPart((exit.FindFirstChild("carpet") as Part));
                    } else {
                        const [formatted] = (value as string).gsub("Stage ", "");

                        gotoPart(stages.find((stage) => stage.n === tonumber(formatted))!.p2)
                    }
                }
            }) as Dropdown;

            tabs.game.AddButton({
                Title: "Disable Conveyors",
                Callback: () => {
                    const tower: Model = (Workspace.FindFirstChild("tower") as Model);
                    const sections: Model = (tower && tower.FindFirstChild("sections") as Model);

                    if (sections) {
                        for (const conveyor of sections.GetDescendants()) {
                            if (conveyor.IsA("Part") && conveyor.Name === "conveyor") {
                                if (conveyor.AssemblyLinearVelocity === new Vector3(0, 0, 0)) {
                                    notify(2, emojis.x + "Already Disabled", "All conveyors have already been disabled");

                                    return;
                                }

                                const visualSpeed: NumberValue = conveyor.FindFirstChild("CONVEYOR") as NumberValue;

                                conveyor.AssemblyLinearVelocity = new Vector3(0, 0, 0)
                                visualSpeed.Value = 0;
                            }
                        }

                        notify(2, emojis.check + "Disabled Conveyors", "All conveyors in the tower have been disabled");
                    }
                }
            });

            // Gears

            tabs.game.AddSection(emojis.tools + "Gears & Tools")

            tabs.game.AddDropdown("Give Gear", {
                Title: emojis.info + "Give Purchasable Gear",
                Values: ["Speed Coil", "Gravity Coil", "Fusion Coil", "Trowel", "Grappling Hook", "Hourglass"],
                Multi: false,
                Default: "Choose One",
                Callback: (value: string | number) => {
                    let option: string = (value as string);

                    option = option.lower();

                    option = option.gsub("coil", "")[0];
                    option = option.gsub("grappling", "")[0];
                    option = option.gsub(" ", "")[0];

                    const gears: Folder = (ReplicatedStorage.FindFirstChild("Gear") as Folder);
                    const item: Tool = (gears.FindFirstChild(option) as Tool);

                    item.Clone().Parent = localPlayer.FindFirstChild("Backpack");
                }
            });

            tabs.game.AddDropdown("Give Hidden Gear", {
                Title: emojis.info + "Give Hidden  Gear",
                Description: "<i>Only</i> the Jump Coil works",
                Values: ["Banana", "Bomb", "Cola", "Fishing Rod", "Jump Coil", "Kill Pbart", "YXTerminator"],
                Multi: false,
                Default: "Choose One",
                Callback: (value: string | number) => {
                    let option: string = (value as string);

                    option = option.lower();

                    option = option.gsub("coil", "")[0];
                    option = option.gsub(" ", "")[0];

                    const gears: Folder = (ReplicatedStorage.FindFirstChild("Gear") as Folder) ?? (ReplicatedStorage.WaitForChild("Gear") as Folder);
                    const item: Tool = (gears.FindFirstChild(option) as Tool);

                    item.Clone().Parent = localPlayer.FindFirstChild("Backpack");
                }
            });

            // Misc

            tabs.game.AddSection(emojis.setting + "Miscellaneous");

            tabs.game.AddDropdown("Goto Server", {
                Title: "Goto Server Type",
                Values: ["Normal Servers", "Pro Servers"],
                Multi: false,
                Default: "Choose One",
                Callback: (value: string | number) => {
                    let placeId: number | undefined;

                    const [formatted] = (value as string).gsub(" Servers", "");

                    if (formatted === "Normal") placeId = 1962086868;
                    if (formatted === "Pro") placeId = 3582763398;

                    TeleportService.Teleport((placeId as number), localPlayer);
                }
            });

            tabs.game.AddDropdown("Open Shop", {
                Title: "Open Shop",
                Values: ["Sidebar Shop", "Bank", "Gear Shop", "Mutators"],
                Multi: false,
                Default: "Choose One",
                Callback: (value: string | number) => {
                    const sidebar: ScreenGui = (playerGui.FindFirstChild("shop2") as ScreenGui) ?? (playerGui.WaitForChild("shop2") as ScreenGui);
                    const bank: ScreenGui = (playerGui.FindFirstChild("shop_coins") as ScreenGui) ?? (playerGui.WaitForChild("shop_coins") as ScreenGui);
                    const gearShop: ScreenGui = (playerGui.FindFirstChild("shop_gears") as ScreenGui) ?? (playerGui.WaitForChild("shop_gears") as ScreenGui);
                    const mutatorShop: ScreenGui = (playerGui.FindFirstChild("shop_mutators") as ScreenGui) ?? (playerGui.WaitForChild("shop_mutators") as ScreenGui);

                    switch (value) {
                        case "Sidebar Shop":
                            (sidebar.FindFirstChild("open") as BoolValue).Value = true;
                            (bank.FindFirstChild("open") as BoolValue).Value = false;
                            (gearShop.FindFirstChild("open") as BoolValue).Value = false;
                            (mutatorShop.FindFirstChild("open") as BoolValue).Value = false;

                            return;

                        case "Bank":
                            (sidebar.FindFirstChild("open") as BoolValue).Value = false;
                            (bank.FindFirstChild("open") as BoolValue).Value = true;
                            (gearShop.FindFirstChild("open") as BoolValue).Value = false;
                            (mutatorShop.FindFirstChild("open") as BoolValue).Value = false;

                            return;

                        case "Gear Shop":
                            (sidebar.FindFirstChild("open") as BoolValue).Value = false;
                            (bank.FindFirstChild("open") as BoolValue).Value = false;
                            (gearShop.FindFirstChild("open") as BoolValue).Value = true;
                            (mutatorShop.FindFirstChild("open") as BoolValue).Value = false;

                            return;

                        case "Mutators":
                            (sidebar.FindFirstChild("open") as BoolValue).Value = false;
                            (bank.FindFirstChild("open") as BoolValue).Value = false;
                            (gearShop.FindFirstChild("open") as BoolValue).Value = false;
                            (mutatorShop.FindFirstChild("open") as BoolValue).Value = true;

                            return;
                    }
                }
            });
        }

        /* Farming Tab */ {
            tabs.farming.AddSection(emojis.globe + "Map.. and Stuff");

            tabs.farming.AddToggle("Auto Win", {
                Title: emojis.warn + "Auto Win",
                Description: "Auto complete the Tower after (x) minutes",
                Default: false,
                Callback: (value: boolean) => {
                    if (value) {
                        RunService.BindToRenderStep("autoWin", 1, () => {
                            let currentTime = os.clock();

                            if (currentTime - autoWinLastTime >= 2) {
                                autoWinLastTime = currentTime;

                                if (!hasWon() && (getTime(true) as number) <= (savedFarmOnTime as number)) {
                                    win(savedWinMethod);
                                }
                            }
                        });
                    } else {
                        RunService.UnbindFromRenderStep("autoWin");
                        autoWinLastTime = 0;
                    }
                }
            });

            tabs.farming.AddButton({
                Title: emojis.warn + "Complete Tower",
                Description: "Completes the Tower for you, regardless of stages",
                Callback: () => {
                    const [success, _] = pcall(() => {
                        if (!hasWon()) {
                            if ((getTime(true) as number) <= (savedFarmOnTime as number)) {
                                win(savedWinMethod);
                            } else {
                                notify(2, emojis.x + "Too Soon", "You can only use the farm after the clocks hits 6 minutes or less");
                            }
                        } else {
                            notify(2, emojis.x + "Already Won", "You've already beaten the Tower, wait until the next round to use this");
                        }
                    });

                    if (!success) {
                        notify(2, emojis.x + "Couldn't Complete", "Please wait until the Tower loads before using this", "Try again after loading");
                    }
                }
            });

            // Player mods

            tabs.farming.AddSection(emojis.run + "Player Mods");

            walkSpeedSlider = tabs.farming.AddSlider("WalkSpeed", {
                Title: "Change WalkSpeed",
                Min: 16,
                Max: 150,
                Default: 16,
                Rounding: 1,
                Callback: (value: number) => {
                    const globalSpeed = ReplicatedStorage.FindFirstChild("globalSpeed") as NumberValue;

                    if (globalSpeed) {
                        globalSpeed.Value = value;
                    }
                }
            }) as Slider;

            jumpPowerSlider = tabs.farming.AddSlider("JumpPower", {
                Title: "Change JumpPower",
                Min: 50,
                Max: 250,
                Default: 50,
                Rounding: 1,
                Callback: (value: number) => {
                    const humanoid = getCharacter().FindFirstChildOfClass("Humanoid");

                    if (humanoid) {
                        humanoid.JumpPower = value;
                    }
                }
            }) as Slider;
        }

        /* MiniGames Tab */ {
            // Minigames

            tabs.minigames.AddSection(emojis.joystick + "Mini Games");

            autoPlayer = tabs.minigames.AddToggle("Auto Player", {
                Title: emojis.info + "Auto Play Stacker",
                Default: false,
                Callback: (value: boolean) => {
                    stackerAutoPlay = value;

                    coroutine.wrap(function () {
                        while (stackerAutoPlay) {
                            if (getgenv().starryBreakLoops) {
                                break;
                            }

                            const tower: Model = (Workspace.FindFirstChild("tower") as Model) ?? (Workspace.WaitForChild("tower") as Model);
                            const sections: Model = (tower && tower.FindFirstChild("sections") as Model) ?? (tower && tower.WaitForChild("sections") as Model);
                            const lobby: Model = (sections && sections.FindFirstChild("lobby") as Model) ?? (sections && sections.WaitForChild("lobby") as Model);
                            const chill: Model = (lobby && lobby.FindFirstChild("Chill") as Model) ?? (lobby && lobby.WaitForChild("Chill") as Model);

                            const stacker: Instance = (chill && chill.FindFirstChild("Stacker") as Instance);

                            if (stacker) {
                                const _stacker: Instance = (stacker && stacker.FindFirstChild("Stacker") as Instance) ?? (stacker && stacker.WaitForChild("Stacker") as Instance);
                                const button: Instance = (_stacker && _stacker.FindFirstChild("Button") as Instance) ?? (_stacker && _stacker.WaitForChild("Button") as Instance);
                                const clicker: ClickDetector = (button && button.FindFirstChild("ClickDetector") as ClickDetector) ?? (button && button.WaitForChild("ClickDetector") as ClickDetector);
                                const segments: Model = (_stacker && _stacker.FindFirstChild("Segments") as Model) ?? (_stacker && _stacker.WaitForChild("Segments") as Model);

                                const targetX: number = 0.0819159357;
                                const tolerance: number = 0.05;

                                let latest: Part | Instance | undefined;
                                let __index: number = 0;

                                for (const object of segments.GetChildren()) {
                                    const index = tonumber(object.Name);

                                    if (index && index > __index) {
                                        __index = index;
                                        latest = object;
                                    }
                                }

                                if (latest) {
                                    const position: Vector3 = (latest as Part).Position;

                                    if (math.abs(position.X - targetX) <= tolerance) {
                                        fireclickdetector(clicker);
                                    }
                                }
                            } else {
                                if (value) {
                                    notify(2, emojis.x + "Wrong Mini-Game", "Please wait until the Stacker Mini-Game is available");
                                }

                                task.wait(0.2);
                                autoPlayer.SetValue(false);

                                return;
                            }

                            task.wait();
                        }
                    })();
                }
            }) as Toggle;

            tabs.minigames.AddDropdown("Custom ScreenSaver", {
                Title: emojis.info + "ScreenSaver Custom Logo",
                Values: ["Skittle Chan", "Gun", "Boy Kisser Furry", "YXCeptional (OG)"],
                Multi: false,
                Default: "Choose One",
                Callback: (value: string | number) => {
                    const selection = value as string;

                    const tower: Model = (Workspace.FindFirstChild("tower") as Model) ?? (Workspace.WaitForChild("tower") as Model);
                    const sections: Model = (tower && tower.FindFirstChild("sections") as Model) ?? (tower && tower.WaitForChild("sections") as Model);
                    const lobby: Model = (sections && sections.FindFirstChild("lobby") as Model) ?? (sections && sections.WaitForChild("lobby") as Model);
                    const chill: Model = (lobby && lobby.FindFirstChild("Chill") as Model) ?? (lobby && lobby.WaitForChild("Chill") as Model);
                    const TV: Model = (chill && chill.FindFirstChild("TV") as Model);

                    if (TV) {
                        const model: Model = (TV && TV.FindFirstChild("TV") as Model) ?? (TV && TV.WaitForChild("TV") as Model);
                        const _Model: Model = (model && model.FindFirstChild("Model") as Model) ?? (model && model.WaitForChild("Model") as Model);
                        const screen: Instance = (_Model && _Model.FindFirstChild("screen") as Instance) ?? (_Model && _Model.WaitForChild("screen") as Instance);
                        const surface: SurfaceGui = (screen && screen.FindFirstChild("SurfaceGui") as SurfaceGui) ?? (screen && screen.WaitForChild("SurfaceGui") as SurfaceGui);
                        const frame: Frame = (surface && surface.FindFirstChild("Frame") as Frame) ?? (surface && surface.WaitForChild("Frame") as Frame);
                        const Y: ImageLabel = (frame && frame.FindFirstChild("Y") as ImageLabel) ?? (frame && frame.WaitForChild("Y") as ImageLabel);
                        const X: ImageLabel = (frame && frame.FindFirstChild("X") as ImageLabel) ?? (frame && frame.WaitForChild("X") as ImageLabel);

                        switch (selection) {
                            case "Skittle Chan":
                                Y.ImageTransparency = 1;
                                X.Image = "http://www.roblox.com/asset/?id=14682431322";

                                return;

                            case "Gun":
                                Y.ImageTransparency = 1;
                                X.Image = "http://www.roblox.com/asset/?id=5381454270";

                                return;

                            case "Boy Kisser Furry":
                                Y.ImageTransparency = 1;
                                X.Image = "http://www.roblox.com/asset/?id=12270392403";

                                return;

                            case "YXCeptional (OG)":
                                Y.ImageTransparency = 0;
                                X.Image = "http://www.roblox.com/asset/?id=11719867225";

                                return;
                        }

                        notify(2, emojis.check + "Icon Changed", "Changed the TV logo, did you notice it change?")
                    } else {
                        notify(2, emojis.x + "Wrong Mini-Game", "Please wait until the ScreenSaver Mini-Game is available");
                    }
                }
            });

            tabs.minigames.AddInput("Fling Player", {
                Title: "Fling Player",
                Description: "<b>Requires</b> the Doom Ball game",
                Numeric: false,
                Finished: true,
                Callback: (value: string | number) => {
                    const player = findPlayer(value as string);

                    if (player) {
                        if (player !== localPlayer) {
                            const tower: Model = (Workspace.FindFirstChild("tower") as Model) ?? (Workspace.WaitForChild("tower") as Model);
                            const sections: Model = (tower && tower.FindFirstChild("sections") as Model) ?? (tower && tower.WaitForChild("sections") as Model);
                            const lobby: Model = (sections && sections.FindFirstChild("lobby") as Model) ?? (sections && sections.WaitForChild("lobby") as Model);
                            const chill: Model = (lobby && lobby.FindFirstChild("Chill") as Model) ?? (lobby && lobby.WaitForChild("Chill") as Model);
                            const balls: Model = (chill && chill.FindFirstChild("Balls") as Model);

                            if (balls) {
                                let ball: Part = (balls.FindFirstChild("BallBlue") as Part) ?? (balls.FindFirstChild("BallOrange"));

                                function claimBall() {
                                    const originalPosition = getRootPart().CFrame;

                                    do {
                                        getRootPart().CFrame = ball.CFrame.mul(new CFrame(0, 2.9, 0));

                                        task.wait(0.05);
                                    } while (isnetworkowner(ball));

                                    task.wait(0.2);

                                    getRootPart().CFrame = originalPosition;
                                }

                                function teleportBall() {
                                    if (player) {
                                        const playerCharacter = player.Character ?? player.CharacterAdded.Wait()[0];
                                        const playerRootPart: BasePart = (playerCharacter.FindFirstChild("HumanoidRootPart") as BasePart) ?? (playerCharacter.WaitForChild("HumanoidRootPart") as BasePart);

                                        const originalPosition = ball.Position;
                                        const originalOrientation = ball.Orientation;

                                        task.spawn(() => {
                                            const startTime = tick();

                                            ball.CanCollide = false;

                                            do {
                                                if (isnetworkowner(ball)) {
                                                    claimBall();
                                                }

                                                ball.AssemblyAngularVelocity = new Vector3(9e9, 9e9, 9e9);
                                                ball.CanCollide = true;
                                                ball.CFrame = playerRootPart.CFrame;

                                                task.wait();
                                            } while (tick() - startTime < 5);

                                            ball.AssemblyAngularVelocity = new Vector3(0, 0, 0);

                                            for (let index = 0; index <= 10; index++) {
                                                ball.CFrame = new CFrame(originalPosition)
                                                    .mul(CFrame.Angles(
                                                        math.rad(originalOrientation.X),
                                                        math.rad(originalOrientation.Y),
                                                        math.rad(originalOrientation.Z)
                                                    ));
                                            }
                                        });
                                    }
                                }

                                claimBall();
                                teleportBall();
                            } else {
                                notify(2, emojis.x + "Wrong Mini-Game", "Please wait until the Doom Ball Mini-Game is available");
                            }
                        } else {
                            notify(2, emojis.x + "Couldn't Fling", "Make sure you aren't flinging yourself");
                        }
                    } else {
                        notify(2, emojis.x + "Couldn't Fling", "Please make sure you're trying to fling a real player");
                    }
                }
            });
        }

        /* Settings Tab */ {
            if (savedTeleportMethod === "Instant") {
                savedTeleportMethod = emojis.warn + "Instant";
            }

            const tpMethod = tabs.settings.AddDropdown("Teleport Method", {
                Title: "Teleport Method",
                Values: [emojis.warn + "Instant"],
                Multi: false,
                Default: savedTeleportMethod,
                Callback: (value: string | number) => {
                    const selection = value as string;
                    const path = `${towerOfHellFolder}//${teleportMethod}`;

                    [savedTeleportMethod] = selection.gsub(emojis.warn, "");

                    delfile(path);
                    writefile(path, savedTeleportMethod);
                }
            });

            tpMethod.SetValue(savedTeleportMethod);

            if (savedWinMethod === "Instant") {
                savedWinMethod = emojis.warn + "Instant";
            }

            tabs.settings.AddDropdown("Farming Method", {
                Title: "Farming Method",
                Values: [emojis.warn + "Instant", "Stage Progression"],
                Multi: false,
                Default: savedWinMethod,
                Callback: (value: string | number) => {
                    const selection = value as string;
                    const path = `${towerOfHellFolder}//${winMethod}`;

                    [savedWinMethod] = selection.gsub(emojis.warn, "");

                    delfile(path);
                    writefile(path, savedWinMethod);

                    notify(2, emojis.check + "Changed Win Method", `Now using the <b>${savedWinMethod}</b> method to win games`);
                }
            });

            if (isProServer()) {
                maxTime = 9;
            } else {
                maxTime = 7;
            }

            tabs.settings.AddSlider("Max Time", {
                Title: "Teleport at Set Time",
                Default: savedFarmOnTime as number,
                Min: 1,
                Max: maxTime,
                Rounding: 0,
                Callback: (value: number) => {
                    savedFarmOnTime = tonumber(value);

                    const path = `${towerOfHellFolder}//${time}`;

                    delfile(path);
                    writefile(path, tostring(savedFarmOnTime));
                }
            });

            // Visuals

            tabs.settings.AddSection(emojis.eyes + "Effects & Visuals");

            tabs.settings.AddToggle("Disable Anti-Gravity", {
                Title: emojis.info + "Disable Anti Gravity",
                Default: false,
                Callback: (value: boolean) => {
                    for (const effect of getActiveEffects()) {
                        if (effect === "gravity") {
                            if (value) {
                                Workspace.Gravity = 196.2;

                                notify(2, emojis.check + "Gravity Disabled", "The gravity mutator has been disabled");
                            } else {
                                Workspace.Gravity = 147.14999999999998;
                            }
                        }
                    }
                }
            });

            tabs.settings.AddToggle("Disable Fog", {
                Title: emojis.info + "Disable Fog",
                Default: false,
                Callback: (value: boolean) => {
                    for (const effect of getActiveEffects()) {
                        if (effect === "fog") {
                            if (value) {
                                Lighting.FogEnd = 1200;
                                Lighting.FogColor = new Color3(0.5, 0.5, 0.5);

                                notify(2, emojis.check + "Fog Disabled", "The fog mutator has been disabled");
                            } else {
                                Lighting.FogEnd = 50;
                                Lighting.FogColor = new Color3(0.75, 0.75, 0.75);
                            }
                        }
                    }
                }
            });

            tabs.settings.AddToggle("Disable Speed", {
                Title: emojis.info + "Disable Speed",
                Default: false,
                Callback: (value: boolean) => {
                    const globalSpeed: NumberValue = ReplicatedStorage.FindFirstChild("globalSpeed") as NumberValue;
                    const originalSpeed: number = globalSpeed.Value;

                    for (const effect of getActiveEffects()) {
                        if (effect === "speed") {
                            if (value) {
                                globalSpeed.Value = originalSpeed;

                                notify(2, emojis.check + "Speed Disabled", "The speed mutator has been disabled");
                            } else {
                                globalSpeed.Value = globalSpeed.Value * 1.25;
                            }
                        }
                    }
                }
            });

            tabs.settings.AddToggle("Disable Bunnyhop", {
                Title: emojis.info + "Disable Bunnyhop",
                Default: false,
                Callback: (value: boolean) => {
                    const mutator: BoolValue = ReplicatedStorage.FindFirstChild("bunnyJumping") as BoolValue;

                    for (const effect of getActiveEffects()) {
                        if (effect === "bunnyhop") {
                            if (value) {
                                mutator.Value = false;

                                notify(2, emojis.check + "Bunnyhop Disabled", "The bunnyhop mutator has been disabled");
                            } else {
                                mutator.Value = true;
                            }
                        }
                    }
                }
            });
        }

        // Connections

        if (timeLabel && timer) {
            const onWinConnection = timer.GetPropertyChangedSignal("TextColor3").Connect(() => {
                if (timer.TextColor3 === new Color3(0, 1, 0)) {
                    if (promoteAfterWin) {
                        chat(emojis.stars + "I'm using Starry (The best Tower of Hell script available)");

                        task.wait(0.5);

                        chat("Find us on ScriptBlox & Rscripts");
                    }
                }
            });

            globalConnection.push(onWinConnection);
        }

        const addedConnection = localPlayer.CharacterAdded.Connect(() => {
            countStats();

            if (godmode) {
                const _script: LocalScript = getCharacter().WaitForChild("KillScript") as LocalScript;

                _script.Disabled = true;
            }
        });

        const removalConnection = localPlayer.CharacterRemoving.Connect(() => {
            currentlyFarming = false;
            alreadyFarmingPatch = false;

            jumpPowerSlider.SetValue(50);
            extraJumps.SetValue(0);
        });

        const newMapHandler = (child: Instance) => {
            if (child.IsA("Model") && child.Name === "tower") {
                presentableStages.clear();
                updateStages();

                presentableStages.push("Spawn")

                for (const stage of stages) {
                    presentableStages.push(`Stage ${stage.n}`);
                }

                presentableStages.push("Ending Zone");

                locations.SetValues(presentableStages);
                locations.BuildDropdownList();
                locations.Display();

                alreadyWon = false;
                currentlyFarming = false;
                alreadyFarmingPatch = false;

                walkSpeedSlider.SetValue(16);
                jumpPowerSlider.SetValue(50);
                extraJumps.SetValue(0);

                const tower: Model = (Workspace.FindFirstChild("tower") as Model) ?? (Workspace.WaitForChild("tower") as Model);
                const sections: Model = (tower && tower.FindFirstChild("sections") as Model) ?? (tower && tower.WaitForChild("sections") as Model);

                if (godmode) {
                    for (const object of sections.GetDescendants()) {
                        if (object.FindFirstChild("kills")) {
                            object.FindFirstChild("kills")?.Destroy();
                        }
                    }
                }
            }
        }

        const newMapConnection = Workspace.ChildAdded.Connect(newMapHandler);

        Workspace.GetChildren().forEach(newMapHandler);
        Workspace.FallenPartsDestroyHeight = -math.huge;

        globalConnection.push(addedConnection);
        globalConnection.push(removalConnection);
        globalConnection.push(newMapConnection);

        countStats();
    }

    {
        const idledConnection = localPlayer.Idled.Connect(() => {
            VirtualUser.CaptureController()
            VirtualUser.ClickButton2(new Vector2());
        });

        globalConnection.push(idledConnection);
    }

    betterMobile(window);

    window.SelectTab(1);

    {
        if (gameId === 5253186791) {
            localPlayer.Kick("\n\n* You're Suspended *\n\nYou've been banned from Tower of Hell,\ntherefore cannot use Starry.\n");
        } else if (isProServer()) {
            notify(2, emojis.check + "Updated Settings", "Updated all settings to be fit for Pro Servers");
        }
    }
}
