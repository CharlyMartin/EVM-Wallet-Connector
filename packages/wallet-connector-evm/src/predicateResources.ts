export const predicates = {
  'verification-predicate': {
    abi: {
  "types": [
    {
      "typeId": 0,
      "type": "b256",
      "components": null,
      "typeParameters": null
    },
    {
      "typeId": 1,
      "type": "bool",
      "components": null,
      "typeParameters": null
    },
    {
      "typeId": 2,
      "type": "struct EvmAddress",
      "components": [
        {
          "name": "value",
          "type": 0,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 3,
      "type": "u64",
      "components": null,
      "typeParameters": null
    }
  ],
  "functions": [
    {
      "inputs": [
        {
          "name": "witness_index",
          "type": 3,
          "typeArguments": null
        }
      ],
      "name": "main",
      "output": {
        "name": "",
        "type": 1,
        "typeArguments": null
      },
      "attributes": null
    }
  ],
  "loggedTypes": [],
  "messagesTypes": [],
  "configurables": [
    {
      "name": "SIGNER",
      "configurableType": {
        "name": "",
        "type": 2,
        "typeArguments": []
      },
      "offset": 1936
    }
  ]
},
    bytecode: base64ToUint8Array('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'),
  },
};
function base64ToUint8Array(base64: string) {
  var binaryString = atob(base64);
  var bytes = new Uint8Array(binaryString.length);
  for (var i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}