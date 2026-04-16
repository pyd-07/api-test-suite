import { logger } from "./wrapper";
import { ValidatedTest } from "../schema/schema";

export function log(obj:ValidatedTest){
    if(obj.stat==="pass"){
        logger.pass(obj.name, obj.responseTime)
    } else {
        logger.fail(obj.name, obj.failReason)
    }
}