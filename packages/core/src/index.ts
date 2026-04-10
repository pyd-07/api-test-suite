export async function runTestSuite(tests : any[]) {
    let passCount = 0, failCount = 0
    let failedTests = []

    for (const test of tests) {
        console.log(`\nRunning: ${test.name}`);

        try {
        const res = await fetch(test.url, {
            method: test.method || "GET"
        });

        const expected = test.expectedStatus;
        const actual = res.status;

        if (actual === expected) {
            console.log(`PASS| ${test.name} (${actual})`);
            passCount++;
        } else {
            console.log(`FAIL| ${test.name} (expected ${expected}, got ${actual})`);
            failCount++;
            failedTests.push(test.name);
        }

        } catch (err) {
        console.log(`ERROR ${test.name} (${err})`);
        failCount++;
        failedTests.push(test.name);
        }
    }
    console.log("\n--- Test Summary ---");
    console.log(`Total: ${passCount + failCount}`);
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failCount}`);

    if (failedTests.length > 0) {
        console.log("\nFailed Tests:");
        for (const name of failedTests) {
            console.log(`- ${name}`);
        }
    }
}