# Directory Structure

```
contracts/
  contracts/
    core/
      Slice.sol (440 lines)
      SliceEscrowV1.5.sol (471 lines)
      SliceV1.5.sol (716 lines)
    fhe/
      FHECounter.sol (46 lines)
      SliceFHE.sol (399 lines)
    interfaces/
      IArbitrable.sol (6 lines)
      ISlice.sol (126 lines)
    mocks/
      MockUSDC.sol (16 lines)
  hardhat.config.ts (132 lines)
  package.json (105 lines)
  README.md (135 lines)
src/
  app/
    .well-known/
      farcaster.json/
        route.ts (6 lines)
    api/
      auth/
        route.ts (76 lines)
    debug/
      page.tsx (313 lines)
    disputes/
      [id]/
        evidence/
          submit/
            page.tsx (117 lines)
        execute/
          page.tsx (303 lines)
        file/
          page.tsx (36 lines)
        pay/
          page.tsx (131 lines)
        reveal/
          page.tsx (160 lines)
        review/
          page.tsx (51 lines)
        vote/
          page.tsx (188 lines)
        loading.tsx (12 lines)
        page.tsx (271 lines)
      create/
        page.tsx (154 lines)
      page.tsx (65 lines)
    juror/
      assign/
        loading.tsx (13 lines)
        page.tsx (190 lines)
      assigned/
        [id]/
          page.tsx (145 lines)
      stake/
        page.tsx (93 lines)
      page.tsx (5 lines)
    manage/
      page.tsx (204 lines)
    profile/
      page.tsx (139 lines)
    globals.css (177 lines)
    layout.tsx (82 lines)
    not-found.tsx (65 lines)
    page.tsx (67 lines)
    providers.tsx (81 lines)
  config/
    adapters/
      beexo.tsx (150 lines)
      coinbase.tsx (56 lines)
      privy.tsx (68 lines)
    app.ts (67 lines)
    chains.ts (30 lines)
    contracts.ts (18 lines)
    tenant.ts (32 lines)
  contexts/
    AuthStrategyContext.tsx (20 lines)
    TimerContext.tsx (102 lines)
  hooks/
    actions/
      useAssignDispute.ts (136 lines)
      useCreateDispute.ts (111 lines)
      useExecuteRuling.ts (49 lines)
      useFaucet.ts (50 lines)
      usePayDispute.ts (97 lines)
      useSendFunds.ts (64 lines)
      useSendNative.ts (59 lines)
      useWithdraw.ts (84 lines)
    core/
      useContracts.ts (17 lines)
      useNativeBalance.ts (28 lines)
      useSliceAccount.ts (11 lines)
      useSliceConnect.ts (12 lines)
      useStakingToken.ts (39 lines)
      useTokenBalance.ts (29 lines)
    debug/
      useConsoleLogs.ts (109 lines)
    disputes/
      useAllDisputes.ts (111 lines)
      useDisputeFinancials.ts (221 lines)
      useDisputeList.ts (185 lines)
      useDisputeParties.ts (31 lines)
      useGetDispute.ts (78 lines)
      useMyDisputes.ts (165 lines)
    evidence/
      useEvidence.ts (89 lines)
    forms/
      useCreateDisputeForm.ts (190 lines)
      useStepBasics.ts (82 lines)
    ui/
      useClickOutside.ts (26 lines)
      usePageSwipe.ts (19 lines)
    user/
      useAddressBook.ts (86 lines)
      useUserProfile.ts (120 lines)
    voting/
      useJurorStats.ts (70 lines)
      useReveal.ts (60 lines)
      useSliceVoting.ts (161 lines)
      useVote.ts (101 lines)
  types/
    xo-connect.d.ts (37 lines)
  util/
    disputeAdapter.ts (270 lines)
    ipfs.ts (137 lines)
    storage.ts (82 lines)
    votingStorage.ts (83 lines)
    votingUtils.ts (103 lines)
    wallet.ts (24 lines)
.env.example (24 lines)
AGENTS.md (163 lines)
package.json (81 lines)
README.md (169 lines)
```