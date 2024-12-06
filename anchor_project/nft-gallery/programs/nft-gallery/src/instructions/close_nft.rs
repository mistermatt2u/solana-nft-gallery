use anchor_lang::prelude::*;

use crate::states::NFT;
use crate::errors::NFTError;

pub fn close_nft(ctx: Context<CloseNFT>) -> Result<()> {
    let nft = &mut ctx.accounts.nft;
    let user = &mut ctx.accounts.user;

    // Ensure the requestor is the owner of the NFT
    require!(
        nft.owner == user.key(), 
        NFTError::UnauthorizedUser
    );

    Ok(())
}

#[derive(Accounts)]
pub struct CloseNFT<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        close = user,
        constraint = nft.owner == user.key() @ NFTError::UnauthorizedUser,
    )]
    pub nft: Account<'info, NFT>,
    pub system_program: Program<'info, System>,
}
