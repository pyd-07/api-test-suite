export function deepMatch(Actual: any, Expect: any): boolean {
    
    if( typeof Expect !== "object" || Expect == null ) {
        return Actual === Expect
    }

    if (typeof Actual !== "object" || Actual == null){
        return false
    }

    for (const key of Object.keys(Expect)){
        if ( !(key in Actual) ){
            return false
        }
        if (!deepMatch(Actual[key], Expect[key])){
            return false
        }
    }
    return true
}