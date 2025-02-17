@nearBindgen
export class Vote {
  constructor(
    public voter: string,
    public candidate: string,
    public timestamp: u64
  ) {}
}
