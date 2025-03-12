@nearBindgen
export class Vote {
  constructor(
    public campaign_id: string,
    public candidate_id: string,
    public public_key: string,
    public voter: string
  ) {}
}
