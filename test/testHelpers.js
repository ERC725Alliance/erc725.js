import { utils } from '../src/lib/utils.js'

export function generateAllRawData(schema) {

    // takes the schema object and builds a full dataset as per expected from provider
    const results = []
    for (let index = 0; index < schema.length; index++) {

        const element = schema[index]
        // if is array push data
        if (element.keyType === 'Array') {

            element.returnRawData.forEach((e, i) => {

                // we assume always first element in the array in returnData array is the length
                if (i === 0) {

                    results.push({
                        key: element.key,
                        value: e
                    })

                } else {

                    // This is array length key/value pair
                    results.push({
                        key: utils.encodeArrayKey(element.key, i - 1),
                        value: e
                    })

                }

            })

        } else {

            results.push({
                key: element.key,
                value: element.returnRawData
            })

        }

    }

    return results

}

export function generateAllData(schema) {

    // takes the schema object and builds a full dataset as per expected from provider
    const results = []
    for (let index = 0; index < schema.length; index++) {

        const element = schema[index]

        // if is a 'nested' array, need to flatten it, and add {key,value} elements
        if (element.keyType === 'Array') {

            element.returnGraphData.forEach((e, i) => {

                if (i === 0) {

                    // We need the new key, and to 'flatten the array as per expected from chain data
                    results.push({
                        key: element.key,
                        value: e
                    }) // we subtract one from length because this has the extra array length key in the array

                } else {

                    // This is array length key/value pair
                    results.push({
                        key: utils.encodeArrayKey(element.key, i - 1),
                        value: e
                    })

                }

            }) // end .forEach()

        } else {

            results.push({
                key: element.key,
                value: element.returnGraphData
            })

        }

    }

    return results

}

export function generateAllResults(schema) {

    // Take the test schema/cases and builds full expected results
    const results = {}
    schema.forEach(e => { results[e.name] = e.expectedResult })
    return results

}
