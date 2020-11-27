// This file contains the mock providers used for tests

export class HttpProvider {

    constructor(props) {

        // clone array
        this.returnData = Array.isArray(props.returnData) ? [...props.returnData] : props.returnData

    }

    send(payload, cb) {


        if (Array.isArray(payload)) {

            const results = []
            for (let index = 0; index < payload.length; index++) {

                const foundResult = this.returnData.find(element => {

                    // get call param (key)
                    const keyParam = '0x' + payload[index].params[0].data.substr(10)
                    return element.key === keyParam

                })

                results.push({
                    jsonrpc: '2.0',
                    id: payload[index].id,
                    result: foundResult ? foundResult.value : '0x'
                })

            }

            setTimeout(() => cb(null, results), 10)

        } else {

            // get call param (key)
            const keyParam = '0x' + payload.params[0].data.substr(10)

            setTimeout(() => cb(null, {
                jsonrpc: '2.0',
                result: (Array.isArray(this.returnData))
                    ? this.returnData.find(e => e.key === keyParam).value
                    : this.returnData
            }), 10)

        }

    }

}

export class EthereumProvider {

    constructor(props) {

        // Deconstruct to create local copy of array
        this.returnData = Array.isArray(props.returnData) ? [...props.returnData] : props.returnData

    }

    request(payload) {

        const keyParam = '0x' + payload.params[0].data.substr(10) // remove methodSig
        return new Promise(resolve => {

            setTimeout(() => {

                const result = (Array.isArray(this.returnData))
                    ? this.returnData.find(e => e.key === keyParam).value
                    : this.returnData
                // TODO: Handle reject
                resolve(result)

            }, 50)

        })

    }

}

export class ApolloClient {

    constructor(props) {

        this.returnData = Array.isArray(props.returnData) ? [...props.returnData] : props.returnData
        this.getAll = (props.getAll) // flag to change return data format

    }

    query(props) {

        let keyParam; let
            val
        if (!this.getAll && Array.isArray(this.returnData)) {

            keyParam = props.query.definitions[0].selectionSet.selections[0].arguments[0].value.fields[1].value.value // this gives the field key in query
            val = this.returnData.find(e => e.key === keyParam).value

        } else if (!this.getAll && !Array.isArray(this.returnData)) {

            val = this.returnData.value

        }

        // TODO: Remove old way, for reference
        // const val = (Array.isArray(this.returnData) && !this.getAll) ? this.returnData.shift() : this.returnData
        return new Promise(resolve => {

            setTimeout(() => {

                // this.getAll flag is used to return different expected query results
                const res = this.getAll
                    ? { data: { mockResults: this.returnData } }
                    : { data: { mockResults: [{ key: keyParam, value: val }] } }
                resolve(res)

            }, 50)

        })

    }

}
