//! BuildBridge — MilestoneTracker Soroban Contract
//!
//! Records and verifies founder milestones on the Stellar blockchain.
//! Each milestone is stored immutably — trustlessly verifiable by investors.
//!
//! Session 5: full implementation + testnet deploy.

#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, log, symbol_short,
    Address, Env, String, Symbol, Vec, Map,
};

// ─── Storage Keys ─────────────────────────────────────────

#[contracttype]
pub enum DataKey {
    /// Global milestone counter (auto-increment ID)
    Counter,
    /// Individual milestone by on-chain ID
    Milestone(u64),
    /// Index: founder address → Vec<u64> of milestone IDs
    FounderIndex(Address),
    /// Admin address (contract deployer)
    Admin,
}

// ─── Data Types ───────────────────────────────────────────

/// Valid milestone categories (stored as Symbol)
pub const CAT_PRODUCT:     Symbol = symbol_short!("product");
pub const CAT_TRACTION:    Symbol = symbol_short!("traction");
pub const CAT_FUNDING:     Symbol = symbol_short!("funding");
pub const CAT_TEAM:        Symbol = symbol_short!("team");
pub const CAT_PARTNER:     Symbol = symbol_short!("partner");
pub const CAT_OTHER:       Symbol = symbol_short!("other");

/// A single on-chain milestone record.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Milestone {
    /// Auto-incrementing unique ID
    pub id: u64,
    /// Stellar address of the founder who owns this milestone
    pub founder: Address,
    /// Short human-readable title (max ~100 chars enforced by client)
    pub title: String,
    /// Category: product | traction | funding | team | partner | other
    pub category: Symbol,
    /// Ledger timestamp when recorded (Unix seconds)
    pub timestamp: u64,
    /// Whether the milestone has been verified by a trusted verifier
    pub verified: bool,
}

// ─── Contract ─────────────────────────────────────────────

#[contract]
pub struct MilestoneTrackerContract;

#[contractimpl]
impl MilestoneTrackerContract {

    // ── Admin ────────────────────────────────────────────

    /// Initialise the contract. Must be called once after deploy.
    /// Sets the admin to `admin` address.
    pub fn init(env: Env, admin: Address) {
        // Prevent re-initialisation
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialised");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Counter, &0u64);
        log!(&env, "MilestoneTracker initialised. Admin: {}", admin);
    }

    /// Returns the admin address.
    pub fn admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("Not initialised")
    }

    // ── Core: Record ──────────────────────────────────────

    /// Record a new milestone on-chain.
    ///
    /// - `founder`  must sign the transaction (prevents spoofing)
    /// - `title`    human-readable description, enforced non-empty by client
    /// - `category` one of: product | traction | funding | team | partner | other
    ///
    /// Returns the new milestone's on-chain ID.
    pub fn record_milestone(
        env: Env,
        founder: Address,
        title: String,
        category: Symbol,
    ) -> u64 {
        // Caller must be the founder — enforces signature requirement
        founder.require_auth();

        // Validate category
        let valid_cats = [
            CAT_PRODUCT, CAT_TRACTION, CAT_FUNDING,
            CAT_TEAM, CAT_PARTNER, CAT_OTHER,
        ];
        if !valid_cats.contains(&category) {
            panic!("Invalid category");
        }

        // Bump counter
        let id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::Counter)
            .unwrap_or(0u64)
            + 1;
        env.storage().instance().set(&DataKey::Counter, &id);

        // Persist milestone
        let milestone = Milestone {
            id,
            founder: founder.clone(),
            title,
            category,
            timestamp: env.ledger().timestamp(),
            verified: false,
        };
        env.storage()
            .persistent()
            .set(&DataKey::Milestone(id), &milestone);

        // Update founder index
        let mut ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::FounderIndex(founder.clone()))
            .unwrap_or_else(|| Vec::new(&env));
        ids.push_back(id);
        env.storage()
            .persistent()
            .set(&DataKey::FounderIndex(founder.clone()), &ids);

        log!(&env, "Milestone #{} recorded for founder {}", id, founder);
        id
    }

    // ── Core: Verify ─────────────────────────────────────

    /// Mark a milestone as verified by a trusted verifier.
    /// Only the admin may call this function.
    pub fn verify_milestone(env: Env, admin: Address, milestone_id: u64) {
        admin.require_auth();

        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("Not initialised");
        if admin != stored_admin {
            panic!("Not admin");
        }

        let mut milestone: Milestone = env
            .storage()
            .persistent()
            .get(&DataKey::Milestone(milestone_id))
            .expect("Milestone not found");

        milestone.verified = true;
        env.storage()
            .persistent()
            .set(&DataKey::Milestone(milestone_id), &milestone);

        log!(&env, "Milestone #{} verified by admin", milestone_id);
    }

    // ── Queries ───────────────────────────────────────────

    /// Fetch a single milestone by its on-chain ID.
    /// Panics if the ID does not exist.
    pub fn get_milestone(env: Env, id: u64) -> Milestone {
        env.storage()
            .persistent()
            .get(&DataKey::Milestone(id))
            .expect("Milestone not found")
    }

    /// Returns all milestone IDs belonging to a founder.
    pub fn get_founder_milestone_ids(env: Env, founder: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::FounderIndex(founder))
            .unwrap_or_else(|| Vec::new(&env))
    }

    /// Returns the total number of milestones ever recorded.
    pub fn total_milestones(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::Counter)
            .unwrap_or(0)
    }

    /// Returns true if a milestone is verified.
    pub fn is_verified(env: Env, id: u64) -> bool {
        env.storage()
            .persistent()
            .get::<DataKey, Milestone>(&DataKey::Milestone(id))
            .map(|m| m.verified)
            .unwrap_or(false)
    }
}

