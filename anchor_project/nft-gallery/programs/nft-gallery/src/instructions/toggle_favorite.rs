use anchor_lang::prelude::*;

use crate::states::*;
use crate::errors::NFTError;

pub fn toggle_favorite(ctx: Context<ToggleFavorite>) -> Result<()> {
    let nft = &mut ctx.accounts.nft;
    let user = &mut ctx.accounts.user;
    
    require!(
        nft.owner == user.key(),
        NFTError::UnauthorizedUser
    );

    nft.favorite = !nft.favorite;

    msg!("Favorite updated for NFT with Token ID: {}", nft.token_id);

    Ok(())
}

#[derive(Accounts)]
pub struct ToggleFavorite<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    // Override the default owner key mismatch error to return the custom error
    #[account(
        mut,
        constraint = nft.owner == user.key() @ NFTError::UnauthorizedUser
    )]
    pub nft: Account<'info, NFT>,
}