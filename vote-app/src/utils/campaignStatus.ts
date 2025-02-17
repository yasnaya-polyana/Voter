export const getCampaignStatus = (startDate: Date | string, endDate: Date | string): 'draft' | 'active' | 'ended' => {
  const now = new Date().getTime();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (now < start) return 'draft';
  if (now > end) return 'ended';
  return 'active';
}; 