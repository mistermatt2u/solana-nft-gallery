## MisterMatt2U's NFT Gallery
This dApp serves as a basic NFT gallery. It will display all NFTs associated with a given Solana wallet. The dApp provides the following features:
- Display NFTs associated with a Solana wallet
- Apply a category to an NFT
- Mark NFTs as a favorite

The application is currently deployed to Devnet with ProgamID: G1rrUNBqdcsVkMZApvvUW3siDd2fsa3XwmHhLMViytad
<br/>Here is the link to explore the Program's on-chain activity: <br/>https://solscan.io/account/G1rrUNBqdcsVkMZApvvUW3siDd2fsa3XwmHhLMViytad?cluster=devnet

<br/>

### *Build and Test Instructions*
To build and test the backend Anchor application:
- Ensure Rust and Anchor CLI commands are installed
- Clone the repo to a local folder
- cd into the repo
- Run command 'anchor build' to build the program.
- Run command 'anchor test' to run the test suite.
 - The program will run in a local test validator environment.

Notes:
- A random wallet (public key) will be created and airdropped some SOL during each iteration of the test. 
- The test suite will generate sample "NFTs", which are simply random public keys, not actual NFTs. The public keys represent a valid NFT.

<br/>

### *Deploy the application to Devnet*
To deploy the application to Devnet:
- Ensure Solana CLI commands are installed
- Update the Anchor.toml file in the anchor_project folder so that the "Cluster" value is "Devnet", like below:

<code>
[provider]
cluster = "Devnet"
wallet = ".config/solana/id.json"
</code><br/>

- Ensure that your wallet has SOL available on Devnet. If not, run this command:
 - Command: <code>solana airdrop --url devnet 2 your_wallet_public_key</code>
- Run command 'anchor deploy'
    
<br/>

### *How to Run the Frontend locally*
To build and run the frontend as a local application, follow the steps below. The frontend will run against the Devnet deployed version of the application, so make sure the application is actually deployed to Devnet prior to running the frontend.
- Ensure that NodeJS (node + npm package manager) are installed.
- Copy the anchor_project/nft-gallery/target/idl/nft_gallery.json file into the frontend/nft-gallery/src/components folder.
- Similarly copy the anchor_project/nft-gallery/target/types/nft_gallery.ts file into the frontend/nft-gallery/src/components folder.
- If you do not already have NFTs in your wallet on Devnet, you can mint some test ones. Follow the "How to Create an NFT collection on Devnet" section below. Generating the test NFT collection and moving the NFTs to your wallet is mostly out of scope for this project currently, but the guidance below will assist you with getting it started.
- Start the frontend test server by running command 'npm run dev'
- Access the frontend server at http://localhost:3000 (or whichever address is provided)

<br/>

### *How to use the application*
The Solana Scaffold (web UI) template has a default page. It contains a button to allow you to airdrop SOL into your wallet. Ensure you are connected to devnet (dev) by using the menu at the top left of the page. Connect your  wallet. In order to access the NFT Gallery program, choose the "Basics" tab at the top. Click the "Generate Gallery button, which will search your connected wallet for NFTs. If your NFTs have not yet been read by the program, they will be read, the program accounts will be initialized on chain, and then the GUI will update. Your NFTs will be displayed, along with default category and favorite information. Click the buttons to update your NFTs' categories and favorite setting as desired.

<br/>

### *How to Create an NFT collection on Devnet*
In order to test the application on Devnet, you need some NFTs in your wallet on Devnet. In order to get the NFTs in your wallet, you need to create a collection of NFTs, and then mint some into your wallet. Follow the guidance below to create your collection of NFTs:
- Reference: https://developers.metaplex.com/candy-machine/guides/create-an-nft-collection-on-solana-with-candy-machine
 - Install Sugar: <code>bash <(curl -sSf https://sugar.metaplex.com/install.sh)</code>
 - Download some sample NFT images and metadata that will generate your collection.
  - https://github.com/metaplex-foundation/example-candy-machine-assets
- Run command 'sugar launch' to generate the collection configuration
- Run command 'sugar deploy -r https://api.devnet.solana.com' to deploy the collection to Devnet
- Run command 'sugar show' to determine the candy machine ID
- Once your NFT collection is available on Devnet, mint some to your wallet with this command:
 - <code>sugar mint --number 2 --rpc-url https://api.devnet.solana.com --candy-machine your_candy_machine_id</code>
