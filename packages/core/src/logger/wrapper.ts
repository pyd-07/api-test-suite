import consola from "consola";
import chalk from "chalk";

export const logger = {
    pass: (name:string, time:number|undefined) => {
        consola.success(`${chalk.green("[PASS]")} ${name} | ${time}ms`)
    },
    fail: (name:string, reason?:string) => {
        consola.error(`${chalk.red("[FAIL]")} ${name} ${reason?`(${chalk.redBright(reason)})`:""}`)
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
    }
}