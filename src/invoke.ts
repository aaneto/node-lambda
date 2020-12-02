import { version } from "../package.json";
import { Command } from "commander";
import { invokeFunction } from "./lib";

const program = new Command("invoke");
program.version(version);
program
    .requiredOption("-f, --function-name <string>", "name of the function to invoke")
    .option("-p, --payload <string>", 'payload of the function in string format: \'{"someData": 10}\' ');

export default async function() {
    program.parse(process.argv);

    const res = await invokeFunction({
        name: program.functionName,
        payload: program.payload || ""
    });

    console.log(res);
}
