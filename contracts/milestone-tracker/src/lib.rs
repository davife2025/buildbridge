//! BuildBridge — MilestoneTracker Soroban Contract
//!
//! Records and verifies founder milestones on the Stellar blockchain.
//! Each milestone is immutably stored, making it trustlessly verifiable
//! by investors without relying on a centralized database.
//!
//! Session 5: full implementation + testnet deploy.
//! Session 1: scaffold only — types and function signatures defined.

#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, log,
    Address, Env, String, Symbol, Vec,
};

// ─── Data Types ───────────────────────────────────────────

/// A single founder milestone recorded on-chain.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Milestone {
    /// Auto-incrementing on-chain ID
    pub id: u64,
    /// Stellar public key of the founder
    pub founder: Address,
    /// Short title, e.g. "Reached 500 beta users"
    pub title: String,
    /// Category: product | traction | funding | team | partnership | other
    pub category: Symbol,
    /// Unix timestamp (seconds) when recorded
    pub timestamp: u64,
}

/// Storage keys
#[contracttype]
pub enum DataKey {
    /// Total milestone count (used as auto-increment ID)
    MilestoneCount,
    /// Individual milestone by ID
    Milestone(u64),
    /// Index: founder address → list of milestone IDs they own
    FounderMilestones(Address),
}

// ─── Contract ─────────────────────────────────────────────

#[contract]
pub struct MilestoneTrackerContract;

#[contractimpl]
impl MilestoneTrackerContract {
    /// Records a new milestone on-chain.
    ///
    /// - `founder`: must sign the transaction (authentication enforced)
    /// - `title`: short human-readable description (max 100 chars)
    /// - `category`: one of product | traction | funding | team | partnership | other
    ///
    /// Returns the new milestone's on-chain ID.
    pub fn record_milestone(
        env: Env,
        founder: Address,
        title: String,
        category: Symbol,
    ) -> u64 {
        // Enforce that the caller IS the founder (no spoofing)
        founder.require_auth();

        // Get and increment the global counter
        let id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::MilestoneCount)
            .unwrap_or(0_u64)
            + 1;

        env.storage()
            .instance()
            .set(&DataKey::MilestoneCount, &id);

        // Build the milestone
        let milestone = Milestone {
            id,
            founder: founder.clone(),
            title,
            category,
            timestamp: env.ledger().timestamp(),
        };

        // Store the milestone by ID
        env.storage()
            .persistent()
            .set(&DataKey::Milestone(id), &milestone);

        // Append to founder's index
        let mut ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::FounderMilestones(founder.clone()))
            .unwrap_or(Vec::new(&env));
        ids.push_back(id);
        env.storage()
            .persistent()
            .set(&DataKey::FounderMilestones(founder.clone()), &ids);

        log!(&env, "Milestone #{} recorded for {}", id, founder);

        id
    }

    /// Returns all milestone IDs for a given founder.
    pub fn get_founder_milestone_ids(env: Env, founder: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::FounderMilestones(founder))
            .unwrap_or(Vec::new(&env))
    }

    /// Fetches a single milestone by its on-chain ID.
    /// Panics if the ID does not exist.
    pub fn get_milestone(env: Env, id: u64) -> Milestone {
        env.storage()
            .persistent()
            .get(&DataKey::Milestone(id))
            .expect("Milestone not found")
    }

    /// Returns the total number of milestones ever recorded.
    pub fn total_milestones(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::MilestoneCount)
            .unwrap_or(0)
    }
}

// ─── Tests ────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_record_and_retrieve_milestone() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, MilestoneTrackerContract);
        let client = MilestoneTrackerContractClient::new(&env, &contract_id);

        let founder = Address::generate(&env);
        let title = String::from_str(&env, "Launched beta with 100 users");
        let category = Symbol::new(&env, "traction");

        // Record milestone
        let id = client.record_milestone(&founder, &title, &category);
        assert_eq!(id, 1);

        // Retrieve by ID
        let milestone = client.get_milestone(&id);
        assert_eq!(milestone.id, 1);
        assert_eq!(milestone.founder, founder);

        // Founder index
        let ids = client.get_founder_milestone_ids(&founder);
        assert_eq!(ids.len(), 1);
        assert_eq!(ids.get(0).unwrap(), 1);

        // Total count
        assert_eq!(client.total_milestones(), 1);
    }

    #[test]
    fn test_multiple_milestones_same_founder() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, MilestoneTrackerContract);
        let client = MilestoneTrackerContractClient::new(&env, &contract_id);

        let founder = Address::generate(&env);

        client.record_milestone(
            &founder,
            &String::from_str(&env, "MVP shipped"),
            &Symbol::new(&env, "product"),
        );
        client.record_milestone(
            &founder,
            &String::from_str(&env, "First paying customer"),
            &Symbol::new(&env, "traction"),
        );

        let ids = client.get_founder_milestone_ids(&founder);
        assert_eq!(ids.len(), 2);
        assert_eq!(client.total_milestones(), 2);
    }

    #[test]
    fn test_different_founders_isolated() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, MilestoneTrackerContract);
        let client = MilestoneTrackerContractClient::new(&env, &contract_id);

        let founder_a = Address::generate(&env);
        let founder_b = Address::generate(&env);

        client.record_milestone(
            &founder_a,
            &String::from_str(&env, "A's milestone"),
            &Symbol::new(&env, "product"),
        );
        client.record_milestone(
            &founder_b,
            &String::from_str(&env, "B's milestone"),
            &Symbol::new(&env, "traction"),
        );

        // Each founder only sees their own milestones
        assert_eq!(client.get_founder_milestone_ids(&founder_a).len(), 1);
        assert_eq!(client.get_founder_milestone_ids(&founder_b).len(), 1);
    }
}
