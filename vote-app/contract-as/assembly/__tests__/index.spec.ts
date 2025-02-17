import { create_campaign, get_campaign, vote } from "..";

describe("Voting Contract", () => {
  it("should create a campaign", () => {
    create_campaign(
      "test-1",
      ["Candidate 1", "Candidate 2"],
      "1710000000000000000",
      "1720000000000000000",
      true
    );
    
    const campaign = get_campaign("test-1");
    expect(campaign).not.toBeNull();
  });
}); 