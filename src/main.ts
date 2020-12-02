import deploy from "./deploy";
import invoke from "./invoke";

async function main() {
    const commandName = process.argv[2];

    if (commandName === "deploy") {
        await deploy();
    } else if (commandName === "invoke") {
        await invoke();
    }
    else {
        console.log("Action is not one of: [deploy | invoke]");
    }
}

main().then(() => {}).catch(console.error);
