import { Ident } from "provide-js";
import { Vault } from "provide-js";
import { NChain } from "provide-js";
import { readFile } from "fs/promises";
import 'dotenv/config';

console.log("begin NFT mint run");

//load the refresh token from env
var REFRESH_TOKEN = process.env.REFRESH_TOKEN;
var ORG_ID = process.env.ORG_ID;
var USER_ID = process.env.USER_ID;

var access_token_request = {};
access_token_request.organization_id = ORG_ID;
access_token_request.user_id = USER_ID;

//get the access token
const IDENT_PROXY = new Ident(REFRESH_TOKEN);
const ACCESS_TOKEN = await IDENT_PROXY.createToken(access_token_request);

//nchain connectivity
const NCHAIN_PROXY = new NChain(ACCESS_TOKEN.accessToken);
const polygon_mumbai = "4251b6fd-c98d-4017-87a3-d691a77a52a7";
const celo_alfajores = "d818afb9-df2f-4e46-963a-f7b6cb7655d2";
var selected_network = polygon_mumbai; 

//get org wallet
const NCHAIN_WALLETS = await NCHAIN_PROXY.fetchWallets();
var SELECTED_WALLET = NCHAIN_WALLETS.results.filter(nchainwallets => nchainwallets.organizationId === ORG_ID );
var TARGET_VAULT = SELECTED_WALLET[0].vaultId;

//get the PRVD vault
const VAULT_PROXY = new Vault(ACCESS_TOKEN.accessToken);
const NFT_VAULTS = await VAULT_PROXY.fetchVaults();
console.log(NFT_VAULTS.results);
var NFT_VAULT_ID = NFT_VAULTS.results[0].id;


//get the key ids ~ no private keys exposed!!
const NFT_VAULT_KEY_IDS = await VAULT_PROXY.fetchVaultKeys(NFT_VAULT_ID);
var NFT_WALLET = NFT_VAULT_KEY_IDS.results.filter(vaultkeys => vaultkeys.spec === "secp256k1");
console.log(NFT_WALLET);

//org-level vault and wallet
const NFT_WALLET_KEY_ID = NFT_WALLET[0].id;
const NFT_WALLET_ADDRESS = NFT_WALLET[0].address;

var selected_contract_address = "";
var selected_contract_name = "";
var selected_contract_id = "";
switch(selected_network) {
    case celo_alfajores:
        selected_contract_address = "0x7e7c0EB2074f499f9010Ad3b7c6a20EdF9E3346c";
        selected_contract_name = "ProvideTest";
        break;
    case polygon_mumbai:
        selected_contract_address = "0x4e9915B2ff6679C63a290645B589794d89584E5C";
        selected_contract_name = "CarbonEmissionsNFT";
        break;
}

let contractslist = await NCHAIN_PROXY.fetchContracts();
let targetcontract = contractslist.results.filter( contract => contract.address === selected_contract_address && contract.networkId === selected_network );


if(targetcontract[0] != undefined) { 
    //contract was already added on Nchain
    console.log('Found deployed contract');
    selected_contract_id = targetcontract[0].id;

} else { 
    //deploy the contract
    console.log('Adding contract to Nchain...');
    var abipath = "";
    var contractpath = "";
    switch(selected_network) {
        case celo_alfajores:
            abipath = "./abi/celo_opennftabi.json";
            contractpath = "contracts/ProvideTest.sol";
            break;
        case polygon_mumbai: 
            abipath = "./abi/opennftabi.json";
            contractpath = "contracts/CarbonEmissionsNFT.sol";
            break;
    }
    let nftDeployment = JSON.parse(await readFile(abipath, "utf8"));
    let nftABI = nftDeployment["output"]["contracts"][contractpath]["ProvideTest"]["abi"];

    var nft_contract_create = {};
    nft_contract_create.address = selected_contract_address; //address of your ERC721 contract
    nft_contract_create.name = selected_contract_name; //name of the contract you deployed for the NFT
    nft_contract_create.network_id = selected_network;
    nft_contract_create.params = { argv: [],
                               wallet_id: NFT_WALLET[0].id,
                               compiled_artifact: {
                                    abi: nftABI,
                                }
                             };                            

    const NFT_CONTRACT = await NCHAIN_PROXY.createContract(nft_contract_create);
    selected_contract_id = NFT_CONTRACT.id;
    console.log(NFT_CONTRACT);
}

const accounts = await NCHAIN_PROXY.fetchAccounts();
const network_account = accounts.results.filter( network_account => network_account.networkId === selected_network );
console.log(network_account);


var execute_contract_by_account = {};
execute_contract_by_account.account_id = network_account[0].id;
execute_contract_by_account.method = 'openMint';
execute_contract_by_account.params = [];
execute_contract_by_account.value = 0;

// execute contract method
const NFT_SAFEMINT_RESP = await NCHAIN_PROXY.executeContract(selected_contract_id, execute_contract_by_account);

console.log(NFT_SAFEMINT_RESP);

const NFT_MINT_STATUS = await NCHAIN_PROXY.fetchTransactionDetails(NFT_SAFEMINT_RESP.ref);

var blockexplorerlink = "";
switch(selected_network) {
    case celo_alfajores:
        blockexplorerlink = "https://alfajores.celoscan.io/tx/" + NFT_MINT_STATUS.hash;
        break;
    case polygon_mumbai:
        blockexplorerlink = "https://mumbai.polygonscan.com/tx/" + NFT_MINT_STATUS.hash;
        break;
    default:
        blockexplorerlink = "Hash:" + NFT_MINT_STATUS.hash;
}

console.log("See block explorer");
console.log(blockexplorerlink);

console.log("end NFT mint run");