// ─── Tests ────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    fn setup() -> (Env, MilestoneTrackerContractClient<'static>, Address) {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, MilestoneTrackerContract);
        let client = MilestoneTrackerContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        client.init(&admin);
        (env, client, admin)
    }

    #[test]
    fn test_init() {
        let (_env, client, admin) = setup();
        assert_eq!(client.admin(), admin);
        assert_eq!(client.total_milestones(), 0);
    }

    #[test]
    #[should_panic(expected = "Already initialised")]
    fn test_init_twice_panics() {
        let (_env, client, admin) = setup();
        client.init(&admin);
    }

    #[test]
    fn test_record_milestone_returns_sequential_ids() {
        let (env, client, _admin) = setup();
        let founder = Address::generate(&env);

        let id1 = client.record_milestone(
            &founder,
            &String::from_str(&env, "Launched MVP"),
            &CAT_PRODUCT,
        );
        let id2 = client.record_milestone(
            &founder,
            &String::from_str(&env, "First 100 users"),
            &CAT_TRACTION,
        );

        assert_eq!(id1, 1);
        assert_eq!(id2, 2);
        assert_eq!(client.total_milestones(), 2);
    }

    #[test]
    fn test_get_milestone_fields() {
        let (env, client, _admin) = setup();
        let founder = Address::generate(&env);

        let id = client.record_milestone(
            &founder,
            &String::from_str(&env, "Signed partnership"),
            &CAT_PARTNER,
        );

        let m = client.get_milestone(&id);
        assert_eq!(m.id, id);
        assert_eq!(m.founder, founder);
        assert_eq!(m.category, CAT_PARTNER);
        assert!(!m.verified);
    }

    #[test]
    fn test_verify_milestone() {
        let (env, client, admin) = setup();
        let founder = Address::generate(&env);

        let id = client.record_milestone(
            &founder,
            &String::from_str(&env, "Raised pre-seed"),
            &CAT_FUNDING,
        );

        assert!(!client.is_verified(&id));
        client.verify_milestone(&admin, &id);
        assert!(client.is_verified(&id));
    }

    #[test]
    #[should_panic(expected = "Not admin")]
    fn test_verify_by_non_admin_panics() {
        let (env, client, _admin) = setup();
        let founder = Address::generate(&env);
        let faker = Address::generate(&env);

        let id = client.record_milestone(
            &founder,
            &String::from_str(&env, "Something"),
            &CAT_OTHER,
        );
        client.verify_milestone(&faker, &id);
    }

    #[test]
    fn test_founder_index_isolation() {
        let (env, client, _admin) = setup();
        let founder_a = Address::generate(&env);
        let founder_b = Address::generate(&env);

        client.record_milestone(&founder_a, &String::from_str(&env, "A milestone"), &CAT_PRODUCT);
        client.record_milestone(&founder_b, &String::from_str(&env, "B milestone"), &CAT_TRACTION);
        client.record_milestone(&founder_a, &String::from_str(&env, "A milestone 2"), &CAT_TEAM);

        let ids_a = client.get_founder_milestone_ids(&founder_a);
        let ids_b = client.get_founder_milestone_ids(&founder_b);

        assert_eq!(ids_a.len(), 2);
        assert_eq!(ids_b.len(), 1);
    }

    #[test]
    #[should_panic(expected = "Invalid category")]
    fn test_invalid_category_panics() {
        let (env, client, _admin) = setup();
        let founder = Address::generate(&env);
        let bad_cat = Symbol::new(&env, "badcat");
        client.record_milestone(&founder, &String::from_str(&env, "Test"), &bad_cat);
    }

    #[test]
    fn test_total_milestones_counter() {
        let (env, client, _admin) = setup();
        assert_eq!(client.total_milestones(), 0);

        for i in 0..5 {
            let f = Address::generate(&env);
            client.record_milestone(
                &f,
                &String::from_str(&env, "Milestone"),
                &CAT_PRODUCT,
            );
        }
        assert_eq!(client.total_milestones(), 5);
    }
}
