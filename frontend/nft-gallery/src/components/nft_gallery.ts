/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/nft_gallery.json`.
 */
export type NftGallery = {
  "address": "G1rrUNBqdcsVkMZApvvUW3siDd2fsa3XwmHhLMViytad",
  "metadata": {
    "name": "nftGallery",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "category",
      "discriminator": [
        159,
        54,
        240,
        50,
        165,
        55,
        101,
        66
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "nft",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "newCategory",
          "type": "string"
        }
      ]
    },
    {
      "name": "close",
      "discriminator": [
        98,
        165,
        201,
        177,
        108,
        65,
        206,
        96
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "nft",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "favorite",
      "discriminator": [
        194,
        64,
        126,
        126,
        225,
        73,
        7,
        251
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "nft",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "nft",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  102,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "arg",
                "path": "tokenId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "tokenId",
          "type": "pubkey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "nft",
      "discriminator": [
        97,
        230,
        6,
        21,
        131,
        208,
        111,
        115
      ]
    }
  ],
  "errors": [
    {
      "code": 6001,
      "name": "invalidUser",
      "msg": "Cannot initialize, invalid Solana address"
    },
    {
      "code": 6002,
      "name": "invalidTokenId",
      "msg": "Cannot initialize, invalid Token ID"
    },
    {
      "code": 6003,
      "name": "unauthorizedUser",
      "msg": "Unauthorized User"
    },
    {
      "code": 6004,
      "name": "updateCategoryInvalidLength",
      "msg": "Error updating category, invalid length"
    },
    {
      "code": 6005,
      "name": "updateFavoriteError",
      "msg": "Error updating favorite"
    },
    {
      "code": 6006,
      "name": "invalidPdaSeeds",
      "msg": "Invalid PDA Seeds"
    },
    {
      "code": 6007,
      "name": "unknownError",
      "msg": "Unknown Error!"
    }
  ],
  "types": [
    {
      "name": "nft",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "tokenId",
            "type": "pubkey"
          },
          {
            "name": "favorite",
            "type": "bool"
          },
          {
            "name": "category",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
