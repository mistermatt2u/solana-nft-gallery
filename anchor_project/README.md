## MisterMatt2U's NFT Gallery
This dApp serves as a basic NFT gallery. It will display all NFTs associated with a given Solana wallet. The dApp provides the following features:
- Display NFTs associated with a Solana wallet
- Apply a category to an NFT
- Mark NFTs as a favorite

### *Implemented Functions*
- initialize: Creates a new PDA for an NFT in a given Solana wallet. Initalizes category and favorite variables.
- updateCategory: Updates the category of an NFT on-chain. 10 characters max, alpha characters only.
- toggleFavorite: Toggles the "favorite" designation of an NFT on-chain. The function will "flip" the existing bool value.
- close: Closes the PDA account on chain. This will remove the PDA and recover Solana rent.

### *Test Suite*
The test suite runs two tests against each function. One test is for the positive case, one for the negative. The test suite is simplistic, and should not be considered exhaustive for purposes of preventing purposeful crashing of the program, or finding a security vulternability. 