use anchor_lang::prelude::*;

use crate::states::*;
use crate::errors::NFTError;

pub fn update_category(ctx: Context<UpdateCategory>, new_category: String) -> Result<()> {
    let nft = &mut ctx.accounts.nft;
    let user = &mut ctx.accounts.user;
    
    require!(
        nft.owner == user.key(),
        NFTError::UnauthorizedUser
    );

    require!(
        new_category.len() <= CATEGORY_LENGTH,
        NFTError::UpdateCategoryInvalidLength
    );

    nft.category = new_category;

    msg!("Category {:?} updated for NFT with Token ID: {}", nft.category, nft.token_id);

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateCategory<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut, 
        constraint = nft.owner == user.key() @ NFTError::UnauthorizedUser
    )]
    pub nft: Account<'info, NFT>,
}