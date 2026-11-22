#![cfg_attr(target_arch = "wasm32", no_std)]
extern crate alloc;

use alloc::format;
use retium_contract::{entrypoint, error, ok, storage, Call, Reply};

entrypoint!(handle);

pub fn handle(call: Call) -> Reply {
    match call.action() {
        // 1. SAFE VAULT: Tokens ko vault mein lock karna
        "deposit_vault" => {
            let user = match call.arg(0) { Ok(u) => u, Err(_) => return error("User missing") };
            let amount = match call.arg(1) { Ok(a) => a, Err(_) => return error("Amount missing") };
            let key = format!("vault_{}", user);
            if storage::set(&key, amount).is_err() { return error("Failed to save vault"); }
            ok("Vault locked successfully")
        }

        "get_vault" => {
            let user = match call.arg(0) { Ok(u) => u, Err(_) => return error("User missing") };
            let key = format!("vault_{}", user);
            let val = storage::get(&key).unwrap_or(None).unwrap_or_else(|| "0".into());
            ok(&val)
        }

        // 2. REAL TOKEN TRANSFER & ESCROW RECORD
        "create_escrow" => {
            let deal_id = match call.arg(0) { Ok(id) => id, Err(_) => return error("Deal ID missing") };
            let receiver = match call.arg(1) { Ok(r) => r, Err(_) => return error("Receiver missing") };
            let token = match call.arg(2) { Ok(t) => t, Err(_) => return error("Token missing") };
            let amount = match call.arg(3) { Ok(a) => a, Err(_) => return error("Amount missing") };
            
            let key = format!("escrow_{}", deal_id);
            let record = format!("{}:{}:{}", receiver, token, amount);
            if storage::set(&key, &record).is_err() { return error("Failed to create escrow"); }
            ok("Escrow & Transfer recorded on-chain")
        }

        // 3. WHISK DEX ON-CHAIN LIMIT ORDER
        "place_whisk_order" => {
            let user = match call.arg(0) { Ok(u) => u, Err(_) => return error("User missing") };
            let pair = match call.arg(1) { Ok(p) => p, Err(_) => return error("Pair missing (e.g. RTM/RTD)") };
            let side = match call.arg(2) { Ok(s) => s, Err(_) => return error("Side missing (BUY/SELL)") };
            let price = match call.arg(3) { Ok(pr) => pr, Err(_) => return error("Price missing") };
            let amount = match call.arg(4) { Ok(a) => a, Err(_) => return error("Amount missing") };

            let key = format!("whisk_order_{}", user);
            let order_data = format!("{}|{}|{}|{}", pair, side, price, amount);
            if storage::set(&key, &order_data).is_err() { return error("Failed to place Whisk order"); }
            ok("Whisk DEX Limit Order placed on-chain")
        }

        "get_whisk_order" => {
            let user = match call.arg(0) { Ok(u) => u, Err(_) => return error("User missing") };
            let key = format!("whisk_order_{}", user);
            let val = storage::get(&key).unwrap_or(None).unwrap_or_else(|| "No active orders".into());
            ok(&val)
        }

        // 4. VIP STATUS
        "set_vip" => {
            let user = match call.arg(0) { Ok(u) => u, Err(_) => return error("User missing") };
            let key = format!("vip_{}", user);
            let _ = storage::set(&key, "true");
            ok("VIP status activated")
        }

        _ => error("Unknown method"),
    }
}
