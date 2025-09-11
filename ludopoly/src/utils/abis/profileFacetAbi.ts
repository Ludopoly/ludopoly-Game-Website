export const ProfileFacetABI = [
  {
    "inputs": [],
    "name": "AccountDoesNotExist",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidBio",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidDisplayName",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidNationality",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "profileId",
        "type": "uint256"
      }
    ],
    "name": "MaxLocationHistoryReached",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "profileId",
        "type": "uint256"
      }
    ],
    "name": "ProfileAlreadyExists",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "profileId",
        "type": "uint256"
      }
    ],
    "name": "ProfileNotFound",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UnauthorizedAccess",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "profileId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "newLocation",
        "type": "bytes32"
      }
    ],
    "name": "LocationUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "profileId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "displayName",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "location",
        "type": "bytes32"
      }
    ],
    "name": "ProfileCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "profileId",
        "type": "uint256"
      }
    ],
    "name": "ProfileDeleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "profileId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "name": "ProfileStatusChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "profileId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "displayName",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "location",
        "type": "bytes32"
      }
    ],
    "name": "ProfileUpdated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "displayName",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "bio",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "avatarCID",
        "type": "string"
      },
      {
        "internalType": "bytes32",
        "name": "nationality",
        "type": "bytes32"
      }
    ],
    "name": "createProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "deleteProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "profileId",
        "type": "uint256"
      }
    ],
    "name": "getCurrentLocation",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "profileId",
        "type": "uint256"
      }
    ],
    "name": "getProfile",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "profileId",
            "type": "uint256"
          },
          {
            "internalType": "bytes32",
            "name": "displayName",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "bio",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "avatarCID",
            "type": "string"
          },
          {
            "internalType": "bytes32",
            "name": "nationality",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "location",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32[]",
            "name": "locationHistory",
            "type": "bytes32[]"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "updatedAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct LibProfile.Profile",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "profileId",
        "type": "uint256"
      }
    ],
    "name": "getProfileLocationHistory",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "location",
        "type": "bytes32"
      }
    ],
    "name": "getProfilesByLocation",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "profileId",
        "type": "uint256"
      }
    ],
    "name": "isProfileActive",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "avatarCID",
        "type": "string"
      }
    ],
    "name": "setProfileAvatarCID",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "bio",
        "type": "string"
      }
    ],
    "name": "setProfileBio",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "displayName",
        "type": "bytes32"
      }
    ],
    "name": "setProfileDisplayName",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "location",
        "type": "bytes32"
      }
    ],
    "name": "setProfileLocation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "nationality",
        "type": "bytes32"
      }
    ],
    "name": "setProfileNationality",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "name": "setProfileStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "displayName",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "bio",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "avatarCID",
        "type": "string"
      },
      {
        "internalType": "bytes32",
        "name": "nationality",
        "type": "bytes32"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "name": "updateProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
