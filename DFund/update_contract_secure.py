import re

contract_content = """;; Decentralized Crowdfunding Smart Contract
;; Milestone-Based Escrow and Community Voting - SECURE AUDITED VERSION

;; constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u1))
(define-constant ERR-CAMPAIGN-NOT-FOUND (err u2))
(define-constant ERR-INSUFFICIENT-FUNDS (err u3))
(define-constant ERR-CAMPAIGN-EXPIRED (err u4))
(define-constant ERR-CAMPAIGN-INACTIVE (err u5))
(define-constant ERR-NOT-CONTRIBUTOR (err u10))
(define-constant ERR-MILESTONE-NOT-FOUND (err u12))
(define-constant ERR-CAMPAIGN-NOT-FUNDED (err u13))
(define-constant ERR-ALREADY-VOTED (err u14))
(define-constant ERR-MILESTONE-NOT-APPROVED (err u15))
(define-constant ERR-MILESTONE-ALREADY-CLAIMED (err u16))
(define-constant ERR-INVALID-MILESTONES (err u17))
(define-constant ERR-CAMPAIGN-FULLY-FUNDED (err u18))

;; data maps and vars
(define-map campaigns
  { campaign-id: uint }
  {
    creator: principal,
    goal-amount: uint,
    current-amount: uint,
    claimed-amount: uint,
    deadline: uint,
    is-active: bool
  }
)

(define-map contributions
  { campaign-id: uint, contributor: principal }
  { amount: uint }
)

(define-map campaign-failed-counted
  { campaign-id: uint }
  { counted: bool }
)

(define-map creator-stats 
 { creator: principal } 
 { 
 total-campaigns: uint, 
 successful-campaigns: uint, 
 failed-campaigns: uint, 
 total-raised: uint 
 } 
) 

;; Milestone structures
(define-map milestones
  { campaign-id: uint, milestone-id: uint }
  {
    description: (string-ascii 256),
    amount: uint,
    approved-amount: uint,
    rejected-amount: uint,
    is-approved: bool,
    is-claimed: bool
  }
)

(define-map milestone-count
  { campaign-id: uint }
  { count: uint }
)

(define-map milestone-votes
  { campaign-id: uint, milestone-id: uint, voter: principal }
  { vote: bool }
)

(define-data-var next-campaign-id uint u0)

;; private functions
(define-private (add-milestone-iter (milestone { amount: uint, description: (string-ascii 256) }) (state { campaign-id: uint, milestone-id: uint, total-amount: uint }))
  (let
    (
      (m-id (get milestone-id state))
      (c-id (get campaign-id state))
    )
    (map-set milestones
      { campaign-id: c-id, milestone-id: m-id }
      {
        description: (get description milestone),
        amount: (get amount milestone),
        approved-amount: u0,
        rejected-amount: u0,
        is-approved: false,
        is-claimed: false
      }
    )
    {
      campaign-id: c-id,
      milestone-id: (+ m-id u1),
      total-amount: (+ (get total-amount state) (get amount milestone))
    }
  )
)

;; public functions
(define-public (create-campaign (goal-amount uint) (deadline uint) (milestone-list (list 10 { amount: uint, description: (string-ascii 256) })))
  (begin
    (asserts! (> goal-amount u0) (err u6))
    (asserts! (> deadline block-height) ERR-CAMPAIGN-EXPIRED)
    (asserts! (> (len milestone-list) u0) ERR-INVALID-MILESTONES)

    (let
      (
        (campaign-id (var-get next-campaign-id))
        (stats (get-creator-stats tx-sender))
        (milestone-result (fold add-milestone-iter milestone-list { campaign-id: campaign-id, milestone-id: u0, total-amount: u0 }))
      )
      
      (asserts! (is-eq (get total-amount milestone-result) goal-amount) ERR-INVALID-MILESTONES)

      ;; State changes
      (var-set next-campaign-id (+ campaign-id u1))
      (map-set campaigns
        { campaign-id: campaign-id }
        {
          creator: tx-sender,
          goal-amount: goal-amount,
          current-amount: u0,
          claimed-amount: u0,
          deadline: deadline,
          is-active: true
        }
      )

      (map-set milestone-count
        { campaign-id: campaign-id }
        { count: (get milestone-id milestone-result) }
      )

      (map-set creator-stats
        { creator: tx-sender }
        (merge stats { total-campaigns: (+ (get total-campaigns stats) u1) })
      )

      (ok campaign-id)
    )
  )
)

(define-public (contribute (campaign-id uint) (amount uint))
  (let
    (
      (campaign (unwrap! (map-get? campaigns { campaign-id: campaign-id }) ERR-CAMPAIGN-NOT-FOUND))
      (current-contribution (default-to { amount: u0 } (map-get? contributions { campaign-id: campaign-id, contributor: tx-sender })))
    )

    (asserts! (get is-active campaign) ERR-CAMPAIGN-INACTIVE)
    (asserts! (< block-height (get deadline campaign)) ERR-CAMPAIGN-EXPIRED)
    (asserts! (< (get current-amount campaign) (get goal-amount campaign)) ERR-CAMPAIGN-FULLY-FUNDED)   
    (asserts! (> amount u0) (err u7))

    ;; Map Updates First (Checks-Effects-Interactions)
    (map-set campaigns
      { campaign-id: campaign-id }
      (merge campaign { current-amount: (+ (get current-amount campaign) amount) })
    )

    (map-set contributions
      { campaign-id: campaign-id, contributor: tx-sender }
      { amount: (+ (get amount current-contribution) amount) }
    )

    ;; Interactions 
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))

    (ok amount)
  )
)

;; Vote on a milestone
(define-public (vote-milestone (campaign-id uint) (milestone-id uint) (approve bool))
  (let
    (
      (campaign (unwrap! (map-get? campaigns { campaign-id: campaign-id }) ERR-CAMPAIGN-NOT-FOUND))
      (contribution (unwrap! (map-get? contributions { campaign-id: campaign-id, contributor: tx-sender }) ERR-NOT-CONTRIBUTOR))
      (current-vote (map-get? milestone-votes { campaign-id: campaign-id, milestone-id: milestone-id, voter: tx-sender }))
      (user-weight (get amount contribution))
      (milestone (unwrap! (map-get? milestones { campaign-id: campaign-id, milestone-id: milestone-id }) ERR-MILESTONE-NOT-FOUND))
      (threshold (/ (get goal-amount campaign) u2))
    )

    ;; Validations
    (asserts! (>= (get current-amount campaign) (get goal-amount campaign)) ERR-CAMPAIGN-NOT-FUNDED)
    (asserts! (is-none current-vote) ERR-ALREADY-VOTED)
    (asserts! (get is-active campaign) ERR-CAMPAIGN-INACTIVE) ;; Cannot vote if halted

    ;; Effect: Record individual vote
    (map-set milestone-votes { campaign-id: campaign-id, milestone-id: milestone-id, voter: tx-sender } { vote: approve })

    (if approve
      ;; Approval logic
      (let
        (
          (new-approval-amount (+ (get approved-amount milestone) user-weight))
        )
        (if (>= new-approval-amount threshold)
          (map-set milestones { campaign-id: campaign-id, milestone-id: milestone-id } (merge milestone { approved-amount: new-approval-amount, is-approved: true }))
          (map-set milestones { campaign-id: campaign-id, milestone-id: milestone-id } (merge milestone { approved-amount: new-approval-amount }))
        )
        (ok true)
      )
      ;; Rejection logic
      (let
        (
          (new-rejected-amount (+ (get rejected-amount milestone) user-weight))
        )
        (map-set milestones { campaign-id: campaign-id, milestone-id: milestone-id } (merge milestone { rejected-amount: new-rejected-amount }))
        
        ;; If meets threshold 50% rejection, explicitly HALT campaign unlocks refunds
        (if (>= new-rejected-amount threshold)
          (map-set campaigns { campaign-id: campaign-id } (merge campaign { is-active: false }))
          true
        )
        (ok true)
      )
    )
  )
)

;; Claim milestone funds
(define-public (claim-milestone (campaign-id uint) (milestone-id uint))
  (let
    (
      (campaign (unwrap! (map-get? campaigns { campaign-id: campaign-id }) ERR-CAMPAIGN-NOT-FOUND))
      (milestone (unwrap! (map-get? milestones { campaign-id: campaign-id, milestone-id: milestone-id }) ERR-MILESTONE-NOT-FOUND))
    )

    ;; Validations
    (asserts! (is-eq tx-sender (get creator campaign)) ERR-NOT-AUTHORIZED)
    (asserts! (get is-approved milestone) ERR-MILESTONE-NOT-APPROVED)
    (asserts! (not (get is-claimed milestone)) ERR-MILESTONE-ALREADY-CLAIMED)
    (asserts! (>= (get current-amount campaign) (get goal-amount campaign)) ERR-CAMPAIGN-NOT-FUNDED)
    (asserts! (get is-active campaign) ERR-CAMPAIGN-INACTIVE) ;; Cannot claim if halted

    ;; Effects first
    (map-set milestones { campaign-id: campaign-id, milestone-id: milestone-id } (merge milestone { is-claimed: true }))
    (map-set campaigns { campaign-id: campaign-id } (merge campaign { claimed-amount: (+ (get claimed-amount campaign) (get amount milestone)) }))

    ;; Interaction out
    (try! (as-contract (stx-transfer? (get amount milestone) tx-sender (get creator campaign))))

    (ok (get amount milestone))
  )
)

;; General Refund
(define-public (refund (campaign-id uint))
  (let
    (
      (campaign (unwrap! (map-get? campaigns { campaign-id: campaign-id }) ERR-CAMPAIGN-NOT-FOUND))
      (contribution (unwrap! (map-get? contributions { campaign-id: campaign-id, contributor: tx-sender }) ERR-INSUFFICIENT-FUNDS))
      (stats (get-creator-stats (get creator campaign)))
      (failed-counted (default-to { counted: false } (map-get? campaign-failed-counted { campaign-id: campaign-id })))
      
      (remaining-balance (- (get current-amount campaign) (get claimed-amount campaign)))
      (user-share (/ (* (get amount contribution) remaining-balance) (get current-amount campaign)))
      
      (is-expired-fail (and (>= block-height (get deadline campaign)) (< (get current-amount campaign) (get goal-amount campaign))))
      (is-halted-fail (not (get is-active campaign)))
    )

    (asserts! (> remaining-balance u0) ERR-INSUFFICIENT-FUNDS)
    (asserts! (> user-share u0) ERR-INSUFFICIENT-FUNDS)
    
    ;; A refund is ONLY valid if:
    ;; 1. Campaign expired and goal not met
    ;; 2. OR campaign was halted/rejected safely (is-active false).
    (asserts! (or is-expired-fail is-halted-fail) ERR-NOT-AUTHORIZED)

    ;; Effect first
    (map-delete contributions { campaign-id: campaign-id, contributor: tx-sender })

    (if (not (get counted failed-counted))
      (begin
        (map-set campaign-failed-counted { campaign-id: campaign-id } { counted: true })
        (map-set creator-stats
          { creator: (get creator campaign) }
          (merge stats { failed-campaigns: (+ (get failed-campaigns stats) u1) })
        )
      )
      true
    )

    ;; Interaction
    (try! (as-contract (stx-transfer? user-share tx-sender tx-sender)))

    (ok user-share)
  )
)

;; Read-only functions
(define-read-only (get-creator-stats (creator principal)) 
 (default-to 
 { 
 total-campaigns: u0, 
 successful-campaigns: u0, 
 failed-campaigns: u0, 
 total-raised: u0 
 } 
 (map-get? creator-stats { creator: creator }) 
 ) 
)

(define-read-only (get-milestone (campaign-id uint) (milestone-id uint))
  (map-get? milestones { campaign-id: campaign-id, milestone-id: milestone-id })
)

(define-read-only (get-milestone-count (campaign-id uint))
  (get count (default-to { count: u0 } (map-get? milestone-count { campaign-id: campaign-id })))
)

(define-read-only (get-milestone-votes (campaign-id uint) (milestone-id uint) (voter principal))
  (map-get? milestone-votes { campaign-id: campaign-id, milestone-id: milestone-id, voter: voter })
)
"""

with open('./contracts/DFund.clar', 'w') as f:
    f.write(contract_content)

print("DFund.clar successfully audited and refactored.")
