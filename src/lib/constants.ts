import { numberToHex, keccak256 } from 'web3-utils'
import { MethodData, Encoding, Method } from '../types/method'

interface Constants {
    methods: Record<Method, MethodData>;
    hashFunctions: {
        name: string;
        sig: string;
        method: (value: any) => string;
    }[];
}

export const CONSTANTS: Constants = {
    methods: {
        [Method.GET_DATA]: {
            sig: '0x54f6127f',
            gas: numberToHex(2000000),
            gasPrice: numberToHex(100000000),
            value: numberToHex(0),
            returnEncoding: Encoding.BYTES
        },
        [Method.DATA_COUNT]: {
            sig: '0x5da40c47',
            gas: numberToHex(2000000),
            gasPrice: numberToHex(100000000),
            value: numberToHex(0),
            returnEncoding: Encoding.UINT256
        },
        [Method.ALL_DATA]: {
            sig: '0xc559acef',
            gas: numberToHex(2000000),
            gasPrice: numberToHex(100000000),
            value: numberToHex(0),
            returnEncoding: Encoding.BYTES32_ARRAY
        },
        [Method.OWNER]: {
            sig: '0x8da5cb5b',
            gas: numberToHex(2000000),
            gasPrice: numberToHex(100000000),
            value: numberToHex(0),
            returnEncoding: Encoding.ADDRESS
        }
    },
    hashFunctions: [
        {
            name: 'keccak256(utf8)',
            sig: '0x6f357c6a',
            method: keccak256
        },
        {
            name: 'keccak256(bytes)',
            sig: '0x8019f9b1',
            method: keccak256
        }
    ]
}
