// test fixture — unregistered claim ID, used by check-claims.ts negative test
export const BadComponent = () => (
  <p data-claim="this-claim-does-not-exist">Test claim text.</p>
);
