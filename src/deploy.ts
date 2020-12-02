import { version, description } from "../package.json";
import { Command } from "commander";
import { deployFunction } from "./lib";

const program = new Command("deploy");
program.version(version);
program
    .requiredOption("-f, --function-name <string>", "name of the function to deploy")
    .requiredOption("-b, --build-folder <string>", "folder where the built files are")
    .option("-r, --role <string>", "role of the function to deploy");

export default async function() {
    program.parse(process.argv);

    const role = program.role || process.env.AWS_ROLE;
    if (!role) {
        throw "The lambda role must be provided! Either by CLI argument or by environment variable."
    }

    const res = await deployFunction({
        codePath: program.buildFolder,
        name: program.functionName,
        description,
        role
    });
    console.log(res);
}
