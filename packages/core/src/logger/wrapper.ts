import consola from "consola";
import chalk from "chalk";

export const logger = {
    pass: (name:string, time:number|undefined) => {
        const tag = chalk.bgGreen.black.bold(" PASS ")
        const timeStr = time !== undefined ? chalk.dim(` ${time}ms`) : ""
        consola.log(`  ${tag}  ${name}${timeStr}`)
    },
    fail: (name:string, reason?:string) => {
        const tag = chalk.bgRed.white.bold(" FAIL ")
        const reasonStr = reason ? chalk.dim(` → ${chalk.redBright(reason)}`) : ""
        consola.log(`  ${tag}  ${name}${reasonStr}`)
    },
    info: (msg:string) => {
        consola.info(msg)
    },
    start: (msg:string) => {
        consola.start(msg)
    },
    warn: (msg:string) => {
        consola.warn(msg)
    },
    error: (msg:string) => {
        consola.error(msg)
    },
    divider: () => {
        console.log(chalk.dim("  " + "─".repeat(60)))
    }
}