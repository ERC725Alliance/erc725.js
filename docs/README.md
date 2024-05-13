# erc725.js docs

The markdown files in this folder are published on the LUKSO docs portal: <https://docs.lukso.tech/tools/erc725js/getting-started>

## Template for docs methods

## Method name

```js
code snippet of the function
```

Some description of how to use the function

:::tip
Add some tips, extra infos or warnings here
:::

#### Parameters

| Name   | Type   | Description                                                                   |
| :----- | :----- | :---------------------------------------------------------------------------- |
| `type` | string | The value type to decode the data (i.e. `uint256`, `bool`, `bytes4`, etc...). |
| `data` | string | A hex encoded string starting with `0x` to decode                             |

#### Returns

| Name           | Type                   | Description                          |
| :------------- | :--------------------- | :----------------------------------- |
| `decodedValue` | string or <br/> number | A value decoded according to `type`. |

### Example

```javascript title="Example of the method"
myErc725.myMethod();
/*
Document an example of the output here
*/
```
