#!/usr/bin/env node

import fs from "fs"
import yaml from "js-yaml"
import dotenv from "dotenv"
dotenv.config({debug: true})
import { resolveObject, runTestSuite, generateReport, writeReportFile } from "@repo/core"
import {TestCase} from "@repo/core/src/schema/schema"

const args = process.argv.slice(2)

const concurrencyIndex = args.indexOf("--concurrency")
let concurrency = 5 // default 
if (concurrencyIndex !== -1){
    const value = args[concurrencyIndex+1]
    concurrency = Number(value)
}
if (isNaN(concurrency) || concurrency <= 0){
    throw new Error("Concurrency should be a number > 0")
}

const reportIndex = args.indexOf("--report")
let reportPath: string | undefined
if (reportIndex !== -1){
    reportPath = args[reportIndex + 1]
    if (!reportPath){
        console.error("--report requires a file path")
        process.exit(1)
    }
}

async function runTests(file: string) {
    try {
        const fileContent = fs.readFileSync(file, "utf-8")

        const raw: any = yaml.load(fileContent)
        const parsed: any = resolveObject(raw)

        const baseUrl: string = parsed.baseUrl
        const tests: TestCase[] = parsed.tests

        if (!tests || !Array.isArray(tests)){
            console.log("Invalid YAML format: `tests` array is misssing")
            process.exit(1)
        }

        const startTime = Date.now()
        const results = await runTestSuite(baseUrl, tests, concurrency)

        if (reportPath) {
            const duration = Date.now() - startTime
            const report = generateReport(results, duration)
            writeReportFile(report, reportPath)
        }

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