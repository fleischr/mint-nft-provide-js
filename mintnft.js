import { Ident } from "provide-js";
import { Vault } from "provide-js";
import { NChain } from "provide-js";
import { Axiom } from "provide-js";
import { readFile } from "fs/promises";
import 'dotenv/config';

console.log("begin NFT mint run");

//load the refresh token from env
//load the refresh token from app
let user_params = JSON.parse(await readFile("./env/prvduser.json", "utf8"));
var REFRESH_TOKEN = user_params.refresh_token;
var ORG_ID = user_params.organization_id;
var USER_ID = user_params.user_id;

var access_token_request = {};
access_token_request.organization_id = ORG_ID;
access_token_request.user_id = USER_ID;

//get the access token
const IDENT_PROXY = new Ident(REFRESH_TOKEN);
const ACCESS_TOKEN = await IDENT_PROXY.createToken(access_token_request);

const NCHAIN_PROXY = new NChain(ACCESS_TOKEN.accessToken);
const polygon_mumbai = "4251b6fd-c98d-4017-87a3-d691a77a52a7";
const celo_alfajores = "d818afb9-df2f-4e46-963a-f7b6cb7655d2";
var selected_network = "4251b6fd-c98d-4017-87a3-d691a77a52a7"; //Polygon Mumbai

const NCHAIN_WALLETS = await NCHAIN_PROXY.fetchWallets();

//console.log("vaultId " + NFT_VAULT_ID);
//console.log("keyId " + NFT_VAULT_KEY_IDS);

var SELECTED_WALLET = NCHAIN_WALLETS.results.filter(nchainwallets => nchainwallets.organizationId === ORG_ID );
var TARGET_VAULT = SELECTED_WALLET[0].vaultId;

//console.log(NCHAIN_WALLETS);


//get the PRVD vault
const VAULT_PROXY = new Vault(ACCESS_TOKEN.accessToken);

const NFT_VAULTS = await VAULT_PROXY.fetchVaults();

console.log(NFT_VAULTS.results);

var NFT_VAULT_ID = NFT_VAULTS.results[0].id;


//get the key ids ~ no private keys exposed!!
const NFT_VAULT_KEY_IDS = await VAULT_PROXY.fetchVaultKeys(NFT_VAULT_ID);

var NFT_WALLET = NFT_VAULT_KEY_IDS.results.filter(vaultkeys => vaultkeys.spec === "secp256k1");
console.log(NFT_WALLET);


const NFT_WALLET_KEY_ID = NFT_WALLET[0].id;
const NFT_WALLET_ADDRESS = NFT_WALLET[0].address;


//console.log("minting NFTs with wallet address:" + NFT_WALLET_ADDRESS );

let nftDeployment = JSON.parse(await readFile("./abi/nftabi.json", "utf8"));
let nftABI = nftDeployment["output"]["contracts"]["contracts/CarbonEmissionsNFT.sol"]["CarbonEmissionsNFT"]["abi"];

//console.log(nftABI);

    // organization wallet
const organizationWallet = await NCHAIN_PROXY.createWallet({
    purpose: 44,
});

const NCHAIN_ACCOUNTS = await NCHAIN_PROXY.fetchAccounts();
let SELECTED_ACCOUNT;
if(NCHAIN_ACCOUNTS.results.length > 0) {
    SELECTED_ACCOUNT = NCHAIN_ACCOUNTS.results.filter(accounts => accounts.networkId === selected_network);
    console.log("account: ");
    console.log(SELECTED_ACCOUNT[0]);
} else {
    console.log("no account found. creating...");
    let accountCreate = { network_id : selected_network };
    const NCHAIN_ACCOUNTS_CREATE = await NCHAIN_PROXY.createAccount(accountCreate);
    console.log(NCHAIN_ACCOUNTS_CREATE);
}

var nft_contract_create = {};
nft_contract_create.address = "0x7A5Cac498cCdb08EDE971749933546Bf8549DC66"; //address of your ERC721 contract
nft_contract_create.name = "CarbonEmissionsNFT"; //name of the contract you deployed for the NFT
nft_contract_create.network_id = selected_network;
//nft_contract_create.type = "ERC721";
nft_contract_create.params = { argv: [],
                               wallet_id: NFT_WALLET[0].id,
                               compiled_artifact: {
                                    abi: nftABI,
                                }
                             };

const NFT_CONTRACT = await NCHAIN_PROXY.createContract(nft_contract_create);
console.log(NFT_CONTRACT);


// execute contract method
/*const NFT_SAFEMINT_RESP = await NCHAIN_PROXY.executeContract(NFT_CONTRACT.id, {
        account_id: SELECTED_ACCOUNT[0].id,
        method: 'safeMint',
        params: [NFT_WALLET_ADDRESS,'abcd'],
        value: 100,
});


console.log(NFT_SAFEMINT_RESP);
*/

console.log("end NFT mint run");