// put all constants here
import Web3Utils from 'web3-utils'

export const CONSTANTS = {
    methods: {
        getData: {
            sig: '0x54f6127f',
            gas: Web3Utils.numberToHex(2000000),
            gasPrice: Web3Utils.numberToHex(100000000),
            value: Web3Utils.numberToHex(0),
            returnEncoding: 'bytes'
        },
        dataCount: {
            sig: '0x5da40c47',
            gas: Web3Utils.numberToHex(2000000),
            gasPrice: Web3Utils.numberToHex(100000000),
            value: Web3Utils.numberToHex(0),
            returnEncoding: 'uint256'
        },
        allData: {
            sig: '0xc559acef',
            gas: Web3Utils.numberToHex(2000000),
            gasPrice: Web3Utils.numberToHex(100000000),
            value: Web3Utils.numberToHex(0),
            returnEncoding: 'bytes32[]'
        },
        owner: {
            sig: '0x8da5cb5b',
            gas: Web3Utils.numberToHex(2000000),
            gasPrice: Web3Utils.numberToHex(100000000),
            value: Web3Utils.numberToHex(0),
            returnEncoding: 'address'
        }

    },
    hashFunctions: [
        {
            name: 'keccak256(utf8)',
            sig: '0x6f357c6a',
            method: Web3Utils.keccak256
        },
        {
            name: 'keccak256(bytes)',
            sig: '0x8019f9b1',
            method: Web3Utils.keccak256
        }
    ]

}
