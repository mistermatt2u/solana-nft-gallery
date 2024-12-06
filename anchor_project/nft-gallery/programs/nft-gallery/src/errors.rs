use anchor_lang::prelude::*;

#[error_code]
pub enum NFTError {
    #[msg("Cannot initialize, invalid Solana address")]
    InvalidUser = 1,
    #[msg("Cannot initialize, invalid Token ID")]
    InvalidTokenId = 2,
    #[msg("Unauthorized User")]
    UnauthorizedUser = 3,
    #[msg("Error updating category, invalid length")]
    UpdateCategoryInvalidLength = 4,
    #[msg("Error updating favorite")]
    UpdateFavoriteError = 5,
    #[msg("Invalid PDA Seeds")]
    InvalidPDASeeds = 6,
    #[msg("Unknown Error!")]
    UnknownError = 7,
}
