use anchor_lang::prelude::*;

use crate::errors::NFTError;
use crate::states::*;

pub fn initialize_nft(
    ctx: Context<InitializeNFT>,
    token_id: Pubkey
) -> Result<()> {
    let initialized_nft = &mut ctx.accounts.nft;
    let user = &mut ctx.accounts.user;

    // Check if the token_id is valid (not zero)
    require!(
        token_id != Pubkey::default(),
        NFTError::InvalidTokenId
    );

    // Check if the user is the rightful owner (e.g., no specific validation needed here for now)
    require!(
        user.key() != Pubkey::default(),
        NFTError::InvalidUser
    );

    msg!("Initializing NFT with Token ID: {}", token_id);

    // Set the owner
    initialized_nft.owner = user.key();

    // Set the token ID
    initialized_nft.token_id = token_id;

    // Set favorite to false by default
    initialized_nft.favorite = false;

    // Set the category to an empty byte array
    initialized_nft.category = "".to_string();

    // Set the bump (retrieved from PDA derivation)
    initialized_nft.bump = ctx.bumps.nft;

    msg!("NFT initialization completed for Token ID: {}", token_id);

    Ok(())
}

#[derive(Accounts)]
#[instruction(token_id: Pubkey)]
pub struct InitializeNFT<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        payer = user,  
        space = 8 + NFT::LEN,
        seeds = [b"nft", user.key().as_ref(), token_id.as_ref()],
        bump
    )]
    pub nft: Account<'info, NFT>,
    pub system_program: Program<'info, System>
}