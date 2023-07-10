# Mint an NFT with provide-js and Provide Platform!

## Setup

Create account on https://shuttle.provide.services

Use the postman collection embedded in this repo. Enter your Shuttle email and password. Execute each HTTP request in order to retrieve all your needed variables.

Add your refresh token and other variables to the .env file accordingly

Your wallet address associated to your account will need to hold some crypto gas for transaction fees on the given network. You can find your wallet address in the mintnft_uservault_wallet variable.

For testnets - you can acquire some free funds from a faucet
[Polygon Mumbai](https://faucet.polygon.technology/)
[Celo Alfajores](https://faucet.celo.org/alfajores)
VeChain - more info soon

This example uses a sample ERC-721 contract already deployed here
[Polygon Mumbai]()
[Celo Alfajores]()
VeChain - coming soon! 

For demonstration purposes, we created an un-whitelisted openMint method. Feel free to try this example out with other NFT minting contracts with more advanced whitelisting criteria. Keep in mind the wallet address generated from Shuttle would have to be permitted to mint.

Final step: Run node mintnft in you console and see your NFT minted on chain!
