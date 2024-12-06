import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { NftGallery } from "../target/types/nft_gallery";
import { Keypair, SystemProgram } from "@solana/web3.js";
import * as crypto from "crypto";
import * as assert from "assert";

describe("nft-gallery", () => {
  // Configure the client to use the cluster set in the Anchor.toml file.
  anchor.setProvider(anchor.AnchorProvider.env());
  let connection = anchor.getProvider().connection;

  const program = anchor.workspace.NftGallery as Program<NftGallery>;
  
  const user = Keypair.generate();  // Ensure this is a Keypair

  before(async () => {
    // Airdrop SOL to the user
    await airdrop(anchor.getProvider().connection, user.publicKey);
  });

  // *** TEST CASE #1 ***
  it("initialize_nft - Success Test Case", async () => {
    // Generate a random token to serve as the "NFT"
    const testNFT = anchor.web3.Keypair.generate().publicKey;

    // Derive PDA
    const [nftAccount, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("nft"), user.publicKey.toBuffer(), testNFT.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .initialize(testNFT)
      .accountsStrict({
        user: user.publicKey,
        nft: nftAccount,
        systemProgram: SystemProgram.programId
      })
      .signers([user])
      .rpc({ skipPreflight: true });

    // Fetch and verify NFT state
    const nftAccountData = await program.account.nft.fetch(nftAccount);
    assert.ok(nftAccountData.owner.equals(user.publicKey), "Owner should match the user");
    assert.ok(nftAccountData.tokenId.equals(testNFT), "Token ID should be correctly set");
    assert.deepEqual(
      nftAccountData.category,
      "",
      "Category should be empty/blank"
    );
    assert.ok(nftAccountData.favorite === false, "Favorite should be set to false by default");

    // Close test account to allow for subsequent use of the same user public key
    await program.methods
    .close()
    .accountsStrict({
      user: user.publicKey,
      nft: nftAccount,
      systemProgram: SystemProgram.programId
    })
    .signers([user])
    .rpc();
  });

  // *** TEST CASE #2 ***
  it("initialize_nft - Failure Test Case (Invalid Token ID)", async () => {
  // Generate an invalid token ID (the default PublicKey address)
    const testNFT = anchor.web3.PublicKey.default;
    
    // Derive PDA
    const [nftAccount, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("nft"), user.publicKey.toBuffer(), testNFT.toBuffer()],
      program.programId
    );

    try {
      const tx = await program.methods
        .initialize(testNFT)
        .accountsStrict({
          user: user.publicKey,
          nft: nftAccount,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc({ skipPreflight: true });
  
      assert.fail("The transaction should have failed due to invalid token ID.");
    } catch (err) {
      // Check if the specific error was thrown
      assert.equal(err.code, 6002, "Expected InvalidTokenId (6002) error!");
    }
  });

  // *** TEST CASE #3 ***  
  it("update_category - Success Test Case", async () => {
    // Generate a random token to serve as the "NFT"
    const testNFT = anchor.web3.Keypair.generate().publicKey;  // Derive PDA

    const [nftAccount, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("nft"), user.publicKey.toBuffer(), testNFT.toBuffer()],
      program.programId
    );
    
    // Define a new category as a 10-byte array (CATEGORY_LENGTH is 10)
    const newCategory = "Art";

    // Initialize a new NFT
    const tx1 = await program.methods
    .initialize(testNFT)
    .accountsStrict({
      user: user.publicKey,
      nft: nftAccount,
      systemProgram: SystemProgram.programId,
    })
    .signers([user])
    .rpc({ skipPreflight: true });

    // Update the same NFT's category
    const tx2 = await program.methods
      .category(newCategory)
      .accountsStrict({
        user: user.publicKey,
        nft: nftAccount,
      })
      .signers([user])
      .rpc({ skipPreflight: true });

    // Fetch and verify NFT state
    const nftAccountData = await program.account.nft.fetch(nftAccount);
    assert.ok(nftAccountData.owner.equals(user.publicKey), "Owner should match the user");
    assert.ok(nftAccountData.tokenId.equals(testNFT), "Token ID should be correctly set");
    assert.deepEqual(
      nftAccountData.category,
      "Art",
      "Category should be Art"
    );
    assert.ok(nftAccountData.favorite === false, "Favorite should be set to false by default");

    // Close test account to allow for subsequent use of the same user public key
    await program.methods
      .close()
      .accountsStrict({
        user: user.publicKey,
        nft: nftAccount,
        systemProgram: SystemProgram.programId
      })
      .signers([user])
      .rpc({ skipPreflight: true });
    });

    // *** TEST CASE #4 ***
    it("update_category - Failure Test Case (Category too long)", async () => {
      // Generate a random token to serve as the "NFT"
      const testNFT = anchor.web3.Keypair.generate().publicKey;// Derive PDA

      const [nftAccount, bump] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("nft"), user.publicKey.toBuffer(), testNFT.toBuffer()],
        program.programId
      );
  
      // Define a new category as a 10-byte array (CATEGORY_LENGTH is 10)
      const newCategory = "AVeryLongCategoryThatIsMoreThan10Bytes";
  
      // Initialize a new NFT
      const tx1 = await program.methods
      .initialize(testNFT)
      .accountsStrict({
        user: user.publicKey,
        nft: nftAccount,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc({ skipPreflight: true });
  
      // Update the same NFT's category, this should fail due to category length
      try {
        await program.methods
          .category(newCategory)
          .accountsStrict({
            user: user.publicKey,
            nft: nftAccount,
          })
          .signers([user])
          .rpc({ skipPreflight: true });
      } catch (err) {
        // Validate the error
        assert.equal(err.code, 6004, "Expected UpdateCategoryInvalidLength (6004) error");
      }

      // Fetch and verify NFT state. The state should be clean/valid, and the category should be blank.
      const nftAccountData = await program.account.nft.fetch(nftAccount);
      assert.ok(nftAccountData.owner.equals(user.publicKey), "Owner should match the user");
      assert.ok(nftAccountData.tokenId.equals(testNFT), "Token ID should be correctly set");
      assert.deepEqual(
        nftAccountData.category,
        "",
        "Category should be blank"
      );
      assert.ok(nftAccountData.favorite === false, "Favorite should be set to false by default");

      // Close test account to allow for subsequent use of the same user public key
    await program.methods
    .close()
    .accountsStrict({
      user: user.publicKey,
      nft: nftAccount,
      systemProgram: SystemProgram.programId
    })
    .signers([user])
    .rpc({ skipPreflight: true });
    });

    // *** TEST CASE #5 ***
    it("toggle_favorite - Success Test Case", async () => {
      // Generate a random token to serve as the "NFT"
      const testNFT = anchor.web3.Keypair.generate().publicKey;// Derive PDA

      const [nftAccount, bump] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("nft"), user.publicKey.toBuffer(), testNFT.toBuffer()],
        program.programId
      );
    
      // Initialize a new NFT
      const tx1 = await program.methods
      .initialize(testNFT)
      .accountsStrict({
        user: user.publicKey,
        nft: nftAccount,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc({ skipPreflight: true });
  
      // Update the same NFT's favorite
      const tx2 = await program.methods
        .favorite()
        .accountsStrict({
          user: user.publicKey,
          nft: nftAccount,
        })
        .signers([user])
        .rpc({ skipPreflight: true });
  
      // Fetch and verify NFT state
      const nftAccountData = await program.account.nft.fetch(nftAccount);
      assert.ok(nftAccountData.owner.equals(user.publicKey), "Owner should match the user");
      assert.ok(nftAccountData.tokenId.equals(testNFT), "Token ID should be correctly set");
      assert.deepEqual(
        nftAccountData.category,
        "",
        "Category should be blank/empty"
      );
      assert.ok(nftAccountData.favorite === true, "Favorite should now be set to true");
  
      // Close test account to allow for subsequent use of the same user public key
      await program.methods
        .close()
        .accountsStrict({
          user: user.publicKey,
          nft: nftAccount,
          systemProgram: SystemProgram.programId
        })
        .signers([user])
        .rpc({ skipPreflight: true });
      });

    // *** TEST CASE #6 ***
    it("toggle_favorite - Failure Test Case (Unauthorized User)", async () => {
      // Generate a random token to serve as the "NFT"
      const testNFT = anchor.web3.Keypair.generate().publicKey;// Derive PDA

      const [nftAccount, bump] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("nft"), user.publicKey.toBuffer(), testNFT.toBuffer()],
        program.programId
      );
  
      // Create a random keypair that represents and unauthorized user
      const unauthorizedUser = anchor.web3.Keypair.generate();
  
      // Initialize a new NFT
      const tx1 = await program.methods
      .initialize(testNFT)
      .accountsStrict({
        user: user.publicKey,
        nft: nftAccount,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc({ skipPreflight: true });
  
      // Update the same NFT's favorite, this should fail due to unauthorizedUser
      try {
        await program.methods
          .favorite()
          .accountsStrict({
            user: unauthorizedUser.publicKey,
            nft: nftAccount,
          })
          .signers([unauthorizedUser])
          .rpc({ skipPreflight: true });
      } catch (err) {
        // Validate the error
        assert.equal(err.code, 6003, "Expected UnauthorizedUser (6003) error");
      }

      // Fetch and verify NFT state. The state should be clean/valid, and the favorite should be false.
      const nftAccountData = await program.account.nft.fetch(nftAccount);
      assert.ok(nftAccountData.owner.equals(user.publicKey), "Owner should match the user");
      assert.ok(nftAccountData.tokenId.equals(testNFT), "Token ID should be correctly set");
      assert.deepEqual(
        nftAccountData.category,
        "",
        "Category should be blank"
      );
      assert.ok(nftAccountData.favorite === false, "Favorite should be set to false");

      // Close test account to allow for subsequent use of the same user public key
    await program.methods
    .close()
    .accountsStrict({
      user: user.publicKey,
      nft: nftAccount,
      systemProgram: SystemProgram.programId
    })
    .signers([user])
    .rpc({ skipPreflight: true });
    });

    // *** TEST CASE #7 ***
    it("close_nft - Success Test Case", async () => {
      // Generate a random token to serve as the "NFT"
      const testNFT = anchor.web3.Keypair.generate().publicKey;// Derive PDA

      const [nftAccount, bump] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("nft"), user.publicKey.toBuffer(), testNFT.toBuffer()],
        program.programId
      );
      
      // Initialize a new NFT
      const tx1 = await program.methods
      .initialize(testNFT)
      .accountsStrict({
        user: user.publicKey,
        nft: nftAccount,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc({ skipPreflight: true });
  
      // Close NFT account
      await program.methods
        .close()
        .accountsStrict({
          user: user.publicKey,
          nft: nftAccount,
          systemProgram: SystemProgram.programId
        })
        .signers([user])
        .rpc({ skipPreflight: true });

      // Assert that the account is closed
      const nftAccountData = await connection.getAccountInfo(nftAccount);
      assert.equal(nftAccountData, null, "NFT account was not properly closed");
    });

    // *** TEST CASE #8 ***
    it("close_nft - Failure Test Case (Unauthorized User)", async () => {
      // Generate a random token to serve as the "NFT"
      const testNFT = anchor.web3.Keypair.generate().publicKey;// Derive PDA

      const [nftAccount, bump] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("nft"), user.publicKey.toBuffer(), testNFT.toBuffer()],
        program.programId
      );
  
      // Create a random keypair that represents and unauthorized user
      const unauthorizedUser = anchor.web3.Keypair.generate();
      
      // Initialize a new NFT
      await program.methods
      .initialize(testNFT)
      .accountsStrict({
        user: user.publicKey,
        nft: nftAccount,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc({ skipPreflight: true });
  
      // Close NFT account, this should fail due to unauthorized user.
      try {
        await program.methods
        .close()
        .accountsStrict({
          user: unauthorizedUser.publicKey,
          nft: nftAccount,
          systemProgram: SystemProgram.programId
        })
        .signers([unauthorizedUser])
        .rpc({ skipPreflight: true });
      } catch (err) {
        assert.equal(err.code, 6003, "Expected UnauthorizedUser error");
      }
      
      // Fetch and verify NFT state. The state should be clean/valid, and not closed.
      const nftAccountData = await program.account.nft.fetch(nftAccount);
      assert.ok(nftAccountData.owner.equals(user.publicKey), "Owner should match the user");
      assert.ok(nftAccountData.tokenId.equals(testNFT), "Token ID should be correctly set");
      assert.deepEqual(
        nftAccountData.category,
        "",
        "Category should be blank"
      );
      assert.ok(nftAccountData.favorite === false, "Favorite should be set to false");
    });

});

async function airdrop(connection: any, address: any, amount = 10000000000) {
  await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}