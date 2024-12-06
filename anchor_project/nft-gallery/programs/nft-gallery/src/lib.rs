use anchor_lang::prelude::*;
use crate::instructions::*;

pub mod errors;
pub mod instructions;
pub mod states;

declare_id!("HAye5oF3GyRcsWRUfZireXMxHSjJFtGhtbwN86wLLxJE");

#[program]
pub mod nft_gallery {
    use super::*;

    pub fn initialize(ctx: Context<InitializeNFT>, token_id: Pubkey) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        
        match initialize_nft(ctx, token_id) {
            Ok(_) => {
                msg!("NFT account successfully initialized!");
                Ok(())
            }
            Err(e) => {
                msg!("Failed to initialize NFT account: {:?}", e);
                Err(e)
            }
        }
    }

    pub fn close(ctx: Context<CloseNFT>) -> Result<()> {
        match close_nft(ctx) {
            Ok(_) => {
                msg!("NFT account successfully closed!");
                Ok(())
            }
            Err(e) => {
                msg!("Failed to close NFT account: {:?}", e);
                Err(e)
            }
        }
    }

    pub fn category(ctx: Context<UpdateCategory>, new_category: String) -> Result<()> {
        match update_category(ctx, new_category) {
            Ok(_) => {
                msg!("NFT category successfully updated!");
                Ok(())
            }
            Err(e) => {
                msg!("Failed to update NFT category: {:?}", e);
                Err(e)
            }
        }
    }

    pub fn favorite(ctx: Context<ToggleFavorite>) -> Result<()> {
        match toggle_favorite(ctx) {
            Ok(_) => {
                msg!("NFT favorite successfully updated!");
                Ok(())
            }
            Err(e) => {
                msg!("Failed to update NFT favorite: {:?}", e);
                Err(e)
            }
        }
    }
}