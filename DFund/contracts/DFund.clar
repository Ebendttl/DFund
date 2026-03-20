;; Decentralized Crowdfunding Smart Contract
;; A secure and flexible crowdfunding platform on the Stacks blockchain with comprehensive fund management

;; constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u1))
(define-constant ERR-CAMPAIGN-NOT-FOUND (err u2))
(define-constant ERR-INSUFFICIENT-FUNDS (err u3))
(define-constant ERR-CAMPAIGN-EXPIRED (err u4))
(define-constant ERR-CAMPAIGN-INACTIVE (err u5))

;; data maps and vars
;; Campaign structure with improved type safety
(define-map campaigns
  { campaign-id: uint }
  {
    creator: principal,
    goal-amount: uint,
    current-amount: uint,
    deadline: uint,
    is-active: bool
  }
)

;; Contributions map
(define-map contributions
  { campaign-id: uint, contributor: principal }
  { amount: uint }
)

;; Campaign failed counted map
(define-map campaign-failed-counted
  { campaign-id: uint }
  { counted: bool }
)

;; Creator stats map
(define-map creator-stats 
 { creator: principal } 
 { 
 total-campaigns: uint, 
 successful-campaigns: uint, 
 failed-campaigns: uint, 
 total-raised: uint 
 } 
) 

;; Campaign counter with explicit initialization
(define-data-var next-campaign-id uint u0)

;; private functions
;; (None defined in this implementation)

;; public functions
;; Create campaign with enhanced validation
(define-public (create-campaign (goal-amount uint) (deadline uint))
  (begin
    (asserts! (> goal-amount u0) (err u6))
    (asserts! (> deadline block-height) ERR-CAMPAIGN-EXPIRED)

    (let
      (
        (campaign-id (var-get next-campaign-id))
        (stats (get-creator-stats tx-sender))
      )

      ;; Increment and create campaign
      (var-set next-campaign-id (+ campaign-id u1))
      (map-set campaigns
        { campaign-id: campaign-id }
        {
          creator: tx-sender,
          goal-amount: goal-amount,
          current-amount: u0,
          deadline: deadline,
          is-active: true
        }
      )

      ;; Update creator stats
      (map-set creator-stats
        { creator: tx-sender }
        (merge stats { total-campaigns: (+ (get total-campaigns stats) u1) })
      )

      (ok campaign-id)
    )
  )
)

;; Contribute with stricter checks
(define-public (contribute (campaign-id uint) (amount uint))
  (let
    (
      (campaign (unwrap! (map-get? campaigns { campaign-id: campaign-id }) ERR-CAMPAIGN-NOT-FOUND))
      (current-contribution (default-to { amount: u0 } (map-get? contributions { campaign-id: campaign-id, contributor: tx-sender })))
    )

    ;; Validate contribution
    (asserts! (get is-active campaign) ERR-CAMPAIGN-INACTIVE)
    (asserts! (< block-height (get deadline campaign)) ERR-CAMPAIGN-EXPIRED)    
    (asserts! (> amount u0) (err u7))

    ;; Safe transfer and update
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))

    (map-set campaigns
      { campaign-id: campaign-id }
      (merge campaign { current-amount: (+ (get current-amount campaign) amount) })
    )

    (map-set contributions
      { campaign-id: campaign-id, contributor: tx-sender }
      { amount: (+ (get amount current-contribution) amount) }
    )

    (ok amount)
  )
)

;; Withdraw funds with comprehensive checks
(define-public (withdraw-funds (campaign-id uint))
  (let
    (
      (campaign (unwrap! (map-get? campaigns { campaign-id: campaign-id }) ERR-CAMPAIGN-NOT-FOUND))
      (stats (get-creator-stats (get creator campaign)))
    )

    ;; Strict authorization and goal validation
    (asserts! (is-eq tx-sender (get creator campaign)) ERR-NOT-AUTHORIZED)      
    (asserts! (>= (get current-amount campaign) (get goal-amount campaign)) ERR-INSUFFICIENT-FUNDS)
    (asserts! (>= block-height (get deadline campaign)) ERR-CAMPAIGN-INACTIVE)  

    ;; Safe transfer from contract
    (try! (as-contract (stx-transfer? (get current-amount campaign) tx-sender (get creator campaign))))

    ;; Mark campaign as inactive
    (map-set campaigns
      { campaign-id: campaign-id }
      (merge campaign { is-active: false })
    )

    ;; Update creator stats
    (map-set creator-stats
      { creator: (get creator campaign) }
      (merge stats {
        successful-campaigns: (+ (get successful-campaigns stats) u1),
        total-raised: (+ (get total-raised stats) (get current-amount campaign))
      })
    )

    (ok (get current-amount campaign))
  )
)

;; Refund mechanism with error handling
(define-public (refund (campaign-id uint))
  (let
    (
      (campaign (unwrap! (map-get? campaigns { campaign-id: campaign-id }) ERR-CAMPAIGN-NOT-FOUND))
      (contribution (unwrap! (map-get? contributions { campaign-id: campaign-id, contributor: tx-sender }) ERR-INSUFFICIENT-FUNDS))
      (stats (get-creator-stats (get creator campaign)))
      (failed-counted (default-to { counted: false } (map-get? campaign-failed-counted { campaign-id: campaign-id })))
    )

    ;; Validate refund conditions
    (asserts! (< (get current-amount campaign) (get goal-amount campaign)) ERR-CAMPAIGN-INACTIVE)
    (asserts! (>= block-height (get deadline campaign)) ERR-CAMPAIGN-INACTIVE)  

    ;; Safe refund transfer
    (try! (as-contract (stx-transfer? (get amount contribution) tx-sender tx-sender)))

    ;; Clear contribution
    (map-delete contributions { campaign-id: campaign-id, contributor: tx-sender })

    ;; Update failed-campaigns only once per campaign
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

    (ok (get amount contribution))
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
