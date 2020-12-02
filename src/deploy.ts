import { version, description } from "../package.json";
import { Command } from "commander";
import { deployFunction } from "./lib";

const program = new Command("deploy");
program.version(version);
program
    .requiredOption("-f, --function-name <string>", "name of the function to deploy")
    .requiredOption("-b, --build-folder <string>", "folder where the built files are")
    .requiredOption("-r, --role <string>", "role of the function to deploy");

export default async function() {
    program.parse(process.argv);
    const res = await deployFunction({
        name: program.functionName,
        role: program.role,
        codePath: program.buildFolder,
        description,
    });
    console.log(res);
}
