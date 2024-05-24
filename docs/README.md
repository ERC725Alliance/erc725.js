# erc725.js docs

The markdown files in this folder are published on the LUKSO docs portal: <https://docs.lukso.tech/tools/erc725js/getting-started>

## Method docs template

You can use the following example below as a template to document any new methods added the library.

### methodName

```js
myErc725.methodName(param1, param2, [optionalParams]);
```

```js
ERC725.methodName(param1, param2, [optionalParams]);
```

Describe your method and how it is intended to be used, the benefits it brings, and any specific behaviour that the functions has.

#### Parameters

| Name     | Type                                                                                                       | Description |
| :------- | :--------------------------------------------------------------------------------------------------------- | :---------- |
| `param1` | `string`                                                                                                   | ...         |
| `param2` | `string` or <br/> `string[]` or <br/> `number` or <br/> `number[]` or <br/> `boolean` or <br/> `boolean[]` | ...         |

#### Returns

| Name | Type     | Description |
| :--- | :------- | :---------- |
|      | `string` | ...         |

#### Examples

```javascript
import ERC725 from '@erc725/erc725.js';

const myErc725 = new ERC725();

myErc725.methodName('hello', 5);
// show in comment the expected output of the function
```

This method is also available as a static method.

```javascript
import ERC725 from '@erc725/erc725.js';

ERC725.methodName('hello', 5);
// show in comment the expected output of the function
```
