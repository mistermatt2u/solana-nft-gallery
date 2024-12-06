import { verify } from '@noble/ed25519';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { FC, useCallback, useState } from 'react';
import { notify } from "../utils/notifications";
import { Program, AnchorProvider, web3, utils, BN, setProvider } from '@coral-xyz/anchor'
import idl from './nft_gallery.json'
import { NftGallery } from './nft_gallery';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js'
import { publicKey, token } from '@coral-xyz/anchor/dist/cjs/utils';
import { WalletKeypairError } from '@solana/wallet-adapter-base';
import { seed } from '@coral-xyz/anchor/dist/cjs/idl';

const idl_string = JSON.stringify(idl)
const idl_object = JSON.parse(idl_string)
const programID = new PublicKey(idl.address)

interface NFT {
    mint: string
    name: string
    image: string
    category: string
    favorite: boolean
}

export const NFTGallery: FC = () => {
    const wallet = useWallet();
    const {connection} = useConnection()
    const [nfts, setNfts] = useState<NFT[]>([])
    const [loading, setLoading] = useState(false)
    const [popupVisible, setPopupVisible] = useState(false);
    const [selectedNFT, setSelectedNFT] = useState<string>(""); // NFT address
    const [newCategory, setNewCategory] = useState("");

    const getProvider = () => {
        const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions())
        setProvider(provider)
        return provider
    }
  
    const anchProvider = getProvider()
    const program = new Program<NftGallery>(idl_object, anchProvider)

    const getNFTs = async () => {
        if (!wallet.publicKey) {
            notify({ type: "error", message: "Wallet not connected" });
            return;
        }
    
        try {
            setLoading(true);
    
            const metaplex = new Metaplex(connection);
    
            // 1. Fetch all wallet NFTs
            const walletNFTs = await metaplex.nfts().findAllByOwner({
                owner: wallet.publicKey,
            });
    
            // 2. Fetch all on-chain NFT accounts
            const onChainNFTAccounts = await connection.getProgramAccounts(programID, {
                filters: [
                    { dataSize: 8 + 80 }, // Filter for NFT struct size
                ],
            });
    
            // Parse on-chain data
            const onChainNFTs = await Promise.all(
                onChainNFTAccounts.map(async (account) => {
                    try {
                        // Decode the NFT data
                        const decodedData = await program.account.nft.fetch(account.pubkey);
    
                        return {
                            token_id: decodedData.tokenId.toBase58(),
                            favorite: decodedData.favorite,
                            category: decodedData.category,
                        };
                    } catch (error) {
                        console.error(`Failed to decode account ${account.pubkey.toBase58()}:`, error);
                        return null;
                    }
                })
            );
    
            // Filter out null results (accounts that failed to decode)
            const validOnChainNFTs = onChainNFTs.filter((nft) => nft !== null);
    
            // 3. Process each wallet NFT
            const nftData = await Promise.all(
                walletNFTs.map(async (walletNFT) => {
                    const metadataResponse = await fetch(walletNFT.uri);
                    const metadata = await metadataResponse.json();

                    // 3.1 Check if the wallet NFT is already on-chain
                    const onChainNFT = validOnChainNFTs.find(
                        (nft) => nft.token_id === walletNFT.address.toBase58()
                    );
    
                    if (!onChainNFT) {
                        console.log(`Initializing on-chain account for NFT: ${walletNFT.address.toBase58()}`);
                        try {
                            // 3.2 Initialize the NFT if it's not found on-chain
                            const [nftPda, bump] = PublicKey.findProgramAddressSync(
                                [Buffer.from("nft"), wallet.publicKey.toBuffer(), walletNFT.address.toBuffer()],
                                programID
                            );
                            console.log("PDA: ", nftPda.toString())
                            
                            await program.methods
                                .initialize(walletNFT.address) // Pass the mint address
                                .accountsStrict({
                                    nft: nftPda, // Use the PDA to initialize the NFT account
                                    user: wallet.publicKey,
                                    systemProgram: SystemProgram.programId,
                                })
                                .rpc();
                        } catch (error) {
                            console.error(`Failed to initialize NFT: ${walletNFT.address.toBase58()}`, error);
                        }
                    }
    
                    // Merge wallet metadata with on-chain data
                    return {
                        mint: walletNFT.address.toBase58(),
                        name: metadata.name,
                        image: metadata.image,
                        favorite: onChainNFT ? onChainNFT.favorite : null,
                        category: onChainNFT ? onChainNFT.category : "Uncategorized",
                    };
                })
            );
    
            // 4. Update state
            setNfts(nftData);
            console.log("NFTs loaded:", nftData);
        } catch (error) {
            console.error("Error fetching NFTs:", error);
            notify({ type: "error", message: "Failed to load NFTs." });
        } finally {
            setLoading(false);
        }
    };    

    const getNFTAccountPDA = async (userPublicKey: PublicKey, tokenId: PublicKey) => {
        const [pda, bump] = await PublicKey.findProgramAddressSync(
          [
            Buffer.from("nft"), // Static seed "nft"
            userPublicKey.toBuffer(), // User's wallet address
            tokenId.toBuffer(), // Token ID (NFT address)
          ],
          program.programId // The program's public key
        );
        return pda;
      };

    // Open Popup
    const openPopup = (nftAddress: string) => {
        setSelectedNFT(nftAddress);
        setPopupVisible(true);
    };

    // Close Popup
    const closePopup = () => {
        setPopupVisible(false);
        setNewCategory("");
        setSelectedNFT("");
    };

    const updateCategory = async (mint: string, newCategory: string) => {
        //Ensure that a valid wallet public key is being used
        if (!wallet.publicKey) {
            notify({ type: "error", message: "Wallet not connected" });
            return;
        }
    
        if (!/^[a-zA-Z]{1,10}$/.test(newCategory)) {
            alert("Category must be alphabetic and no more than 10 characters long.");
            return;
        }

        console.log("updating category on NFT: {}", mint);
        console.log("size of newCategory string: {}", newCategory.length);

        setPopupVisible(false);

        const nftTokenId = new PublicKey(mint);  // Convert string to PublicKey
        const nftAccountPDA = await getNFTAccountPDA(wallet.publicKey, nftTokenId);  // Get the correct PDA

        try {
            await program.methods
                .category(newCategory)
                .accounts({
                    nft: nftAccountPDA,
                    user: wallet.publicKey,
                })
                .rpc();
    
            // Update the frontend state
            setNfts((prev) =>
                prev.map((nft) =>
                    nft.mint === mint
                        ? { ...nft, category: newCategory }
                        : nft
                )
            );
            notify({ type: "success", message: "Category updated!" });
        } catch (error) {
            console.error("Error updating category:", error);
            notify({ type: "error", message: "Failed to update category." });
        }
    };

    const toggleFavorite = async (mint: string) => {
        if (!wallet.publicKey) {
            notify({ type: "error", message: "Wallet not connected" });
            return;
        }
    
        console.log("Toggling favorite on NFT: {}", mint);

        const nftTokenId = new PublicKey(mint);  // Convert string to PublicKey
        const nftAccountPDA = await getNFTAccountPDA(wallet.publicKey, nftTokenId);  // Get the correct PDA

        console.log("PDA: {}", nftAccountPDA.toString());

        try {
            await program.methods
                .favorite()
                .accounts({
                    nft: nftAccountPDA,
                    user: wallet.publicKey,
                })
                .rpc();
    
            // Update the frontend state
            setNfts((prev) =>
                prev.map((nft) =>
                    nft.mint === mint
                        ? { ...nft, favorite: !nft.favorite }
                        : nft
                )
            );
            notify({ type: "success", message: "Favorite status updated!" });
        } catch (error) {
            console.error("Error toggling favorite:", error);
            notify({ type: "error", message: "Failed to update favorite status." });
        }
    };    

    // Update the UI
    return (
        <div>
            {
                nfts.map((nft) => {
                    return (
                        <div key={nft.mint.toString()} className="nft-item">
                            <h1>{nft.name}</h1>
                            <img src= {nft.image} width={"150px"} height={"auto"}/>
                            <p>Category: {nft.category}</p>
                            <p>Favorite: {nft.favorite ? "Yes" : "No"}</p>
                            <br/>
                            <button
                                className="group w-30 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                                onClick={() => openPopup(nft.mint.toString())}>
                                <span> 
                                    Update Category 
                                </span>
                            </button>
                            <button
                                className="group w-30 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                                onClick={() => toggleFavorite(nft.mint.toString()) }>
                                <span> 
                                    Toggle Favorite 
                                </span>
                            </button>
                            <br/>
                            <br/>
                        </div>
                    )
                })
            }
            <div className="flex flex-row justify-center">
            <div className="relative group items-center">
                <div className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
                rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <button
                    className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                    onClick={ getNFTs }
                >
                    <div className="hidden group-disabled:block">
                        Wallet not connected
                    </div>
                    <span className="block group-disabled:hidden"> 
                        Generate Gallery
                    </span>
                </button>
            </div>
            </div>

            {/* Popup */}
            {popupVisible && (
            <div className="popup-overlay">
            <div className="popup">
            <h3>Update Category</h3>
                <input
                    type="text"

                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    maxLength={10}
                    placeholder="Enter new category"
            />
                    <button className="group w-30 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                        onClick={() => updateCategory(selectedNFT, newCategory)}>Submit</button>
                    <button className="group w-30 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                        onClick={closePopup}>Cancel</button>
            </div>
            </div>
        )}
        </div>
    )
};
