use anchor_lang::prelude::*;

pub const CATEGORY_LENGTH: usize = 10;

#[account]
pub struct NFT {
    pub owner: Pubkey,
    pub token_id: Pubkey,
    pub favorite: bool,
    pub category: String,
    pub bump: u8,
}

impl NFT {
    // owner (32) + token_id (32) + favorite (1) + category size (4) + category (10) + bump (1)
    pub const LEN: usize = 80;
}