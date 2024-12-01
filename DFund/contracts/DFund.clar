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
      ((campaign-id (var-get next-campaign-id)))
      
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
    
    (ok (get current-amount campaign))
  )
)

;; Refund mechanism with error handling
(define-public (refund (campaign-id uint))
  (let 
    (
      (campaign (unwrap! (map-get? campaigns { campaign-id: campaign-id }) ERR-CAMPAIGN-NOT-FOUND))
      (contribution (unwrap! (map-get? contributions { campaign-id: campaign-id, contributor: tx-sender }) ERR-INSUFFICIENT-FUNDS))
    )
    
    ;; Validate refund conditions
    (asserts! (< (get current-amount campaign) (get goal-amount campaign)) ERR-CAMPAIGN-INACTIVE)
    (asserts! (>= block-height (get deadline campaign)) ERR-CAMPAIGN-INACTIVE)
    
    ;; Safe refund transfer
    (try! (as-contract (stx-transfer? (get amount contribution) tx-sender tx-sender)))
    
    ;; Clear contribution
    (map-delete contributions { campaign-id: campaign-id, contributor: tx-sender })
    
    (ok (get amount contribution))
  )
)
