import chalk from "chalk";

export const logger = {
    pass: (name:string, time:number|undefined) => {
        const timeStr = time !== undefined ? chalk.dim(` (${time}ms)`) : ""
        console.log(`  ${chalk.green("✔")} ${chalk.bold("PASS")}   ${name}${timeStr}`)
    },
    fail: (name:string, reason?:string) => {
        const reasonStr = reason ? chalk.dim(` → ${chalk.red(reason)}`) : ""
        console.log(`  ${chalk.red("✖")} ${chalk.bold("FAIL")}   ${name}${reasonStr}`)
    },
    retry: (name:string, attempt:number, maxRetries:number) => {
        console.log(`  ${chalk.yellow("⟳")} ${chalk.bold("RETRY")}  ${name} ${chalk.dim(`(attempt ${attempt}/${maxRetries})`)}`)
    },
    info: (msg:string) => {
        console.log(`  ${chalk.blue("ℹ")} ${msg}`)
    },
    warn: (msg:string) => {
        console.log(`  ${chalk.yellow("⚠")} ${chalk.bold("WARN")}   ${msg}`)
    },
    error: (msg:string) => {
        console.log(`  ${chalk.red("✖")} ${chalk.bold("ERROR")}  ${msg}`)
    },
    divider: () => {
        console.log(chalk.dim("  " + "─".repeat(60)))
    }
}