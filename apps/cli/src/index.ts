#!/usr/bin/env node

import fs from "fs"
import yaml from "js-yaml"
import {runTestSuite} from "@repo/core"
import {TestCase} from "@repo/core/src/schema/schema"

const args = process.argv.slice(2)

async function runTests(file: string) {
    try {
        const fileContent = fs.readFileSync(file, "utf-8")
        const parsed: any = yaml.load(fileContent)

        const baseUrl: string = parsed.baseUrl
        const tests: TestCase[] = parsed.tests

        if (!tests || !Array.isArray(tests)){
            console.log("Invalid YAML format: `tests` array is misssing")
            process.exit(1)
        }

        runTestSuite(baseUrl, tests)

    } catch (error) {
        console.error(`Error Reading ${file}: ${error}`)
        process.exit(1)
    }

}

async function main() {
    const command = args[0]
    if (!command){
        console.log("No command provided")
        process.exit(1)
    }
    if (command === "run"){
        const file = args[1]
        if (!file || !file.endsWith(".yml")){
            console.log("Please provide a .yml file")
            process.exit(1)
        }
        await runTests(file)
        return
    }
    console.log("Invalid comand")
    process.exit(1)
}

main()